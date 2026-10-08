import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Badge } from '@openng/optimus-ui/badge';
import { OverlayBadge, OverlayBadgeModule } from './overlaybadge';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
    template: `
        <p-overlayBadge [value]="value" [severity]="severity" [badgeSize]="badgeSize" [badgeDisabled]="badgeDisabled" [styleClass]="styleClass" [style]="style" [pt]="pt">
            <i class="target pi pi-bell"></i>
        </p-overlayBadge>
    `
})
class TestOverlayBadgeComponent {
    value: string | number | null = '2';
    severity: any = null;
    badgeSize: any = null;
    badgeDisabled = false;
    styleClass: string | undefined;
    style: { [klass: string]: any } | null | undefined;
    pt: any;
}

describe('OverlayBadge', () => {
    let fixture: ComponentFixture<TestOverlayBadgeComponent>;
    let component: TestOverlayBadgeComponent;

    const root = () => fixture.nativeElement.querySelector('.p-overlaybadge') as HTMLElement;
    const badge = () => fixture.nativeElement.querySelector('p-badge') as HTMLElement;
    const settle = async () => {
        fixture.changeDetectorRef.markForCheck();
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OverlayBadgeModule],
            declarations: [TestOverlayBadgeComponent],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestOverlayBadgeComponent);
        component = fixture.componentInstance;
        await settle();
    });

    it('should create', () => {
        expect(fixture.debugElement.query(By.directive(OverlayBadge)).componentInstance.componentName).toBe('OverlayBadge');
    });

    it('should draw its content and a badge in the same wrapper', () => {
        expect(root()).toBeTruthy();
        expect(root().querySelector('.target')).toBeTruthy();
        expect(root().contains(badge())).toBe(true);
    });

    it('should show the value in the badge', async () => {
        expect(badge().textContent?.trim()).toBe('2');

        component.value = 99;
        await settle();

        expect(badge().textContent?.trim()).toBe('99');
    });

    it('should make a dot of the badge when there is no value', async () => {
        component.value = null;
        await settle();

        expect(badge().classList.contains('p-badge-dot')).toBe(true);
    });

    it('should hand the severity and the size to the badge', async () => {
        component.severity = 'danger';
        component.badgeSize = 'large';
        await settle();

        expect(badge().classList.contains('p-badge-danger')).toBe(true);
        expect(badge().classList.contains('p-badge-lg')).toBe(true);
    });

    it('should hide the badge when it is disabled', async () => {
        component.badgeDisabled = true;
        await settle();

        expect(badge().style.display).toBe('none');
    });

    it('should hand its style class and style to the badge', async () => {
        component.styleClass = 'my-badge';
        component.style = { color: 'red' };
        await settle();

        expect(badge().classList.contains('my-badge')).toBe(true);
        expect(badge().style.color).toBe('red');
    });

    it('should apply pass through to the root and to the badge', async () => {
        component.pt = { root: { class: 'PT_ROOT' }, pcBadge: { root: { class: 'PT_BADGE' } } };
        await settle();

        expect(root().classList.contains('PT_ROOT')).toBe(true);
        expect(badge().classList.contains('PT_BADGE')).toBe(true);
        expect(fixture.debugElement.query(By.directive(Badge))).toBeTruthy();
    });
});
