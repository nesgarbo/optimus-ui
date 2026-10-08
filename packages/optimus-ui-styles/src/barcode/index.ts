export const style = /*css*/ `
    .p-barcode {
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
        border-radius: dt('barcode.border.radius');
        line-height: 0;
    }

    .p-barcode-svg,
    .p-barcode-canvas {
        display: block;
        max-width: 100%;
        max-height: 100%;
    }

    .p-barcode-invalid {
        outline: 1px dashed dt('barcode.invalid.border.color');
        outline-offset: -1px;
    }
`;
