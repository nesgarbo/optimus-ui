export const style = /*css*/ `
    .p-chart {
        display: block;
        position: relative;
        color: dt('charts.color');
        font-family: dt('charts.font.family');
    }

    .p-chart-container {
        position: relative;
        margin-inline: auto;
        isolation: isolate;
        user-select: none;
        width: 100%;
        height: 100%;
    }

    .p-chart-container:focus-visible {
        outline: dt('charts.focus.ring.width') dt('charts.focus.ring.style') dt('charts.focus.ring.color');
        outline-offset: dt('charts.focus.ring.offset');
    }

    .p-chart-surface {
        display: block;
        overflow: visible;
    }

    /*
     * Every mark reads its colour from a custom property rather than carrying a literal, so a
     * stylesheet can restyle a chart at any scope without the chart re-rendering. The Canvas
     * renderer has no DOM to resolve these against and goes through the theme object instead.
     */
    .p-chart-axis-line,
    .p-chart-axis-tick {
        stroke: dt('charts.axis.color');
    }

    .p-chart-tick-label {
        fill: dt('charts.tick.label.color');
    }

    .p-chart-axis-title {
        fill: dt('charts.axis.title.color');
    }

    .p-chart-grid-line {
        stroke: dt('charts.grid.color');
    }

    .p-chart-grid-line-minor {
        stroke: dt('charts.grid.minor.color');
    }

    .p-chart-band {
        fill: dt('charts.band.fill');
    }

    /*
     * Hover and dimming are class-driven so they cost no re-render: the frame that sets the class is
     * the frame the effect appears in. Dimming is opt-in -- the coefficient defaults to 1, which is
     * no fade -- because fading every other mark on each pointer move makes a dense chart flicker.
     */
    .p-chart-point-hover {
        filter: brightness(dt('charts.hover.brightness'));
    }

    .p-chart-point-inactive,
    .p-chart-series-inactive {
        opacity: dt('charts.dim.opacity');
    }

    .p-chart-marker,
    .p-chart-bar,
    .p-chart-area,
    .p-chart-line {
        transition: filter dt('charts.transition.duration'), opacity dt('charts.transition.duration');
    }

    /* The chrome that has to stay real DOM: it needs focus, text selection and hit targets. */
    .p-chart-overlays {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .p-chart-overlays > * {
        pointer-events: auto;
    }

    .p-chart-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
    }

    /*
     * Print takes the SVG at its vector resolution, which is the whole reason to prefer the SVG
     * renderer for anything that ends up on paper.
     */
    @media print {
        .p-chart-surface {
            print-color-adjust: exact;
        }
    }
`;
