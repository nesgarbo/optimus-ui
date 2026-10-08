import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { describe, expect, it } from 'vitest';
import { createAppTree } from './helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_PATH = path.resolve(__dirname, '../dist/migrations.json');

const run = (files: Record<string, string>) => new SchematicTestRunner('optimus-ui-migrations', MIGRATIONS_PATH).runSchematic('migrate-signal-forms', {}, createAppTree(files));

describe('migrate-signal-forms', () => {
    it('renames minLength on p-autocomplete in a template file', async () => {
        const tree = await run({ '/src/app/app.html': `<p-autocomplete [(ngModel)]="city" minLength="3" [suggestions]="items" />\n` });

        expect(tree.readContent('/src/app/app.html')).toBe(`<p-autocomplete [(ngModel)]="city" minQueryLength="3" [suggestions]="items" />\n`);
    });

    it('renames minLength in an inline template', async () => {
        const tree = await run({
            '/src/app/card.ts': `import { Component } from '@angular/core';\n@Component({ selector: 'app-card', template: \`<p-autocomplete [minLength]="min" />\` })\nexport class Card {}\n`
        });

        expect(tree.readContent('/src/app/card.ts')).toContain('[minQueryLength]="min"');
    });

    it('does not touch files without p-autocomplete', async () => {
        const content = `<p-password minLength="3" />\n`;
        const tree = await run({ '/src/app/app.html': content });

        expect(tree.readContent('/src/app/app.html')).toBe(content);
    });
});
