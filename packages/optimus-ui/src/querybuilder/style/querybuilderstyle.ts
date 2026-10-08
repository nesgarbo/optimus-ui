import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/querybuilder';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-querybuilder p-component',
        `p-querybuilder-${instance.displayMode()}`,
        {
            'p-querybuilder-disabled': instance.$disabled(),
            'p-querybuilder-readonly': instance.readonly(),
            'p-querybuilder-invalid': instance.$invalid()
        }
    ]
};

@Injectable()
export class QueryBuilderStyle extends BaseStyle {
    name = 'querybuilder';

    style = style;

    classes = classes;
}

/**
 *
 * QueryBuilder lets the user compose a tree of conditions, and reads it out as SQL, MongoDB or a predicate.
 *
 * [Live Demo](https://optimus.openng.org/querybuilder/)
 *
 * @module querybuilderstyle
 *
 */
export enum QueryBuilderClasses {
    /** Class name of the root element */
    root = 'p-querybuilder',
    /** Class name of a group */
    group = 'p-querybuilder-group',
    /** Class name of a group header */
    groupHeader = 'p-querybuilder-group-header',
    /** Class name of a group body */
    groupBody = 'p-querybuilder-group-body',
    /** Class name of a condition row */
    rule = 'p-querybuilder-rule',
    /** Class name of the value editor wrapper */
    value = 'p-querybuilder-value',
    /** Class name of a validation message */
    error = 'p-querybuilder-error'
}

export interface QueryBuilderStyle {
    /** Used to pass tokens of the component */
    name: string;
}
