import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DragDropModule, Draggable, Droppable } from './dragdrop';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
    template: `
        <div class="source" pDraggable="photo" [dragEffect]="effect" [dragHandle]="handle" [pDraggableDisabled]="dragDisabled" (onDragStart)="events.push('dragstart')" (onDrag)="events.push('drag')" (onDragEnd)="events.push('dragend')">
            <span class="grip">grip</span>
            <span class="body">body</span>
        </div>
        <div class="target" [pDroppable]="scope" [dropEffect]="dropEffect" [pDroppableDisabled]="dropDisabled" (onDragEnter)="events.push('enter')" (onDragLeave)="events.push('leave')" (onDrop)="events.push('drop')">
            <span class="inner">inner</span>
        </div>
    `
})
class TestDragDropComponent {
    effect: any = undefined;
    handle: string | undefined;
    dragDisabled = false;
    scope: string | string[] = 'photo';
    dropEffect: any = undefined;
    dropDisabled = false;
    events: string[] = [];
}

function dragEvent(type: string, init: DragEventInit & { data?: string } = {}) {
    const dataTransfer = new DataTransfer();

    if (init.data) dataTransfer.setData('text', init.data);

    return new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer, ...init });
}

describe('DragDrop', () => {
    let fixture: ComponentFixture<TestDragDropComponent>;
    let component: TestDragDropComponent;

    const source = () => fixture.nativeElement.querySelector('.source') as HTMLElement;
    const target = () => fixture.nativeElement.querySelector('.target') as HTMLElement;
    const settle = async () => {
        fixture.changeDetectorRef.markForCheck();
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DragDropModule],
            declarations: [TestDragDropComponent],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestDragDropComponent);
        component = fixture.componentInstance;
        await settle();
    });

    describe('Draggable', () => {
        it('should make its element draggable', () => {
            expect(fixture.debugElement.query(By.directive(Draggable))).toBeTruthy();
            expect(source().draggable).toBe(true);
        });

        it('should put the scope in the data of the drag, and tell about the start and the end', () => {
            const start = dragEvent('dragstart');

            source().dispatchEvent(start);
            source().dispatchEvent(dragEvent('drag'));
            source().dispatchEvent(dragEvent('dragend'));

            expect(start.dataTransfer!.getData('text')).toBe('photo');
            expect(start.defaultPrevented).toBe(false);
            expect(component.events).toEqual(['dragstart', 'drag', 'dragend']);
        });

        it('should stop telling about the drag once it ends', () => {
            source().dispatchEvent(dragEvent('dragstart'));
            source().dispatchEvent(dragEvent('dragend'));
            source().dispatchEvent(dragEvent('drag'));

            expect(component.events).toEqual(['dragstart', 'dragend']);
        });

        it('should set the effect that is allowed', async () => {
            component.effect = 'copy';
            await settle();

            // A browser only lets the real drag set the effect, so the event carries a plain object to read it from.
            const transfer = { setData: vi.fn(), effectAllowed: 'uninitialized' };
            const start = dragEvent('dragstart');

            Object.defineProperty(start, 'dataTransfer', { value: transfer });
            source().dispatchEvent(start);

            expect(transfer.effectAllowed).toBe('copy');
            expect(transfer.setData).toHaveBeenCalledWith('text', 'photo');
        });

        it('should start only from its handle when it has one', async () => {
            component.handle = '.grip';
            await settle();

            const fromBody = dragEvent('dragstart');

            source()
                .querySelector('.body')!
                .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            source().dispatchEvent(fromBody);
            expect(fromBody.defaultPrevented).toBe(true);
            expect(component.events).toEqual([]);

            const fromGrip = dragEvent('dragstart');

            source()
                .querySelector('.grip')!
                .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            source().dispatchEvent(fromGrip);
            expect(fromGrip.defaultPrevented).toBe(false);
            expect(component.events).toEqual(['dragstart']);
        });

        it('should not start when it is disabled, and start again when it is enabled', async () => {
            component.dragDisabled = true;
            await settle();

            const refused = dragEvent('dragstart');

            source().dispatchEvent(refused);
            expect(refused.defaultPrevented).toBe(true);
            expect(component.events).toEqual([]);

            component.dragDisabled = false;
            await settle();
            source().dispatchEvent(dragEvent('dragstart'));

            expect(component.events).toEqual(['dragstart']);
            expect(source().draggable).toBe(true);
        });

        it('should drop its listeners when it is destroyed', () => {
            const draggable = fixture.debugElement.query(By.directive(Draggable)).injector.get(Draggable);

            source().dispatchEvent(dragEvent('dragstart'));
            expect(draggable.dragListener).toBeTruthy();

            fixture.destroy();

            expect(draggable.dragListener).toBeNull();
            expect(draggable.mouseDownListener).toBeNull();
            expect(draggable.mouseUpListener).toBeNull();
        });
    });

    describe('Droppable', () => {
        it('should be there', () => {
            expect(fixture.debugElement.query(By.directive(Droppable))).toBeTruthy();
        });

        it('should mark itself while a drag is over it, and tell about it', () => {
            target().dispatchEvent(dragEvent('dragenter'));

            expect(target().classList.contains('p-draggable-enter')).toBe(true);
            expect(component.events).toEqual(['enter']);

            target().dispatchEvent(dragEvent('dragleave'));

            expect(target().classList.contains('p-draggable-enter')).toBe(false);
            expect(component.events).toEqual(['enter', 'leave']);
        });

        it('should not count the drag moving over its own children as leaving', () => {
            target().dispatchEvent(dragEvent('dragenter'));
            target().dispatchEvent(dragEvent('dragleave', { relatedTarget: target().querySelector('.inner') }));

            expect(target().classList.contains('p-draggable-enter')).toBe(true);
            expect(component.events).toEqual(['enter']);
        });

        it('should say it takes a drop, so the browser lets it happen', () => {
            const over = dragEvent('dragover');

            target().dispatchEvent(over);

            expect(over.defaultPrevented).toBe(true);
        });

        it('should take the drop of its scope, and only that', () => {
            target().dispatchEvent(dragEvent('dragenter'));

            const wrong = dragEvent('drop', { data: 'video' });

            target().dispatchEvent(wrong);
            expect(wrong.defaultPrevented).toBe(false);
            expect(component.events).toEqual(['enter']);

            const right = dragEvent('drop', { data: 'photo' });

            target().dispatchEvent(right);
            expect(right.defaultPrevented).toBe(true);
            expect(component.events).toEqual(['enter', 'drop']);
            expect(target().classList.contains('p-draggable-enter')).toBe(false);
        });

        it('should take the drop of any of several scopes', async () => {
            component.scope = ['video', 'photo'];
            await settle();

            target().dispatchEvent(dragEvent('drop', { data: 'video' }));
            target().dispatchEvent(dragEvent('drop', { data: 'photo' }));
            target().dispatchEvent(dragEvent('drop', { data: 'music' }));

            expect(component.events).toEqual(['drop', 'drop']);
        });

        it('should set the drop effect', async () => {
            component.dropEffect = 'move';
            await settle();

            const transfer = { dropEffect: 'none' };
            const enter = dragEvent('dragenter');

            Object.defineProperty(enter, 'dataTransfer', { value: transfer });
            target().dispatchEvent(enter);

            expect(transfer.dropEffect).toBe('move');
        });

        it('should stop answering dragover when it is disabled', async () => {
            component.dropDisabled = true;
            await settle();

            const over = dragEvent('dragover');

            target().dispatchEvent(over);
            expect(over.defaultPrevented).toBe(false);

            component.dropDisabled = false;
            await settle();

            const again = dragEvent('dragover');

            target().dispatchEvent(again);
            expect(again.defaultPrevented).toBe(true);
        });

        it('should drop its listener when it is destroyed', () => {
            const droppable = fixture.debugElement.query(By.directive(Droppable)).injector.get(Droppable);

            expect(droppable.dragOverListener).toBeTruthy();

            fixture.destroy();

            expect(droppable.dragOverListener).toBeNull();
        });
    });
});
