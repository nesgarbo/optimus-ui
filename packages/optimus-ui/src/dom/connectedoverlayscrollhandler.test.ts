import { ConnectedOverlayScrollHandler } from './connectedoverlayscrollhandler';

describe('ConnectedOverlayScrollHandler', () => {
    let parent: HTMLElement;
    let child: HTMLElement;

    beforeEach(() => {
        parent = document.createElement('div');
        parent.style.overflow = 'auto';
        child = document.createElement('span');
        parent.appendChild(child);
        document.body.appendChild(parent);
    });

    afterEach(() => {
        parent.remove();
    });

    it('registers passive scroll listeners and removes them', () => {
        const addSpy = vi.spyOn(parent, 'addEventListener');
        const removeSpy = vi.spyOn(parent, 'removeEventListener');
        const listener = vi.fn();
        const handler = new ConnectedOverlayScrollHandler(child, listener);

        handler.bindScrollListener();
        expect(addSpy).toHaveBeenCalledWith('scroll', listener, { passive: true });

        handler.unbindScrollListener();
        expect(removeSpy).toHaveBeenCalledWith('scroll', listener);
    });

    it('binds outside of the given zone', () => {
        const zone = { runOutsideAngular: vi.fn((fn: () => void) => fn()) } as any;
        const handler = new ConnectedOverlayScrollHandler(child, vi.fn(), zone);

        handler.bindScrollListener();

        expect(zone.runOutsideAngular).toHaveBeenCalledTimes(1);
        handler.destroy();
    });

    it('does not stack listeners when bound twice', () => {
        const listener = vi.fn();
        const handler = new ConnectedOverlayScrollHandler(child, listener);

        handler.bindScrollListener();
        handler.bindScrollListener();
        parent.dispatchEvent(new Event('scroll'));

        expect(listener).toHaveBeenCalledTimes(1);
        handler.destroy();
    });
});
