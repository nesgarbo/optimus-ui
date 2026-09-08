import { describe, expect, it } from 'vitest';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { addDays, addMonths, dayKey, daysBetween, formatTimeRange, navigate, startOfWeek, timeSlots, timelineScaleOf, toDate, viewRange } from './scheduler-date';
import { groupByDay, groupByResource, layoutRows, layoutTimeGrid } from './scheduler-layout';
import { buildTimelineAxis, placeOnAxis } from './scheduler-timeline-axis';
import { applyPendingChanges, readCellTarget, snapInstant } from './scheduler-drag';
import { expandEvents, parseRRule, recurrenceStarts } from './scheduler-recurrence';
import { fromDisplayTime, toDisplayTime, zoneLabel, zoneOffsetMinutes } from './scheduler-timezone';
import { parseICalendar, parseSchedule, serializeSchedule, toICalendar } from './scheduler-transfer';

// El motor del Scheduler es aritmética de fechas y colocación de eventos: las dos cosas que se
// rompen en silencio y sin las que ninguna vista se puede confiar. Se prueba aquí, sin DOM.

const d = (iso: string) => new Date(iso);
const ev = (id: string, start: string, end?: string, extra: Partial<SchedulerEvent> = {}): SchedulerEvent => ({ id, start: d(start), end: end ? d(end) : undefined, ...extra });

describe('scheduler-date', () => {
    it('dayKey usa el día LOCAL, no el de UTC', () => {
        // 00:30 en UTC+2 es el día anterior en UTC: por aquí se cuelan los off-by-one.
        expect(dayKey(new Date(2026, 8, 8, 0, 30))).toBe('2026-09-08');
        expect(dayKey(new Date(2026, 8, 8, 23, 30))).toBe('2026-09-08');
    });

    it('addDays conserva la hora local al cruzar el cambio de hora', () => {
        // En Europa el horario de verano acaba el último domingo de octubre: ese día tiene 25 horas,
        // así que sumar 86.400.000 ms daría las 08:00 en vez de las 09:00.
        const before = new Date(2026, 9, 25, 9, 0);
        const after = addDays(before, 1);
        expect(after.getDate()).toBe(26);
        expect(after.getHours()).toBe(9);
    });

    it('addMonths recorta el día en vez de desbordar al mes siguiente', () => {
        expect(dayKey(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
        expect(dayKey(addMonths(new Date(2024, 0, 31), 1))).toBe('2024-02-29');
    });

    it('daysBetween cuenta días de calendario, también en el día del cambio de hora', () => {
        expect(daysBetween(new Date(2026, 9, 25), new Date(2026, 9, 26))).toBe(1);
        expect(daysBetween(new Date(2026, 8, 1), new Date(2026, 8, 30))).toBe(29);
    });

    it('startOfWeek respeta firstDayOfWeek', () => {
        const wed = new Date(2026, 8, 9); // miércoles
        expect(dayKey(startOfWeek(wed, 0))).toBe('2026-09-06'); // domingo
        expect(dayKey(startOfWeek(wed, 1))).toBe('2026-09-07'); // lunes
    });

    it('viewRange de month cubre semanas enteras, no solo el mes', () => {
        const { start, end } = viewRange('month', new Date(2026, 8, 15), { firstDayOfWeek: 1 });
        expect(dayKey(start)).toBe('2026-08-31'); // lunes anterior al 1 de septiembre
        expect(daysBetween(start, end)).toBe(42); // 6 semanas fijas
    });

    it('viewRange de week son 7 días y de day son dayCount', () => {
        expect(daysBetween(viewRange('week', new Date(2026, 8, 9)).start, viewRange('week', new Date(2026, 8, 9)).end)).toBe(7);
        const three = viewRange('day', new Date(2026, 8, 9), { dayCount: 3 });
        expect(daysBetween(three.start, three.end)).toBe(3);
    });

    it('navigate mueve lo que corresponde a cada vista', () => {
        const base = new Date(2026, 8, 9);
        expect(dayKey(navigate('day', base, 1))).toBe('2026-09-10');
        expect(dayKey(navigate('week', base, -1))).toBe('2026-09-02');
        expect(dayKey(navigate('month', base, 1))).toBe('2026-10-09');
        expect(navigate('year', base, 1).getFullYear()).toBe(2027);
    });

    it('timeSlots marca las horas en punto y respeta el rango', () => {
        const slots = timeSlots(8, 10, 30);
        expect(slots.map((s) => s.minutes)).toEqual([480, 510, 540, 570]);
        expect(slots.filter((s) => s.major).map((s) => s.minutes)).toEqual([480, 540]);
        expect(timeSlots(0, 24, 60)).toHaveLength(24);
    });
});

describe('layoutTimeGrid', () => {
    const range = { start: new Date(2026, 8, 8, 0, 0), end: new Date(2026, 8, 9, 0, 0) };

    it('coloca un evento como fracción del rango', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-08T06:00', '2026-09-08T12:00')], { range });
        expect(item.offset).toBeCloseTo(0.25, 5);
        expect(item.size).toBeCloseTo(0.25, 5);
        expect(item.columns).toBe(1);
    });

    it('dos eventos solapados se reparten el ancho', () => {
        const items = layoutTimeGrid([ev('a', '2026-09-08T09:00', '2026-09-08T11:00'), ev('b', '2026-09-08T10:00', '2026-09-08T12:00')], { range });
        expect(items.map((i) => i.column)).toEqual([0, 1]);
        expect(items.every((i) => i.columns === 2)).toBe(true);
    });

    it('eventos que NO se solapan van los dos a ancho completo', () => {
        const items = layoutTimeGrid([ev('a', '2026-09-08T09:00', '2026-09-08T10:00'), ev('b', '2026-09-08T11:00', '2026-09-08T12:00')], { range });
        expect(items.every((i) => i.columns === 1 && i.column === 0)).toBe(true);
    });

    it('en una cadena a-b-c, c reutiliza la columna de a (concurrencia máxima, no tamaño del clúster)', () => {
        // a pisa a b y b pisa a c, pero a y c NO se pisan: en ningún instante hay 3 eventos a la vez.
        // Repartir en tercios dejaría un tercio del ancho muerto para siempre, así que c vuelve a la
        // columna 0. Es lo que hacen Google Calendar y FullCalendar.
        const items = layoutTimeGrid([ev('a', '2026-09-08T09:00', '2026-09-08T11:00'), ev('b', '2026-09-08T10:00', '2026-09-08T13:00'), ev('c', '2026-09-08T12:00', '2026-09-08T14:00')], { range });
        expect(items.map((i) => i.column)).toEqual([0, 1, 0]);
        expect(items.every((i) => i.columns === 2)).toBe(true);
    });

    it('recorta el evento que se sale del rango y lo señala', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-07T22:00', '2026-09-09T02:00')], { range });
        expect(item.offset).toBe(0);
        expect(item.size).toBeCloseTo(1, 5);
        expect(item.continuesBefore).toBe(true);
        expect(item.continuesAfter).toBe(true);
    });

    it('un evento de un minuto sigue siendo visible', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-08T05:43', '2026-09-08T05:44')], { range, minEventMinutes: 15 });
        expect(item.size).toBeCloseTo(15 / 1440, 5);
    });

    it('un evento sin fin recibe la duración por defecto', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-08T06:00')], { range, defaultEventDuration: 60 });
        expect(item.size).toBeCloseTo(1 / 24, 5);
    });

    it('descarta lo que queda fuera del rango', () => {
        expect(layoutTimeGrid([ev('a', '2026-09-01T09:00', '2026-09-01T10:00')], { range })).toHaveLength(0);
    });
});

describe('layoutRows', () => {
    const week = { start: new Date(2026, 8, 6), end: new Date(2026, 8, 13) };

    it('un evento de varios días ocupa UNA fila de punta a punta', () => {
        const { items } = layoutRows([ev('a', '2026-09-07T00:00', '2026-09-10T00:00')], { range: week });
        expect(items[0].row).toBe(0);
        expect(items[0].size).toBeCloseTo(3 / 7, 5);
    });

    it('dos eventos que se pisan caen en filas distintas', () => {
        const { items } = layoutRows([ev('a', '2026-09-07', '2026-09-10'), ev('b', '2026-09-08', '2026-09-09')], { range: week });
        expect(items.map((i) => i.row)).toEqual([0, 1]);
    });

    it('reutiliza la fila cuando ya está libre', () => {
        const { items } = layoutRows([ev('a', '2026-09-07', '2026-09-08'), ev('b', '2026-09-09', '2026-09-10')], { range: week });
        expect(items.every((i) => i.row === 0)).toBe(true);
    });

    it('lo que no cabe en maxRows sale como overflow, no se pierde', () => {
        const events = [ev('a', '2026-09-07', '2026-09-08'), ev('b', '2026-09-07', '2026-09-08'), ev('c', '2026-09-07', '2026-09-08')];
        const { items, overflow } = layoutRows(events, { range: week, maxRows: 2 });
        expect(items).toHaveLength(2);
        expect(overflow.get(1)?.map((e) => e.id)).toEqual(['c']);
    });
});

describe('agrupaciones', () => {
    it('groupByDay lista el evento en TODOS los días que toca', () => {
        const groups = groupByDay([ev('a', '2026-09-07T22:00', '2026-09-09T02:00')]);
        expect([...groups.keys()].sort()).toEqual(['2026-09-07', '2026-09-08', '2026-09-09']);
    });

    it('groupByDay NO mete en el día siguiente lo que acaba a medianoche', () => {
        const groups = groupByDay([ev('a', '2026-09-07T08:00', '2026-09-08T00:00')]);
        expect([...groups.keys()]).toEqual(['2026-09-07']);
    });

    it('groupByResource deja los huérfanos bajo null en vez de tirarlos', () => {
        const groups = groupByResource([ev('a', '2026-09-08', undefined, { resourceId: 'r1' }), ev('b', '2026-09-08', undefined, { resourceId: 'zzz' }), ev('c', '2026-09-08')], ['r1', 'r2']);
        expect(groups.get('r1')?.map((e) => e.id)).toEqual(['a']);
        expect(groups.get('r2')).toEqual([]);
        expect(groups.get(null)?.map((e) => e.id)).toEqual(['b', 'c']);
    });
});

describe('escalas del timeline', () => {
    const axisOptions = (range: { start: Date; end: Date }) => ({
        range,
        dayBounds: { start: 8, end: 12 },
        slotMinutes: 60,
        firstDayOfWeek: 1,
        locale: 'en-US'
    });

    it('el nombre de la vista decide la escala, y los nombres antiguos siguen siendo el día', () => {
        expect(timelineScaleOf('timeline')).toBe('day');
        expect(timelineScaleOf('resourceTimeline')).toBe('day');
        expect(timelineScaleOf('timelineWeek')).toBe('week');
        expect(timelineScaleOf('resourceTimelineMonth')).toBe('month');
        expect(timelineScaleOf('timelineYear')).toBe('year');
        expect(timelineScaleOf('month')).toBeUndefined();
    });

    it('cada escala abarca su periodo, y el mes NO se rellena a semanas enteras', () => {
        const anchor = new Date(2026, 8, 8); // martes 8 de septiembre
        const week = viewRange('timelineWeek', anchor, { firstDayOfWeek: 1 });
        expect(dayKey(week.start)).toBe('2026-09-07');
        expect(dayKey(week.end)).toBe('2026-09-14');

        const month = viewRange('timelineMonth', anchor, { firstDayOfWeek: 1 });
        expect(dayKey(month.start)).toBe('2026-09-01');
        expect(dayKey(month.end)).toBe('2026-10-01');

        const year = viewRange('timelineYear', anchor, {});
        expect(dayKey(year.start)).toBe('2026-01-01');
        expect(dayKey(year.end)).toBe('2027-01-01');
    });

    it('navegar mueve el rango de la escala, no un día', () => {
        const anchor = new Date(2026, 8, 8);
        expect(dayKey(navigate('timelineWeek', anchor, 1, {}))).toBe('2026-09-15');
        expect(dayKey(navigate('timelineMonth', anchor, 1, {}))).toBe('2026-10-08');
        expect(dayKey(navigate('timelineYear', anchor, -1, {}))).toBe('2025-09-08');
        expect(dayKey(navigate('timelineDay', anchor, 1, {}))).toBe('2026-09-09');
    });

    it('el eje de la semana repite la ventana horaria en cada día y se salta las noches', () => {
        const range = viewRange('timelineWeek', new Date(2026, 8, 8), { firstDayOfWeek: 1 });
        const axis = buildTimelineAxis('week', axisOptions(range));

        // 7 días × 4 horas (08:00–12:00)
        expect(axis.slots.length).toBe(28);
        expect(axis.multiDay).toBe(true);
        // La primera columna del segundo día es de nuevo las 08:00, no las 12:00.
        expect(axis.slots[4].start.getHours()).toBe(8);
        expect(dayKey(axis.slots[4].start)).toBe('2026-09-08');
    });

    it('una hora de la noche cae en el borde del hueco, no interpolada por dentro', () => {
        const range = viewRange('timelineWeek', new Date(2026, 8, 8), { firstDayOfWeek: 1 });
        const axis = buildTimelineAxis('week', axisOptions(range));

        // Las 03:00 del martes están fuera de la ventana dibujada: el eje las resuelve al inicio de
        // las columnas del martes, que es donde acaba el hueco.
        const nightPosition = axis.position(new Date(2026, 8, 8, 3, 0));
        expect(nightPosition).toBeCloseTo(4 / 28, 6);
        // Las 10:00 del martes son la mitad de la ventana de ese día.
        expect(axis.position(new Date(2026, 8, 8, 10, 0))).toBeCloseTo(6 / 28, 6);
    });

    it('las bandas de cabecera agrupan las columnas y su span suma el eje', () => {
        const range = viewRange('timelineWeek', new Date(2026, 8, 8), { firstDayOfWeek: 1 });
        const axis = buildTimelineAxis('week', axisOptions(range));
        const [period, day] = axis.tiers;

        expect(period.key).toBe('period');
        expect(day.cells.length).toBe(7);
        for (const tier of axis.tiers) {
            expect(tier.cells.reduce((sum, cell) => sum + cell.span, 0)).toBe(axis.slots.length);
        }
    });

    it('el mes es una columna por día y el año una por mes', () => {
        const monthAxis = buildTimelineAxis('month', axisOptions(viewRange('timelineMonth', new Date(2026, 8, 8), {})));
        expect(monthAxis.slots.length).toBe(30);
        expect(monthAxis.tiers.length).toBe(1);

        const yearAxis = buildTimelineAxis('year', axisOptions(viewRange('timelineYear', new Date(2026, 8, 8), {})));
        expect(yearAxis.slots.length).toBe(12);
        expect(yearAxis.slots[0].label).toBe('Jan');
    });

    it('un evento más corto que media columna conserva media columna de ancho', () => {
        const range = viewRange('timelineYear', new Date(2026, 8, 8), {});
        const axis = buildTimelineAxis('year', axisOptions(range));
        const events = [ev('a', '2026-09-08T10:00', '2026-09-08T11:00')];
        const packed = layoutTimeGrid(events, { range });
        const placed = placeOnAxis(packed, axis, (event) => ({ start: new Date(event.start as Date), end: new Date(event.end as Date) }));

        expect(placed.length).toBe(1);
        expect(placed[0].size).toBeCloseTo(0.5 / 12, 6);
        // Septiembre es el noveno mes: la barra arranca dentro de su columna.
        expect(placed[0].offset).toBeGreaterThanOrEqual(8 / 12);
        expect(placed[0].offset).toBeLessThan(9 / 12);
    });

    it('la hora se imprime sin cero de relleno y con guion', () => {
        expect(formatTimeRange(new Date(2026, 8, 8, 8, 30), new Date(2026, 8, 8, 9, 30), 'en-US')).toBe('8:30 AM - 9:30 AM');
    });
});

describe('recurrencia', () => {
    const window = (fromDay: number, toDay: number) => ({ start: new Date(2026, 8, fromDay), end: new Date(2026, 8, toDay) });

    it('lee el subconjunto de RRULE que usan los calendarios, y descarta lo que no entiende', () => {
        expect(parseRRule('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=MO,WE')).toMatchObject({ freq: 'WEEKLY', interval: 2, count: 4, byDay: [1, 3] });
        expect(parseRRule('FREQ=DAILY;UNTIL=20260915')?.until).toEqual(new Date(2026, 8, 15));
        // Un INTERVAL de 0 dejaría al expansor sin avanzar nunca.
        expect(parseRRule('FREQ=DAILY;INTERVAL=0')?.interval).toBe(1);
        expect(parseRRule('every other tuesday')).toBeUndefined();
        expect(parseRRule(undefined)).toBeUndefined();
    });

    it('COUNT cuenta desde el inicio de la serie, no desde el borde de la ventana', () => {
        const rule = parseRRule('FREQ=DAILY;COUNT=5')!;
        // La serie empieza el día 1 y la ventana abre el día 4: quedan 2 ocurrencias, no 5.
        const starts = recurrenceStarts(new Date(2026, 8, 1, 9), rule, window(4, 30));
        expect(starts.map(dayKey)).toEqual(['2026-09-04', '2026-09-05']);
    });

    it('BYDAY reparte la semana y respeta el inicio de la serie', () => {
        const rule = parseRRule('FREQ=WEEKLY;BYDAY=TU,TH;COUNT=4')!;
        // Empieza el martes 8: el jueves 3 de esa misma semana no existe hacia atrás.
        const starts = recurrenceStarts(new Date(2026, 8, 8, 15), rule, window(1, 30));
        expect(starts.map(dayKey)).toEqual(['2026-09-08', '2026-09-10', '2026-09-15', '2026-09-17']);
    });

    it('BYMONTHDAY se salta los días que ese mes no tiene, en vez de recortarlos', () => {
        const rule = parseRRule('FREQ=MONTHLY;BYMONTHDAY=30,31;COUNT=4')!;
        const starts = recurrenceStarts(new Date(2026, 0, 30, 9), rule, { start: new Date(2026, 0, 1), end: new Date(2026, 4, 1) });
        // Febrero no tiene ni 30 ni 31: la serie salta a marzo sin duplicar el 28.
        expect(starts.map(dayKey)).toEqual(['2026-01-30', '2026-01-31', '2026-03-30', '2026-03-31']);
    });

    it('expandir da una ocurrencia por fecha, con id propio y enlace a la serie', () => {
        const series: SchedulerEvent = { id: 's', title: 'Stand-up', start: new Date(2026, 8, 8, 9), end: new Date(2026, 8, 8, 9, 15), rrule: 'FREQ=DAILY;COUNT=3' };
        const occurrences = expandEvents([series], window(1, 30), 30);

        expect(occurrences.length).toBe(3);
        expect(new Set(occurrences.map((event) => event.id)).size).toBe(3);
        expect(occurrences.every((event) => event['recurrenceId'] === 's')).toBe(true);
        // La duración de la serie se conserva en cada copia.
        expect(occurrences.map((event) => toDate(event.end!).getTime() - toDate(event.start).getTime())).toEqual([900_000, 900_000, 900_000]);
    });

    it('exdate se salta una ocurrencia y rdate añade una fuera de la regla', () => {
        const series: SchedulerEvent = {
            id: 's',
            start: new Date(2026, 8, 8, 9),
            end: new Date(2026, 8, 8, 10),
            rrule: 'FREQ=DAILY;COUNT=3',
            exdate: [new Date(2026, 8, 9)],
            rdate: [new Date(2026, 8, 20, 9)]
        };
        expect(expandEvents([series], window(1, 30), 30).map((event) => dayKey(toDate(event.start)))).toEqual(['2026-09-08', '2026-09-10', '2026-09-20']);
    });

    it('una excepción guardada aparte sustituye a su ocurrencia en vez de duplicarla', () => {
        const series: SchedulerEvent = { id: 's', start: new Date(2026, 8, 8, 9), end: new Date(2026, 8, 8, 10), rrule: 'FREQ=DAILY;COUNT=3' };
        const exception: SchedulerEvent = { id: 's-moved', recurrenceId: 's', recurrenceStart: new Date(2026, 8, 9, 9), start: new Date(2026, 8, 9, 14), end: new Date(2026, 8, 9, 15) };

        const expanded = expandEvents([series, exception], window(1, 30), 30);
        const nine = expanded.filter((event) => dayKey(toDate(event.start)) === '2026-09-09');
        expect(nine.length).toBe(1);
        expect(nine[0].id).toBe('s-moved');
    });

    it('sin ninguna regla se devuelve el array TAL CUAL, por referencia', () => {
        const events = [ev('a', '2026-09-08T09:00')];
        expect(expandEvents(events, window(1, 30), 30)).toBe(events);
    });
});

describe('arrastre y redimensión', () => {
    it('el redondeo cuenta desde el inicio del día, no desde la época', () => {
        expect(snapInstant(new Date(2026, 8, 8, 9, 7), 15)).toEqual(new Date(2026, 8, 8, 9, 0));
        expect(snapInstant(new Date(2026, 8, 8, 9, 8), 15)).toEqual(new Date(2026, 8, 8, 9, 15));
        // Un paso de 0 o negativo no puede dividir: se devuelve el instante intacto.
        expect(snapInstant(new Date(2026, 8, 8, 9, 7), 0)).toEqual(new Date(2026, 8, 8, 9, 7));
    });

    it('un cambio pendiente se aplica solo mientras el dato siga como estaba', () => {
        const event = ev('a', '2026-09-08T09:00', '2026-09-08T10:00');
        const change = {
            from: { start: new Date(2026, 8, 8, 9).getTime(), end: new Date(2026, 8, 8, 10).getTime(), resourceId: undefined, allDay: false },
            to: { start: new Date(2026, 8, 8, 11), end: new Date(2026, 8, 8, 12) }
        };
        const pending = new Map([['a', change]]);

        expect(toDate(applyPendingChanges([event], pending)[0].start).getHours()).toBe(11);

        // La aplicación ha guardado el cambio: el override deja de aplicarse en vez de sumarse.
        const persisted = ev('a', '2026-09-08T11:00', '2026-09-08T12:00');
        expect(toDate(applyPendingChanges([persisted], pending)[0].start).getHours()).toBe(11);

        // Y si el dato cambió por cualquier otro motivo, manda el dato.
        const elsewhere = ev('a', '2026-09-09T08:00', '2026-09-09T09:00');
        expect(applyPendingChanges([elsewhere], pending)[0]).toBe(elsewhere);
    });

    it('sin cambios pendientes se devuelve el array por referencia', () => {
        const events = [ev('a', '2026-09-08T09:00')];
        expect(applyPendingChanges(events, new Map())).toBe(events);
    });

    it('el objetivo de un arrastre se lee de los data-attributes de la celda', () => {
        const lane = document.createElement('div');
        lane.dataset['resourceId'] = 'r1';
        const cell = document.createElement('div');
        cell.dataset['slot'] = 'scheduler-time-grid-cell';
        cell.dataset['startDate'] = String(new Date(2026, 8, 8, 9).getTime());
        cell.dataset['endDate'] = String(new Date(2026, 8, 8, 9, 30).getTime());
        lane.appendChild(cell);

        const target = readCellTarget(cell)!;
        expect(target.start).toEqual(new Date(2026, 8, 8, 9));
        expect(target.resourceId).toBe('r1');
        // Una celda horaria SÍ se interpola por dentro; una de mes es un día entero.
        expect(target.whole).toBe(false);

        const monthCell = document.createElement('div');
        monthCell.dataset['slot'] = 'scheduler-month-cell';
        monthCell.dataset['startDate'] = String(new Date(2026, 8, 8).getTime());
        monthCell.dataset['endDate'] = String(new Date(2026, 8, 9).getTime());
        expect(readCellTarget(monthCell)!.whole).toBe(true);

        // Cualquier cosa que no sea una celda etiquetada no es un objetivo.
        expect(readCellTarget(document.createElement('div'))).toBeNull();
        expect(readCellTarget(null)).toBeNull();
    });
});

describe('zonas horarias', () => {
    // Un instante conocido: 2026-07-01T12:00:00Z, en pleno verano del hemisferio norte.
    const summer = new Date(Date.UTC(2026, 6, 1, 12));
    // Y otro en invierno, para que se vea que el offset se pregunta por instante y no una vez.
    const winter = new Date(Date.UTC(2026, 0, 1, 12));

    it('el offset se pregunta por instante, así que el horario de verano entra solo', () => {
        expect(zoneOffsetMinutes(summer, 'Europe/Madrid')).toBe(120);
        expect(zoneOffsetMinutes(winter, 'Europe/Madrid')).toBe(60);
        expect(zoneOffsetMinutes(summer, 'Asia/Tokyo')).toBe(540);
        // Tokio no tiene horario de verano: el mismo offset todo el año.
        expect(zoneOffsetMinutes(winter, 'Asia/Tokyo')).toBe(540);
    });

    it('una zona que la plataforma no conoce no rompe nada', () => {
        expect(Number.isNaN(zoneOffsetMinutes(summer, 'Mars/Olympus'))).toBe(true);
        // Y desplazar con ella devuelve el instante intacto en vez de una fecha inválida.
        expect(toDisplayTime(summer, 'Mars/Olympus').getTime()).toBe(summer.getTime());
    });

    it('la fecha de pantalla lee la hora de pared de la zona destino', () => {
        // La hora LOCAL de la fecha desplazada tiene que ser la que Intl da en la zona destino: eso
        // es lo que hace que la aritmética local del motor coloque el evento donde toca.
        for (const zone of ['Asia/Tokyo', 'America/New_York', 'Pacific/Auckland']) {
            const expected = Number(new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', hour12: false }).format(summer)) % 24;
            expect(toDisplayTime(summer, zone).getHours()).toBe(expected);
        }
    });

    const zones = ['Europe/Madrid', 'Asia/Tokyo', 'America/New_York', 'Pacific/Auckland'];

    it('desplazar y volver es la identidad, incluido el salto de primavera', () => {
        // El salto adelante y un instante a cada lado de los cambios americano y europeo: ahí el
        // instante y su fecha de pantalla caen a distinto lado de una frontera, que es donde una
        // implementación a base de sumar offsets se deja una hora.
        const instants = [summer, winter, new Date(Date.UTC(2026, 2, 29, 1, 30)), new Date(Date.UTC(2026, 2, 8, 6, 30)), new Date(Date.UTC(2026, 5, 15, 3, 15))];

        for (const zone of zones) {
            for (const instant of instants) {
                expect(fromDisplayTime(toDisplayTime(instant, zone), zone).getTime()).toBe(instant.getTime());
            }
        }
    });

    it('en la hora REPETIDA del cambio de otoño la vuelta cae en una de las dos, sin moverse en pantalla', () => {
        // Las 02:30 del 25 de octubre existen DOS veces en Madrid, y la 01:30 del 1 de noviembre dos
        // veces en Nueva York: por el reloj de pared no se puede saber cuál de las dos se quería.
        for (const [zone, instant] of [
            ['Europe/Madrid', new Date(Date.UTC(2026, 9, 25, 0, 30))],
            ['America/New_York', new Date(Date.UTC(2026, 10, 1, 5, 30))]
        ] as const) {
            const back = fromDisplayTime(toDisplayTime(instant, zone), zone);

            // Cae en una de las dos: la misma o la de una hora después.
            expect([instant.getTime(), instant.getTime() + 3_600_000]).toContain(back.getTime());
            // Y la invariante que sí se mantiene siempre: en pantalla no se mueve nada.
            expect(toDisplayTime(back, zone).getTime()).toBe(toDisplayTime(instant, zone).getTime());
        }
    });

    it('sin zona destino las dos conversiones son la identidad, por referencia', () => {
        expect(toDisplayTime(summer, undefined)).toBe(summer);
        expect(fromDisplayTime(summer, undefined)).toBe(summer);
    });

    it('la etiqueta del gutter dice el offset de la zona que se está pintando', () => {
        expect(zoneLabel(summer, 'Asia/Tokyo')).toBe('GMT+9');
        expect(zoneLabel(summer, 'Europe/Madrid')).toBe('GMT+2');
        expect(zoneLabel(summer, 'Asia/Kolkata')).toBe('GMT+5:30');
        expect(zoneLabel(winter, 'America/New_York')).toBe('GMT-5');
    });
});

describe('importar y exportar', () => {
    const events: SchedulerEvent[] = [
        { id: 'a', title: 'Stand-up; daily', start: new Date(2026, 8, 8, 9, 30), end: new Date(2026, 8, 8, 9, 45), description: 'Line one\nline two', rrule: 'FREQ=DAILY;COUNT=5', categoryId: 'ops', resourceId: 'crew' },
        { id: 'b', title: 'Festival', start: new Date(2026, 8, 10), end: new Date(2026, 8, 13), allDay: true }
    ];

    it('una serie se exporta como UN VEVENT con su regla, no como sus copias', () => {
        const ics = toICalendar(events, { name: 'Demo' });
        expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(2);
        expect(ics).toContain('RRULE:FREQ=DAILY;COUNT=5');
        expect(ics).toContain('X-WR-CALNAME:Demo');
        // Punto y coma y salto de línea son estructurales en ICS: van escapados.
        expect(ics).toContain('SUMMARY:Stand-up\\; daily');
        expect(ics).toContain('DESCRIPTION:Line one\\nline two');
        // El día completo va como VALUE=DATE, que es lo que el formato entiende por un día entero.
        expect(ics).toContain('DTSTART;VALUE=DATE:20260910');
    });

    it('las líneas se plegan a 75 octetos, que es lo que muchos parsers exigen', () => {
        const long = toICalendar([{ id: 'l', title: 'x'.repeat(200), start: new Date(2026, 8, 8, 9) }]);
        for (const line of long.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
    });

    it('la ida y vuelta conserva lo que el Scheduler sabe pintar', () => {
        const { events: parsed, name } = parseICalendar(toICalendar(events, { name: 'Demo' }));

        expect(name).toBe('Demo');
        expect(parsed.length).toBe(2);
        expect(parsed[0].id).toBe('a');
        expect(parsed[0].title).toBe('Stand-up; daily');
        expect(parsed[0].description).toBe('Line one\nline two');
        expect(parsed[0]['rrule']).toBe('FREQ=DAILY;COUNT=5');
        expect(parsed[0]['categoryId']).toBe('ops');
        expect(parsed[0].resourceId).toBe('crew');
        expect(toDate(parsed[0].start).getTime()).toBe(new Date(2026, 8, 8, 9, 30).getTime());
        expect(parsed[1].allDay).toBe(true);
    });

    it('un calendario roto da lo que se pueda leer, no una excepción', () => {
        const { events: parsed } = parseICalendar('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:No start\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20260908T090000Z\r\nSUMMARY:Fine\r\nEND:VEVENT\r\nEND:VCALENDAR');
        // El VEVENT sin DTSTART no se puede colocar en ningún sitio y se descarta; el otro entra.
        expect(parsed.length).toBe(1);
        expect(parsed[0].title).toBe('Fine');
    });

    it('el JSON lleva los instantes como ISO y los devuelve como Date', () => {
        const payload = serializeSchedule(events, { categories: [{ id: 'ops', name: 'Operations' }] });
        expect(typeof payload.events[0].start).toBe('string');
        expect(payload.categories?.length).toBe(1);

        const back = parseSchedule(JSON.stringify(payload));
        expect(back.events[0].start instanceof Date).toBe(true);
        expect(toDate(back.events[0].start).getTime()).toBe(new Date(2026, 8, 8, 9, 30).getTime());
    });
});
