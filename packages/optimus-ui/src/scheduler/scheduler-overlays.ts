import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject } from '@angular/core';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { SCHEDULER_CONTEXT_MENU_CONTEXT, SCHEDULER_EVENT_POPOVER_CONTEXT, SCHEDULER_MORE_POPOVER_CONTEXT, SCHEDULER_QUICK_INFO_CONTEXT } from './scheduler-context';
import { SCHEDULER_STATE } from './scheduler-state';

/**
 * The four overlays.
 *
 * Each one owns its anchor, its open/closed state and its dismissal, and provides a context so a
 * projected part can draw the contents without inputs — the ownership split the upstream docs
 * insist on: Scheduler owns the positioned root and the dismissal, the child owns the markup.
 *
 * Positioning is deliberately simple here: absolute placement next to the anchor. It is enough for
 * the month overflow and the event surfaces, and it keeps the overlays free of a dependency on the
 * library's overlay/portal machinery, which would drag the whole `p-popover` stack in.
 *
 * @module scheduler-overlays
 */

/**
 * Where an overlay panel goes, relative to the element it was opened from.
 *
 * Absolute offsets against the panel's own `offsetParent` and not `position: fixed`: the Scheduler's
 * scroll containers would leave a fixed panel behind while the grid moved under it. The inline
 * offset is measured from the START edge, so it is the left edge in LTR and the right one in RTL and
 * the same `inset-inline-start` works for both.
 *
 * `null` when there is no anchor, which leaves the panel wherever the part was placed — the fallback
 * the "+N more" list used before it had one.
 */
function anchorOffset(host: HTMLElement, anchor?: HTMLElement): { top: number; start: number } | null {
    if (!anchor?.isConnected) return null;

    const parent = (host.offsetParent as HTMLElement | null) ?? host.ownerDocument.body;
    const anchorBox = anchor.getBoundingClientRect();
    const parentBox = parent.getBoundingClientRect();
    const rtl = getComputedStyle(host).direction === 'rtl';

    return {
        top: anchorBox.bottom - parentBox.top + 4,
        start: rtl ? parentBox.right - anchorBox.right : anchorBox.left - parentBox.left
    };
}

/**
 * Overflow list of a dense cell, opened by the "+N more" link.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-more-popover',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-more-popover-panel" role="dialog" [attr.aria-label]="title()" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <div class="p-scheduler-more-popover-header">
                    <span>{{ title() }}</span>
                    <button type="button" class="p-scheduler-more-popover-close" [attr.aria-label]="state.labels().clear" (click)="context().close()">&times;</button>
                </div>
                <ng-content>
                    @for (event of context().events; track event.id) {
                        <button type="button" class="p-scheduler-more-popover-item" [attr.data-event-id]="event.id" (click)="pick($event, event)">
                            <span class="p-scheduler-event-title">{{ state.title(event) }}</span>
                        </button>
                    }
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-more-popover',
        'data-slot': 'scheduler-more-popover',
        '[attr.data-view]': 'state.view()',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_MORE_POPOVER_CONTEXT, useFactory: () => inject(SchedulerMorePopover).context }]
})
export class SchedulerMorePopover {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

    /** @internal Where the panel sits, relative to the surface it was opened from. */
    readonly offset = computed(() => anchorOffset(this.el.nativeElement, this.state.morePopover()?.anchor ?? undefined));

    /** The overflow context. */
    readonly context = computed(() => {
        const target = this.state.morePopover();
        return {
            date: target?.date,
            resource: target?.resource,
            events: target?.events ?? [],
            visible: target != null,
            close: () => this.state.morePopover.set(null)
        };
    });

    /** @internal */
    readonly title = computed(() => {
        const date = this.state.morePopover()?.date;
        return date ? date.toLocaleDateString(this.state.locale(), { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    });

    /** Selects an event from the list and closes the overlay. */
    pick(originalEvent: MouseEvent, event: SchedulerEvent): void {
        this.state.handleEventClick(originalEvent, event);
        this.state.morePopover.set(null);
    }
}

/**
 * Compact read-only summary of an event.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-quick-info',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-overlay-panel" role="dialog" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <ng-content>
                    <div class="p-scheduler-overlay-title">{{ title() }}</div>
                    <div class="p-scheduler-overlay-time">{{ timeText() }}</div>
                    <div class="p-scheduler-overlay-actions">
                        <button type="button" (click)="context().edit()">Edit</button>
                        <button type="button" (click)="context().remove()">Delete</button>
                    </div>
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-quick-info',
        'data-slot': 'scheduler-quick-info',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_QUICK_INFO_CONTEXT, useFactory: () => inject(SchedulerQuickInfo).context }]
})
export class SchedulerQuickInfo {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

    /** @internal Where the panel sits, relative to the surface it was opened from. */
    readonly offset = computed(() => anchorOffset(this.el.nativeElement, this.state.quickInfo()?.anchor ?? undefined));

    /** The quick info context. */
    readonly context = computed(() => {
        const target = this.state.quickInfo();
        return {
            event: target?.event,
            visible: target != null,
            close: () => this.state.quickInfo.set(null),
            edit: () => this.state.requestEdit(target?.event),
            remove: () => this.state.requestRemove(target?.event)
        };
    });

    /** @internal */
    readonly title = computed(() => {
        const event = this.state.quickInfo()?.event;
        return event ? this.state.title(event) : '';
    });

    /** @internal */
    readonly timeText = computed(() => {
        const event = this.state.quickInfo()?.event;
        return event ? this.state.eventTimeText(event) : '';
    });
}

/**
 * Fuller detail panel of an event.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-popover',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-overlay-panel" role="dialog" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <ng-content>
                    <div class="p-scheduler-overlay-title">{{ title() }}</div>
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-popover',
        'data-slot': 'scheduler-event-popover',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_EVENT_POPOVER_CONTEXT, useFactory: () => inject(SchedulerPopover).context }]
})
export class SchedulerPopover {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

    /** @internal Where the panel sits, relative to the surface it was opened from. */
    readonly offset = computed(() => anchorOffset(this.el.nativeElement, this.state.eventPopover()?.anchor ?? undefined));

    /** The popover context. */
    readonly context = computed(() => {
        const target = this.state.eventPopover();
        return {
            event: target?.event,
            visible: target != null,
            close: () => this.state.eventPopover.set(null),
            edit: () => this.state.requestEdit(target?.event),
            remove: () => this.state.requestRemove(target?.event)
        };
    });

    /** @internal */
    readonly title = computed(() => {
        const event = this.state.eventPopover()?.event;
        return event ? this.state.title(event) : '';
    });
}

/**
 * Actions for an event or a date.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-context-menu',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-overlay-panel" role="menu" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <ng-content>
                    <button type="button" role="menuitem" (click)="context().edit()">Edit</button>
                    <button type="button" role="menuitem" (click)="context().remove()">Delete</button>
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-context-menu',
        'data-slot': 'scheduler-context-menu',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_CONTEXT_MENU_CONTEXT, useFactory: () => inject(SchedulerContextMenu).context }]
})
export class SchedulerContextMenu {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

    /** @internal Where the panel sits, relative to the surface it was opened from. */
    readonly offset = computed(() => anchorOffset(this.el.nativeElement, this.state.contextMenu()?.anchor ?? undefined));

    /** The context menu context. */
    readonly context = computed(() => {
        const target = this.state.contextMenu();
        return {
            event: target?.event,
            visible: target != null,
            close: () => this.state.contextMenu.set(null),
            edit: () => this.state.requestEdit(target?.event),
            remove: () => this.state.requestRemove(target?.event)
        };
    });
}
