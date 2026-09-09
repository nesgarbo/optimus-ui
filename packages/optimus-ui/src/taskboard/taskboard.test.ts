import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { TaskBoardColumnGroup, TaskBoardColumnModel, TaskBoardItem, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';
import { beforeEach, describe, expect, it } from 'vitest';
import { TaskBoard } from './taskboard';
import { TaskBoardModule } from './taskboard.module';

// Se monta el árbol compuesto TAL CUAL lo escribe un consumidor: root → content → columna con su
// definición → cabecera de serie + tarjetas de serie. Lo que se protege:
//   - que la composición compile y pinte las columnas, las tarjetas y sus data-attributes,
//   - que la definición de columna gane al contenido proyectado, y el fallback cuando no hay ninguna,
//   - que las partes de serie lean su contexto sin recibir un solo input,
//   - que el plegado, la selección y el foco lleguen al DOM,
//   - que las cabeceras de fase midan por tramos de columnas consecutivas.

interface Card extends TaskBoardItem {
    id: string;
    title: string;
    columnId: string;
    order: number;
}

const COLUMNS: TaskBoardColumnModel[] = [
    { id: 'backlog', label: 'Backlog', statusType: 'todo', order: 0 },
    { id: 'active', label: 'Active', statusType: 'in-progress', wipLimit: 2, order: 1 },
    { id: 'done', label: 'Done', statusType: 'done', order: 2, locked: true }
];

const GROUPS: TaskBoardColumnGroup[] = [
    { label: 'Intake', columns: ['backlog'], color: '#3b82f6' },
    { label: 'Delivery', columns: ['active', 'done'], color: '#10b981' }
];

const SWIMLANES: TaskBoardSwimlane[] = [{ id: 'growth', label: 'Growth', order: 0 }];

function cards(): Card[] {
    return [
        { id: 'a', title: 'Alpha', columnId: 'backlog', order: 0, description: 'Primera', tags: ['design'], assignee: 'Ana Ruiz' },
        { id: 'b', title: 'Beta', columnId: 'backlog', order: 1, progress: 40 },
        { id: 'c', title: 'Gamma', columnId: 'active', order: 0 },
        { id: 'd', title: 'Delta', columnId: 'active', order: 1 }
    ];
}

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-taskboard-root
            [tasks]="tasks()"
            (tasksChange)="tasks.set($event)"
            dataKey="id"
            columnField="columnId"
            [columns]="columns"
            [columnGroups]="groups()"
            [swimlanes]="swimlanes()"
            [swimlaneField]="swimlaneField()"
            [selectionMode]="'multiple'"
            [density]="density()"
        >
            <p-taskboard-header><span class="toolbar">Toolbar</span></p-taskboard-header>
            <p-taskboard-content>
                @for (column of columns; track column.id) {
                    <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                        <ng-template pTaskBoardColumnDef let-columnContext let-itemCount="itemCount">
                            <p-taskboard-column-header>
                                <p-taskboard-column-header-ui />
                            </p-taskboard-column-header>
                            <p-taskboard-column-content>
                                @for (item of columnContext.visibleItems; track item.id; let index = $index) {
                                    <p-taskboard-drop-indicator [index]="index" />
                                    <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                } @empty {
                                    <p-taskboard-column-empty />
                                }
                                <p-taskboard-drop-indicator [index]="columnContext.visibleItems.length" />
                            </p-taskboard-column-content>
                            <p-taskboard-column-footer
                                ><span class="footer-count">{{ itemCount }}</span></p-taskboard-column-footer
                            >
                        </ng-template>
                    </p-taskboard-column>
                }
            </p-taskboard-content>
            <p-taskboard-drag-preview />
            <p-taskboard-drag-confirm />
        </p-taskboard-root>
    `
})
class TestHost {
    readonly board = viewChild.required(TaskBoard);

    readonly columns = COLUMNS;
    readonly tasks = signal<Card[]>(cards());
    readonly groups = signal<TaskBoardColumnGroup[]>([]);
    readonly swimlanes = signal<TaskBoardSwimlane[]>([]);
    readonly swimlaneField = signal<string | undefined>(undefined);
    readonly density = signal<'compact' | 'standard' | 'comfortable'>('standard');
}

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-taskboard-root [tasks]="tasks()" dataKey="id" columnField="columnId">
            <p-taskboard-content>
                <p-taskboard-column value="backlog" label="Backlog">
                    <span class="projected">Sin definición</span>
                </p-taskboard-column>
            </p-taskboard-content>
        </p-taskboard-root>
    `
})
class FallbackHost {
    readonly tasks = signal<Card[]>(cards());
}

describe('TaskBoard', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const q = (selector: string) => fixture.debugElement.queryAll(By.css(selector));
    const one = (selector: string) => q(selector)[0]?.nativeElement as HTMLElement | undefined;
    const text = (selector: string) => q(selector).map((el) => (el.nativeElement as HTMLElement).textContent?.trim());

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskBoardModule],
            declarations: [TestHost, FallbackHost],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('monta el árbol compuesto y pinta las columnas', () => {
        expect(q('[data-part="root"]').length).toBe(1);
        expect(one('[data-part="root"]')?.className).toContain('p-taskboard-density-standard');
        expect(q('[data-part="content"] [data-part="columns"]').length).toBe(1);
        expect(q('[data-part="column"]').length).toBe(3);
        expect(text('.toolbar')).toEqual(['Toolbar']);
    });

    it('la columna lleva su identidad, su familia de estado y su recuento accesible', () => {
        const backlog = one('[data-part="column"][data-column-id="backlog"]')!;

        expect(backlog.className).toContain('p-taskboard-column-todo');
        expect(backlog.getAttribute('role')).toBe('list');
        expect(backlog.getAttribute('data-taskboard-id-key')).toBe('s:backlog');
        expect(backlog.getAttribute('aria-label')).toBe('Backlog, 2 items');
        expect(backlog.getAttribute('aria-expanded')).toBe('true');
    });

    it('una columna bloqueada lo dice en su clase', () => {
        expect(one('[data-column-id="done"]')?.className).toContain('p-taskboard-column-locked');
    });

    it('la tarjeta es el objetivo de foco y de arrastre, con sus data-attributes', () => {
        const card = one('[data-part="card"][data-task-id="a"]')!;

        expect(card.getAttribute('role')).toBe('listitem');
        expect(card.getAttribute('data-taskboard-id-key')).toBe('s:a');
        expect(card.getAttribute('data-task-index')).toBe('0');
        expect(card.getAttribute('aria-label')).toBe('Alpha');
        expect(card.getAttribute('tabindex')).toBe('-1');
        expect(card.className).toContain('p-taskboard-card-draggable');
    });

    it('la definición de columna gana, y sin ninguna se usa el contenido proyectado', async () => {
        expect(q('.footer-count').length).toBe(3);
        expect(text('.footer-count')).toEqual(['2', '2', '0']);

        const fallback = TestBed.createComponent(FallbackHost);
        await fallback.whenStable();

        expect(fallback.debugElement.queryAll(By.css('.projected')).length).toBe(1);
    });

    it('las partes de serie leen su contexto sin recibir un solo input', () => {
        expect(text('.taskboard-column-header-title')).toEqual(['Backlog', 'Active', 'Done']);
        expect(text('.taskboard-card-title')).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
        expect(text('.taskboard-card-description')).toEqual(['Primera']);
        expect(one('.taskboard-card-progress-label')?.textContent?.trim()).toBe('40%');
    });

    it('la insignia de WIP sale solo en la columna que tiene límite, y avisa según lo lleno', () => {
        const badges = q('.taskboard-column-header-meta');

        expect(badges.length).toBe(1);
        expect((badges[0].nativeElement as HTMLElement).textContent?.trim()).toBe('WIP 2/2');
        expect((badges[0].nativeElement as HTMLElement).className).toContain('taskboard-column-header-meta--danger');
    });

    it('una columna vacía pinta su superficie de vacío', () => {
        expect(q('[data-column-id="done"] [data-part="column-empty"]').length).toBe(1);
    });

    it('los marcadores están declarados y todos escondidos mientras no se arrastra', () => {
        const markers = q('[data-part="drop-indicator"]');

        // Uno antes de cada tarjeta y uno al final, por columna: 3 + 3 + 1.
        expect(markers.length).toBe(7);
        expect(markers.every((marker) => (marker.nativeElement as HTMLElement).hasAttribute('hidden'))).toBe(true);
    });

    it('plegar una columna lo dice en la clase, en aria-expanded y en la etiqueta del control', async () => {
        host.board().collapseColumn('backlog');
        await fixture.whenStable();

        const backlog = one('[data-column-id="backlog"]')!;

        expect(backlog.className).toContain('p-taskboard-column-collapsed');
        expect(backlog.getAttribute('aria-expanded')).toBe('false');
        expect(one('.taskboard-column-header-collapse-toggle')?.getAttribute('aria-label')).toBe('Expand Backlog column');
    });

    it('seleccionar marca las tarjetas y emite la selección entera', async () => {
        host.board().setSelectedCards(['a', 'b']);
        await fixture.whenStable();

        expect(q('.p-taskboard-card-selected').length).toBe(2);
        expect(host.board().getSelectedCardIds()).toEqual(['a', 'b']);
    });

    it('un clic en una tarjeta la selecciona y le pasa el foco', async () => {
        (one('[data-task-id="c"]') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await fixture.whenStable();

        expect(host.board().getSelectedCardIds()).toEqual(['c']);
        expect(one('[data-task-id="c"]')?.className).toContain('p-taskboard-card-selected');
    });

    it('la densidad viaja a la clase de la raíz', async () => {
        host.density.set('compact');
        await fixture.whenStable();

        expect(one('[data-part="root"]')?.className).toContain('p-taskboard-density-compact');
    });

    it('las cabeceras de fase se agrupan por tramos de columnas consecutivas', async () => {
        host.groups.set(GROUPS);
        await fixture.whenStable();

        const headers = q('.p-taskboard-column-group-header');

        expect(text('.p-taskboard-column-group-header')).toEqual(['Intake', 'Delivery']);
        expect((headers[1].nativeElement as HTMLElement).style.getPropertyValue('--p-taskboard-group-span')).toBe('2');
        expect(one('[data-part="columns"]')?.className).toContain('p-taskboard-columns-with-groups');

        // La banda estrecha repite la etiqueta una vez por columna.
        expect(text('.p-taskboard-column-group-mobile-header')).toEqual(['Intake', 'Delivery', 'Delivery']);
    });

    it('un tablero agrupado cambia de contenedor y deja la rejilla a la aplicación', async () => {
        // Hacen falta las dos cosas: las filas Y el campo que las nombra. Sin el campo el tablero no
        // sabe a qué fila pertenece una tarjeta, así que no está agrupado.
        host.swimlanes.set(SWIMLANES);
        host.swimlaneField.set('swimlaneId');
        await fixture.whenStable();

        expect(one('[data-part="columns"]')?.className).toContain('p-taskboard-swimlane-grid');
    });

    it('la raíz lleva las regiones en vivo y los atajos que reclama', () => {
        const root = one('[data-part="root"]')!;

        expect(root.getAttribute('aria-label')).toBe('Task board');
        expect(root.getAttribute('aria-keyshortcuts')).toContain('Alt+ArrowLeft');
        expect(q('.p-taskboard-live-region').length).toBe(1);
        expect(q('.p-taskboard-live-region-assertive').length).toBe(1);
    });

    it('un movimiento imperativo reescribe la columna y anuncia el cambio', async () => {
        host.board().moveTask('a', 'active', 0);
        await fixture.whenStable();

        // active tiene wipLimit 2 y ya está llena, así que el movimiento se rechaza.
        expect(host.tasks().find((card) => card.id === 'a')!.columnId).toBe('backlog');

        host.board().moveTask('a', 'done', 0);
        await fixture.whenStable();

        expect(host.tasks().find((card) => card.id === 'a')!.columnId).toBe('done');
        expect(q('[data-column-id="done"] [data-part="card"]').length).toBe(1);
    });

    it('el teclado mueve el foco por las tarjetas de la celda', async () => {
        const root = one('[data-part="root"]')!;

        // El foco del DOM es lo que arranca la navegación, igual que al pinchar en el navegador: el
        // `focusin` de la tarjeta es lo que pone el foco móvil del tablero en ella.
        (one('[data-task-id="a"]') as HTMLElement).focus();
        await fixture.whenStable();

        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await fixture.whenStable();

        expect(one('[data-task-id="b"]')?.className).toContain('p-taskboard-card-focused');
    });

    it('Escape deshace la selección antes que el foco', async () => {
        const root = one('[data-part="root"]')!;

        host.board().setSelectedCards(['a']);
        await fixture.whenStable();

        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await fixture.whenStable();

        expect(host.board().getSelectedCardIds()).toEqual([]);
    });

    it('las superficies de arrastre existen y están escondidas en reposo', () => {
        expect(one('[data-part="drag-preview"]')?.hasAttribute('hidden')).toBe(true);
        expect(one('[data-part="drag-confirm"]')?.hasAttribute('hidden')).toBe(true);
    });
});
