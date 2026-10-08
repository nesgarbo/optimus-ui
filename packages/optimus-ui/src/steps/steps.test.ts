import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@openng/optimus-ui/api';
import { Steps, StepsModule } from './steps';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
    template: `<p-steps [model]="model" [activeIndex]="activeIndex" [readonly]="readonly" [styleClass]="styleClass" [style]="style" (activeIndexChange)="changes.push($event)" />`
})
class TestStepsComponent {
    model: MenuItem[] = [{ label: 'Personal' }, { label: 'Seat' }, { label: 'Payment' }, { label: 'Confirmation' }];
    activeIndex = 1;
    readonly = true;
    styleClass: string | undefined;
    style: { [klass: string]: any } | null | undefined;
    changes: number[] = [];
}

describe('Steps', () => {
    let fixture: ComponentFixture<TestStepsComponent>;
    let component: TestStepsComponent;

    const items = () => Array.from(fixture.nativeElement.querySelectorAll('li.p-steps-item')) as HTMLElement[];
    const links = () => Array.from(fixture.nativeElement.querySelectorAll('a.p-steps-item-link')) as HTMLElement[];
    const settle = async () => {
        fixture.changeDetectorRef.markForCheck();
        await fixture.whenStable();
    };
    const key = (target: HTMLElement, code: string) => target.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepsModule],
            declarations: [TestStepsComponent],
            providers: [provideZonelessChangeDetection(), provideRouter([])]
        }).compileComponents();

        fixture = TestBed.createComponent(TestStepsComponent);
        component = fixture.componentInstance;
        await settle();
    });

    it('should create', () => {
        expect(fixture.debugElement.query(By.directive(Steps)).componentInstance.componentName).toBe('Steps');
    });

    it('should draw one numbered item per step', () => {
        expect(items().length).toBe(4);
        expect(fixture.nativeElement.querySelectorAll('.p-steps-item-number').length).toBe(4);
        expect(Array.from(fixture.nativeElement.querySelectorAll('.p-steps-item-number')).map((n: any) => n.textContent.trim())).toEqual(['1', '2', '3', '4']);
        expect(Array.from(fixture.nativeElement.querySelectorAll('.p-steps-item-label')).map((n: any) => n.textContent.trim())).toEqual(['Personal', 'Seat', 'Payment', 'Confirmation']);
    });

    it('should mark the active step', async () => {
        expect(items().map((i) => i.classList.contains('p-steps-item-active'))).toEqual([false, true, false, false]);
        expect(items()[1].getAttribute('aria-current')).toBe('step');
        expect(items()[0].getAttribute('aria-current')).toBeNull();

        component.activeIndex = 3;
        await settle();

        expect(items().map((i) => i.classList.contains('p-steps-item-active'))).toEqual([false, false, false, true]);
    });

    it('should skip the steps that are not visible', async () => {
        component.model = [{ label: 'A' }, { label: 'B', visible: false }, { label: 'C' }];
        await settle();

        expect(items().length).toBe(2);
    });

    it('should add the style class and the inline style, and the readonly class', async () => {
        component.styleClass = 'my-steps';
        component.style = { width: '300px' };
        await settle();

        const root = fixture.nativeElement.querySelector('nav') as HTMLElement;

        expect(root.classList.contains('p-steps')).toBe(true);
        expect(root.classList.contains('my-steps')).toBe(true);
        expect(root.classList.contains('p-readonly')).toBe(true);
        expect(root.style.width).toBe('300px');

        component.readonly = false;
        await settle();

        expect(root.classList.contains('p-readonly')).toBe(false);
    });

    describe('readonly', () => {
        it('should not react to a click, and disable the steps that are not the active one', () => {
            const click = new MouseEvent('click', { bubbles: true, cancelable: true });

            links()[2].dispatchEvent(click);

            expect(click.defaultPrevented).toBe(true);
            expect(component.changes).toEqual([]);
            expect(items()[2].classList.contains('p-disabled')).toBe(true);
            expect(items()[1].classList.contains('p-disabled')).toBe(false);
        });
    });

    describe('interactive', () => {
        beforeEach(async () => {
            component.readonly = false;
            await settle();
        });

        it('should emit the index of a clicked step and run its command', async () => {
            const command = vi.fn();

            component.model = [{ label: 'A' }, { label: 'B', command }, { label: 'C' }];
            await settle();

            links()[1].click();

            expect(component.changes).toEqual([1]);
            expect(command).toHaveBeenCalledTimes(1);
            expect(command.mock.calls[0][0].index).toBe(1);
            expect(command.mock.calls[0][0].item.label).toBe('B');
        });

        it('should ignore a disabled step', async () => {
            component.model = [{ label: 'A' }, { label: 'B', disabled: true }];
            await settle();

            links()[1].click();

            expect(component.changes).toEqual([]);
            expect(links()[1].getAttribute('tabindex')).toBe('-1');
            expect(items()[1].classList.contains('p-disabled')).toBe(true);
        });

        it('should let a step with a url go to it', async () => {
            component.model = [{ label: 'A' }, { label: 'B', url: '#elsewhere' }];
            await settle();

            const click = new MouseEvent('click', { bubbles: true, cancelable: true });

            links()[1].dispatchEvent(click);

            expect(links()[1].getAttribute('href')).toBe('#elsewhere');
            expect(click.defaultPrevented).toBe(false);
            expect(component.changes).toEqual([1]);
        });

        it('should keep only the active step in the tab order', () => {
            expect(links().map((l) => l.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1']);
        });

        it('should move the focus with the arrow, Home and End keys', () => {
            links()[1].focus();

            key(links()[1], 'ArrowRight');
            expect(document.activeElement).toBe(links()[2]);

            key(links()[2], 'ArrowLeft');
            expect(document.activeElement).toBe(links()[1]);

            key(links()[1], 'End');
            expect(document.activeElement).toBe(links()[3]);

            key(links()[3], 'Home');
            expect(document.activeElement).toBe(links()[0]);
        });

        it('should activate a step with Enter and Space', () => {
            key(links()[2], 'Enter');
            key(links()[0], 'Space');

            expect(component.changes).toEqual([2, 0]);
        });

        it('should stay put at the ends of the list', () => {
            links()[0].focus();
            key(links()[0], 'ArrowLeft');

            expect(document.activeElement).toBe(links()[0]);
        });
    });

    describe('router links', () => {
        it('should draw a router link for a step that has one when it is not readonly', async () => {
            component.readonly = false;
            component.model = [
                { label: 'A', routerLink: '/a' },
                { label: 'B', routerLink: ['/b'] }
            ];
            await settle();

            expect(links().map((l) => l.getAttribute('href'))).toEqual(['/a', '/b']);
        });

        it('should draw a plain link when readonly', async () => {
            component.model = [{ label: 'A', routerLink: '/a' }];
            await settle();

            expect(links()[0].getAttribute('href')).toBeNull();
        });
    });

    it('should stop listening to the router when it is destroyed', () => {
        const steps = fixture.debugElement.query(By.directive(Steps)).componentInstance as Steps;
        const unsubscribe = vi.spyOn(steps.subscription!, 'unsubscribe');

        fixture.destroy();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
