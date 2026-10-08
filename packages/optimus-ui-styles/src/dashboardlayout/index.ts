export const style = /*css*/ `
    .p-dashboardlayout {
        display: block;
        position: relative;
        width: 100%;
    }

    .p-dashboardlayout-grid {
        position: relative;
        width: 100%;
    }

    .p-dashboardlayout-panel {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
        background: dt('dashboardlayout.panel.background');
        color: dt('dashboardlayout.panel.color');
        border: 1px solid dt('dashboardlayout.panel.border.color');
        border-radius: dt('dashboardlayout.panel.border.radius');
        box-shadow: dt('dashboardlayout.panel.shadow');
        transition:
            transform 0.2s ease,
            width 0.2s ease,
            height 0.2s ease,
            box-shadow 0.2s ease;
        touch-action: manipulation;
    }

    .p-dashboardlayout-panel:focus-visible {
        outline: dt('dashboardlayout.focus.ring.width') solid dt('dashboardlayout.focus.ring.color');
        outline-offset: 2px;
    }

    .p-dashboardlayout-panel-draggable {
        cursor: grab;
        touch-action: none;
    }

    .p-dashboardlayout-panel-dragging {
        cursor: grabbing;
        transition: none;
        box-shadow: dt('dashboardlayout.panel.drag.shadow');
        user-select: none;
    }

    .p-dashboardlayout-panel-disabled {
        opacity: 0.7;
    }

    .p-dashboardlayout-header {
        flex: 0 0 auto;
        padding: dt('dashboardlayout.header.padding');
        background: dt('dashboardlayout.header.background');
        color: dt('dashboardlayout.header.color');
        font-weight: dt('dashboardlayout.header.font.weight');
        border-bottom: 1px solid dt('dashboardlayout.header.border.color');
        user-select: none;
    }

    .p-dashboardlayout-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: dt('dashboardlayout.content.padding');
        cursor: auto;
    }

    .p-dashboardlayout-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        box-sizing: border-box;
        background: dt('dashboardlayout.placeholder.background');
        border: 2px dashed dt('dashboardlayout.placeholder.border.color');
        border-radius: dt('dashboardlayout.placeholder.border.radius');
        transition:
            transform 0.15s ease,
            width 0.15s ease,
            height 0.15s ease;
        pointer-events: none;
    }

    .p-dashboardlayout-handle {
        position: absolute;
        z-index: 1;
        touch-action: none;
    }

    .p-dashboardlayout-handle-se {
        right: 0;
        bottom: 0;
        width: 1rem;
        height: 1rem;
        cursor: se-resize;
        background: linear-gradient(135deg, transparent 50%, dt('dashboardlayout.handle.color') 50%, dt('dashboardlayout.handle.color') 60%, transparent 60%, transparent 70%, dt('dashboardlayout.handle.color') 70%, dt('dashboardlayout.handle.color') 80%, transparent 80%);
    }

    .p-dashboardlayout-handle-sw {
        left: 0;
        bottom: 0;
        width: 1rem;
        height: 1rem;
        cursor: sw-resize;
    }

    .p-dashboardlayout-handle-ne {
        right: 0;
        top: 0;
        width: 1rem;
        height: 1rem;
        cursor: ne-resize;
    }

    .p-dashboardlayout-handle-nw {
        left: 0;
        top: 0;
        width: 1rem;
        height: 1rem;
        cursor: nw-resize;
    }

    .p-dashboardlayout-handle-e {
        right: 0;
        top: 1rem;
        bottom: 1rem;
        width: 0.5rem;
        cursor: e-resize;
    }

    .p-dashboardlayout-handle-w {
        left: 0;
        top: 1rem;
        bottom: 1rem;
        width: 0.5rem;
        cursor: w-resize;
    }

    .p-dashboardlayout-handle-s {
        left: 1rem;
        right: 1rem;
        bottom: 0;
        height: 0.5rem;
        cursor: s-resize;
    }

    .p-dashboardlayout-handle-n {
        left: 1rem;
        right: 1rem;
        top: 0;
        height: 0.5rem;
        cursor: n-resize;
    }

    .p-dashboardlayout-sr {
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
        .p-dashboardlayout-panel,
        .p-dashboardlayout-placeholder {
            transition: none;
        }
    }
`;
