export const style = /*css*/ `
    .p-signature {
        position: relative;
        display: block;
        height: dt('signature.height');
        min-height: 4rem;
        background: dt('signature.background');
        color: dt('signature.color');
        border: 1px solid dt('signature.border.color');
        border-radius: dt('signature.border.radius');
        overflow: hidden;
        touch-action: none;
    }

    .p-signature:has(.p-signature-canvas:focus-visible) {
        border-color: dt('signature.focus.border.color');
    }

    .p-signature-invalid {
        border-color: dt('signature.invalid.border.color');
    }

    .p-signature.p-disabled {
        opacity: dt('signature.disabled.opacity');
        pointer-events: none;
    }

    .p-signature-canvas {
        display: block;
        width: 100%;
        height: 100%;
        cursor: crosshair;
        touch-action: none;
        user-select: none;
        outline: none;
    }

    .p-signature-readonly .p-signature-canvas {
        cursor: default;
    }
`;
