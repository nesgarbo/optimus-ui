import type { TemplateRef } from '@angular/core';
import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * Font of a gauge label or title.
 * @group Types
 */
export interface GaugeFont {
    /** Size in pixels of the 200-unit gauge. Defaults to 10. */
    size?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string | number;
}

/**
 * A line: the axis, an outline.
 * @group Types
 */
export interface GaugeLine {
    width?: number;
    color?: string;
}

/**
 * Major or minor ticks of an axis.
 * @group Types
 */
export interface GaugeTicks {
    /** Value distance between ticks. Defaults to a round step, and to none for minor ticks. */
    interval?: number;
    width?: number;
    height?: number;
    color?: string;
    /** Distance from the axis line, outward positive. */
    offset?: number;
    /** Colors the tick with the range it falls in. */
    useRangeColor?: boolean;
}

/**
 * The labels of an axis.
 * @group Types
 */
export interface GaugeLabels {
    /** Draws the labels inside or outside the ticks. */
    position?: 'inside' | 'outside';
    font?: GaugeFont;
    /** Distance from the ticks. */
    offset?: number;
    /** Hides the labels. */
    hidden?: boolean;
    /** Colors the label with the range it falls in. */
    useRangeColor?: boolean;
    /** A pattern with `{value}`, for example `{value}°C`, or a function. */
    format?: string | ((value: number) => string);
}

/**
 * The shape of a marker pointer.
 * @group Types
 */
export type GaugeMarkerShape = 'circle' | 'rectangle' | 'triangle' | 'diamond' | 'invertedTriangle';

/**
 * Animation of a pointer.
 * @group Types
 */
export interface GaugeAnimation {
    enable?: boolean;
    /** Milliseconds. */
    duration?: number;
}

/**
 * A colored band on the axis. Mirrors Syncfusion's gauge `Range`.
 * @group Types
 */
export interface GaugeRange {
    start: number;
    end: number;
    color?: string;
    /** Width where the band begins, so that a band can taper. */
    startWidth?: number;
    /** Width where the band ends. */
    endWidth?: number;
    /** Radius as a percentage of the axis radius, for example `'90%'`. */
    radius?: string | number;
    /** Rounds the ends of the band. */
    roundedCornerRadius?: number;
    /** Text for the legend and the accessible description. */
    legendText?: string;
}

/**
 * The cap at the center of a needle.
 * @group Types
 */
export interface GaugeCap {
    radius?: number;
    color?: string;
    border?: GaugeLine;
}

/**
 * The tail of a needle behind the center.
 * @group Types
 */
export interface GaugeNeedleTail {
    /** In pixels, or a percentage of the needle. */
    length?: string | number;
    color?: string;
}

/**
 * A pointer of a circular axis. Mirrors Syncfusion's `Pointer`.
 * @group Types
 */
export interface CircularPointer {
    value: number;
    type?: 'needle' | 'marker' | 'rangeBar';
    color?: string;
    /** Width of the needle, the marker or the bar. */
    pointerWidth?: number;
    /** Length of the needle or position of the marker, as a percentage of the axis radius or pixels. */
    radius?: string | number;
    cap?: GaugeCap;
    needleTail?: GaugeNeedleTail;
    markerShape?: GaugeMarkerShape;
    markerWidth?: number;
    markerHeight?: number;
    /** Distance from the axis, outward positive, for a marker. */
    offset?: number;
    roundedCornerRadius?: number;
    animation?: GaugeAnimation;
    /** Accessible name. */
    description?: string;
}

/**
 * Something drawn at a position of a circular gauge.
 * @group Types
 */
export interface CircularAnnotation {
    /** Text, or a template. */
    content: string | TemplateRef<any>;
    /** Degrees clockwise from the top. */
    angle?: number;
    /** Distance from the center, a percentage of the axis radius or pixels. Defaults to 0: the center. */
    radius?: string | number;
    zIndex?: number;
}

/**
 * An axis of a circular gauge. Mirrors Syncfusion's `Axis`.
 * @group Types
 */
export interface CircularAxis {
    minimum?: number;
    maximum?: number;
    /** Degrees clockwise from the top, where the axis begins. */
    startAngle?: number;
    /** Degrees clockwise from the top, where the axis ends. Equal to `startAngle`, it is a full circle. */
    endAngle?: number;
    /** Percentage of the gauge radius, for example `'80%'`. */
    radius?: string | number;
    direction?: 'clockwise' | 'antiClockwise';
    lineStyle?: GaugeLine;
    majorTicks?: GaugeTicks;
    minorTicks?: GaugeTicks;
    labelStyle?: GaugeLabels;
    ranges?: GaugeRange[];
    pointers?: CircularPointer[];
    annotations?: CircularAnnotation[];
}

/**
 * Event of `pointerChange`, fired as a pointer is dragged or set.
 * @group Events
 */
export interface GaugePointerEvent {
    axisIndex: number;
    pointerIndex: number;
    value: number;
    /** `true` while a drag is still going. */
    dragging: boolean;
}

/**
 * The container of a linear gauge.
 * @group Types
 */
export interface LinearContainer {
    type?: 'normal' | 'thermometer' | 'roundedRectangle';
    /** Thickness in pixels of the 200-unit gauge. */
    width?: number;
    backgroundColor?: string;
    border?: GaugeLine;
    /** Offset from the axis. */
    offset?: number;
}

/**
 * A band of a linear axis.
 * @group Types
 */
export interface LinearRange extends Omit<GaugeRange, 'radius'> {
    /** Where the band sits against the axis line. */
    position?: 'inside' | 'outside' | 'cross';
}

/**
 * A pointer of a linear axis.
 * @group Types
 */
export interface LinearPointer {
    value: number;
    type?: 'bar' | 'marker';
    color?: string;
    /** Thickness of the bar, or the long side of the marker. */
    width?: number;
    /** Short side of the marker. */
    height?: number;
    markerShape?: GaugeMarkerShape;
    /** Where it sits against the axis line. */
    placement?: 'near' | 'center' | 'far';
    offset?: number;
    roundedCornerRadius?: number;
    animation?: GaugeAnimation;
    description?: string;
}

/**
 * An axis of a linear gauge.
 * @group Types
 */
export interface LinearAxis {
    minimum?: number;
    maximum?: number;
    lineStyle?: GaugeLine;
    majorTicks?: GaugeTicks;
    minorTicks?: GaugeTicks;
    labelStyle?: GaugeLabels;
    ranges?: LinearRange[];
    pointers?: LinearPointer[];
    /** Puts the axis on the other side of the container. */
    opposedPosition?: boolean;
    /** Reverses the direction of the values. */
    isInversed?: boolean;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface GaugePassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    svg?: PassThroughOption<SVGElement, any>;
}

/**
 * @group Interface
 */
export type GaugePassThrough<I = unknown> = PassThrough<I, GaugePassThroughOptions>;
