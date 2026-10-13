import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE = '@openng/optimus-ui';

/** Signal factory (the callee, or `callee.required`) -> kind recorded in the manifest. */
const FACTORIES = {
    input: 'input',
    model: 'model',
    output: 'output',
    outputFromObservable: 'output',
    viewChild: 'viewChild',
    viewChildren: 'viewChildren',
    contentChild: 'contentChild',
    contentChildren: 'contentChildren',
    signal: 'signal',
    computed: 'signal',
    linkedSignal: 'signal'
};

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(full, files);
        } else if (/\.ts$/.test(entry.name) && !/\.(test|spec)\.ts$|\.d\.ts$/.test(entry.name)) {
            files.push(full);
        }
    }

    return files;
}

function factoryKind(initializer) {
    if (!initializer || !ts.isCallExpression(initializer)) return undefined;

    let callee = initializer.expression;

    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'required') callee = callee.expression;

    return ts.isIdentifier(callee) && Object.hasOwn(FACTORIES, callee.text) ? FACTORIES[callee.text] : undefined;
}

function isPublic(member) {
    if (ts.isPrivateIdentifier(member.name)) return false;

    const flags = ts.getCombinedModifierFlags(member);

    return !(flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static));
}

/**
 * Reads the classes of every entry point of the library and returns the public members that are signals.
 * Syntactic on purpose: it needs neither a build of the library nor a type checker, and the factory
 * (`input`, `model`, ...) is the source of truth of what a member is.
 */
export function generateManifest(srcDir) {
    /** @type {Map<string, {module: string, name: string, base?: string, exported: boolean, members: Map<string, string>, plain: Set<string>}[]>} */
    const byName = new Map();

    for (const file of walk(srcDir).sort()) {
        const module = path.relative(srcDir, file).split(path.sep)[0];
        const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);

        for (const statement of sf.statements) {
            if (!ts.isClassDeclaration(statement) || !statement.name) continue;

            const exported = !!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
            const extendsClause = statement.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
            const baseExpr = extendsClause?.types[0]?.expression;
            const info = { module, name: statement.name.text, base: baseExpr && ts.isIdentifier(baseExpr) ? baseExpr.text : undefined, exported, members: new Map(), plain: new Set(), plainProps: new Set() };

            for (const member of statement.members) {
                if (!member.name || !ts.isIdentifier(member.name) || !isPublic(member)) continue;

                const name = member.name.text;
                const kind = ts.isPropertyDeclaration(member) ? factoryKind(member.initializer) : undefined;

                if (kind) {
                    info.members.set(name, kind);
                } else if (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member) || ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
                    info.plain.add(name);

                    // A method is always called (`instance.disabled(item)`), so only a property or accessor makes a name ambiguous.
                    if (!ts.isMethodDeclaration(member)) info.plainProps.add(name);
                }
            }

            byName.set(info.name, [...(byName.get(info.name) ?? []), info]);
        }
    }

    function resolveBase(info) {
        const candidates = info.base ? (byName.get(info.base) ?? []) : [];

        return candidates.find((c) => c.module === info.module) ?? (candidates.length === 1 ? candidates[0] : undefined);
    }

    function flatten(info, seen = new Set()) {
        const result = { members: new Map(), plain: new Set(), plainProps: new Set() };

        if (seen.has(info)) return result;
        seen.add(info);

        const base = resolveBase(info);

        if (base) {
            const inherited = flatten(base, seen);

            inherited.members.forEach((kind, name) => result.members.set(name, kind));
            inherited.plain.forEach((name) => result.plain.add(name));
            inherited.plainProps.forEach((name) => result.plainProps.add(name));
        }

        info.plain.forEach((name) => {
            result.plain.add(name);
            result.plainProps.delete(name);
            result.members.delete(name);
        });
        info.plainProps.forEach((name) => result.plainProps.add(name));
        info.members.forEach((kind, name) => {
            result.members.set(name, kind);
            result.plain.delete(name);
            result.plainProps.delete(name);
        });

        return result;
    }

    const modules = {};
    const signalNames = new Set();
    const plainNames = new Set();

    for (const infos of byName.values()) {
        for (const info of infos) {
            const { members, plainProps } = flatten(info);

            plainProps.forEach((name) => plainNames.add(name));

            // `_x` and `$x` are the internal and effective state signals introduced by 3.0: they never existed in 2.x.
            const api = [...members].filter(([name]) => !/^[_$]/.test(name)).sort(([a], [b]) => a.localeCompare(b));
            const hasTemplates = members.get('_templates') === 'contentChildren';

            if (!info.exported || (!api.length && !hasTemplates)) continue;

            api.forEach(([name, kind]) => {
                if (kind !== 'output' && kind !== 'viewChildren' && kind !== 'contentChildren') signalNames.add(name);
            });

            const entry = { members: Object.fromEntries(api) };

            if (hasTemplates) entry.hasTemplates = true;

            (modules[`${PACKAGE}/${info.module}`] ??= {})[info.name] = entry;
        }
    }

    // The `instance` of a pass through function can be any component. A name that is a signal in some class
    // is safe to read as a signal there only when no class keeps it as a plain property; otherwise the
    // migration cannot tell and leaves a TODO.
    const instanceMembers = [...signalNames].filter((name) => !plainNames.has(name)).sort();
    const ambiguousInstanceMembers = [...signalNames].filter((name) => plainNames.has(name)).sort();

    return { generatedBy: 'scripts/generate-signals-manifest.mjs', package: PACKAGE, modules, instanceMembers, ambiguousInstanceMembers };
}

export function writeManifest(srcDir, outFile) {
    const manifest = generateManifest(srcDir);

    fs.ensureDirSync(path.dirname(outFile));
    fs.writeJsonSync(outFile, manifest, { spaces: 4 });

    return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const manifest = writeManifest(path.resolve(__dirname, '../src'), path.resolve(__dirname, '../schematics/migrate-signals-v3/manifest.json'));

    console.log(`Signals manifest: ${Object.values(manifest.modules).reduce((n, classes) => n + Object.keys(classes).length, 0)} classes, ${manifest.instanceMembers.length} instance members`);
}
