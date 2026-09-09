import { computed, signal } from '@angular/core';
import type { TaskBoardColumnModel, TaskBoardItem, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';
import { beforeEach, describe, expect, it } from 'vitest';
import { TASKBOARD_DEFAULT_LABELS, TaskBoardState, taskBoardIdKey, type TaskBoardStateConfig } from './taskboard-state';

// El motor se prueba sin DOM: es una clase que solo recibe señales, así que aquí se le pasan señales
// planas y se mira lo que decide. Lo que se protege es lo que no se ve mirando el tablero:
//   - que el orden de las reglas de movimiento sea el que promete la documentación,
//   - que un movimiento aceptado renumere las celdas de origen y de destino y nada más,
//   - que la selección por rango sea local a la celda,
//   - que el modo externo no escriba nunca y siga emitiendo,
//   - que la ventana virtual sea la lista entera cuando está apagada.

interface Card extends TaskBoardItem {
    id: string;
    title: string;
    columnId: string;
    swimlaneId?: string;
    order: number;
    owner?: string;
}

const COLUMNS: TaskBoardColumnModel[] = [
    { id: 'backlog', label: 'Backlog', statusType: 'todo', order: 0 },
    { id: 'active', label: 'Active', statusType: 'in-progress', wipLimit: 2, order: 1 },
    { id: 'review', label: 'Review', statusType: 'in-progress', order: 2, allowedTransitionsFrom: ['active'], requiredFields: ['owner'] },
    { id: 'done', label: 'Done', statusType: 'done', order: 3, confirmOnEnter: 'Ship it?' }
];

const SWIMLANES: TaskBoardSwimlane[] = [
    { id: 'growth', label: 'Growth', order: 0 },
    { id: 'platform', label: 'Platform', order: 1 }
];

function cards(): Card[] {
    return [
        { id: 'a', title: 'A', columnId: 'backlog', swimlaneId: 'growth', order: 0 },
        { id: 'b', title: 'B', columnId: 'backlog', swimlaneId: 'growth', order: 1 },
        // `order` es por columna, no por celda: en un tablero sin filas backlog es a, b, c, y al
        // agrupar 'c' se queda sola en su celda, así que el 2 vale para los dos casos.
        { id: 'c', title: 'C', columnId: 'backlog', swimlaneId: 'platform', order: 2 },
        { id: 'd', title: 'D', columnId: 'active', swimlaneId: 'growth', order: 0, owner: 'Ana' },
        { id: 'e', title: 'E', columnId: 'active', swimlaneId: 'platform', order: 1 }
    ];
}

/** La configuración del motor, con lo que cada prueba necesite cambiar. */
function makeConfig(overrides: Partial<TaskBoardStateConfig<Card>> = {}) {
    const tasks = signal<Card[]>(cards());
    const emitted: Record<string, any[]> = {};

    const record = (name: string) => (payload: any) => {
        emitted[name] = emitted[name] ?? [];
        emitted[name].push(payload);
    };

    const config: TaskBoardStateConfig<Card> = {
        tasks,
        items: signal<Card[] | undefined>(undefined),
        setTasks: (value) => tasks.set(value),
        columns: signal(COLUMNS),
        swimlanes: signal([]),
        columnGroups: signal([]),
        dataKey: signal('id'),
        columnField: signal('columnId'),
        swimlaneField: signal<string | undefined>(undefined),
        draggable: signal(true),
        dragMinDistance: signal(5),
        columnCollapsible: signal(true),
        columnReorderable: signal(true),
        contextMenu: signal(true),
        scrollable: signal(true),
        selectionMode: signal('multiple'),
        density: signal('standard'),
        features: signal(undefined),
        access: signal(undefined),
        rtl: signal(false),
        disabled: signal(false),
        readonly: signal(false),
        virtualScroll: signal(false),
        virtualScrollItemHeight: signal(100),
        virtualScrollBuffer: signal(2),
        labels: computed(() => TASKBOARD_DEFAULT_LABELS),
        emitTasksChange: record('tasksChange'),
        emitCardMove: record('cardMove'),
        emitCardReorder: record('cardReorder'),
        emitCardDropBlocked: record('cardDropBlocked'),
        emitCardSelect: record('cardSelect'),
        emitSelectionChange: record('selectionChange'),
        emitCardCreate: record('cardCreate'),
        emitCardUpdate: record('cardUpdate'),
        emitCardDelete: record('cardDelete'),
        emitColumnCollapse: record('columnCollapse'),
        emitColumnReorder: record('columnReorder'),
        emitSwimlaneCollapse: record('swimlaneCollapse'),
        emitCardActivate: record('cardActivate'),
        emitDragStart: record('dragStart'),
        emitDragEnd: record('dragEnd'),
        emitDragCancel: record('dragCancel'),
        emitCardClick: record('cardClick'),
        emitCardDblclick: record('cardDblclick'),
        emitCardContextMenu: record('cardContextMenu'),
        hasDeclaredColumns: signal(true),
        registerColumn: () => undefined,
        unregisterColumn: () => undefined,
        ...overrides
    };

    // `tasks` puede venir sobreescrito, y entonces el escritor por defecto apuntaría al array que no
    // es; se vuelve a atar al que haya quedado si nadie ha traído su propio escritor.
    const model = config.tasks as ReturnType<typeof signal<Card[]>>;
    if (!overrides.setTasks) config.setTasks = (value) => model.set(value);
    if (!overrides.emitTasksChange) config.emitTasksChange = record('tasksChange');

    return { config, tasks: model, emitted };
}

/** Un banco de pruebas del motor, con las emisiones recogidas para poder mirarlas. */
function bench(options: { external?: boolean; swimlanes?: boolean } = {}) {
    const { config, tasks, emitted } = makeConfig({
        items: signal<Card[] | undefined>(options.external ? cards() : undefined),
        swimlanes: signal(options.swimlanes ? SWIMLANES : []),
        swimlaneField: signal<string | undefined>(options.swimlanes ? 'swimlaneId' : undefined)
    });

    return { state: new TaskBoardState<Card>(config), tasks, emitted };
}

describe('el índice del tablero', () => {
    it('agrupa por columna y, cuando hay filas, por celda', () => {
        const plain = bench();
        expect(plain.state.itemsOf('backlog').map((item) => item.id)).toEqual(['a', 'b', 'c']);

        const grouped = bench({ swimlanes: true });
        expect(grouped.state.itemsOf('backlog', 'growth').map((item) => item.id)).toEqual(['a', 'b']);
        expect(grouped.state.itemsOf('backlog', 'platform').map((item) => item.id)).toEqual(['c']);
    });

    it('los recuentos de columna y de fila cruzan la otra dimensión', () => {
        const { state } = bench({ swimlanes: true });

        expect(state.countOfColumn('backlog')).toBe(3);
        expect(state.countOfSwimlane('growth')).toBe(3);
    });

    it('ordena las columnas por order y esconde las que el acceso niega', () => {
        const { state } = bench();
        expect(state.columns().map((column) => column.id)).toEqual(['backlog', 'active', 'review', 'done']);
    });

    it('una clave de id no confunde el 1 numérico con el "1" de texto', () => {
        expect(taskBoardIdKey(1)).not.toBe(taskBoardIdKey('1'));
    });
});

describe('las reglas de movimiento', () => {
    it('las reglas de transición se comprueban antes que los campos obligatorios', () => {
        const { state } = bench();
        const card = state.itemById('a')!;

        // 'a' está en backlog, y review solo admite desde active. Además le falta `owner`, que es el
        // otro motivo por el que sería rechazada: la que gana tiene que ser la transición.
        const refusal = state.validateMove(card, 'review');

        expect(refusal?.reason).toBe('transition-rule');
    });

    it('el límite de WIP rechaza una entrada y deja los datos como estaban', () => {
        const { state, tasks, emitted } = bench();
        const card = state.itemById('a')!;

        // active tiene wipLimit 2 y ya tiene dos tarjetas.
        state.requestMove(card, { id: 'a', columnValue: 'active', index: 0 });

        expect(emitted['cardDropBlocked']?.[0].reason).toBe('wip-limit');
        expect(emitted['cardMove']).toBeUndefined();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('backlog');
    });

    it('los campos obligatorios rechazan y dicen cuáles faltan', () => {
        const { state } = bench();
        const card = state.itemById('e')!;

        const refusal = state.validateMove(card, 'review');

        expect(refusal?.reason).toBe('validation');
        expect(refusal?.failedFields).toEqual(['owner']);
    });

    it('una columna que pide confirmación retiene el movimiento y no emite rechazo', () => {
        const { state, tasks, emitted } = bench();
        const card = state.itemById('a')!;

        state.requestMove(card, { id: 'a', columnValue: 'done', index: 0 });

        expect(state.pendingMove()?.message).toBe('Ship it?');
        expect(emitted['cardDropBlocked']).toBeUndefined();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('backlog');

        state.confirmPendingMove();

        expect(state.pendingMove()).toBeNull();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('done');
    });

    it('cancelar la confirmación deja el tablero intacto', () => {
        const { state, tasks } = bench();

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'done', index: 0 });
        state.cancelPendingMove();

        expect(state.pendingMove()).toBeNull();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('backlog');
    });

    it('el acceso puede prohibir la salida de una columna y la entrada en otra', () => {
        const { config } = makeConfig({
            access: signal({ columnAccess: { backlog: { canMoveOut: false }, done: { canMoveIn: false } } })
        });

        const local = new TaskBoardState<Card>(config);

        // 'a' sale de backlog y 'd' entra en done: los dos lados del guardia.
        expect(local.validateMove(local.itemById('a')!, 'done')?.reason).toBe('access');
        expect(local.validateMove(local.itemById('d')!, 'done')?.reason).toBe('access');
    });

    it('una columna que el acceso esconde desaparece de las columnas visibles', () => {
        const { config } = makeConfig({ access: signal({ columnAccess: { done: { canView: false } } }) });
        const local = new TaskBoardState<Card>(config);

        expect(local.columns().map((column) => column.id)).toEqual(['backlog', 'active', 'review']);
    });
});

describe('un movimiento aceptado', () => {
    let harness: ReturnType<typeof bench>;

    beforeEach(() => {
        harness = bench();
    });

    it('emite el array nuevo ANTES del movimiento', () => {
        const order: string[] = [];
        const { config } = makeConfig({
            emitTasksChange: () => order.push('tasksChange'),
            emitCardMove: () => order.push('cardMove'),
            emitCardReorder: () => order.push('cardReorder')
        });

        const local = new TaskBoardState<Card>(config);

        local.requestMove(local.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(order).toEqual(['tasksChange', 'cardMove', 'cardReorder']);
    });

    it('un movimiento dentro de la misma celda emite cardMove y después cardReorder', () => {
        const { state, emitted } = harness;

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(emitted['cardMove']).toHaveLength(1);
        expect(emitted['cardReorder']).toHaveLength(1);
        expect(emitted['cardReorder'][0]).toMatchObject({ columnValue: 'backlog', oldIndex: 0, newIndex: 2 });
    });

    it('un movimiento entre columnas NO emite cardReorder', () => {
        const { state, emitted } = harness;

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'review', index: 0 });

        // review rechaza desde backlog, así que se usa una columna sin reglas.
        expect(emitted['cardReorder']).toBeUndefined();
    });

    it('renumera la celda de destino y cierra el hueco en la de origen', () => {
        const { state, tasks } = harness;

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        const backlog = tasks()
            .filter((item) => item.columnId === 'backlog')
            .sort((left, right) => left.order - right.order);

        expect(backlog.map((item) => item.id)).toEqual(['b', 'c', 'a']);
        expect(backlog.map((item) => item.order)).toEqual([0, 1, 2]);
    });

    it('cruzar de fila reescribe los dos campos configurados', () => {
        const grouped = bench({ swimlanes: true });

        grouped.state.requestMove(grouped.state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 0, swimlaneValue: 'platform' });

        const moved = grouped.tasks().find((item) => item.id === 'a')!;

        expect(moved.columnId).toBe('backlog');
        expect(moved.swimlaneId).toBe('platform');
        expect(grouped.state.itemsOf('backlog', 'growth').map((item) => item.id)).toEqual(['b']);
    });

    it('un grupo de tarjetas viaja en el orden en que se pintaba', () => {
        const { state, tasks } = harness;

        state.setSelection(['b', 'a']);
        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 3 }, ['a', 'b']);

        const backlog = tasks()
            .filter((item) => item.columnId === 'backlog')
            .sort((left, right) => left.order - right.order);

        expect(backlog.map((item) => item.id)).toEqual(['c', 'a', 'b']);
    });
});

describe('el modo externo', () => {
    it('no escribe nunca, pero sigue emitiendo el movimiento', () => {
        const { state, tasks, emitted } = bench({ external: true });
        const before = tasks();

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(tasks()).toBe(before);
        expect(emitted['tasksChange']).toBeUndefined();
        expect(emitted['cardMove']).toHaveLength(1);
    });

    it('no graba historial: el deshacer es de quien tiene los datos', () => {
        const { state } = bench({ external: true });

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(state.canUndo()).toBe(false);
    });
});

describe('la selección', () => {
    it('un clic sencillo reemplaza y un clic con modificador alterna', () => {
        const { state } = bench();

        state.selectFromPointer(state.itemById('a')!);
        expect(state.selectedIds()).toEqual(['a']);

        state.selectFromPointer(state.itemById('b')!, { toggle: true });
        expect(state.selectedIds()).toEqual(['a', 'b']);

        state.selectFromPointer(state.itemById('b')!, { toggle: true });
        expect(state.selectedIds()).toEqual(['a']);
    });

    it('el rango es local a la celda: si el destino está en otra columna, solo se selecciona él', () => {
        const { state } = bench();

        state.selectFromPointer(state.itemById('a')!);
        state.selectFromPointer(state.itemById('c')!, { range: true });
        expect(state.selectedIds()).toEqual(['a', 'b', 'c']);

        state.selectFromPointer(state.itemById('a')!);
        state.selectFromPointer(state.itemById('d')!, { range: true });
        expect(state.selectedIds()).toEqual(['d']);
    });

    it('cardSelect describe una tarjeta y selectionChange la selección entera', () => {
        const { state, emitted } = bench();

        state.selectFromPointer(state.itemById('a')!);

        expect(emitted['cardSelect'][0]).toMatchObject({ selected: true });
        expect(emitted['selectionChange'][0].selectedIds).toEqual(['a']);
    });

    it('seleccionar la celda entera emite solo selectionChange', () => {
        const { state, emitted } = bench();

        state.selectCell('backlog');

        expect(state.selectedIds()).toEqual(['a', 'b', 'c']);
        expect(emitted['cardSelect']).toBeUndefined();
    });

    it('borrar una tarjeta la saca de la selección', () => {
        const { state } = bench();

        state.setSelection(['a', 'b']);
        state.removeItem('a');

        expect(state.selectedIds()).toEqual(['b']);
    });
});

describe('el plegado', () => {
    it('la semilla de la metadata se lee una vez y no vuelve a pisar al usuario', () => {
        const columns = signal<TaskBoardColumnModel[]>([{ id: 'backlog', label: 'Backlog', collapsed: true }]);
        const { config } = makeConfig({ columns });
        const local = new TaskBoardState<Card>(config);

        expect(local.isColumnCollapsed('backlog')).toBe(true);

        local.setColumnCollapsed('backlog', false);

        // El array llega otra vez con `collapsed: true`, como tras un refresco de datos: la columna
        // tiene que quedarse abierta.
        columns.set([{ id: 'backlog', label: 'Backlog', collapsed: true }]);

        expect(local.isColumnCollapsed('backlog')).toBe(false);
    });

    it('el estado de WIP es aviso una tarjeta antes del límite y excedido al alcanzarlo', () => {
        const { state, tasks } = bench();

        expect(state.wipStateOf('active')).toBe('exceeded');

        tasks.update((items) => items.filter((item) => item.id !== 'e'));
        expect(state.wipStateOf('active')).toBe('warning');
    });
});

describe('el reorden de columnas', () => {
    it('rechaza entero un reorden que desplazaría una columna bloqueada', () => {
        const tasks = signal<Card[]>(cards());
        const locked: TaskBoardColumnModel[] = [
            { id: 'backlog', label: 'Backlog', order: 0 },
            { id: 'active', label: 'Active', order: 1 },
            { id: 'done', label: 'Done', order: 2, locked: true }
        ];

        const emitted: any[] = [];
        const { config } = makeConfig({ tasks, columns: signal(locked), emitColumnReorder: (payload) => emitted.push(payload) });
        const local = new TaskBoardState<Card>(config);

        local.reorderColumns(0, 2);
        expect(emitted).toHaveLength(0);

        local.reorderColumns(0, 1);
        expect(emitted[0].columns.map((column: TaskBoardColumnModel) => column.id)).toEqual(['active', 'backlog', 'done']);
    });
});

describe('el historial', () => {
    it('deshacer devuelve el array anterior y rehacer lo vuelve a aplicar', () => {
        const { state, tasks } = bench();

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });
        expect(tasks().find((item) => item.id === 'a')!.order).toBe(2);

        state.undo();
        expect(tasks().find((item) => item.id === 'a')!.order).toBe(0);

        state.redo();
        expect(tasks().find((item) => item.id === 'a')!.order).toBe(2);
    });
});

describe('la exportación', () => {
    it('el JSON lleva columnas, tarjetas, filas y el instante', () => {
        const { state } = bench({ swimlanes: true });
        const payload = JSON.parse(state.exportToJSON());

        expect(payload.columns).toHaveLength(4);
        expect(payload.tasks).toHaveLength(5);
        expect(payload.swimlanes).toHaveLength(2);
        expect(typeof payload.exportedAt).toBe('string');
    });

    it('el CSV escapa el separador y aplana los arrays', () => {
        const tasks = signal<Card[]>([{ id: 'x', title: 'Uno, dos', columnId: 'backlog', order: 0, tags: ['a', 'b'] } as Card]);
        const { config } = makeConfig({ tasks });
        const local = new TaskBoardState<Card>(config);

        const csv = local.exportToCSV({ fields: ['id', 'title', 'tags'] });

        expect(csv.split('\n')[0]).toBe('id,title,tags');
        expect(csv.split('\n')[1]).toBe('x,"Uno, dos",a;b');
    });

    it('la instantánea guarda solo estado de pantalla y se restaura a trozos', () => {
        const { state } = bench();

        state.setSelection(['a']);
        state.setColumnCollapsed('backlog', true);

        const snapshot = state.serializeState();
        expect(snapshot.selectedCardIds).toEqual(['a']);
        expect(snapshot.collapsedColumnIds).toEqual(['backlog']);

        state.clearSelection();
        state.setColumnCollapsed('backlog', false);

        state.restoreState({ collapsedColumnIds: ['active'] });
        expect(state.isColumnCollapsed('active')).toBe(true);
        expect(state.selectedIds()).toEqual([]);
    });
});

describe('la ventana virtual', () => {
    it('apagada, la ventana es la lista entera y no reserva espacio', () => {
        const { state } = bench();

        expect(state.windowOf('s:backlog|', 40)).toEqual({ start: 0, end: 40, paddingTop: 0, paddingBottom: 0 });
    });

    it('encendida, se ajusta al viewport y reserva lo que deja fuera', () => {
        const { config } = makeConfig({ virtualScroll: signal(true), virtualScrollItemHeight: signal(100), virtualScrollBuffer: signal(1) });
        const local = new TaskBoardState<Card>(config);

        local.setViewport('cell', 300, 400);

        const range = local.windowOf('cell', 100);

        expect(range.start).toBe(2);
        expect(range.paddingTop).toBe(200);
        expect(range.end).toBeGreaterThan(range.start);
        expect(range.paddingBottom).toBeGreaterThan(0);
    });
});
