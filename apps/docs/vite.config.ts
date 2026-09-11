import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = (name: string) => path.resolve(here, '../../packages', name);

// The docs run against the library sources, not the published bundles, so a change in
// packages/ shows up in the running site without a rebuild. Vite needs these spelled out
// as aliases: tsconfig `paths` alone does not reach importers that live inside packages/.
const workspaceAliases = [
    { find: /^@openng\/optimus-ui\/(.*)$/, replacement: `${pkg('optimus-ui')}/src/$1/public_api` },
    { find: '@openng/optimus-ui-themes/tokens', replacement: `${pkg('optimus-ui-themes')}/tokens` },
    { find: /^@openng\/optimus-ui-themes\/types\/(.*)$/, replacement: `${pkg('optimus-ui-themes')}/types/$1` },
    { find: '@openng/optimus-ui-themes/types', replacement: `${pkg('optimus-ui-themes')}/types` },
    { find: /^@openng\/optimus-ui-themes\/(.*)$/, replacement: `${pkg('optimus-ui-themes')}/src/presets/$1` },
    { find: '@openng/optimus-ui-themes', replacement: `${pkg('optimus-ui-themes')}/src/index.ts` },
    { find: /^@openng\/optimus-ui-styles\/(.*)$/, replacement: `${pkg('optimus-ui-styles')}/src/$1` },
    { find: '@openng/optimus-ui-styles', replacement: `${pkg('optimus-ui-styles')}/src/index.ts` },
    { find: /^@openng\/optimus-ui-utils\/(.*)$/, replacement: `${pkg('optimus-ui-utils')}/src/$1` },
    { find: '@openng/optimus-ui-utils', replacement: `${pkg('optimus-ui-utils')}/src/index.ts` },
    { find: '@openng/optimus-ui-motion', replacement: `${pkg('optimus-ui-motion')}/src/index.ts` },
    { find: '@openng/optimus-ui-styled', replacement: `${pkg('optimus-ui-styled')}/src/index.ts` },
    { find: /^@\/(.*)$/, replacement: `${path.resolve(here, 'src')}/$1` }
];

// The docs site is an Analog app: Vite for the build, file-based routing for the
// 110+ component pages under src/app/pages, Nitro for SSR and prerendering.
export default defineConfig(({ mode }) => ({
    root: here,
    publicDir: 'public',
    build: {
        target: ['es2022'],
        sourcemap: mode !== 'production',
        /*
         * One chunk per lazy component leaves a page asking for a hundred scripts, sixty
         * of them under five kilobytes: all of them round trips, none of them worth their
         * own request. Rolldown merges anything below the floor into its parent, which on
         * a component page cuts the requests by more than half and changes nothing about
         * what is loaded.
         */
        rollupOptions: {
            output: {
                advancedChunks: {
                    minSize: 30_000,
                    minShareCount: 2
                }
            }
        }
    },
    resolve: {
        alias: workspaceAliases,
        mainFields: ['module']
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'legacy-js-api']
            }
        }
    },
    plugins: [
        tailwindcss(),
        analog({
            ssr: true,
            static: true,
            prerender: {
                routes: async () => {
                    const { docsRoutes } = await import('./scripts/prerender-routes.mjs');
                    return docsRoutes();
                },
                // Only the routes above. Discovering more by following links also rendered
                // the redirect pages and a `/button%23accessibility`, each a 200 that
                // duplicated another page.
                discover: false
            },
            nitro: {
                // Every route is prerendered, so the deployed site is plain static files
                // and there is no server rendering at request time.
                preset: 'static',
                compatibilityDate: '2026-01-01'
            },
            vite: {
                inlineStylesExtension: 'scss'
            }
        })
        /*
         * Vite 8 builds the client and ssr environments through the Environment API, and
         * Analog 2.7 is aligned with it, so the two no longer race over one Angular
         * compilation. Isolating the plugins here — which is what this app needed on Vite 7
         * to stop the second environment emitting raw TypeScript — makes the ssr assets be
         * emitted twice with different hashes, and the prerenderer then looks for a chunk
         * that is not there. Leave the plugins shared.
         */
    ]
}));
