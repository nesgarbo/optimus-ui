import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideOptimus } from '@openng/optimus-ui/config';
import { Divider } from '@openng/optimus-ui/divider';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Divider],
    template: `<p-divider [pt]="pt" />`
})
class HostComponent {
    pt: any = {};
}

describe('BaseComponent passthrough hooks', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideOptimus()] });
    });

    afterEach(() => TestBed.resetTestingModule());

    it('does not throw when a hook of the pt gives back something that is not a function', () => {
        const fixture = TestBed.createComponent(HostComponent);

        fixture.componentInstance.pt = { hooks: { onInit: () => 'a value', onAfterViewInit: () => 42 } };

        expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('calls the hook that the pt gives back as a function', () => {
        const hook = vi.fn();
        const fixture = TestBed.createComponent(HostComponent);

        fixture.componentInstance.pt = { hooks: { onInit: () => hook } };
        fixture.detectChanges();

        expect(hook).toHaveBeenCalled();
    });
});
