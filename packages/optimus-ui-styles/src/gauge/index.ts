export const style = /*css*/ `
    .p-gauge {
        display: block;
        color: dt('gauge.color');
        font-family: dt('gauge.font.family');
    }

    .p-gauge-title {
        color: dt('gauge.title.color');
        font-size: dt('gauge.title.font.size');
        font-weight: dt('gauge.title.font.weight');
        padding: dt('gauge.title.padding');
        text-align: center;
    }

    .p-gauge-svg {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
        user-select: none;
    }

    .p-gauge-svg:focus {
        outline: none;
    }

    .p-gauge-interactive .p-gauge-svg:focus-visible {
        outline: dt('gauge.pointer.focus.ring.width') solid dt('gauge.pointer.focus.ring.color');
        outline-offset: 4px;
        border-radius: 0.5rem;
    }

    .p-gauge-line {
        stroke: dt('gauge.line.color');
        stroke-linecap: round;
    }

    .p-gauge-tick {
        stroke: dt('gauge.tick.color');
    }

    .p-gauge-label {
        fill: dt('gauge.label.color');
    }

    .p-gauge-range {
        fill: dt('gauge.range.color');
    }

    .p-gauge-pointer path {
        fill: dt('gauge.pointer.color');
        stroke: dt('gauge.pointer.color');
    }

    .p-gauge-pointer circle {
        fill: dt('gauge.pointer.color');
    }

    .p-gauge-pointer-rangeBar path {
        stroke: none;
    }

    .p-gauge-interactive .p-gauge-pointer {
        cursor: grab;
        touch-action: none;
    }

    .p-gauge-container {
        fill: dt('gauge.container.background');
        stroke: dt('gauge.container.border.color');
        stroke-width: 1;
    }

    .p-gauge-annotation {
        fill: dt('gauge.annotation.color');
        font-size: dt('gauge.annotation.font.size');
        font-weight: dt('gauge.annotation.font.weight');
    }

    .p-gauge-annotation-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: dt('gauge.annotation.color');
        font-size: 14px;
    }
`;
