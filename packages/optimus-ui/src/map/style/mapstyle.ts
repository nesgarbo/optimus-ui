import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/map';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-map p-component',
        {
            'p-map-loading': !instance.ready(),
            'p-map-failed': instance.failed()
        }
    ],
    container: 'p-map-container'
};

@Injectable()
export class MapStyle extends BaseStyle {
    name = 'map';

    style = style;

    classes = classes;
}

/**
 *
 * Map shows an interactive map with markers and layers, on top of MapLibre GL.
 *
 * [Live Demo](https://optimus.openng.org/map/)
 *
 * @module mapstyle
 *
 */
export enum MapClasses {
    /** Class name of the root element */
    root = 'p-map',
    /** Class name of the element MapLibre draws in */
    container = 'p-map-container'
}

export interface MapStyle {
    /** Used to pass tokens of the component */
    name: string;
}
