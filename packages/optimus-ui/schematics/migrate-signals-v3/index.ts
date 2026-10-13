import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SKIP_DIRS } from '../utils/package-json';
import manifest from './manifest.json';
import { Manifest, rewriteSignalsV3 } from './rewrite';

export const SIGNALS_GUIDE_URL = 'https://optimus.openng.org/migration/update#signals-api';

/**
 * Migration to the signals API of 3.0.
 *
 * Every public property of a component that was a plain field is an `input()`, `model()`, `output()` or
 * query signal now. The migration reads `./manifest.json` (generated from the library sources by
 * `scripts/generate-signals-manifest.mjs`) and rewrites only what is not ambiguous, on references whose
 * type the file declares (`@ViewChild(Table) table: Table`, `viewChild(Table)`, `inject(Table)`, `x as Table`):
 *
 * - `table.rows` becomes `table.rows()`;
 * - `table.first = 20` becomes `table.first.set(20)` for a `model()`;
 * - `instance.disabled` becomes `instance.disabled()` in the pass through (`pt`) functions.
 *
 * What cannot be rewritten without knowing more gets a `TODO(optimus-ui 3.0)` comment: a write to an input,
 * `.pipe` on an output, `QueryList` methods. Templates are not touched, because the bindings do not change.
 */
export function migrateSignalsV3(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        let changedFiles = 0;
        let rewrites = 0;
        let todos = 0;

        tree.visit((path) => {
            if (SKIP_DIRS.test(path) || !/\.m?ts$/.test(path) || path.endsWith('.d.ts')) {
                return;
            }

            const original = tree.read(path)?.toString();

            if (!original) {
                return;
            }

            const result = rewriteSignalsV3(original, manifest as unknown as Manifest);

            if (!result.changed) {
                return;
            }

            tree.overwrite(path, result.text);
            changedFiles++;
            rewrites += result.rewrites;
            todos += result.todos;
            context.logger.info(`${path}: ${result.rewrites} rewritten, ${result.todos} TODO`);
        });

        context.logger.info(`Signals API: ${changedFiles} file(s) changed, ${rewrites} rewrite(s), ${todos} TODO comment(s) left.`);

        if (todos > 0) {
            context.logger.warn(`Search the project for "TODO(optimus-ui 3.0)": those places need a manual change.`);
        }

        context.logger.info(
            'Templates were not changed: the bindings ([x], [(x)], (onX)) work as before. Code that reads a component through a template reference (#t) or ComponentRef without a declared type was not touched: call its inputs as functions by hand.'
        );
        context.logger.info(`Guide: ${SIGNALS_GUIDE_URL} (Migrating to 3.0: Signals API)`);

        return tree;
    };
}
