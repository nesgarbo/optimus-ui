export const style = /*css*/ `
    .p-cropper {
        position: relative;
        display: block;
        height: dt('cropper.height');
        min-height: 8rem;
        background: dt('cropper.background');
        border: 1px solid dt('cropper.border.color');
        border-radius: dt('cropper.border.radius');
        overflow: hidden;
        user-select: none;
    }

    .p-cropper-invalid {
        border-color: dt('cropper.invalid.border.color');
    }

    .p-cropper.p-disabled {
        opacity: dt('cropper.disabled.opacity');
        pointer-events: none;
    }

    .p-cropper-stage {
        position: absolute;
        inset: 0;
    }

    .p-cropper-stage cropper-canvas {
        width: 100%;
        height: 100%;
    }
`;
