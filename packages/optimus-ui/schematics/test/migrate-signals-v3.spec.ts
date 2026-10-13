import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { describe, expect, it } from 'vitest';
import { createAppTree } from './helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_PATH = path.resolve(__dirname, '../dist/migrations.json');

const run = async (files: Record<string, string>) => {
    const runner = new SchematicTestRunner('optimus-ui-migrations', MIGRATIONS_PATH);
    const logs: string[] = [];

    runner.logger.subscribe((entry) => logs.push(entry.message));

    const tree = await runner.runSchematic('migrate-signals-v3', {}, createAppTree(files));

    return { tree, logs };
};

describe('migrate-signals-v3', () => {
    it('is registered for 3.0.0 and ships its manifest in dist', () => {
        const migrations = JSON.parse(fs.readFileSync(MIGRATIONS_PATH, 'utf8'));

        expect(migrations.schematics['migrate-signals-v3'].version).toBe('3.0.0');

        const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../dist/migrate-signals-v3/manifest.json'), 'utf8'));

        expect(manifest.modules['@openng/optimus-ui/table'].Table.members).toMatchObject({ first: 'model', rows: 'model', value: 'input', onPage: 'output' });
        expect(manifest.modules['@openng/optimus-ui/fileupload'].FileUpload.live.files).toEqual({ name: '_files', call: false });
        expect(manifest.modules['@openng/optimus-ui/table'].Table.live.value).toEqual({ name: '_value', call: true });
        const live = Object.values(manifest.modules as Record<string, Record<string, { live?: Record<string, unknown> }>>).flatMap((classes) =>
            Object.entries(classes).flatMap(([name, info]) => Object.keys(info.live ?? {}).map((member) => `${name}.${member}`))
        );

        // Base layer members and template inputs are not live state; neither are the ones checked against 2.x and left out.
        expect(live.filter((entry) => /\.disabled$/.test(entry) && !entry.startsWith('Scroller.'))).toEqual([]);
        expect(live.filter((entry) => /Template$/.test(entry))).toEqual([]);
        expect(live).not.toContain('Drawer.position');
        expect(live).not.toContain('Select.placeholder');
        expect(manifest.modules['@openng/optimus-ui/dialog'].Dialog.members).toMatchObject({ visible: 'model' });
    });

    it('rewrites reads, model writes, pt and leaves TODOs, then logs a summary', async () => {
        const { tree, logs } = await run({
            '/src/app/list.ts': `import { Component, viewChild } from '@angular/core';
import { Table } from '@openng/optimus-ui/table';
import { Dialog } from '@openng/optimus-ui/dialog';

@Component({ selector: 'app-list', template: '' })
export class List {
    table = viewChild.required(Table);
    dialog = viewChild(Dialog);
    pt = { root: ({ instance }) => ({ class: instance.showClear ? 'off' : 'on' }) };

    go() {
        const rows = this.table().rows;
        const items = this.table().value;
        this.table().first = 20;
        this.dialog()!.header = 'x';
    }
}
`
        });
        const content = tree.readContent('/src/app/list.ts');

        expect(content).toContain('const rows = this.table().rows();');
        expect(content).toContain('this.table().first.set(20);');
        expect(content).toContain('const items = this.table()._value();');
        expect(content).toContain(`// TODO(optimus-ui 3.0): inputs are read only signals; bind it in the template or use componentRef.setInput('header', ...)\n        this.dialog()!.header = 'x';`);
        expect(content).toContain('instance.showClear() ?');
        expect(logs.join('\n')).toContain('1 file(s) changed, 4 rewrite(s), 1 TODO comment(s) left');
        expect(logs.join('\n')).toContain('Migrating to 3.0: Signals API');
    });

    it('is idempotent', async () => {
        const source = `import { Table } from '@openng/optimus-ui/table';\nexport function f(t: Table) {\n    t.first = 1;\n    return t.rows;\n}\n`;
        const first = await run({ '/src/app/a.ts': source });
        const second = await run({ '/src/app/a.ts': first.tree.readContent('/src/app/a.ts') });

        expect(second.tree.readContent('/src/app/a.ts')).toBe(first.tree.readContent('/src/app/a.ts'));
        expect(second.logs.join('\n')).toContain('0 file(s) changed');
    });

    it('does not touch files without imports from the library, nor templates', async () => {
        const plain = `export function f(t: { rows: number }) {\n    return t.rows;\n}\n`;
        const html = `<p-table #t [rows]="10"></p-table>\n`;
        const { tree } = await run({ '/src/app/plain.ts': plain, '/src/app/app.html': html });

        expect(tree.readContent('/src/app/plain.ts')).toBe(plain);
        expect(tree.readContent('/src/app/app.html')).toBe(html);
    });
});
