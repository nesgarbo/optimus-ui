import js from '@eslint/js';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const angularRules = (plugin, names, prefix) => Object.fromEntries(names.filter((n) => plugin.rules[n]).map((n) => [`${prefix}/${n}`, 'error']));

export default [
    {
        ignores: ['**/dist/**', '**/node_modules/**', '**/.angular/**', '**/.demos/**', 'apps/docs/public/**', '**/umd/**', '**/*.d.mts', '**/*.d.cts']
    },
    { ...js.configs.recommended, files: ['**/*.{js,mjs,cjs,ts,mts}'] },
    {
        languageOptions: { globals: { ...globals.node, ...globals.browser } }
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            '@angular-eslint': angular
        },
        processor: angularTemplate.processors?.['extract-inline-html'],
        rules: {
            ...tsPlugin.configs['flat/eslint-recommended'].rules,
            ...tsPlugin.configs.recommended.rules,
            ...angularRules(
                angular,
                [
                    'contextual-lifecycle',
                    'no-empty-lifecycle-method',
                    'no-input-rename',
                    'no-inputs-metadata-property',
                    'no-output-native',
                    'no-output-rename',
                    'no-outputs-metadata-property',
                    'prefer-inject',
                    'use-lifecycle-interface',
                    'use-pipe-transform-interface',
                    'directive-class-suffix'
                ],
                '@angular-eslint'
            ),
            '@angular-eslint/component-selector': ['warn', { type: 'element', prefix: 'p', style: 'kebab-case' }],
            '@angular-eslint/directive-selector': ['warn', { type: 'attribute', prefix: 'p', style: 'camelCase' }],
            '@angular-eslint/component-class-suffix': ['error', { suffixes: [''] }],
            '@angular-eslint/no-host-metadata-property': 'off',
            '@angular-eslint/no-output-on-prefix': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@angular-eslint/directive-class-suffix': 'off',
            '@angular-eslint/use-lifecycle-interface': 'warn',
            '@typescript-eslint/no-unsafe-declaration-merging': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-var': 'warn',
            'no-useless-assignment': 'warn',
            '@angular-eslint/no-output-native': 'warn',
            '@angular-eslint/no-input-rename': 'warn',
            '@angular-eslint/no-output-rename': 'warn',
            '@angular-eslint/no-empty-lifecycle-method': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-require-imports': 'warn',
            '@typescript-eslint/no-wrapper-object-types': 'warn',
            '@typescript-eslint/no-this-alias': 'warn',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
            '@typescript-eslint/no-duplicate-enum-values': 'warn',
            'no-regex-spaces': 'warn',
            'no-useless-escape': 'warn',
            'no-empty': 'warn',
            'no-control-regex': 'warn',
            'no-extra-boolean-cast': 'warn',
            'no-case-declarations': 'warn',
            'no-constant-condition': 'warn',
            'no-irregular-whitespace': 'warn',
            'no-unused-vars': 'off',
            'no-fallthrough': 'warn',
            'no-prototype-builtins': 'warn',
            '@typescript-eslint/no-inferrable-types': 'off',
            'no-undef': 'off',
            'arrow-body-style': ['warn', 'as-needed'],
            curly: 0,
            '@typescript-eslint/member-ordering': ['off', { default: ['public-static-field', 'static-field', 'instance-field', 'public-instance-method', 'public-static-field'] }],
            'no-console': 0,
            'prefer-const': 0,
            '@angular-eslint/prefer-inject': 'warn',
            '@angular-eslint/prefer-signals': 'warn',
            '@angular-eslint/prefer-signal-model': 'warn',
            '@angular-eslint/prefer-output-emitter-ref': 'warn',
            '@angular-eslint/prefer-standalone': 'warn',
            '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
            '@typescript-eslint/no-unused-expressions': 'warn',
            'padding-line-between-statements': [
                'off',
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
        files: ['apps/**/*.ts', '**/*.test.ts'],
        rules: {
            '@angular-eslint/use-lifecycle-interface': 'off',
            '@angular-eslint/component-selector': 'off',
            '@angular-eslint/directive-selector': 'off'
        }
    },
    {
        // The public API of the library is signals only (3.0): a decorator, a constructor injection or a signal
        // that is not readonly is a mistake. The tests keep their warnings.
        files: ['packages/optimus-ui/src/**/*.ts'],
        ignores: ['**/*.test.ts'],
        rules: {
            '@angular-eslint/prefer-signals': 'error',
            '@angular-eslint/prefer-inject': 'error',
            '@angular-eslint/prefer-output-emitter-ref': 'error'
        }
    },
    {
        files: ['packages/optimus-ui/src/**/*.html'],
        languageOptions: { parser: templateParser },
        plugins: { '@angular-eslint/template': angularTemplate },
        rules: { '@angular-eslint/template/prefer-control-flow': 'error' }
    },
    {
        files: ['**/*.html'],
        languageOptions: { parser: templateParser },
        plugins: { '@angular-eslint/template': angularTemplate },
        rules: {
            ...angularRules(angularTemplate, ['banana-in-box', 'no-negated-async'], '@angular-eslint/template'),
            '@angular-eslint/template/prefer-control-flow': 'warn',
            '@angular-eslint/template/eqeqeq': ['warn', { allowNullOrUndefined: true }]
        }
    },
    {
        files: ['**/*.{js,mjs}'],
        rules: { 'no-unused-vars': 'warn', 'no-regex-spaces': 'warn', 'no-useless-escape': 'warn' }
    },
    prettier
];
