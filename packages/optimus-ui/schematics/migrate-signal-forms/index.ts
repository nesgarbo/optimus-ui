import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SKIP_DIRS } from '../utils/package-json';
import { rewriteAutoCompleteTags } from './rewrite';

/**
 * Migration for the signal forms release.
 *
 * `p-autocomplete` lost the `minLength` input that was deprecated since v20, because `minLength` is the
 * name a signal form (`[formField]`) binds to the string length of the field. The minimum query length
 * is `minQueryLength`. This renames the attribute in templates and inline templates.
 *
 * `p-password` also lost its deprecated `maxLength` decorator input, but `maxLength` is still accepted
 * with the same meaning, so there is nothing to rename.
 */
export function migrateSignalForms(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        let changedFiles = 0;

        tree.visit((path) => {
            if (SKIP_DIRS.test(path) || !(path.endsWith('.html') || path.endsWith('.ts') || path.endsWith('.mts'))) {
                return;
            }

            const original = tree.read(path)?.toString();

            if (!original || !/<p-(?:auto-?complete)\b/i.test(original)) {
                return;
            }

            const { text, changed } = rewriteAutoCompleteTags(original);

            if (changed) {
                tree.overwrite(path, text);
                changedFiles++;
                context.logger.info(`${path}: renamed minLength to minQueryLength on p-autocomplete`);
            }
        });

        if (changedFiles === 0) {
            context.logger.info('No p-autocomplete with minLength was found.');
        } else {
            context.logger.warn('If your code reads or sets the `minLength` property of an AutoComplete instance (for example through viewChild), rename it to `minQueryLength` by hand.');
        }

        return tree;
    };
}
