import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Avatar } from '@openng/optimus-ui/avatar';
import { AvatarGroup, AvatarGroupModule } from './avatargroup';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
    template: `
        <p-avatarGroup [styleClass]="styleClass" [style]="style" [pt]="pt">
            <p-avatar label="A" />
            <p-avatar label="B" />
            @if (showThird) {
                <p-avatar label="+2" />
            }
        </p-avatarGroup>
    `
})
class TestAvatarGroupComponent {
    styleClass: string | undefined;
    style: { [klass: string]: any } | null | undefined;
    pt: any;
    showThird = true;
}

describe('AvatarGroup', () => {
    let fixture: ComponentFixture<TestAvatarGroupComponent>;
    let component: TestAvatarGroupComponent;

    const group = () => fixture.debugElement.query(By.directive(AvatarGroup));
    const settle = async () => {
        fixture.changeDetectorRef.markForCheck();
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AvatarGroupModule, Avatar],
            declarations: [TestAvatarGroupComponent],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestAvatarGroupComponent);
        component = fixture.componentInstance;
        await settle();
    });

    it('should create', () => {
        expect(group().componentInstance).toBeInstanceOf(AvatarGroup);
        expect(group().componentInstance.componentName).toBe('AvatarGroup');
    });

    it('should carry the group classes on its host', () => {
        const host = group().nativeElement as HTMLElement;

        expect(host.classList.contains('p-avatar-group')).toBe(true);
        expect(host.classList.contains('p-component')).toBe(true);
    });

    it('should project its avatars in order', () => {
        const labels = group()
            .queryAll(By.directive(Avatar))
            .map((a) => a.nativeElement.textContent.trim());

        expect(labels).toEqual(['A', 'B', '+2']);
    });

    it('should follow the avatars that come and go', async () => {
        component.showThird = false;
        await settle();

        expect(group().queryAll(By.directive(Avatar)).length).toBe(2);
    });

    it('should add the style class and the inline style', async () => {
        component.styleClass = 'my-group';
        component.style = { width: '200px' };
        await settle();

        const host = group().nativeElement as HTMLElement;

        expect(host.classList.contains('my-group')).toBe(true);
        expect(host.classList.contains('p-avatar-group')).toBe(true);
        expect(host.style.width).toBe('200px');
    });

    it('should apply pass through to its root', async () => {
        component.pt = { root: { class: 'PT_ROOT', 'data-testid': 'group' } };
        await settle();

        const host = group().nativeElement as HTMLElement;

        expect(host.classList.contains('PT_ROOT')).toBe(true);
        expect(host.getAttribute('data-testid')).toBe('group');
    });
});
