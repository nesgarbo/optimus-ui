import type { TemplateRef } from '@angular/core';
import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * How the children of a group are combined.
 * @group Types
 */
export type QueryBuilderCondition = 'and' | 'or';

/**
 * The value types a column can carry. They pick the default operator list and the editor.
 * @group Types
 */
export type QueryBuilderFieldType = 'string' | 'number' | 'boolean' | 'date' | 'datetime';

/**
 * The operator keys the builder understands. The keys match the ones Syncfusion's QueryBuilder uses.
 * @group Types
 */
export type QueryBuilderOperatorKey =
    'equal' | 'notequal' | 'greaterthan' | 'greaterthanorequal' | 'lessthan' | 'lessthanorequal' | 'startswith' | 'endswith' | 'contains' | 'notcontains' | 'between' | 'notbetween' | 'in' | 'notin' | 'isnull' | 'isnotnull' | 'isempty' | 'isnotempty';

/**
 * One operator offered by a column.
 * @group Types
 */
export interface QueryBuilderOperator {
    /** Operator key, one of {@link QueryBuilderOperatorKey}. */
    key: QueryBuilderOperatorKey | string;
    /** Text shown in the operator list. Falls back to the built-in English label. */
    value?: string;
}

/**
 * Validation the editor applies to a value.
 * @group Types
 */
export interface QueryBuilderValidation {
    /** The value must not be empty. */
    isRequired?: boolean;
    /** Smallest allowed number. */
    min?: number;
    /** Largest allowed number. */
    max?: number;
    /** Shortest allowed string. */
    minLength?: number;
    /** Longest allowed string. */
    maxLength?: number;
}

/**
 * A field the user can build a rule on. Mirrors Syncfusion's `ColumnsModel`.
 * @group Types
 */
export interface QueryBuilderColumn {
    /** Name of the field. Dotted paths reach into nested objects. */
    field: string;
    /** Text shown in the field list. Defaults to `field`. */
    label?: string;
    /** Value type. Defaults to `string`. */
    type?: QueryBuilderFieldType;
    /** Operators this column offers. Defaults to the list for `type`. */
    operators?: QueryBuilderOperator[];
    /** Fixed values: the editor becomes a select, or a multi-select for `in` and `notin`. */
    values?: { label: string; value: any }[];
    /** Date format hint passed to the date editor. */
    format?: string;
    /** Step of the number editor. */
    step?: number;
    /** Validation applied to the value. */
    validation?: QueryBuilderValidation;
    /** Groups columns under a heading in the field list. */
    category?: string;
    /** Custom value editor for this column. */
    template?: TemplateRef<any>;
}

/**
 * The rule tree. A leaf has `field`, `operator` and `value`; a group has `condition` and `rules`.
 * Mirrors Syncfusion's `RuleModel`.
 * @group Types
 */
export interface RuleModel {
    /** Combiner of the children. Groups only. */
    condition?: QueryBuilderCondition;
    /** Children. Groups only. */
    rules?: RuleModel[];
    /** Negates the whole group. Groups only. */
    not?: boolean;
    /** Field name. Leaves only. */
    field?: string;
    /** Display label of the field. Leaves only. */
    label?: string;
    /** Value type. Leaves only. */
    type?: QueryBuilderFieldType;
    /** Operator key. Leaves only. */
    operator?: QueryBuilderOperatorKey | string;
    /** Comparison value. An array for `in`, `notin`, `between` and `notbetween`. Leaves only. */
    value?: any;
}

/**
 * Where a node sits in the tree: the index at each level, root first. `[]` is the root.
 * @group Types
 */
export type QueryBuilderPath = number[];

/**
 * A SQL string plus its bound values.
 * @group Types
 */
export interface QueryBuilderParameterizedSql {
    sql: string;
    params: any[];
}

/**
 * Event of `ruleChange`.
 * @group Events
 */
export interface QueryBuilderChangeEvent {
    /** Rule tree before the change. */
    previousRule: RuleModel;
    /** Rule tree after the change. */
    rule: RuleModel;
    /** What changed. */
    type: 'insertRule' | 'insertGroup' | 'deleteRule' | 'deleteGroup' | 'field' | 'operator' | 'value' | 'condition' | 'not' | 'reset' | 'set';
    /** Position of the changed node. */
    path?: QueryBuilderPath;
}

/**
 * Event of `actionBegin`. Set `cancel` to stop the change.
 * @group Events
 */
export interface QueryBuilderActionEvent {
    type: QueryBuilderChangeEvent['type'];
    path?: QueryBuilderPath;
    /** Set to `true` to cancel the change. */
    cancel: boolean;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface QueryBuilderPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    group?: PassThroughOption<HTMLElement, any>;
    groupHeader?: PassThroughOption<HTMLElement, any>;
    rule?: PassThroughOption<HTMLElement, any>;
    error?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type QueryBuilderPassThrough<I = unknown> = PassThrough<I, QueryBuilderPassThroughOptions>;
