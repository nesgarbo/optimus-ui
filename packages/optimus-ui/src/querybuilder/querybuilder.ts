import { ChangeDetectionStrategy, Component, computed, contentChild, effect, inject, input, model, NgModule, output, TemplateRef, untracked, ViewEncapsulation } from '@angular/core';
import { booleanAttribute } from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { BaseEditableHolder } from '@openng/optimus-ui/baseeditableholder';
import { Bind } from '@openng/optimus-ui/bind';
import type { QueryBuilderActionEvent, QueryBuilderChangeEvent, QueryBuilderColumn, QueryBuilderOperator, QueryBuilderParameterizedSql, QueryBuilderPassThrough, QueryBuilderPath, RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';
import {
    QUERYBUILDER_HOST,
    QUERYBUILDER_MESSAGES,
    type QueryBuilderFieldGroup,
    type QueryBuilderFieldOption,
    type QueryBuilderHeaderContext,
    type QueryBuilderHost,
    type QueryBuilderMessages,
    type QueryBuilderValueContext
} from './querybuilder-context';
import {
    countGroups,
    createGroup,
    createRule,
    emptyValueFor,
    fromMongo,
    fromSql,
    getAt,
    getValidRules,
    insertNode,
    isGroup,
    isListOperator,
    isRangeOperator,
    isUnaryOperator,
    operatorsFor,
    removeNode,
    toFeathers,
    toMongo,
    toParameterizedSql,
    toPredicate,
    toSql,
    updateNode,
    validateRule,
    type ToSqlOptions
} from './querybuilder-engine';
import { QueryBuilderGroup } from './querybuilder-parts';
import { QueryBuilderStyle } from './style/querybuilderstyle';

export const QUERYBUILDER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => QueryBuilder),
    multi: true
};

/**
 * QueryBuilder lets the user compose a tree of conditions over a set of columns, and reads it out
 * as SQL, a MongoDB filter, a FeathersJS query or a JavaScript predicate.
 *
 * The API follows Syncfusion's QueryBuilder: `columns`, `rule`, `maxGroupCount`, `enableNotCondition`,
 * `showButtons`, `allowValidation`, `displayMode`, and the `getRules`, `setRules`, `getSqlFromRules`,
 * `setRulesFromSql`, `getValidRules`, `addRules`, `addGroups`, `deleteRule`, `deleteGroup` and `reset` methods.
 * Where Angular has a better idiom the idiom wins: the tree is a two-way `[(rule)]` and a form value.
 *
 * @group Components
 */
@Component({
    selector: 'p-querybuilder, p-queryBuilder, p-query-builder',
    standalone: true,
    imports: [SharedModule, QueryBuilderGroup],
    template: `<p-querybuilder-group [node]="value()" [path]="rootPath" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [QueryBuilderStyle, QUERYBUILDER_VALUE_ACCESSOR, { provide: PARENT_INSTANCE, useExisting: QueryBuilder }, { provide: QUERYBUILDER_HOST, useExisting: forwardRef(() => QueryBuilder) }],
    host: {
        '[class]': 'cx("root")',
        'data-scope': 'querybuilder',
        'data-part': 'root',
        '[attr.aria-disabled]': '$disabled() ? "true" : null',
        '[attr.aria-invalid]': '$invalid() ? "true" : null'
    },
    hostDirectives: [Bind]
})
export class QueryBuilder extends BaseEditableHolder<QueryBuilderPassThrough> implements QueryBuilderHost {
    componentName = 'QueryBuilder';

    /** @internal */
    _componentStyle = inject(QueryBuilderStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    protected readonly rootPath: QueryBuilderPath = [];

    constructor() {
        super();

        // `rule` is the Syncfusion spelling of the initial tree: a change to it replaces the value.
        effect(() => {
            const seed = this.rule();

            if (seed && Array.isArray(seed.rules)) untracked(() => this.value.set(seed));
        });
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /** Moves the focus into the builder. Called by a signal form when it needs to focus the field. */
    focus(options?: FocusOptions): void {
        (this.el.nativeElement as HTMLElement).querySelector<HTMLElement>('input, button, [tabindex]')?.focus(options);
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The condition tree. Supports `[(value)]`, binds to a signal form with `[field]` and to a classic
     * form with `formControlName` / `ngModel`.
     * @group Props
     */
    readonly value = model<RuleModel>(createGroup('and'));
    /**
     * Initial tree, under the name Syncfusion's QueryBuilder gives it. Each time it changes it replaces `value`.
     * @group Props
     */
    readonly rule = input<RuleModel | undefined>(undefined);
    /**
     * The fields the user can build conditions on.
     * @group Props
     */
    readonly columns = input<QueryBuilderColumn[]>([]);
    /**
     * Operators every column without its own list offers, in place of the list for its type.
     * @group Props
     */
    readonly operators = input<QueryBuilderOperator[] | undefined>(undefined);
    /**
     * Most groups the tree may hold, the root included.
     * @group Props
     */
    readonly maxGroupCount = input<number>(5);
    /**
     * Shows the NOT toggle on every group.
     * @group Props
     */
    readonly enableNotCondition = input(false, { transform: booleanAttribute });
    /**
     * Marks and explains the leaves that cannot be evaluated.
     * @group Props
     */
    readonly allowValidation = input(false, { transform: booleanAttribute });
    /**
     * Lays a condition out in one line, or stacks its parts.
     * @group Props
     */
    readonly displayMode = input<'horizontal' | 'vertical'>('horizontal');
    /**
     * Which buttons are drawn. All on by default.
     * @group Props
     */
    readonly showButtons = input<{ ruleDelete?: boolean; groupInsert?: boolean; groupDelete?: boolean }>({});
    /**
     * Order of the field list.
     * @group Props
     */
    readonly sortDirection = input<'default' | 'ascending' | 'descending'>('default');
    /**
     * Shows the tree, and takes the controls away.
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Replaces any of the built-in text.
     * @group Props
     */
    readonly messagesOverride = input<Partial<QueryBuilderMessages> | undefined>(undefined, { alias: 'messages' });

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Fires after the tree changed through the UI or a method.
     * @group Emits
     */
    readonly ruleChanged = output<QueryBuilderChangeEvent>();
    /**
     * Fires before a change is applied. Set `cancel` to `true` to stop it.
     * @group Emits
     */
    readonly actionBegin = output<QueryBuilderActionEvent>();
    /**
     * Fires once, when the component is ready.
     * @group Emits
     */
    readonly created = output<void>();
    /**
     * Fires when the user interacts with the builder. A signal form reads it as `touched`.
     * @group Emits
     */
    readonly touch = output<void>();

    // ---------------------------------------------------------------------------------------------
    // Templates
    // ---------------------------------------------------------------------------------------------

    /**
     * Template that draws the value editor of every condition whose column has no `template` of its own.
     * Reference it as `#value`.
     * @group Templates
     */
    readonly valueTpl = contentChild<TemplateRef<QueryBuilderValueContext>>('value');
    /**
     * Template that replaces the header of every group. Reference it as `#header`.
     * @group Templates
     */
    readonly headerTpl = contentChild<TemplateRef<QueryBuilderHeaderContext>>('header');

    // ---------------------------------------------------------------------------------------------
    // Host contract
    // ---------------------------------------------------------------------------------------------

    readonly tree = computed(() => this.value());
    readonly messages = computed<QueryBuilderMessages>(() => {
        const o = this.messagesOverride();

        return { ...QUERYBUILDER_MESSAGES, ...o, errors: { ...QUERYBUILDER_MESSAGES.errors, ...o?.errors } };
    });
    readonly locked = computed(() => this.readonly() || this.$disabled());
    readonly showRuleDelete = computed(() => this.showButtons().ruleDelete !== false);
    readonly showGroupInsert = computed(() => this.showButtons().groupInsert !== false);
    readonly showGroupDelete = computed(() => this.showButtons().groupDelete !== false);
    readonly valueTemplate = computed(() => this.valueTpl());
    readonly headerTemplate = computed(() => this.headerTpl());
    readonly canAddGroup = computed(() => countGroups(this.value()) < this.maxGroupCount());
    readonly fieldsGrouped = computed(() => this.columns().some((c) => !!c.category));

    readonly fieldOptions = computed<QueryBuilderFieldGroup[] | QueryBuilderFieldOption[]>(() => {
        const direction = this.sortDirection();
        const sorted = this.columns().map((c) => ({ label: c.label ?? c.field, value: c.field, category: c.category }));

        if (direction !== 'default') sorted.sort((a, b) => (direction === 'ascending' ? 1 : -1) * a.label.localeCompare(b.label));

        if (!this.fieldsGrouped()) return sorted.map(({ label, value }) => ({ label, value }));

        const groups = new Map<string, QueryBuilderFieldOption[]>();

        for (const item of sorted) {
            const key = item.category ?? '';

            if (!groups.has(key)) groups.set(key, []);

            groups.get(key)!.push({ label: item.label, value: item.value });
        }

        return [...groups].map(([label, items]) => ({ label, items }));
    });

    column(field: string | undefined): QueryBuilderColumn | undefined {
        return field ? this.columns().find((c) => c.field === field) : undefined;
    }

    operatorsOf(column: QueryBuilderColumn | undefined): QueryBuilderOperator[] {
        if (!column) return [];

        const global = this.operators();

        return operatorsFor(column.operators?.length || !global?.length ? column : { type: column.type, operators: global });
    }

    errorOf(rule: RuleModel): string | null {
        return this.allowValidation() ? validateRule(rule, this.column(rule.field)) : null;
    }

    changeField(path: QueryBuilderPath, field: string): void {
        const column = this.column(field);

        if (!column) return;

        const current = getAt(this.value(), path);
        const fresh = createRule(column);
        const keep = current?.operator && this.operatorsOf(column).some((o) => o.key === current.operator);
        const sameShape = keep && current!.type === fresh.type && this.shape(current!.operator) === this.shape(fresh.operator);

        this.apply('field', path, (root) => updateNode(root, path, keep ? { ...fresh, operator: current!.operator, value: sameShape ? current!.value : emptyValueFor(current!.operator, fresh.type) } : fresh));
    }

    changeOperator(path: QueryBuilderPath, operator: string): void {
        const current = getAt(this.value(), path);

        if (!current) return;

        const same = this.shape(current.operator) === this.shape(operator);

        this.apply('operator', path, (root) => updateNode(root, path, { operator, value: same ? current.value : emptyValueFor(operator, current.type) }));
    }

    changeValue(path: QueryBuilderPath, value: any): void {
        this.apply('value', path, (root) => updateNode(root, path, { value }));
    }

    changeCondition(path: QueryBuilderPath, condition: 'and' | 'or'): void {
        this.apply('condition', path, (root) => updateNode(root, path, { condition }));
    }

    toggleNot(path: QueryBuilderPath, not: boolean): void {
        this.apply('not', path, (root) => updateNode(root, path, { not }));
    }

    insertRule(groupPath: QueryBuilderPath): void {
        this.apply('insertRule', groupPath, (root) => insertNode(root, groupPath, createRule(this.columns()[0])));
    }

    insertGroup(groupPath: QueryBuilderPath): void {
        if (!this.canAddGroup()) return;

        this.apply('insertGroup', groupPath, (root) => insertNode(root, groupPath, createGroup('and', [createRule(this.columns()[0])])));
    }

    remove(path: QueryBuilderPath): void {
        const node = getAt(this.value(), path);

        this.apply(isGroup(node) ? 'deleteGroup' : 'deleteRule', path, (root) => removeNode(root, path));
    }

    /** What kind of value an operator takes: lets a change of operator keep the value when the kind holds. */
    private shape(operator: string | undefined): string {
        return isUnaryOperator(operator) ? 'none' : isRangeOperator(operator) ? 'range' : isListOperator(operator) ? 'list' : 'one';
    }

    private apply(type: QueryBuilderChangeEvent['type'], path: QueryBuilderPath, change: (root: RuleModel) => RuleModel): void {
        if (this.locked()) return;

        const begin: QueryBuilderActionEvent = { type, path, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return;

        this.commit(change(this.value()), type, path);
    }

    private commit(next: RuleModel, type: QueryBuilderChangeEvent['type'], path?: QueryBuilderPath): void {
        const previousRule = this.value();

        this.value.set(next);
        this.onModelChange(next);
        this.onModelTouched();
        this.touch.emit();
        this.ruleChanged.emit({ previousRule, rule: next, type, path });
    }

    ngAfterViewInit(): void {
        this.created.emit();
    }

    // ---------------------------------------------------------------------------------------------
    // Form control
    // ---------------------------------------------------------------------------------------------

    writeControlValue(value: any): void {
        this.value.set(value && Array.isArray(value.rules) ? value : createGroup('and'));
        this.cd.markForCheck();
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** The current tree. Mirrors Syncfusion's `getRules`. */
    getRules(): RuleModel {
        return this.value();
    }

    /** Replaces the tree. Mirrors Syncfusion's `setRules`. */
    setRules(rule: RuleModel): void {
        this.commit(rule && Array.isArray(rule.rules) ? rule : createGroup('and'), 'set');
    }

    /** The tree without its invalid leaves. Mirrors Syncfusion's `getValidRules`. */
    getValidRules(): RuleModel {
        return getValidRules(this.value(), this.columns());
    }

    /** `true` when every leaf can be evaluated. */
    isValid(): boolean {
        return JSON.stringify(this.getValidRules()) === JSON.stringify(this.value());
    }

    /** The tree as SQL. Mirrors Syncfusion's `getSqlFromRules`. */
    getSqlFromRules(rule: RuleModel = this.value(), options?: ToSqlOptions): string {
        return toSql(rule, { columns: this.columns(), ...options });
    }

    /** The tree as SQL with `?` placeholders. Mirrors Syncfusion's `getParameterizedSql`. */
    getParameterizedSql(rule: RuleModel = this.value(), options?: ToSqlOptions): QueryBuilderParameterizedSql {
        return toParameterizedSql(rule, { columns: this.columns(), ...options });
    }

    /** Reads SQL into the tree. Mirrors Syncfusion's `setRulesFromSql`. Throws a `QueryBuilderParseError`. */
    setRulesFromSql(sql: string): void {
        this.setRules(fromSql(sql, this.columns()));
    }

    /** The tree as a MongoDB filter. Mirrors Syncfusion's `getMongoQuery`. */
    getMongoQuery(rule: RuleModel = this.value()): Record<string, any> {
        return toMongo(rule);
    }

    /** Reads a MongoDB filter into the tree. Mirrors Syncfusion's `setMongoQuery`. */
    setMongoQuery(query: Record<string, any>): void {
        this.setRules(fromMongo(query, this.columns()));
    }

    /** The tree as a FeathersJS `query`. */
    getFeathersQuery(rule: RuleModel = this.value()): Record<string, any> {
        return toFeathers(rule);
    }

    /** A predicate for `Array.prototype.filter`. Mirrors Syncfusion's `getPredicate`. */
    getPredicate(rule: RuleModel = this.value()): (row: any) => boolean {
        return toPredicate(rule);
    }

    /** Adds conditions to a group (the root by default). Mirrors Syncfusion's `addRules`. */
    addRules(rules: RuleModel[], groupPath: QueryBuilderPath = []): void {
        this.commit(
            rules.reduce((root, rule) => insertNode(root, groupPath, rule), this.value()),
            'insertRule',
            groupPath
        );
    }

    /** Adds groups to a group (the root by default). Mirrors Syncfusion's `addGroups`. */
    addGroups(groups: RuleModel[], groupPath: QueryBuilderPath = []): void {
        this.commit(
            groups.reduce((root, group) => insertNode(root, groupPath, group), this.value()),
            'insertGroup',
            groupPath
        );
    }

    /** Removes a condition. Mirrors Syncfusion's `deleteRule`. */
    deleteRule(path: QueryBuilderPath): void {
        this.commit(removeNode(this.value(), path), 'deleteRule', path);
    }

    /** Removes a group. Mirrors Syncfusion's `deleteGroup`. */
    deleteGroup(path: QueryBuilderPath): void {
        this.commit(removeNode(this.value(), path), 'deleteGroup', path);
    }

    /** Empties the tree. Mirrors Syncfusion's `reset`. */
    reset(): void {
        this.commit(createGroup('and'), 'reset');
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [QueryBuilder, SharedModule],
    exports: [QueryBuilder, SharedModule]
})
export class QueryBuilderModule {}
