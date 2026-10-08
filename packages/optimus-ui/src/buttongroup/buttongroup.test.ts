import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonGroup, ButtonGroupModule } from './buttongroup';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
    template: `
        <p-buttongroup>
            <button type="button" class="first">One</button>
            <button type="button" class="second">Two</button>
        </p-buttongroup>
    `
})
class TestButtonGroupComponent {}

describe('ButtonGroup', () => {
    let fixture: ComponentFixture<TestButtonGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonGroupModule],
            declarations: [TestButtonGroupComponent],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestButtonGroupComponent);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        const group = fixture.debugElement.query(By.directive(ButtonGroup));

        expect(group.componentInstance.componentName).toBe('ButtonGroup');
    });

    it('should wrap what it holds in a group', () => {
        const wrapper = fixture.nativeElement.querySelector('span.p-buttongroup') as HTMLElement;

        expect(wrapper).toBeTruthy();
        expect(wrapper.classList.contains('p-component')).toBe(true);
        expect(wrapper.getAttribute('role')).toBe('group');
    });

    it('should project its buttons inside the wrapper, in order', () => {
        const buttons = Array.from(fixture.nativeElement.querySelectorAll('span.p-buttongroup > button')) as HTMLElement[];

        expect(buttons.map((b) => b.textContent?.trim())).toEqual(['One', 'Two']);
    });

    it('should load its own style once', () => {
        const group = fixture.debugElement.query(By.directive(ButtonGroup)).componentInstance as ButtonGroup;

        expect(group._componentStyle.name).toBe('buttongroup');
    });
});
