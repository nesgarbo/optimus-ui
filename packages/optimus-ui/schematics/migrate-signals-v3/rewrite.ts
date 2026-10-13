import * as ts from 'typescript';

/** Kind of a signal member, as the manifest generator records it. */
export type MemberKind = 'input' | 'model' | 'output' | 'viewChild' | 'viewChildren' | 'contentChild' | 'contentChildren' | 'signal';

export interface ClassInfo {
    members: Record<string, MemberKind>;
    hasTemplates?: boolean;
    /** Inputs whose live state is in a public `_x`: `call` when it is a signal, else it is a plain field. */
    live?: Record<string, { name: string; call: boolean }>;
}

export interface Manifest {
    package: string;
    modules: Record<string, Record<string, ClassInfo>>;
    instanceMembers: string[];
    /** Signal in some component and a plain property in another: a pass through function cannot tell which. */
    ambiguousInstanceMembers?: string[];
    /** Live state of the names every component agrees on, for the pass through functions. */
    instanceLive?: Record<string, { name: string; call: boolean }>;
}

export interface RewriteResult {
    text: string;
    changed: boolean;
    /** Reads rewritten to a call and assignments rewritten to `.set(...)`. */
    rewrites: number;
    /** TODO comments inserted. */
    todos: number;
}

export const TODO_MARK = 'TODO(optimus-ui 3.0):';

const PARAMETER_PROPERTY = [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.ReadonlyKeyword];
const PT_NAME = /^pt$|^pt[A-Z]|(?:PT|Pt)$/;

interface Binding {
    info: ClassInfo;
    /** The name holds a signal of the instance (`viewChild(Table)`), not the instance. */
    signal: boolean;
}

/** A name with its declared classes. `null` means: declared with a type that is not a known class. */
type Declared = Map<string, (Binding | null)[]>;

interface Edit {
    pos: number;
    end: number;
    text: string;
    order: number;
}

function unwrap(node: ts.Expression): ts.Expression {
    let current = node;

    while (ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current)) current = current.expression;

    return current;
}

function propertyName(name: ts.PropertyName | ts.BindingName | undefined): string | undefined {
    return name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined;
}

function sameBinding(a: Binding | null, b: Binding | null): boolean {
    return !!a && !!b && a.info === b.info && a.signal === b.signal;
}

/** The binding of a name when every declaration of that name in the file agrees, else undefined. */
function resolveName(declared: Declared, name: string): Binding | undefined {
    const all = declared.get(name);
    const first = all?.[0];

    return first && all.every((b) => sameBinding(b, first)) ? first : undefined;
}

export function rewriteSignalsV3(text: string, manifest: Manifest): RewriteResult {
    const unchanged: RewriteResult = { text, changed: false, rewrites: 0, todos: 0 };

    if (!text.includes(manifest.package)) return unchanged;

    const sf = ts.createSourceFile('file.ts', text, ts.ScriptTarget.Latest, true);
    const classes = collectImports(sf, manifest);

    if (!classes.size) return unchanged;

    const instanceMembers = new Set(manifest.instanceMembers);
    const ambiguousMembers = new Set(manifest.ambiguousInstanceMembers ?? []);
    const locals: Declared = new Map();
    const props: Declared = new Map();

    const declare = (map: Declared, name: string, binding: Binding | null) => map.set(name, [...(map.get(name) ?? []), binding]);

    /** The class a type annotation names: `Table`, `Table<T>`, `Table | undefined`. */
    const classOfType = (type: ts.TypeNode | undefined): ClassInfo | undefined => {
        if (!type) return undefined;
        if (ts.isParenthesizedTypeNode(type)) return classOfType(type.type);
        if (ts.isUnionTypeNode(type)) {
            const rest = type.types.filter((t) => !(t.kind === ts.SyntaxKind.UndefinedKeyword || (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword)));

            return rest.length === 1 ? classOfType(rest[0]) : undefined;
        }

        return ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName) ? classes.get(type.typeName.text) : undefined;
    };

    /** The binding an initializer gives: `x as Table`, `inject(Table)`, `viewChild(Table)`. */
    const bindingOfInitializer = (init: ts.Expression | undefined): Binding | undefined => {
        if (!init) return undefined;

        const expr = unwrap(init);

        if (ts.isAsExpression(expr) || ts.isTypeAssertionExpression(expr)) {
            const info = classOfType(expr.type);

            return info && { info, signal: false };
        }

        if (!ts.isCallExpression(expr)) return undefined;

        let callee = expr.expression;

        if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'required') callee = callee.expression;
        if (!ts.isIdentifier(callee)) return undefined;

        const arg = expr.arguments[0];
        const fromIdentifier = arg && ts.isIdentifier(arg) ? classes.get(arg.text) : undefined;

        if (callee.text === 'inject') {
            return fromIdentifier && { info: fromIdentifier, signal: false };
        }

        if (callee.text === 'viewChild' || callee.text === 'contentChild') {
            const typeArg = classOfType(expr.typeArguments?.[0]);
            let read: ClassInfo | undefined;
            const options = expr.arguments[1];

            if (options && ts.isObjectLiteralExpression(options)) {
                for (const p of options.properties) {
                    if (ts.isPropertyAssignment(p) && propertyName(p.name) === 'read' && ts.isIdentifier(p.initializer)) read = classes.get(p.initializer.text);
                }
            }

            // The locator is either the class or a template reference, whose type comes from `read` or the type argument.
            const info = read ?? typeArg ?? (arg && ts.isIdentifier(arg) ? fromIdentifier : undefined);

            return info && { info, signal: true };
        }

        return undefined;
    };

    const decoratorClass = (node: ts.PropertyDeclaration): ClassInfo | undefined => {
        for (const decorator of ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : []) {
            const call = decorator.expression;

            if (ts.isCallExpression(call) && ts.isIdentifier(call.expression) && /^(ViewChild|ContentChild)$/.test(call.expression.text) && call.arguments[0] && ts.isIdentifier(call.arguments[0])) {
                return classes.get(call.arguments[0].text);
            }
        }

        return undefined;
    };

    const collect = (node: ts.Node) => {
        if (ts.isPropertyDeclaration(node)) {
            const name = propertyName(node.name);

            if (name && ts.isIdentifier(node.name)) {
                const typed = classOfType(node.type);
                const decorated = !node.type ? decoratorClass(node) : undefined;
                const binding: Binding | undefined = typed ? { info: typed, signal: false } : (bindingOfInitializer(node.initializer) ?? (decorated && { info: decorated, signal: false }));

                declare(props, name, binding ?? null);
            }
        } else if (ts.isParameter(node)) {
            if (ts.isIdentifier(node.name)) {
                const typed = classOfType(node.type);
                const binding: Binding | null = typed ? { info: typed, signal: false } : null;

                declare(locals, node.name.text, binding);

                if (node.modifiers?.some((m) => PARAMETER_PROPERTY.includes(m.kind))) {
                    declare(props, node.name.text, binding);
                }
            } else {
                declareBindingNames(node.name, locals);
            }
        } else if (ts.isVariableDeclaration(node)) {
            if (ts.isIdentifier(node.name)) {
                const typed = classOfType(node.type);
                const binding = typed ? { info: typed, signal: false } : bindingOfInitializer(node.initializer);

                declare(locals, node.name.text, binding ?? null);
            } else {
                declareBindingNames(node.name, locals);
            }
        }

        ts.forEachChild(node, collect);
    };

    const declareBindingNames = (name: ts.BindingName, map: Declared) => {
        if (ts.isIdentifier(name)) {
            declare(map, name.text, null);

            return;
        }

        for (const element of name.elements) {
            if (ts.isBindingElement(element)) declareBindingNames(element.name, map);
        }
    };

    collect(sf);

    const edits: Edit[] = [];
    const todos = new Map<number, string[]>();
    let order = 0;
    let rewrites = 0;
    const handled = new Set<ts.Node>();

    const edit = (pos: number, end: number, replacement: string, priority = 0) => edits.push({ pos, end, text: replacement, order: priority * 1e9 + order++ });

    /** The class of a receiver expression, when the file declares it without doubt. */
    const classOfReceiver = (node: ts.Expression): ClassInfo | undefined => {
        const expr = unwrap(node);

        if (ts.isAsExpression(expr) || ts.isTypeAssertionExpression(expr)) return classOfType(expr.type);

        if (ts.isIdentifier(expr)) {
            const binding = resolveName(locals, expr.text);

            return binding && !binding.signal ? binding.info : undefined;
        }

        if (ts.isPropertyAccessExpression(expr) && expr.expression.kind === ts.SyntaxKind.ThisKeyword) {
            const binding = resolveName(props, expr.name.text);

            return binding && !binding.signal ? binding.info : undefined;
        }

        if (ts.isCallExpression(expr) && !expr.arguments.length) {
            const callee = unwrap(expr.expression);
            const binding = ts.isIdentifier(callee) ? resolveName(locals, callee.text) : ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword ? resolveName(props, callee.name.text) : undefined;

            return binding?.signal ? binding.info : undefined;
        }

        return undefined;
    };

    const addTodo = (node: ts.Node, message: string) => {
        let target: ts.Node = node;

        while (target.parent && !(ts.isBlock(target.parent) || ts.isSourceFile(target.parent) || ts.isModuleBlock(target.parent) || ts.isCaseClause(target.parent) || ts.isDefaultClause(target.parent) || ts.isClassLike(target.parent))) {
            target = target.parent;
        }

        const start = target.getStart(sf);
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;

        if (!hasTodoAbove(text, lineStart, message)) {
            const lines = todos.get(lineStart) ?? [];

            if (!lines.includes(message)) todos.set(lineStart, [...lines, message]);
        }
    };

    const READ_ONLY_INPUT = (name: string) => `${TODO_MARK} inputs are read only signals; bind it in the template or use componentRef.setInput('${name}', ...)`;

    /** `x.member` with `x` of a known class. */
    const handleMember = (access: ts.PropertyAccessExpression, info: ClassInfo) => {
        const name = access.name.text;
        const kind = info.members[name];
        const parent = access.parent;

        if (!kind) {
            if (name === 'templates' && info.hasTemplates) {
                addTodo(access, `${TODO_MARK} templates is not a QueryList any more; read the templates signal with its read only array (see the "Migrating to 3.0: Signals API" guide)`);
            }

            return;
        }

        // Already migrated (`x.rows()`).
        if (ts.isCallExpression(parent) && parent.expression === access) return;

        const isAssignmentTarget = ts.isBinaryExpression(parent) && parent.left === access && parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment;
        const isIncrement = (ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) && (parent.operator === ts.SyntaxKind.PlusPlusToken || parent.operator === ts.SyntaxKind.MinusMinusToken);

        if (isAssignmentTarget || isIncrement) {
            if (isAssignmentTarget && kind === 'model' && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isExpressionStatement(parent.parent)) {
                // `x.first = v;` -> `x.first.set(v);`. The value is rewritten by the visit of the right side.
                edit(access.end, parent.right.getStart(sf), '.set(');
                edit(parent.right.end, parent.right.end, ')', 1);
                rewrites++;
            } else if (kind === 'model') {
                addTodo(access, `${TODO_MARK} ${name} is a model signal; write it with ${name}.set(value) and read it with ${name}()`);
            } else if (kind === 'input') {
                addTodo(access, READ_ONLY_INPUT(name));
            } else {
                addTodo(access, `${TODO_MARK} ${name} is a read only signal; it cannot be assigned`);
            }

            return;
        }

        if (kind === 'output') {
            if (ts.isPropertyAccessExpression(parent) && parent.expression === access && ['pipe', 'next', 'observers'].includes(parent.name.text)) {
                addTodo(access, `${TODO_MARK} ${name} is an output(); it has subscribe and emit but no ${parent.name.text}. Use outputToObservable(...) from '@angular/core/rxjs-interop' for RxJS operators`);
            }

            return;
        }

        if (kind === 'viewChildren' || kind === 'contentChildren') {
            addTodo(access, `${TODO_MARK} ${name} is a signal of a read only array now, not a QueryList; call ${name}() and use the array methods`);

            return;
        }

        // `x.rows.set(...)`, `x.rows.update(...)`: the member is already a signal.
        if (ts.isPropertyAccessExpression(parent) && parent.expression === access && ['set', 'update', 'asReadonly'].includes(parent.name.text)) return;

        const live = kind === 'input' ? info.live?.[name] : undefined;

        // The live state of an input is in `_x`: `x()` would give only what was bound.
        if (live) edit(access.name.getStart(sf), access.name.end, live.name + (live.call ? '()' : ''));
        else edit(access.name.end, access.name.end, '()');
        rewrites++;
    };

    /** `instance.member` inside a pass through function. */
    const handlePtMember = (access: ts.PropertyAccessExpression) => {
        if (handled.has(access)) return;
        handled.add(access);

        const parent = access.parent;
        const name = access.name.text;

        if (!instanceMembers.has(name) && !ambiguousMembers.has(name)) return;
        if (ts.isCallExpression(parent) && parent.expression === access) return;
        if (ts.isBinaryExpression(parent) && parent.left === access && parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return;
        if (ts.isPropertyAccessExpression(parent) && parent.expression === access && ['set', 'update', 'asReadonly', 'subscribe', 'emit'].includes(parent.name.text)) return;

        if (ambiguousMembers.has(name)) {
            addTodo(access, `${TODO_MARK} instance.${name} is a signal in some components and a plain value in others; call it (${name}()) only if this component gives it as a signal`);

            return;
        }

        const live = manifest.instanceLive?.[name];

        if (live) edit(access.name.getStart(sf), access.name.end, live.name + (live.call ? '()' : ''));
        else edit(access.name.end, access.name.end, '()');
        rewrites++;
    };

    const scanPassThrough = (root: ts.Node) => {
        const visit = (node: ts.Node) => {
            if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node)) && node.parameters.length) {
                const first = node.parameters[0].name;
                const aliases = new Set<string>();
                const holders = new Set<string>();

                if (ts.isObjectBindingPattern(first)) {
                    for (const element of first.elements) {
                        if ((propertyName(element.propertyName) ?? propertyName(element.name)) === 'instance' && ts.isIdentifier(element.name)) aliases.add(element.name.text);
                    }
                } else if (ts.isIdentifier(first)) {
                    holders.add(first.text);
                }

                if (aliases.size || holders.size) {
                    const walk = (inner: ts.Node) => {
                        if (ts.isPropertyAccessExpression(inner)) {
                            const target = unwrap(inner.expression);

                            if (ts.isIdentifier(target) && aliases.has(target.text)) {
                                handlePtMember(inner);
                            } else if (ts.isPropertyAccessExpression(target) && target.name.text === 'instance' && ts.isIdentifier(target.expression) && holders.has(target.expression.text)) {
                                handlePtMember(inner);
                            }
                        }

                        ts.forEachChild(inner, walk);
                    };

                    if (node.body) walk(node.body);
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(root);
    };

    const visit = (node: ts.Node) => {
        if (ts.isPropertyAccessExpression(node)) {
            const info = classOfReceiver(node.expression);

            if (info) handleMember(node, info);
        } else if (ts.isVariableDeclaration(node) && node.initializer && ts.isObjectBindingPattern(node.name)) {
            const info = classOfReceiver(node.initializer);

            if (info && node.name.elements.some((e) => info.members[propertyName(e.propertyName) ?? propertyName(e.name) ?? ''])) {
                addTodo(node, `${TODO_MARK} the properties you destructure from this component are signals now; destructure the signals and call them (rows()) when you read the value`);
            }
        }

        if (
            (ts.isPropertyAssignment(node) || ts.isPropertyDeclaration(node) || ts.isVariableDeclaration(node)) &&
            node.initializer &&
            PT_NAME.test(propertyName(node.name) ?? '') &&
            (ts.isObjectLiteralExpression(node.initializer) || ts.isArrowFunction(node.initializer))
        ) {
            scanPassThrough(node.initializer);
        }

        ts.forEachChild(node, visit);
    };

    visit(sf);

    if (!edits.length && !todos.size) return unchanged;

    // Insertions at the same position go in the order they were made, closing parentheses last.
    const ordered = edits.sort((a, b) => a.pos - b.pos || a.order - b.order);
    const inserts = [...todos].map(([pos, messages]) => ({ pos, text: messages.map((m) => `${indentOf(text, pos)}// ${m}\n`).join('') }));
    const pieces: { pos: number; end: number; text: string; order: number }[] = [...ordered, ...inserts.map((i, n) => ({ pos: i.pos, end: i.pos, text: i.text, order: -1 - n }))].sort((a, b) => a.pos - b.pos || a.order - b.order);

    let result = '';
    let cursor = 0;

    for (const piece of pieces) {
        result += text.slice(cursor, piece.pos) + piece.text;
        cursor = piece.end;
    }

    result += text.slice(cursor);

    const todoCount = [...todos.values()].reduce((n, lines) => n + lines.length, 0);

    return { text: result, changed: result !== text, rewrites, todos: todoCount };
}

function indentOf(text: string, lineStart: number): string {
    return /^[ \t]*/.exec(text.slice(lineStart))?.[0] ?? '';
}

/** True when the comment lines right above `lineStart` already carry this TODO (the migration ran before). */
function hasTodoAbove(text: string, lineStart: number, message: string): boolean {
    const lines = text.slice(0, lineStart).split('\n');

    lines.pop();

    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();

        if (!line.startsWith('//')) return false;
        if (line === `// ${message}`) return true;
    }

    return false;
}

/** Local names of the library classes the file imports, mapped to their manifest entry. */
function collectImports(sf: ts.SourceFile, manifest: Manifest): Map<string, ClassInfo> {
    const result = new Map<string, ClassInfo>();

    for (const statement of sf.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;

        const specifier = statement.moduleSpecifier.text;
        const bindings = statement.importClause?.namedBindings;

        if ((specifier !== manifest.package && !specifier.startsWith(`${manifest.package}/`)) || !bindings || !ts.isNamedImports(bindings)) continue;

        for (const element of bindings.elements) {
            const exported = (element.propertyName ?? element.name).text;
            let info: ClassInfo | undefined = manifest.modules[specifier]?.[exported];

            if (!info && specifier === manifest.package) {
                const found = Object.values(manifest.modules)
                    .map((classes) => classes[exported])
                    .filter(Boolean);

                info = found.length === 1 ? found[0] : undefined;
            }

            if (info) result.set(element.name.text, info);
        }
    }

    return result;
}
