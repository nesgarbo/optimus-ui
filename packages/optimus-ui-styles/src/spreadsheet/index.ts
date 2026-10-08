export const style = /*css*/ `
    .p-spreadsheet {
        position: relative;
        display: block;
        height: dt('spreadsheet.height');
        min-height: 12rem;
        background: dt('spreadsheet.background');
        border: 1px solid dt('spreadsheet.border.color');
        border-radius: dt('spreadsheet.border.radius');
        overflow: hidden;
    }

    .p-spreadsheet-container {
        position: absolute;
        inset: 0;
    }

    .p-spreadsheet-invalid {
        border-color: dt('spreadsheet.invalid.border.color');
    }

    .p-spreadsheet.p-disabled {
        opacity: dt('spreadsheet.disabled.opacity');
        pointer-events: none;
    }
`;
