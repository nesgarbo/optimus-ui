import { defineConfig } from 'vitest/config';

// Jasmine implicitly restores every spyOn'd method after each spec; vitest does
// not, so spies on shared globals (document, window.MutationObserver, ...) leak
// across tests and files. restoreMocks replicates jasmine's per-spec restoration
// suite-wide. Only options the Angular unit-test builder does not manage belong
// in this file.
//
// The coverage block is read only when the run asks for coverage (`test:unit:coverage`). The
// builder sets the provider and the reports folder itself, so they are not repeated here, and there is
// no `include` on purpose: with one, vitest reads the files that no test loaded through vite instead of
// the Angular build, which cannot resolve the `@openng/optimus-ui/*` paths, and the report comes out at 0%.
export default defineConfig({
    test: {
        restoreMocks: true,
        coverage: {
            exclude: ['**/*.test.ts', '**/*.d.ts', '**/public_api.ts', '**/src/icons/**', '**/src/types/**', '**/style/**'],
            reporter: ['text-summary', 'lcov'],
            // A net against regressions, a little under what the suite measures (statements 67.6, branches 53.7, functions 68.0,
            // lines 68.8): raise it when the coverage rises, never to chase a number. Only the files the tests load are counted.
            thresholds: {
                statements: 65,
                branches: 51,
                functions: 65,
                lines: 66
            }
        }
    }
});
