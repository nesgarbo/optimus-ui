import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/gauge';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => ['p-gauge p-component', `p-gauge-${instance.kind}`, { 'p-gauge-interactive': instance.interactive() }],
    title: 'p-gauge-title',
    svg: 'p-gauge-svg',
    line: 'p-gauge-line',
    tick: 'p-gauge-tick',
    label: 'p-gauge-label',
    range: 'p-gauge-range',
    pointer: 'p-gauge-pointer'
};

@Injectable()
export class GaugeStyle extends BaseStyle {
    name = 'gauge';

    style = style;

    classes = classes;
}

/**
 *
 * CircularGauge and LinearGauge show a value, or several, on a dial or a scale.
 *
 * [Live Demo](https://optimus.openng.org/gauges/)
 *
 * @module gaugestyle
 *
 */
export enum GaugeClasses {
    /** Class name of the root element */
    root = 'p-gauge',
    /** Class name of the title */
    title = 'p-gauge-title',
    /** Class name of the SVG */
    svg = 'p-gauge-svg',
    /** Class name of an axis line */
    line = 'p-gauge-line',
    /** Class name of a tick */
    tick = 'p-gauge-tick',
    /** Class name of a label */
    label = 'p-gauge-label',
    /** Class name of a range */
    range = 'p-gauge-range',
    /** Class name of a pointer */
    pointer = 'p-gauge-pointer'
}

export interface GaugeStyle {
    /** Used to pass tokens of the component */
    name: string;
}
