import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            The root carries <i>aria-busy</i> while the <i>loading</i> input is set. The range title is an <i>aria-live="polite"</i> region, so navigating announces the new range without moving focus. View buttons expose their state through
            <i>aria-pressed</i>, and the overflow popover is a <i>dialog</i> labelled with the day it belongs to.
        </p>
        <p>
            Events and cells are rendered as buttons when the view is interactive, so they are reachable and announced as actionable. Definition children own their own markup: keep any interactive element inside the supplied semantic component so it
            stays connected to the right surface.
        </p>
        <p>
            The event popover opens on focus as well as on hover, so the detail it carries is not mouse-only. The context menu is bound to the browser's own contextmenu event, which fires from the keyboard menu key too, and the native menu is only
            suppressed when the Scheduler actually has one to show.
        </p>
        <h3>Keyboard Support</h3>
        <p>Header controls, view buttons, event surfaces, cells and the overflow list are all native buttons and follow the standard tab order.</p>
        <p>
            Moving and resizing are POINTER-ONLY today: there is no keyboard equivalent and no grid-style arrow navigation between cells. If editing has to be reachable without a pointer, give the same operation a form — the quick info's edit action,
            or your own dialog — and treat the drag as the shortcut it is. An interface where the only way to reschedule is to drag is an interface some users cannot reschedule in.
        </p>
        <h3>Direction</h3>
        <p>
            <i>rtl</i> sets <i>dir</i> on the root, so assistive technology and the layout agree on the reading order. The stylesheet is written with logical properties, which is what keeps the columns, the gutter and the event bars flipping together
            instead of one at a time.
        </p>
        <h3>Reduced Motion</h3>
        <p>The stylesheet disables its transitions under <i>prefers-reduced-motion</i>.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
