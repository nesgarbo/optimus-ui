import type { UserConfig } from '@commitlint/types';
import { findAiCoAuthorTrailers } from './scripts/commitlint/no-ai-co-author';

const config: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    plugins: [
        {
            rules: {
                'no-ai-co-author': (parsed) => {
                    const aiCoAuthors = findAiCoAuthorTrailers(parsed.raw ?? '');

                    return [aiCoAuthors.length === 0, `commit message must not credit an AI agent as Co-authored-by (found: ${aiCoAuthors.join(', ')})`];
                }
            }
        }
    ],
    rules: {
        'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']],
        'subject-case': [1, 'always', ['sentence-case', 'lower-case']],
        'body-max-line-length': [0],
        'no-ai-co-author': [2, 'always']
    },
    ignores: [(commit: string) => commit.startsWith('Merge')],
    parserPreset: {
        parserOpts: {
            issuePrefixes: ['Fixes #', 'Fixed #']
        }
    }
};

export default config;
