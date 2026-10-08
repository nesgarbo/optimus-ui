import { InjectionToken, Signal, TemplateRef } from '@angular/core';
import type { QueryBuilderColumn, QueryBuilderOperator, QueryBuilderPath, RuleModel } from '@openng/optimus-ui/types/querybuilder';

/**
 * What a part of the builder (a group, a rule row) may read from the root and call on it.
 *
 * The parts never see the root class. They see this contract, so a replacement part can only do
 * what the root already does, and the root can be refactored without touching them.
 *
 * @module querybuilder-context
 */

/** The text of the builder. Every entry can be replaced through the `messages` input. */
export interface QueryBuilderMessages {
    and: string;
    or: string;
    not: string;
    addRule: string;
    addGroup: string;
    deleteRule: string;
    deleteGroup: string;
    field: string;
    operator: string;
    value: string;
    from: string;
    to: string;
    emptyGroup: string;
    selectField: string;
    selectOperator: string;
    typeValue: string;
    yes: string;
    no: string;
    /** Error text by reason: `field`, `operator`, `required`, `range`, `list`, `number`, `min`, `max`, `minLength`, `maxLength`. */
    errors: Record<string, string>;
}

/** The default English text. */
export const QUERYBUILDER_MESSAGES: QueryBuilderMessages = {
    and: 'AND',
    or: 'OR',
    not: 'NOT',
    addRule: 'Add condition',
    addGroup: 'Add group',
    deleteRule: 'Delete condition',
    deleteGroup: 'Delete group',
    field: 'Field',
    operator: 'Operator',
    value: 'Value',
    from: 'From',
    to: 'To',
    emptyGroup: 'No conditions yet',
    selectField: 'Select a field',
    selectOperator: 'Select an operator',
    typeValue: 'Type a value',
    yes: 'Yes',
    no: 'No',
    errors: {
        field: 'Pick a field.',
        operator: 'Pick an operator.',
        required: 'Enter a value.',
        range: 'Enter both ends of the range.',
        list: 'Enter at least one value.',
        number: 'Enter a number.',
        min: 'The value is too small.',
        max: 'The value is too large.',
        minLength: 'The value is too short.',
        maxLength: 'The value is too long.'
    }
};

/** One entry of the field list. */
export interface QueryBuilderFieldOption {
    label: string;
    value: string;
}

/** A group of entries of the field list. */
export interface QueryBuilderFieldGroup {
    label: string;
    items: QueryBuilderFieldOption[];
}

/** Context handed to a custom value template. */
export interface QueryBuilderValueContext {
    /** The leaf being edited. */
    $implicit: RuleModel;
    /** Its column. */
    column: QueryBuilderColumn | undefined;
    /** Call with the new value to write it into the tree. */
    setValue: (value: any) => void;
    /** Position of the leaf in the tree. */
    path: QueryBuilderPath;
}

/** Context handed to a custom group header template. */
export interface QueryBuilderHeaderContext {
    /** The group. */
    $implicit: RuleModel;
    /** Position of the group in the tree. */
    path: QueryBuilderPath;
}

/** The surface of the root that the parts use. */
export interface QueryBuilderHost {
    readonly tree: Signal<RuleModel>;
    readonly columns: Signal<QueryBuilderColumn[]>;
    readonly messages: Signal<QueryBuilderMessages>;
    /** `true` when nothing can be edited. */
    readonly locked: Signal<boolean>;
    readonly enableNotCondition: Signal<boolean>;
    readonly allowValidation: Signal<boolean>;
    readonly displayMode: Signal<'horizontal' | 'vertical'>;
    readonly showRuleDelete: Signal<boolean>;
    readonly showGroupInsert: Signal<boolean>;
    readonly showGroupDelete: Signal<boolean>;
    readonly fieldOptions: Signal<QueryBuilderFieldGroup[] | QueryBuilderFieldOption[]>;
    readonly fieldsGrouped: Signal<boolean>;
    /** `true` while another group still fits under `maxGroupCount`. */
    readonly canAddGroup: Signal<boolean>;
    readonly valueTemplate: Signal<TemplateRef<QueryBuilderValueContext> | undefined>;
    readonly headerTemplate: Signal<TemplateRef<QueryBuilderHeaderContext> | undefined>;

    column(field: string | undefined): QueryBuilderColumn | undefined;
    operatorsOf(column: QueryBuilderColumn | undefined): QueryBuilderOperator[];
    /** Why a leaf is invalid, or `null`. Always `null` while `allowValidation` is off. */
    errorOf(rule: RuleModel): string | null;

    changeField(path: QueryBuilderPath, field: string): void;
    changeOperator(path: QueryBuilderPath, operator: string): void;
    changeValue(path: QueryBuilderPath, value: any): void;
    changeCondition(path: QueryBuilderPath, condition: 'and' | 'or'): void;
    toggleNot(path: QueryBuilderPath, not: boolean): void;
    insertRule(groupPath: QueryBuilderPath): void;
    insertGroup(groupPath: QueryBuilderPath): void;
    remove(path: QueryBuilderPath): void;
}

/** Provided by the root, read by the parts. */
export const QUERYBUILDER_HOST = new InjectionToken<QueryBuilderHost>('QUERYBUILDER_HOST');
