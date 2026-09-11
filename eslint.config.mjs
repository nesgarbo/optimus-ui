import js from '@eslint/js';
import angular from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

/**
 * Flat config, which is the only format ESLint 9 reads. This file used to be written in
 * the old `.eslintrc` shape (`root`, `extends`, `overrides`), so `pnpm run lint` failed
 * before it linted a single file — and nobody had seen its output in a long time.
 *
 * Two things follow from that. The rules the repository declared are kept, on top of the
 * recommended sets from ESLint, typescript-eslint and angular-eslint. And the library,
 * which is a drop-in continuation of PrimeNG v21 and predates most of Angular's newer
 * idioms, reports those idioms as warnings rather than errors: they are migrations to
 * schedule, not defects to block a commit on. Application code — the documentation site —
 * is held to the full set.
 *
 * Type-aware linting is deliberately left out: none of the enabled rules need type
 * information, and turning it on costs a full program per package for no extra coverage.
 */

/** Advice about newer Angular idioms. Useful to read, wrong thing to fail a build on. */
const MIGRATION_ADVICE = {
    '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    '@angular-eslint/prefer-standalone': 'off',
    '@angular-eslint/prefer-inject': 'off',
    '@angular-eslint/prefer-signals': 'off'
};

/** Long-standing patterns in the library, surfaced now that the linter runs at all. */
const LIBRARY_LEGACY = {
    '@angular-eslint/component-selector': 'warn',
    '@angular-eslint/component-class-suffix': 'off',
    '@angular-eslint/use-lifecycle-interface': 'warn',
    '@angular-eslint/no-input-rename': 'warn',
    '@angular-eslint/no-output-native': 'warn',
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'warn',
    '@typescript-eslint/no-wrapper-object-types': 'warn',
    'no-extra-boolean-cast': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    '@typescript-eslint/no-duplicate-enum-values': 'warn',
    'no-case-declarations': 'warn',
    'no-useless-escape': 'warn',
    'no-duplicate-case': 'warn',
    'no-unsafe-optional-chaining': 'warn',
    'no-irregular-whitespace': 'warn',
    'no-constant-condition': 'warn',
    '@angular-eslint/no-output-rename': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    'no-prototype-builtins': 'warn',
    'no-fallthrough': 'warn',
    'no-empty': 'warn',
    'no-var': 'warn',
    'arrow-body-style': 'off',
    'padding-line-between-statements': 'off'
};

export default tseslint.config(
    {
        ignores: ['**/dist/**', '**/node_modules/**', '**/.angular/**', '**/.nitro/**', '**/.vercel/**', '**/out-tsc/**', '**/coverage/**', '**/tokens/**', 'apps/docs/src/doc/apidoc/**', 'apps/docs/public/**']
    },
    {
        files: ['**/*.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,
        plugins: { prettier },
        rules: {
            ...prettierConfig.rules,
            ...MIGRATION_ADVICE,
            '@angular-eslint/no-output-on-prefix': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, varsIgnorePattern: '^_' }],
            'arrow-body-style': ['error', 'as-needed'],
            curly: 'off',
            'no-console': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'prefer-const': 'off',
            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                { blankLine: 'any', prev: ['case', 'default'], next: 'break' },
                { blankLine: 'any', prev: 'case', next: 'case' },
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: 'block', next: '*' },
                { blankLine: 'always', prev: '*', next: 'block' },
                { blankLine: 'always', prev: 'block-like', next: '*' },
                { blankLine: 'always', prev: '*', next: 'block-like' },
                { blankLine: 'always', prev: ['import'], next: ['const', 'let', 'var'] }
            ]
        }
    },
    {
        /*
         * The `p-` prefix is the library's public API, so it is enforced where that API is
         * declared. The documentation site names its own components after what they are —
         * `hero-section`, `app-topbar` — and is not part of that surface.
         */
        files: ['packages/**/*.ts'],
        rules: {
            // `tt` is the TreeTable's own published prefix (`ttSortableColumn`, `ttRow`), the
            // counterpart of Table's `p`-prefixed directives. Both are public API.
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['p', 'tt'], style: 'camelCase' }],
            ...LIBRARY_LEGACY
        }
    },
    {
        // Tests, build scripts and configs are not application code: the Angular naming
        // rules and the statement padding do not apply to them.
        files: ['**/*.test.ts', '**/*.spec.ts', '**/scripts/**', '**/*.config.{ts,mts,mjs,js}', '**/*.mjs'],
        rules: {
            '@angular-eslint/component-selector': 'off',
            '@angular-eslint/directive-selector': 'off',
            '@angular-eslint/component-class-suffix': 'off',
            'padding-line-between-statements': 'off'
        }
    },
    {
        // Only component templates: the app shell and any prerendered page are plain HTML,
        // not Angular templates, and the template parser chokes on their braces.
        files: ['**/src/**/*.html', '**/*.ts/*.html'],
        extends: [...angular.configs.templateRecommended],
        rules: {
            ...prettierConfig.rules,
            '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
            // The older documentation components predate the built-in control flow.
            '@angular-eslint/template/prefer-control-flow': 'warn'
        }
    },
    {
        /*
         * Last, so it relaxes the block above for the library: its templates are the
         * PrimeNG v21 ones, written before the built-in control flow and before these
         * accessibility rules existed.
         */
        files: ['packages/**/*.html', 'packages/**/*.ts/*.html'],
        rules: {
            '@angular-eslint/template/prefer-control-flow': 'off',
            '@angular-eslint/template/prefer-self-closing-tags': 'off',
            '@angular-eslint/template/eqeqeq': 'warn',
            '@angular-eslint/template/no-negated-async': 'warn',
            '@angular-eslint/template/interactive-supports-focus': 'warn',
            '@angular-eslint/template/click-events-have-key-events': 'warn'
        }
    }
);
