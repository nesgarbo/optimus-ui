import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Motion } from './motion.component';
import { MotionDirective } from './motion.directive';
import { MotionModule } from './motion.module';
import { applyHiddenStyles, resetStyles } from './motion.utils';

describe('motion utils', () => {
    it('hides an element with display and gives its style back', () => {
        const el = document.createElement('div');

        el.style.display = 'flex';
        applyHiddenStyles(el, 'display');
        expect(el.style.display).toBe('none');

        resetStyles(el, 'display');
        expect(el.style.display).toBe('flex');
    });

    it('hides an element with visibility and gives back what the three styles were', () => {
        const el = document.createElement('div');

        el.style.overflow = 'auto';
        applyHiddenStyles(el, 'visibility');
        expect([el.style.visibility, el.style.maxHeight, el.style.overflow]).toEqual(['hidden', '0px', 'hidden']);

        resetStyles(el, 'visibility');
        expect([el.style.visibility, el.style.maxHeight, el.style.overflow]).toEqual(['', '', 'auto']);
    });

    it('remembers the first style only, however many times it hides', () => {
        const el = document.createElement('div');

        el.style.display = 'grid';
        applyHiddenStyles(el, 'display');
        applyHiddenStyles(el, 'display');
        resetStyles(el, 'display');

        expect(el.style.display).toBe('grid');
    });

    it('does nothing for no element', () => {
        expect(() => applyHiddenStyles(null as any, 'display')).not.toThrow();
        expect(() => resetStyles(undefined as any, 'display')).not.toThrow();
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
    template: `
        <p-motion
            [visible]="visible"
            [mountOnEnter]="mountOnEnter"
            [unmountOnLeave]="unmountOnLeave"
            [hideStrategy]="hideStrategy"
            [duration]="20"
            type="transition"
            enterFromClass="t-from"
            enterActiveClass="t-active"
            enterToClass="t-to"
            leaveFromClass="t-from"
            leaveActiveClass="t-active"
            leaveToClass="t-to"
            (onBeforeEnter)="events.push('beforeEnter')"
            (onEnter)="events.push('enter')"
            (onAfterEnter)="events.push('afterEnter')"
            (onBeforeLeave)="events.push('beforeLeave')"
            (onAfterLeave)="events.push('afterLeave')"
        >
            <span class="inside">content</span>
        </p-motion>
    `
})
class TestMotionComponent {
    visible = false;
    mountOnEnter = true;
    unmountOnLeave = true;
    hideStrategy: 'display' | 'visibility' = 'display';
    events: string[] = [];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
    template: `<div class="target" [pMotion]="visible" [pMotionDuration]="20" pMotionType="transition" (pMotionOnBeforeEnter)="events.push('beforeEnter')" (pMotionOnAfterLeave)="events.push('afterLeave')">content</div>`
})
class TestMotionDirectiveComponent {
    visible = false;
    events: string[] = [];
}

describe('Motion', () => {
    let fixture: ComponentFixture<TestMotionComponent>;
    let component: TestMotionComponent;

    const motion = () => fixture.debugElement.query(By.directive(Motion));
    const root = () => motion().nativeElement as HTMLElement;
    const inside = () => root().querySelector('.inside');
    const settle = async () => {
        fixture.changeDetectorRef.markForCheck();
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MotionModule],
            declarations: [TestMotionComponent, TestMotionDirectiveComponent],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();
    });

    describe('component', () => {
        const create = async (init: Partial<TestMotionComponent> = {}) => {
            fixture = TestBed.createComponent(TestMotionComponent);
            component = fixture.componentInstance;
            Object.assign(component, init);
            await settle();
        };

        it('should create and carry its root class', async () => {
            await create();

            expect(motion().componentInstance).toBeInstanceOf(Motion);
            expect(root().classList.contains('p-motion')).toBe(true);
        });

        it('should not draw its content until it is visible, when it mounts on enter', async () => {
            await create();

            expect(inside()).toBeNull();
            expect(root().style.display).toBe('none');
        });

        it('should draw its content at once with mountOnEnter off, and keep it hidden', async () => {
            await create({ mountOnEnter: false });

            expect(inside()).toBeTruthy();
            expect(root().style.display).toBe('none');
        });

        it('should show what starts visible, without a motion', async () => {
            await create({ visible: true });
            await vi.waitFor(() => expect(root().style.display).toBe(''));

            expect(inside()).toBeTruthy();
            expect(component.events).toEqual([]);
        });

        it('should hide with visibility when asked to', async () => {
            await create({ hideStrategy: 'visibility', mountOnEnter: false });

            expect(root().style.visibility).toBe('hidden');
            expect(root().style.display).toBe('');
        });

        it('should draw and show its content, and run the enter, when it becomes visible', async () => {
            await create();

            component.visible = true;
            await settle();

            await vi.waitFor(() => expect(component.events).toContain('afterEnter'));
            expect(inside()).toBeTruthy();
            expect(root().style.display).toBe('');
            expect(component.events.indexOf('beforeEnter')).toBeLessThan(component.events.indexOf('enter'));
            expect(component.events.indexOf('enter')).toBeLessThan(component.events.indexOf('afterEnter'));
        });

        it('should run the leave, hide and unmount its content when it stops being visible', async () => {
            await create({ visible: true });
            await vi.waitFor(() => expect(root().style.display).toBe(''));

            component.visible = false;
            await settle();

            await vi.waitFor(() => expect(component.events).toContain('afterLeave'));
            await vi.waitFor(() => expect(inside()).toBeNull());
            expect(root().style.display).toBe('none');
            expect(component.events.indexOf('beforeLeave')).toBeLessThan(component.events.indexOf('afterLeave'));
        });

        it('should keep its content after the leave with unmountOnLeave off', async () => {
            await create({ visible: true, unmountOnLeave: false });
            await vi.waitFor(() => expect(root().style.display).toBe(''));

            component.visible = false;
            await settle();

            await vi.waitFor(() => expect(component.events).toContain('afterLeave'));
            await vi.waitFor(() => expect(root().style.display).toBe('none'));
            expect(inside()).toBeTruthy();
        });

        it('should stop emitting when it is destroyed in the middle of a motion', async () => {
            await create();

            component.visible = true;
            await settle();
            fixture.destroy();

            const seen = component.events.length;

            await new Promise((resolve) => setTimeout(resolve, 80));

            expect(component.events.length).toBe(seen);
        });
    });

    describe('directive', () => {
        let dirFixture: ComponentFixture<TestMotionDirectiveComponent>;

        const target = () => dirFixture.nativeElement.querySelector('.target') as HTMLElement;
        const dirSettle = async () => {
            dirFixture.changeDetectorRef.markForCheck();
            await dirFixture.whenStable();
        };

        beforeEach(async () => {
            dirFixture = TestBed.createComponent(TestMotionDirectiveComponent);
            await dirSettle();
        });

        it('should hide the element it is on while it is not visible', async () => {
            expect(dirFixture.debugElement.query(By.directive(MotionDirective))).toBeTruthy();
            expect(target().style.display).toBe('none');
        });

        it('should show the element, and enter, when it becomes visible', async () => {
            dirFixture.componentInstance.visible = true;
            await dirSettle();

            await vi.waitFor(() => expect(target().style.display).toBe(''));
            await vi.waitFor(() => expect(dirFixture.componentInstance.events).toContain('beforeEnter'));
        });

        it('should hide the element again after it leaves', async () => {
            dirFixture.componentInstance.visible = true;
            await dirSettle();
            await vi.waitFor(() => expect(target().style.display).toBe(''));

            dirFixture.componentInstance.visible = false;
            await dirSettle();

            await vi.waitFor(() => expect(dirFixture.componentInstance.events).toContain('afterLeave'));
            await vi.waitFor(() => expect(target().style.display).toBe('none'));
        });
    });
});
