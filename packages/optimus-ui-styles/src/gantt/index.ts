export const style = /*css*/ `
    .p-gantt {
        display: block;
        position: relative;
        background: dt('gantt.background');
        color: dt('gantt.color');
        border: 1px solid dt('gantt.border.color');
        border-radius: dt('gantt.border.radius');
        overflow: hidden;
        font-size: 0.875rem;
    }

    .p-gantt-scroll {
        position: relative;
        overflow: auto;
        overscroll-behavior: contain;
    }

    .p-gantt-inner {
        position: relative;
        min-width: 100%;
    }

    /* The header stays at the top and the grid at the left while the rest scrolls: one scroll box keeps rows and bars level. */
    .p-gantt-head {
        position: sticky;
        top: 0;
        z-index: 6;
        display: flex;
        background: dt('gantt.header.background');
        color: dt('gantt.header.color');
        border-bottom: 1px solid dt('gantt.header.border.color');
        box-sizing: border-box;
    }

    .p-gantt-grid-head {
        position: sticky;
        left: 0;
        z-index: 2;
        display: flex;
        flex: none;
        background: dt('gantt.header.background');
        box-sizing: border-box;
    }

    .p-gantt-head-cell {
        flex: none;
        box-sizing: border-box;
        padding: dt('gantt.cell.padding');
        display: flex;
        align-items: center;
        font-weight: dt('gantt.header.font.weight');
        border-right: 1px solid dt('gantt.header.border.color');
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .p-gantt-splitter-head {
        position: sticky;
        z-index: 2;
        flex: none;
        background: dt('gantt.splitter.background');
    }

    .p-gantt-chart-head {
        position: relative;
        flex: none;
        overflow: hidden;
    }

    .p-gantt-tier {
        position: relative;
        border-bottom: 1px solid dt('gantt.header.border.color');
        box-sizing: border-box;
    }

    .p-gantt-tier:last-child {
        border-bottom: 0;
    }

    .p-gantt-tier-cell {
        position: absolute;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 0 0.25rem;
        border-left: 1px solid dt('gantt.header.border.color');
        font-size: 0.75rem;
        white-space: nowrap;
        overflow: hidden;
    }

    .p-gantt-tier-cell-off {
        opacity: 0.55;
    }

    .p-gantt-body {
        position: relative;
        display: flex;
    }

    .p-gantt-grid {
        position: sticky;
        left: 0;
        z-index: 4;
        flex: none;
        background: dt('gantt.background');
        box-sizing: border-box;
        overflow: hidden;
    }

    .p-gantt-row {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        border-bottom: 1px solid dt('gantt.row.border.color');
        cursor: pointer;
        outline: none;
    }

    .p-gantt-row:hover {
        background: dt('gantt.row.hover.background');
    }

    .p-gantt-row-selected,
    .p-gantt-row-selected:hover {
        background: dt('gantt.row.selected.background');
        color: dt('gantt.row.selected.color');
    }

    .p-gantt-row:focus-visible {
        outline: dt('gantt.focus.ring.width') solid dt('gantt.focus.ring.color');
        outline-offset: -2px;
    }

    .p-gantt-row-parent {
        font-weight: 600;
    }

    .p-gantt-cell {
        display: flex;
        flex: none;
        align-items: center;
        box-sizing: border-box;
        padding: dt('gantt.cell.padding');
        overflow: hidden;
        white-space: nowrap;
    }

    .p-gantt-cell-text {
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1 1 auto;
        min-width: 0;
    }

    .p-gantt-indent {
        flex: none;
    }

    .p-gantt-toggle,
    .p-gantt-toggle-gap {
        flex: none;
        width: 1.25rem;
        height: 1.25rem;
    }

    .p-gantt-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        border-radius: 0.25rem;
    }

    .p-gantt-chevron {
        width: 0.4rem;
        height: 0.4rem;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(-45deg);
        transition: transform 0.15s ease;
    }

    .p-gantt-chevron-open {
        transform: rotate(45deg) translate(-1px, -1px);
    }

    .p-gantt-splitter {
        position: sticky;
        z-index: 4;
        flex: none;
        width: 6px;
        background: dt('gantt.splitter.background');
        cursor: col-resize;
        touch-action: none;
        outline: none;
    }

    .p-gantt-splitter:hover,
    .p-gantt-splitter:focus-visible {
        background: dt('gantt.splitter.hover.background');
    }

    .p-gantt-chart {
        position: relative;
        flex: none;
        overflow: hidden;
        background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--p-gantt-row-height, 36px) - 1px), dt('gantt.row.border.color') calc(var(--p-gantt-row-height, 36px) - 1px), dt('gantt.row.border.color') var(--p-gantt-row-height, 36px));
    }

    .p-gantt-shade {
        position: absolute;
        top: 0;
        bottom: 0;
        background: dt('gantt.chart.shade.background');
        pointer-events: none;
    }

    .p-gantt-line {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: dt('gantt.chart.line.color');
        opacity: 0.6;
        pointer-events: none;
    }

    .p-gantt-today {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        margin-left: -1px;
        background: dt('gantt.chart.today.color');
        opacity: 0.8;
        pointer-events: none;
        z-index: 1;
    }

    .p-gantt-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 0;
        border-left: 2px dashed dt('gantt.chart.marker.color');
        pointer-events: none;
        z-index: 1;
    }

    .p-gantt-marker span {
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 0.7rem;
        white-space: nowrap;
        color: dt('gantt.chart.marker.color');
    }

    .p-gantt-links {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
        overflow: visible;
    }

    .p-gantt-link {
        stroke: dt('gantt.link.color');
        stroke-width: 1.25;
        stroke-linejoin: round;
    }

    .p-gantt-link-critical {
        stroke: dt('gantt.link.critical.color');
        stroke-width: 1.75;
    }

    .p-gantt-arrow {
        fill: context-stroke;
    }

    .p-gantt-taskbar {
        position: absolute;
        z-index: 2;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background: dt('gantt.taskbar.background');
        border-radius: dt('gantt.taskbar.border.radius');
        user-select: none;
        touch-action: pan-y;
    }

    .p-gantt-editable .p-gantt-taskbar:not(.p-gantt-taskbar-parent):not(.p-gantt-taskbar-milestone) {
        cursor: grab;
        touch-action: none;
    }

    .p-gantt-progress {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        background: dt('gantt.taskbar.progress.background');
        border-radius: dt('gantt.taskbar.border.radius');
        pointer-events: none;
    }

    .p-gantt-taskbar-text {
        position: relative;
        padding: 0 0.4rem;
        font-size: 0.75rem;
        color: dt('gantt.taskbar.label.color');
        white-space: nowrap;
        overflow: hidden;
        pointer-events: none;
    }

    .p-gantt-taskbar-parent {
        background: dt('gantt.taskbar.parent.background');
        border-radius: 2px;
    }

    .p-gantt-taskbar-parent .p-gantt-progress {
        background: color-mix(in srgb, #000 35%, dt('gantt.taskbar.parent.background'));
        border-radius: 2px;
    }

    /* The diamond is a turned square inside the box, so that the label beside it is not turned with it. */
    .p-gantt-taskbar-milestone {
        background: transparent;
    }

    .p-gantt-taskbar-milestone::before {
        content: '';
        position: absolute;
        inset: 18%;
        background: dt('gantt.taskbar.milestone.background');
        border-radius: 2px;
        transform: rotate(45deg);
    }

    .p-gantt-taskbar-milestone.p-gantt-taskbar-critical::before {
        background: dt('gantt.taskbar.critical.progress.background');
    }

    .p-gantt-taskbar-critical {
        background: dt('gantt.taskbar.critical.background');
    }

    .p-gantt-taskbar-critical .p-gantt-progress {
        background: dt('gantt.taskbar.critical.progress.background');
    }

    .p-gantt-taskbar-selected {
        outline: 2px solid dt('gantt.row.selected.color');
        outline-offset: 1px;
    }

    .p-gantt-taskbar-dragging {
        z-index: 3;
        cursor: grabbing;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }

    .p-gantt-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 7px;
        cursor: ew-resize;
        opacity: 0;
    }

    .p-gantt-handle-start {
        left: 0;
    }

    .p-gantt-handle-end {
        right: 0;
    }

    .p-gantt-progress-knob {
        position: absolute;
        bottom: -4px;
        width: 8px;
        height: 8px;
        margin-left: -4px;
        background: dt('gantt.taskbar.progress.background');
        border: 1px solid dt('gantt.background');
        transform: rotate(45deg);
        cursor: ew-resize;
        opacity: 0;
    }

    .p-gantt-taskbar:hover .p-gantt-progress-knob,
    .p-gantt-taskbar-dragging .p-gantt-progress-knob {
        opacity: 1;
    }

    .p-gantt-label {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.75rem;
        white-space: nowrap;
        pointer-events: none;
    }

    .p-gantt-label-left {
        right: 100%;
        margin-right: 6px;
    }

    .p-gantt-label-right {
        left: 100%;
        margin-left: 6px;
    }

    .p-gantt-editor {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        height: calc(100% - 8px);
        margin: 0;
        padding: 0 0.35rem;
        font: inherit;
        color: inherit;
        background: dt('gantt.background');
        border: 1px solid dt('gantt.splitter.hover.background');
        border-radius: 0.25rem;
        outline: none;
    }

    .p-gantt-editor[aria-invalid='true'] {
        border-color: dt('gantt.link.critical.color');
    }

    .p-gantt-baseline {
        position: absolute;
        z-index: 1;
        height: 4px;
        border-radius: 2px;
        background: dt('gantt.taskbar.baseline.background');
        pointer-events: none;
    }

    .p-gantt-taskbar-overallocated {
        outline: 2px dashed dt('gantt.link.critical.color');
        outline-offset: 1px;
    }

    .p-gantt-dialog {
        width: min(34rem, 92vw);
        padding: 0;
        color: dt('gantt.color');
        background: dt('gantt.background');
        border: 1px solid dt('gantt.border.color');
        border-radius: dt('gantt.border.radius');
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }

    .p-gantt-dialog::backdrop {
        background: rgba(0, 0, 0, 0.4);
    }

    .p-gantt-form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem 1.25rem 1.25rem;
    }

    .p-gantt-form-title {
        margin: 0;
        font-size: 1.1rem;
    }

    .p-gantt-form label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.8rem;
        color: dt('gantt.header.color');
    }

    .p-gantt-form input:not([type='checkbox']),
    .p-gantt-form textarea {
        box-sizing: border-box;
        padding: 0.4rem 0.55rem;
        font: inherit;
        font-size: 0.9rem;
        color: dt('gantt.color');
        background: dt('gantt.background');
        border: 1px solid dt('gantt.border.color');
        border-radius: 0.375rem;
    }

    .p-gantt-form input:disabled {
        opacity: 0.55;
    }

    .p-gantt-form-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
    }

    .p-gantt-form-resources {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem 1rem;
        margin: 0;
        padding: 0.5rem 0.75rem;
        border: 1px solid dt('gantt.border.color');
        border-radius: 0.375rem;
    }

    .p-gantt-form .p-gantt-check {
        flex-direction: row;
        align-items: center;
        gap: 0.4rem;
        color: dt('gantt.color');
    }

    .p-gantt-form-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.25rem;
    }

    .p-gantt-spacer {
        flex: 1 1 auto;
    }

    .p-gantt-btn {
        padding: 0.45rem 0.9rem;
        font: inherit;
        font-size: 0.875rem;
        color: dt('gantt.color');
        background: transparent;
        border: 1px solid dt('gantt.border.color');
        border-radius: 0.375rem;
        cursor: pointer;
    }

    .p-gantt-btn-primary {
        color: dt('gantt.taskbar.label.color');
        background: dt('gantt.taskbar.progress.background');
        border-color: transparent;
    }

    .p-gantt-btn-danger {
        color: dt('gantt.link.critical.color');
        border-color: dt('gantt.link.critical.color');
    }

    @media (max-width: 30rem) {
        .p-gantt-form-row {
            grid-template-columns: 1fr;
        }
    }

    .p-gantt-sr {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
        .p-gantt-chevron {
            transition: none;
        }
    }
`;
