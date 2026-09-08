import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import type { SchedulerCategory, SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { SchedulerModule } from './scheduler.module';

// Se monta el árbol compuesto TAL CUAL lo escribe un consumidor: root → header → content → scope,
// con definiciones propias en un scope y un fallback en el content. Lo que se protege:
//   - que la composición compile y pinte la vista activa,
//   - que un *...Def de un scope gane al fallback y que en otra vista se use el fallback,
//   - que el contexto llegue con el título y la hora ya resueltos,
//   - que el día de hoy y el mes ajeno salgan marcados con sus data-attributes,
//   - que una celda densa colapse en "+N more",
//   - que navegación y selector de vista muevan el rango.
const DAY = new Date(2026, 8, 8); // martes 8 de septiembre de 2026

const CATEGORIES: SchedulerCategory[] = [
    { id: 'prod', name: 'Producción', color: '#0ea5e9' },
    { id: 'lab', name: 'Laboratorio', color: '#f59e0b' }
];

function at(day: number, hour: number, minute = 0) {
    return new Date(2026, 8, day, hour, minute);
}

const EVENTS: SchedulerEvent[] = [
    { id: 'a', title: 'Escurrir tinturas', start: at(8, 9), end: at(8, 11), categoryId: 'prod' },
    { id: 'b', title: 'Pigmentar', start: at(8, 10), end: at(8, 12), categoryId: 'prod' },
    { id: 'c', title: 'Ensayo solidez', start: at(8, 15), end: at(8, 16), categoryId: 'lab' },
    { id: 'd', title: 'Parada mantenimiento', start: at(8, 0), end: at(11, 0), allDay: true },
    { id: 'e', title: 'Cuarto del día', start: at(8, 17), end: at(8, 18), categoryId: 'lab' }
];

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-scheduler-root [events]="events()" [categories]="categories" categoryField="categoryId" [view]="view()" (viewChange)="view.set($event)" [date]="date" [resources]="resources" [maxEventsPerCell]="2" [views]="allViews">
            <p-scheduler-header>
                <p-scheduler-navigation />
                <p-scheduler-title />
                <p-scheduler-view-selector />
            </p-scheduler-header>
            <p-scheduler-category-legend />
            <p-scheduler-content>
                <p-scheduler-event *pSchedulerEventDef="let ctx">
                    <span class="fallback-card">{{ ctx.title }}</span>
                </p-scheduler-event>
                <p-scheduler-month>
                    <p-scheduler-month-event *pSchedulerMonthEventDef="let ctx">
                        <span class="month-card">{{ ctx.title }} · {{ ctx.timeText }}</span>
                    </p-scheduler-month-event>
                </p-scheduler-month>
                <p-scheduler-week>
                    <p-scheduler-time-grid-event *pSchedulerTimeGridEventDef="let ctx">
                        <span class="week-card" [attr.data-accent]="ctx.accentColor">{{ ctx.title }}</span>
                    </p-scheduler-time-grid-event>
                </p-scheduler-week>
                <p-scheduler-agenda />
                <p-scheduler-day />
                <p-scheduler-year />
                <p-scheduler-timeline />
                <p-scheduler-resource-timeline />
            </p-scheduler-content>
            <p-scheduler-more-popover />
            <p-scheduler-loading />
        </p-scheduler-root>
    `
})
class TestHost {
    events = signal(EVENTS);
    categories = CATEGORIES;
    view = signal<SchedulerViewType>('month');

    resources: any[] = [];

    allViews: SchedulerViewType[] = ['day', 'week', 'month', 'agenda', 'year', 'timeline', 'resourceTimeline'];
    date = DAY;
}

describe('Scheduler', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const q = (selector: string) => fixture.debugElement.queryAll(By.css(selector));
    const text = (selector: string) => q(selector).map((el) => (el.nativeElement as HTMLElement).textContent?.trim());

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SchedulerModule],
            declarations: [TestHost],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('monta el árbol compuesto y pinta la vista activa', () => {
        expect(q('[data-slot="scheduler-root"]').length).toBe(1);
        expect(q('[data-slot="scheduler-content"][data-view="month"]').length).toBeGreaterThan(0);
        expect(q('.p-scheduler-view-month').length).toBe(1);
    });

    it('el mes son 6 semanas de 7 días', () => {
        expect(q('.p-scheduler-month-week').length).toBe(6);
        expect(q('[data-slot="scheduler-month-cell"]').length).toBe(42);
    });

    it('marca hoy, el fin de semana y los días de otro mes', () => {
        expect(q('[data-slot="scheduler-month-cell"][data-other-month]').length).toBeGreaterThan(0);
        expect(q('[data-slot="scheduler-month-cell"][data-weekend]').length).toBe(12); // 6 semanas × sáb+dom
        expect(q('[data-slot="scheduler-month-cell"][data-date="2026-09-08"]').length).toBe(1);
    });

    it('usa la definición del scope del mes, no el fallback', () => {
        expect(q('.month-card').length).toBeGreaterThan(0);
        expect(q('.fallback-card').length).toBe(0);
    });

    it('el contexto llega con el título y la hora ya resueltos', () => {
        const cards = text('.month-card');
        expect(cards.some((t) => t?.includes('Escurrir tinturas'))).toBe(true);
        expect(cards.some((t) => t?.includes('·'))).toBe(true);
    });

    it('una celda densa colapsa en "+N more"', () => {
        // maxEventsPerCell = 2 y el día 8 tiene 4 eventos con hora más la parada de varios días.
        const links = q('[data-slot="scheduler-month-more-link"]');
        expect(links.length).toBeGreaterThan(0);
        expect((links[0].nativeElement as HTMLElement).textContent).toMatch(/\+\d+/);
    });

    it('la leyenda cuenta los eventos por categoría', async () => {
        const items = q('[data-slot="scheduler-category-legend-ui-item"]');
        expect(items.length).toBe(2);
        expect((items[0].nativeElement as HTMLElement).getAttribute('data-event-count')).toBe('2');
    });

    it('filtrar por categoría quita sus eventos', async () => {
        // Se mide el total que reportan las celdas y NO las tarjetas visibles: con maxEventsPerCell
        // la celda recorta, así que filtrar cambia CUÁLES se ven y no cuántas, y la aserción sobre
        // lo visible pasaba por casualidad o fallaba sin que hubiera nada roto.
        const totalEvents = () => q('[data-slot="scheduler-month-cell"]').reduce((sum, el) => sum + Number((el.nativeElement as HTMLElement).getAttribute('data-event-count') ?? 0), 0);

        const before = totalEvents();
        expect(before).toBeGreaterThan(0);

        (q('[data-slot="scheduler-category-legend-ui-item"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();

        expect(totalEvents()).toBeLessThan(before);
        expect(q('[data-slot="scheduler-category-legend-ui-item"][data-selected]').length).toBe(1);
    });

    it('al cambiar a semana usa la definición de la semana y aparece la rejilla horaria', async () => {
        host.view.set('week');
        await fixture.whenStable();

        expect(q('.p-scheduler-view-time-grid').length).toBe(1);
        expect(q('.week-card').length).toBeGreaterThan(0);
        expect(q('.month-card').length).toBe(0);
        // 7 columnas de día
        expect(q('[data-slot="scheduler-time-grid-column"]').length).toBe(7);
    });

    it('el color de la categoría llega al contexto del evento', async () => {
        host.view.set('week');
        await fixture.whenStable();
        const accents = q('.week-card').map((el) => (el.nativeElement as HTMLElement).getAttribute('data-accent'));
        expect(accents).toContain('#0ea5e9');
    });

    it('el evento de todo el día va a la banda superior, no a la rejilla', async () => {
        host.view.set('week');
        await fixture.whenStable();
        expect(q('[data-slot="scheduler-all-day-event"]').length).toBe(1);
    });

    it('en la agenda cada día es un grupo y los días vacíos no salen', async () => {
        host.view.set('agenda');
        await fixture.whenStable();

        const headers = q('[data-slot="scheduler-agenda-date-header"]');
        expect(headers.length).toBeGreaterThan(0);
        // La parada de varios días aparece en sus 3 días; ninguno de los grupos está vacío.
        expect(q('[data-slot="scheduler-agenda-event"]').length).toBeGreaterThanOrEqual(EVENTS.length);
        expect(q('.p-scheduler-agenda-empty').length).toBe(0);
    });

    it('la navegación mueve el rango y el título', async () => {
        const title = () => (q('[data-slot="scheduler-title"]')[0].nativeElement as HTMLElement).textContent?.trim();
        const before = title();
        (q('[data-slot="scheduler-nav-next"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(title()).not.toBe(before);
    });

    it('el selector de vista cambia la vista y marca la activa', async () => {
        const dayButton = q('[data-slot="scheduler-view-button"][data-view="day"]')[0];
        (dayButton.nativeElement as HTMLElement).click();
        await fixture.whenStable();

        expect(q('.p-scheduler-view-time-grid').length).toBe(1);
        expect(q('[data-slot="scheduler-time-grid-column"]').length).toBe(1);
        expect(q('[data-slot="scheduler-view-button"][data-view="day"][data-selected]').length).toBe(1);
    });

    it('el "+N more" abre el popover de desborde con los eventos del día', async () => {
        expect(q('[data-slot="scheduler-more-popover"] .p-scheduler-more-popover-panel').length).toBe(0);

        (q('[data-slot="scheduler-month-more-link"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();

        const panel = q('[data-slot="scheduler-more-popover"] .p-scheduler-more-popover-panel');
        expect(panel.length).toBe(1);
        expect(q('.p-scheduler-more-popover-item').length).toBeGreaterThan(0);

        (q('.p-scheduler-more-popover-close')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(q('[data-slot="scheduler-more-popover"] .p-scheduler-more-popover-panel').length).toBe(0);
    });

    it('el año son doce minimeses y marca los días con eventos', async () => {
        host.view.set('year');
        await fixture.whenStable();

        expect(q('[data-slot="scheduler-mini-month"]').length).toBe(12);
        // Los eventos del fixture caen en septiembre: al menos un día tiene indicador.
        expect(q('.p-scheduler-mini-month-day-has-events').length).toBeGreaterThan(0);
        // El año es un navegador: pulsar un día lleva a la vista de día.
        const marked = q('.p-scheduler-mini-month-day-has-events')[0];
        (marked.nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(host.view()).toBe('day');
    });

    it('el timeline pone el día en horizontal, con una fila por solape', async () => {
        host.view.set('timeline');
        await fixture.whenStable();

        expect(q('[data-slot="scheduler-timeline-body"]').length).toBe(1);
        expect(q('[data-slot="scheduler-timeline-lane"]').length).toBe(1);
        expect(q('[data-slot="scheduler-timeline-event"]').length).toBeGreaterThan(0);
        // Sin carril de recursos en la vista simple.
        expect(q('[data-slot="scheduler-resource-area"]').length).toBe(0);
    });

    it('el timeline de recursos da un carril por recurso y recoge los huérfanos', async () => {
        host.resources = [
            { id: 'r1', name: 'Drum 1' },
            { id: 'r2', name: 'Drum 2' }
        ];
        host.view.set('resourceTimeline');
        await fixture.whenStable();

        expect(q('[data-slot="scheduler-resource-area"]').length).toBe(1);
        const labels = q('.p-scheduler-resource-label').map((el) => (el.nativeElement as HTMLElement).textContent?.trim());
        // Dos recursos más el carril de los que no tienen recurso conocido: ningún evento se pierde.
        expect(labels).toContain('Drum 1');
        expect(labels).toContain('Drum 2');
        expect(labels).toContain('Unassigned');
    });

    it('un clic en un evento lo selecciona', async () => {
        const card = q('[data-slot="scheduler-month-event"]')[0];
        (card.nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(q('[data-slot="scheduler-month-event"][data-selected]').length).toBe(1);
    });
});
