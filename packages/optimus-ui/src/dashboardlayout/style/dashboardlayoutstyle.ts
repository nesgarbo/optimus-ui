import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/dashboardlayout';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => ['p-dashboardlayout p-component', { 'p-dashboardlayout-narrow': instance.narrow(), 'p-dashboardlayout-busy': instance.busy() }],
    grid: 'p-dashboardlayout-grid',
    panel: ({ instance, panel }) => [
        'p-dashboardlayout-panel',
        panel.cssClass,
        {
            'p-dashboardlayout-panel-draggable': instance.canDrag(panel),
            'p-dashboardlayout-panel-dragging': instance.isActive(panel.id),
            'p-dashboardlayout-panel-disabled': panel.enabled === false
        }
    ],
    header: 'p-dashboardlayout-header',
    content: 'p-dashboardlayout-content',
    placeholder: 'p-dashboardlayout-placeholder',
    handle: ({ handle }) => ['p-dashboardlayout-handle', `p-dashboardlayout-handle-${handle}`]
};

@Injectable()
export class DashboardLayoutStyle extends BaseStyle {
    name = 'dashboardlayout';

    style = style;

    classes = classes;
}

/**
 *
 * DashboardLayout arranges panels on a grid that the user can rearrange and resize.
 *
 * [Live Demo](https://optimus.openng.org/dashboardlayout/)
 *
 * @module dashboardlayoutstyle
 *
 */
export enum DashboardLayoutClasses {
    /** Class name of the root element */
    root = 'p-dashboardlayout',
    /** Class name of the grid */
    grid = 'p-dashboardlayout-grid',
    /** Class name of a panel */
    panel = 'p-dashboardlayout-panel',
    /** Class name of a panel header */
    header = 'p-dashboardlayout-header',
    /** Class name of a panel body */
    content = 'p-dashboardlayout-content',
    /** Class name of the drop placeholder */
    placeholder = 'p-dashboardlayout-placeholder',
    /** Class name of a resize handle */
    handle = 'p-dashboardlayout-handle'
}

export interface DashboardLayoutStyle {
    /** Used to pass tokens of the component */
    name: string;
}
