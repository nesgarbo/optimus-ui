import { NgZone } from '@angular/core';
import { DomHandler } from './domhandler';

export class ConnectedOverlayScrollHandler {
    element: any;

    listener: any;

    scrollableParents: any;

    /**
     * Optional zone. When given, the scroll listeners are registered outside of Angular so a scroll does not trigger
     * change detection; the listener must then write a signal or call `markForCheck` when something visible changes.
     */
    zone: NgZone | null | undefined;

    constructor(element: any, listener: any = () => {}, zone?: NgZone | null) {
        this.element = element;
        this.listener = listener;
        this.zone = zone;
    }

    bindScrollListener() {
        if (this.scrollableParents) {
            this.unbindScrollListener();
        }

        const parents = DomHandler.getScrollableParents(this.element);
        this.scrollableParents = parents;

        const bind = () => {
            for (let i = 0; i < parents.length; i++) {
                parents[i].addEventListener('scroll', this.listener, { passive: true });
            }
        };

        this.zone ? this.zone.runOutsideAngular(bind) : bind();
    }

    unbindScrollListener() {
        if (this.scrollableParents) {
            for (let i = 0; i < this.scrollableParents.length; i++) {
                this.scrollableParents[i].removeEventListener('scroll', this.listener);
            }
        }
    }

    destroy() {
        this.unbindScrollListener();
        this.element = null;
        this.listener = null;
        this.scrollableParents = null;
        this.zone = null;
    }
}
