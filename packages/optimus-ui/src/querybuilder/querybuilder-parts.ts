import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete } from '@openng/optimus-ui/autocomplete';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DatePicker } from '@openng/optimus-ui/datepicker';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { MultiSelect } from '@openng/optimus-ui/multiselect';
import { Select } from '@openng/optimus-ui/select';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { ToggleButton } from '@openng/optimus-ui/togglebutton';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';
import type { QueryBuilderPath, RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { isGroup, isListOperator, isRangeOperator, isUnaryOperator } from './querybuilder-engine';
import { QUERYBUILDER_HOST } from './querybuilder-context';

/**
 * The two parts the builder is drawn from: a group, which holds a header and its children, and a
 * rule, which is one `field operator value` row. The group draws itself again for a nested group.
 *
 * Both read the root only through {@link QUERYBUILDER_HOST}.
 *
 * @module querybuilder-parts
 */

type EditorKind = 'none' | 'template' | 'select' | 'multiselect' | 'number' | 'numberRange' | 'boolean' | 'date' | 'dateRange' | 'text' | 'textRange' | 'list';

/**
 * One `field operator value` row.
 * @group Components
 */
@Component({
    selector: 'p-querybuilder-rule',
    standalone: true,
    imports: [FormsModule, NgTemplateOutlet, Select, MultiSelect, InputNumber, InputText, DatePicker, AutoComplete, ToggleSwitch, ButtonModule],
    template: `
        <div class="p-querybuilder-rule-row" role="group" [attr.aria-label]="host.messages().field + ' ' + (rule().label || rule().field || '')">
            <p-select
                class="p-querybuilder-field"
                size="small"
                appendTo="body"
                optionLabel="label"
                optionValue="value"
                [options]="host.fieldOptions()"
                [group]="host.fieldsGrouped()"
                [filter]="host.columns().length > 8"
                [ngModel]="rule().field || null"
                [placeholder]="host.messages().selectField"
                [ariaLabel]="host.messages().field"
                [disabled]="host.locked()"
                (ngModelChange)="host.changeField(path(), $event)"
            />
            <p-select
                class="p-querybuilder-operator"
                size="small"
                appendTo="body"
                optionLabel="value"
                optionValue="key"
                [options]="operators()"
                [ngModel]="rule().operator || null"
                [placeholder]="host.messages().selectOperator"
                [ariaLabel]="host.messages().operator"
                [disabled]="host.locked() || !rule().field"
                (ngModelChange)="host.changeOperator(path(), $event)"
            />

            <div class="p-querybuilder-value" [attr.data-kind]="kind()">
                @switch (kind()) {
                    @case ('template') {
                        <ng-container *ngTemplateOutlet="templateOf()!; context: templateContext()" />
                    }
                    @case ('select') {
                        <p-select
                            class="p-querybuilder-editor"
                            size="small"
                            appendTo="body"
                            optionLabel="label"
                            optionValue="value"
                            [options]="column()!.values"
                            [ngModel]="rule().value"
                            [ariaLabel]="host.messages().value"
                            [disabled]="host.locked()"
                            (ngModelChange)="set($event)"
                        />
                    }
                    @case ('multiselect') {
                        <p-multiselect
                            class="p-querybuilder-editor"
                            size="small"
                            appendTo="body"
                            optionLabel="label"
                            optionValue="value"
                            display="chip"
                            [options]="column()!.values"
                            [ngModel]="rule().value"
                            [ariaLabel]="host.messages().value"
                            [disabled]="host.locked()"
                            (ngModelChange)="set($event ?? [])"
                        />
                    }
                    @case ('number') {
                        <p-inputnumber
                            class="p-querybuilder-editor"
                            size="small"
                            [maxFractionDigits]="20"
                            [step]="column()?.step ?? 1"
                            [ngModel]="rule().value"
                            [ariaLabel]="host.messages().value"
                            [disabled]="host.locked()"
                            (ngModelChange)="set($event)"
                        />
                    }
                    @case ('numberRange') {
                        <p-inputnumber
                            class="p-querybuilder-editor"
                            size="small"
                            [maxFractionDigits]="20"
                            [ngModel]="part(0)"
                            [placeholder]="host.messages().from"
                            [ariaLabel]="host.messages().from"
                            [disabled]="host.locked()"
                            (ngModelChange)="setPart(0, $event)"
                        />
                        <p-inputnumber
                            class="p-querybuilder-editor"
                            size="small"
                            [maxFractionDigits]="20"
                            [ngModel]="part(1)"
                            [placeholder]="host.messages().to"
                            [ariaLabel]="host.messages().to"
                            [disabled]="host.locked()"
                            (ngModelChange)="setPart(1, $event)"
                        />
                    }
                    @case ('boolean') {
                        <p-toggleswitch class="p-querybuilder-editor" [ngModel]="rule().value === true" [ariaLabel]="host.messages().value" [disabled]="host.locked()" (ngModelChange)="set($event)" />
                        <span class="p-querybuilder-boolean-label">{{ rule().value === true ? host.messages().yes : host.messages().no }}</span>
                    }
                    @case ('date') {
                        <p-datepicker
                            class="p-querybuilder-editor"
                            size="small"
                            appendTo="body"
                            [showTime]="column()?.type === 'datetime'"
                            [dateFormat]="column()?.format ?? 'yy-mm-dd'"
                            [ngModel]="rule().value"
                            [ariaLabel]="host.messages().value"
                            [disabled]="host.locked()"
                            (ngModelChange)="set($event)"
                        />
                    }
                    @case ('dateRange') {
                        <p-datepicker
                            class="p-querybuilder-editor"
                            size="small"
                            appendTo="body"
                            [showTime]="column()?.type === 'datetime'"
                            [dateFormat]="column()?.format ?? 'yy-mm-dd'"
                            [ngModel]="part(0)"
                            [placeholder]="host.messages().from"
                            [ariaLabel]="host.messages().from"
                            [disabled]="host.locked()"
                            (ngModelChange)="setPart(0, $event)"
                        />
                        <p-datepicker
                            class="p-querybuilder-editor"
                            size="small"
                            appendTo="body"
                            [showTime]="column()?.type === 'datetime'"
                            [dateFormat]="column()?.format ?? 'yy-mm-dd'"
                            [ngModel]="part(1)"
                            [placeholder]="host.messages().to"
                            [ariaLabel]="host.messages().to"
                            [disabled]="host.locked()"
                            (ngModelChange)="setPart(1, $event)"
                        />
                    }
                    @case ('textRange') {
                        <input
                            pInputText
                            class="p-inputtext-sm p-querybuilder-editor"
                            [ngModel]="part(0)"
                            [placeholder]="host.messages().from"
                            [attr.aria-label]="host.messages().from"
                            [disabled]="host.locked()"
                            (ngModelChange)="setPart(0, $event)"
                        />
                        <input pInputText class="p-inputtext-sm p-querybuilder-editor" [ngModel]="part(1)" [placeholder]="host.messages().to" [attr.aria-label]="host.messages().to" [disabled]="host.locked()" (ngModelChange)="setPart(1, $event)" />
                    }
                    @case ('list') {
                        <p-autocomplete
                            class="p-querybuilder-editor"
                            size="small"
                            [multiple]="true"
                            [typeahead]="false"
                            [ngModel]="rule().value ?? []"
                            [placeholder]="host.messages().typeValue"
                            [ariaLabel]="host.messages().value"
                            [disabled]="host.locked()"
                            (ngModelChange)="setList($event)"
                        />
                    }
                    @case ('text') {
                        <input
                            pInputText
                            class="p-inputtext-sm p-querybuilder-editor"
                            [ngModel]="rule().value ?? ''"
                            [placeholder]="host.messages().typeValue"
                            [attr.aria-label]="host.messages().value"
                            [disabled]="host.locked()"
                            (ngModelChange)="set($event)"
                        />
                    }
                }
            </div>

            @if (host.showRuleDelete() && !host.locked()) {
                <p-button class="p-querybuilder-delete" icon="pi pi-trash" severity="secondary" [text]="true" size="small" [ariaLabel]="host.messages().deleteRule" (onClick)="host.remove(path())" />
            }
        </div>
        @if (error(); as message) {
            <small class="p-querybuilder-error" role="alert">{{ message }}</small>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-querybuilder-rule', 'data-scope': 'querybuilder', 'data-part': 'rule', '[class.p-querybuilder-rule-invalid]': '!!error()' }
})
export class QueryBuilderRule {
    protected readonly host = inject(QUERYBUILDER_HOST);

    /** The leaf. */
    readonly rule = input.required<RuleModel>();
    /** Where the leaf sits. */
    readonly path = input.required<QueryBuilderPath>();

    protected readonly column = computed(() => this.host.column(this.rule().field));
    protected readonly operators = computed(() => this.host.operatorsOf(this.column()));

    protected readonly templateOf = computed(() => this.column()?.template ?? this.host.valueTemplate());

    protected readonly templateContext = computed(() => ({ $implicit: this.rule(), column: this.column(), path: this.path(), setValue: (value: any) => this.set(value) }));

    protected readonly error = computed(() => {
        const reason = this.host.errorOf(this.rule());

        return reason ? (this.host.messages().errors[reason] ?? reason) : null;
    });

    protected readonly kind = computed<EditorKind>(() => {
        const rule = this.rule();
        const column = this.column();

        if (!rule.field || !rule.operator || isUnaryOperator(rule.operator)) return 'none';
        if (this.templateOf()) return 'template';

        const range = isRangeOperator(rule.operator);
        const list = isListOperator(rule.operator);

        if (column?.values?.length) return list ? 'multiselect' : 'select';

        switch (column?.type ?? 'string') {
            case 'boolean':
                return 'boolean';
            case 'number':
                return range ? 'numberRange' : list ? 'list' : 'number';
            case 'date':
            case 'datetime':
                return range ? 'dateRange' : 'date';
            default:
                return range ? 'textRange' : list ? 'list' : 'text';
        }
    });

    protected part(index: number): any {
        const value = this.rule().value;

        return Array.isArray(value) ? (value[index] ?? null) : null;
    }

    protected set(value: any): void {
        this.host.changeValue(this.path(), value);
    }

    protected setPart(index: number, value: any): void {
        const current = Array.isArray(this.rule().value) ? this.rule().value.slice() : [null, null];

        current[index] = value;
        this.set(current);
    }

    protected setList(values: any[] | null): void {
        const numeric = this.column()?.type === 'number';
        const list = (values ?? []).map((v) => (numeric ? Number(v) : v)).filter((v) => !(typeof v === 'number' && Number.isNaN(v)));

        this.set(list);
    }
}

/**
 * A group: its header and its children, each a rule or a nested group.
 * @group Components
 */
@Component({
    selector: 'p-querybuilder-group',
    standalone: true,
    imports: [FormsModule, NgTemplateOutlet, SelectButton, ToggleButton, ButtonModule, QueryBuilderRule],
    template: `
        <div class="p-querybuilder-group-header">
            @if (host.headerTemplate(); as header) {
                <ng-container *ngTemplateOutlet="header; context: { $implicit: node(), path: path() }" />
            } @else {
                <p-selectbutton
                    class="p-querybuilder-condition"
                    size="small"
                    optionLabel="label"
                    optionValue="value"
                    [options]="conditions()"
                    [allowEmpty]="false"
                    [ngModel]="node().condition ?? 'and'"
                    [ariaLabel]="'AND / OR'"
                    [disabled]="host.locked()"
                    (ngModelChange)="host.changeCondition(path(), $event)"
                />
                @if (host.enableNotCondition()) {
                    <p-togglebutton class="p-querybuilder-not" size="small" [onLabel]="host.messages().not" [offLabel]="host.messages().not" [ngModel]="!!node().not" [disabled]="host.locked()" (ngModelChange)="host.toggleNot(path(), $event)" />
                }
                <span class="p-querybuilder-spacer"></span>
                @if (!host.locked()) {
                    <p-button class="p-querybuilder-add-rule" icon="pi pi-plus" size="small" severity="secondary" [outlined]="true" [label]="host.messages().addRule" (onClick)="host.insertRule(path())" />
                    @if (host.showGroupInsert()) {
                        <p-button
                            class="p-querybuilder-add-group"
                            icon="pi pi-plus-circle"
                            size="small"
                            severity="secondary"
                            [outlined]="true"
                            [label]="host.messages().addGroup"
                            [disabled]="!host.canAddGroup()"
                            (onClick)="host.insertGroup(path())"
                        />
                    }
                    @if (!isRoot() && host.showGroupDelete()) {
                        <p-button class="p-querybuilder-delete" icon="pi pi-trash" size="small" severity="secondary" [text]="true" [ariaLabel]="host.messages().deleteGroup" (onClick)="host.remove(path())" />
                    }
                }
            }
        </div>
        <div class="p-querybuilder-group-body">
            @for (child of node().rules ?? []; track $index) {
                @if (isGroup(child)) {
                    <p-querybuilder-group [node]="child" [path]="childPath($index)" />
                } @else {
                    <p-querybuilder-rule [rule]="child" [path]="childPath($index)" />
                }
            } @empty {
                <div class="p-querybuilder-empty">{{ host.messages().emptyGroup }}</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-querybuilder-group', role: 'group', 'data-scope': 'querybuilder', 'data-part': 'group', '[class.p-querybuilder-group-not]': '!!node().not' }
})
export class QueryBuilderGroup {
    protected readonly host = inject(QUERYBUILDER_HOST);

    /** The group. */
    readonly node = input.required<RuleModel>();
    /** Where the group sits. `[]` for the root. */
    readonly path = input.required<QueryBuilderPath>();

    protected readonly isRoot = computed(() => this.path().length === 0);
    protected readonly conditions = computed(() => [
        { label: this.host.messages().and, value: 'and' },
        { label: this.host.messages().or, value: 'or' }
    ]);

    protected readonly isGroup = isGroup;

    protected childPath(index: number): QueryBuilderPath {
        return [...this.path(), index];
    }
}
