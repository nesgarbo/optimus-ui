export const style = /*css*/ `
    .p-querybuilder {
        display: flex;
        flex-direction: column;
        gap: dt('querybuilder.gap');
        background: dt('querybuilder.background');
        color: dt('querybuilder.color');
        container-type: inline-size;
        container-name: querybuilder;
    }

    .p-querybuilder-disabled {
        pointer-events: none;
        opacity: 0.6;
    }

    .p-querybuilder-group {
        display: flex;
        flex-direction: column;
        gap: dt('querybuilder.group.gap');
        padding: dt('querybuilder.group.padding');
        background: dt('querybuilder.group.background');
        border: 1px solid dt('querybuilder.group.border.color');
        border-radius: dt('querybuilder.group.border.radius');
    }

    /* The root group is the surface itself: it needs no frame of its own. */
    .p-querybuilder > .p-querybuilder-group {
        border: 0;
        padding: 0;
        background: transparent;
    }

    .p-querybuilder-group-not {
        border-style: dashed;
    }

    .p-querybuilder-group-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: dt('querybuilder.header.gap');
    }

    .p-querybuilder-spacer {
        flex: 1 1 auto;
    }

    .p-querybuilder-group-body {
        display: flex;
        flex-direction: column;
        gap: dt('querybuilder.group.gap');
    }

    .p-querybuilder-rule {
        display: block;
        padding: dt('querybuilder.rule.padding');
    }

    .p-querybuilder-rule-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: dt('querybuilder.rule.gap');
    }

    .p-querybuilder-field,
    .p-querybuilder-operator {
        flex: 0 1 12rem;
        min-width: 8rem;
    }

    .p-querybuilder-value {
        display: flex;
        flex: 1 1 14rem;
        align-items: center;
        gap: dt('querybuilder.rule.gap');
        min-width: 8rem;
    }

    .p-querybuilder-editor {
        flex: 1 1 0;
        min-width: 0;
    }

    .p-querybuilder-editor.p-inputtext,
    .p-querybuilder-editor .p-inputtext {
        width: 100%;
    }

    .p-querybuilder-vertical .p-querybuilder-rule-row {
        flex-direction: column;
        align-items: stretch;
    }

    .p-querybuilder-vertical .p-querybuilder-field,
    .p-querybuilder-vertical .p-querybuilder-operator,
    .p-querybuilder-vertical .p-querybuilder-value {
        flex: 1 1 auto;
    }

    .p-querybuilder-vertical .p-querybuilder-value {
        flex-direction: column;
        align-items: stretch;
    }

    .p-querybuilder-error {
        display: block;
        margin-top: 0.25rem;
        color: dt('querybuilder.error.color');
        font-size: dt('querybuilder.error.font.size');
    }

    .p-querybuilder-rule-invalid .p-select,
    .p-querybuilder-rule-invalid .p-inputtext,
    .p-querybuilder-rule-invalid .p-inputnumber-input {
        border-color: dt('querybuilder.error.color');
    }

    .p-querybuilder-empty {
        padding: dt('querybuilder.empty.padding');
        color: dt('querybuilder.empty.color');
        font-style: italic;
    }

    .p-querybuilder-boolean-label {
        color: dt('querybuilder.empty.color');
    }

    /* Narrow containers stack the parts, whatever the viewport says. */
    @container querybuilder (max-width: 32rem) {
        .p-querybuilder-rule-row {
            flex-direction: column;
            align-items: stretch;
        }

        .p-querybuilder-field,
        .p-querybuilder-operator,
        .p-querybuilder-value {
            flex: 1 1 auto;
        }
    }
`;
