import { TestBed } from '@angular/core/testing';
import { Confirmation } from './confirmation';
import { ConfirmationService } from './confirmationservice';
import { ContextMenuService } from './contextmenuservice';
import { FilterService } from './filterservice';
import { MessageService } from './messageservice';
import { OverlayService } from './overlayservice';
import { ToastMessageOptions } from './toastmessage';
import { TreeDragDropService } from './treedragdropservice';

describe('FilterService', () => {
    const service = new FilterService();
    const f = service.filters;

    describe('text rules', () => {
        it('startsWith ignores case and accents, and lets an empty filter through', () => {
            expect(f['startsWith']('Álvaro', 'alv')).toBe(true);
            expect(f['startsWith']('Álvaro', 'var')).toBe(false);
            expect(f['startsWith']('x', '  ')).toBe(true);
            expect(f['startsWith']('x', null)).toBe(true);
            expect(f['startsWith'](null, 'a')).toBe(false);
        });

        it('contains and notContains are each others opposite for a value that is there', () => {
            expect(f['contains']('Cordoba', 'ORD')).toBe(true);
            expect(f['contains']('Córdoba', 'cord')).toBe(true);
            expect(f['contains']('Cordoba', 'xyz')).toBe(false);
            expect(f['contains'](12345, 34)).toBe(true);
            expect(f['contains'](undefined, 'a')).toBe(false);
            expect(f['notContains']('Cordoba', 'ord')).toBe(false);
            expect(f['notContains']('Cordoba', 'xyz')).toBe(true);
            expect(f['notContains']('Cordoba', '')).toBe(true);
        });

        it('endsWith looks at the end only', () => {
            expect(f['endsWith']('Madrid', 'RID')).toBe(true);
            expect(f['endsWith']('Madrid', 'mad')).toBe(false);
            expect(f['endsWith']('Madrid', '')).toBe(true);
            expect(f['endsWith'](null, 'a')).toBe(false);
        });

        it('uses the locale to lower the case', () => {
            expect(f['contains']('ISTANBUL', 'ı', 'tr')).toBe(false);
            expect(f['contains']('ISTANBUL', 'ist', 'en')).toBe(true);
        });
    });

    describe('equality rules', () => {
        it('equals compares dates by time, numbers loosely and text without case or accents', () => {
            expect(f['equals'](new Date(5), new Date(5))).toBe(true);
            expect(f['equals'](new Date(5), new Date(6))).toBe(false);
            expect(f['equals'](3, '3')).toBe(true);
            expect(f['equals']('Álvaro', 'ALVARO')).toBe(true);
            expect(f['equals']('a', 'b')).toBe(false);
            expect(f['equals'](null, 'b')).toBe(false);
            expect(f['equals']('a', undefined)).toBe(true);
        });

        it('notEquals is the opposite, except that an empty filter excludes nothing', () => {
            expect(f['notEquals']('a', 'b')).toBe(true);
            expect(f['notEquals']('a', 'A')).toBe(false);
            expect(f['notEquals'](null, 'b')).toBe(true);
            expect(f['notEquals']('a', '')).toBe(false);
            expect(f['notEquals'](new Date(1), new Date(2))).toBe(true);
        });

        it('in is true for any of the values, and for an empty list', () => {
            expect(f['in']('b', ['a', 'b'])).toBe(true);
            expect(f['in']('c', ['a', 'b'])).toBe(false);
            expect(f['in']('c', [])).toBe(true);
            expect(f['in']('c', null)).toBe(true);
        });

        it('is and isNot go through equals and notEquals', () => {
            expect(f['is']('Ab', 'aB')).toBe(true);
            expect(f['isNot']('Ab', 'aB')).toBe(false);
        });
    });

    describe('order rules', () => {
        it('compares numbers and dates', () => {
            expect(f['lt'](1, 2)).toBe(true);
            expect(f['lt'](2, 2)).toBe(false);
            expect(f['lte'](2, 2)).toBe(true);
            expect(f['gt'](3, 2)).toBe(true);
            expect(f['gte'](2, 2)).toBe(true);
            expect(f['lt'](new Date(1), new Date(2))).toBe(true);
            expect(f['gt'](new Date(1), new Date(2))).toBe(false);
            expect(f['before'](1, 2)).toBe(true);
            expect(f['after'](1, 2)).toBe(false);
        });

        it('lets through a missing filter and refuses a missing value', () => {
            for (const rule of ['lt', 'lte', 'gt', 'gte']) {
                expect(f[rule](1, null)).toBe(true);
                expect(f[rule](null, 1)).toBe(false);
            }
        });

        it('between is inclusive, works on dates, and lets an open range through', () => {
            expect(f['between'](5, [1, 5])).toBe(true);
            expect(f['between'](6, [1, 5])).toBe(false);
            expect(f['between'](new Date(3), [new Date(1), new Date(5)])).toBe(true);
            expect(f['between'](9, [1, null])).toBe(true);
            expect(f['between'](9, null)).toBe(true);
            expect(f['between'](null, [1, 5])).toBe(false);
        });
    });

    describe('date rules', () => {
        const day = (d: number, h = 0) => new Date(2024, 0, d, h);

        it('dateIs and dateIsNot look at the day only', () => {
            expect(f['dateIs'](day(5, 3), day(5, 20))).toBe(true);
            expect(f['dateIs'](day(5), day(6))).toBe(false);
            expect(f['dateIsNot'](day(5), day(6))).toBe(true);
            expect(f['dateIsNot'](day(5), null)).toBe(true);
        });

        it('dateBefore and dateAfter compare the time', () => {
            expect(f['dateBefore'](day(5), day(6))).toBe(true);
            expect(f['dateBefore'](day(6), day(5))).toBe(false);
            expect(f['dateAfter'](day(6, 15), day(5))).toBe(true);
            expect(f['dateAfter'](day(4), day(5))).toBe(false);
        });
    });

    describe('filter()', () => {
        const people = [
            { name: 'Ana', city: { name: 'Madrid' }, age: 30 },
            { name: 'Luis', city: { name: 'Sevilla' }, age: 41 },
            { name: 'Marta', city: { name: 'Madrid' }, age: 25 }
        ];

        it('keeps the items where a field matches, once each, with nested fields', () => {
            expect(service.filter(people, ['name', 'city.name'], 'ma', 'contains').map((p) => p.name)).toEqual(['Ana', 'Marta']);
            expect(service.filter(people, ['name', 'city.name'], 'a', 'startsWith').map((p) => p.name)).toEqual(['Ana']);
            expect(service.filter(people, ['age'], 30, 'gte').map((p) => p.name)).toEqual(['Ana', 'Luis']);
        });

        it('gives an empty list for no value', () => {
            expect(service.filter(null as any, ['name'], 'a', 'contains')).toEqual([]);
        });

        it('runs a rule that was registered', () => {
            service.register('adult', (value: number) => value >= 30);

            expect(service.filter(people, ['age'], null, 'adult').map((p) => p.name)).toEqual(['Ana', 'Luis']);
        });
    });

    it('is a singleton the injector provides', () => {
        expect(TestBed.inject(FilterService)).toBe(TestBed.inject(FilterService));
    });
});

describe('MessageService', () => {
    let service: MessageService;

    beforeEach(() => {
        service = new MessageService();
    });

    it('emits a message that is added', () => {
        const seen: any[] = [];

        service.messageObserver.subscribe((m) => seen.push(m));
        service.add({ severity: 'info', summary: 'One' } as ToastMessageOptions);
        service.add(undefined as any);

        expect(seen).toEqual([{ severity: 'info', summary: 'One' }]);
    });

    it('emits a list of messages as one emission, and nothing for an empty list', () => {
        const seen: any[] = [];
        const list = [{ summary: 'A' }, { summary: 'B' }] as ToastMessageOptions[];

        service.messageObserver.subscribe((m) => seen.push(m));
        service.addAll(list);
        service.addAll([]);
        service.addAll(undefined as any);

        expect(seen).toEqual([list]);
    });

    it('emits the key to clear, or null for all', () => {
        const keys: (string | null)[] = [];

        service.clearObserver.subscribe((k) => keys.push(k));
        service.clear('top');
        service.clear();

        expect(keys).toEqual(['top', null]);
    });
});

describe('ConfirmationService', () => {
    let service: ConfirmationService;

    beforeEach(() => {
        service = new ConfirmationService();
    });

    it('emits the confirmation it is asked for, and can be chained', () => {
        const seen: (Confirmation | null)[] = [];
        const confirmation: Confirmation = { message: 'Sure?' };

        service.requireConfirmation$.subscribe((c) => seen.push(c));

        expect(service.confirm(confirmation)).toBe(service);
        expect(seen).toEqual([confirmation]);
    });

    it('emits null to close', () => {
        const seen: (Confirmation | null)[] = [];

        service.requireConfirmation$.subscribe((c) => seen.push(c));

        expect(service.close()).toBe(service);
        expect(seen).toEqual([null]);
    });

    it('tells when it is accepted', () => {
        const accepted = vi.fn();

        service.accept.subscribe(accepted);
        service.onAccept();

        expect(accepted).toHaveBeenCalledWith(null);
    });
});

describe('ContextMenuService', () => {
    it('keeps the active key and tells about each change, and about the reset', () => {
        const service = new ContextMenuService();
        const keys: string[] = [];

        service.activeItemKeyChange$.subscribe((k) => keys.push(k));
        service.changeKey('0_1');
        expect(service.activeItemKey).toBe('0_1');

        service.reset();
        expect(service.activeItemKey).toBeNull();
        expect(keys).toEqual(['0_1', null as any]);
    });
});

describe('OverlayService', () => {
    it('passes on the clicks it is given, and ignores an empty one', () => {
        const service = TestBed.inject(OverlayService);
        const clicks: any[] = [];
        const subscription = service.clickObservable.subscribe((c) => clicks.push(c));
        const event = { originalEvent: new Event('click'), target: document.body };

        service.add(event);
        service.add(null);
        subscription.unsubscribe();

        expect(clicks).toEqual([event]);
    });

    it('passes on the drag of a parent', () => {
        const service = TestBed.inject(OverlayService);
        const seen: Element[] = [];
        const el = document.createElement('div');
        const subscription = service.parentDragObservable.subscribe((e) => seen.push(e));

        service.emitParentDrag(el);
        subscription.unsubscribe();

        expect(seen).toEqual([el]);
    });
});

describe('TreeDragDropService', () => {
    it('tells about the start and the stop of a drag, each on its own', () => {
        const service = new TreeDragDropService();
        const started = vi.fn();
        const stopped = vi.fn();
        const event = { tree: {}, node: { label: 'n' }, subNodes: [], index: 0, scope: {} } as any;

        service.dragStart$.subscribe(started);
        service.dragStop$.subscribe(stopped);

        service.startDrag(event);
        expect(started).toHaveBeenCalledWith(event);
        expect(stopped).not.toHaveBeenCalled();

        service.stopDrag(event);
        expect(stopped).toHaveBeenCalledWith(event);
        expect(started).toHaveBeenCalledTimes(1);
    });
});
