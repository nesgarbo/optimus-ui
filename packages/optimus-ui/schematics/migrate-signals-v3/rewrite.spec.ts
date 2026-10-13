import { describe, expect, it } from 'vitest';
import { Manifest, rewriteSignalsV3 } from './rewrite';

const manifest: Manifest = {
    package: '@openng/optimus-ui',
    modules: {
        '@openng/optimus-ui/table': {
            Table: { members: { rows: 'model', first: 'model', value: 'input', onPage: 'output', contentViewChild: 'viewChild' }, hasTemplates: true }
        },
        '@openng/optimus-ui/dialog': {
            Dialog: { members: { header: 'input', visible: 'model', onHide: 'output' } }
        }
    },
    instanceMembers: ['disabled', 'header', 'visible'],
    ambiguousInstanceMembers: ['value']
};

const run = (body: string, imports = `import { Table } from '@openng/optimus-ui/table';\nimport { Dialog } from '@openng/optimus-ui/dialog';\n`) => rewriteSignalsV3(`${imports}${body}`, manifest);
const out = (body: string) => run(body).text.slice(run('').text.length);

describe('rewriteSignalsV3', () => {
    it('reads a member of a decorated query as a function', () => {
        const body = `class A {\n    @ViewChild(Table) table!: Table;\n    go() {\n        const r = this.table.rows;\n        return this.table?.value.length + r;\n    }\n}\n`;

        expect(out(body)).toBe(body.replace('this.table.rows;', 'this.table.rows();').replace('this.table?.value.length', 'this.table?.value().length'));
    });

    it('reads a member through viewChild, inject, a typed variable and a cast', () => {
        const body = `class A {\n    t = viewChild.required(Table);\n    inj = inject(Table);\n    go(p: Table, fixture: any) {\n        const c = fixture.x as Table;\n        return [this.t().rows, this.inj.rows, p.rows, c.rows, (fixture.y as Table).rows];\n    }\n}\n`;

        expect(out(body)).toBe(body.replace(/rows(?=[,\]])/g, 'rows()'));
    });

    it('writes a model with set, including nested reads', () => {
        const body = `function f(dialog: Dialog, table: Table) {\n    table.first = 20;\n    dialog.visible = !dialog.visible;\n    table.first = table.rows;\n}\n`;

        expect(out(body)).toBe(`function f(dialog: Dialog, table: Table) {\n    table.first.set(20);\n    dialog.visible.set(!dialog.visible());\n    table.first.set(table.rows());\n}\n`);
        expect(run(body).todos).toBe(0);
    });

    it('leaves a TODO above the assignment to an input', () => {
        const result = run(`function f(dialog: Dialog) {\n    if (ok) {\n        dialog.header = 'x';\n    }\n}\n`);

        expect(result.text).toContain(`        // TODO(optimus-ui 3.0): inputs are read only signals; bind it in the template or use componentRef.setInput('header', ...)\n        dialog.header = 'x';`);
        expect(result.todos).toBe(1);
        expect(result.rewrites).toBe(0);
    });

    it('does not rewrite an assignment that is not a statement or is compound', () => {
        const result = run(`function f(table: Table) {\n    const x = (table.first = 1);\n    table.first += 1;\n    table.first++;\n}\n`);

        expect(result.text).not.toContain('table.first.set(');
        expect(result.todos).toBe(3);
    });

    it('recommends outputToObservable for pipe, next and observers on an output', () => {
        const result = run(`function f(table: Table) {\n    table.onPage.pipe(map(x => x));\n    table.onPage.subscribe(x => x);\n    table.onPage.next(1);\n    return table.onPage.observers;\n}\n`);

        expect(result.todos).toBe(3);
        expect(result.text).toContain('outputToObservable');
        expect(result.text).toContain('table.onPage.subscribe(x => x);');
    });

    it('marks templates and the QueryList of a class', () => {
        const result = run(`function f(table: Table) {\n    return table.templates.forEach(x => x);\n}\n`);

        expect(result.todos).toBe(1);
        expect(result.text).toContain('templates is not a QueryList');
    });

    it('reads instance in a pass through function', () => {
        const body = `const config = {\n    pt: {\n        root: ({ instance }) => ({ class: instance.disabled ? 'off' : 'on' }),\n        header: (options) => options.instance.header,\n        other: ({ instance: inst }) => inst.visible\n    }\n};\nconst plain = ({ instance }) => instance.disabled;\n`;

        expect(out(body)).toBe(body.replace('instance.disabled ?', 'instance.disabled() ?').replace('options.instance.header', 'options.instance.header()').replace('inst.visible', 'inst.visible()'));
    });

    it('leaves a TODO for a member that is a plain value in some components', () => {
        const result = run(`const pt = { root: ({ instance }) => instance.value };\n`);

        expect(result.todos).toBe(1);
        expect(result.text).not.toContain('instance.value()');
    });

    it('is idempotent', () => {
        const body = `class A {\n    @ViewChild(Table) table!: Table;\n    dialog = inject(Dialog);\n    pt = { root: ({ instance }) => instance.disabled };\n    go() {\n        this.table.first = 2;\n        this.dialog.header = 'x';\n        this.table.onPage.pipe();\n        return this.table.rows + this.table.value.length;\n    }\n}\n`;
        const first = run(body);
        const second = rewriteSignalsV3(first.text, manifest);

        expect(first.changed).toBe(true);
        expect(second.changed).toBe(false);
        expect(second.text).toBe(first.text);
    });

    it('does not touch a call that already uses the signal', () => {
        const body = `function f(table: Table) {\n    table.first.set(1);\n    return table.rows() + table.value.length;\n}\n`;

        expect(out(body)).toBe(body.replace('table.value.length', 'table.value().length'));
    });

    it('does not touch a name with conflicting or unknown declarations', () => {
        const body = `class A {\n    a(table: Table) { return table.rows; }\n    b(table) { return table.rows; }\n    c() { const { rows } = this.other; }\n}\n`;

        expect(run(body).changed).toBe(false);
    });

    it('does not touch a class that the file does not import from the library', () => {
        const body = `class Table { rows = 1 }\nfunction f(table: Table) { return table.rows; }\n`;

        expect(rewriteSignalsV3(body, manifest).changed).toBe(false);
        expect(rewriteSignalsV3(`import { Table } from './mine';\n${body}`, manifest).changed).toBe(false);
    });

    it('resolves an aliased import and the package root', () => {
        const result = rewriteSignalsV3(`import { Table as PTable } from '@openng/optimus-ui';\nfunction f(t: PTable) { return t.rows; }\n`, manifest);

        expect(result.text).toContain('t.rows()');
    });
});
