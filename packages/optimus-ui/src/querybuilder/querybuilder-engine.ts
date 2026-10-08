import type { QueryBuilderColumn, QueryBuilderFieldType, QueryBuilderOperator, QueryBuilderOperatorKey, QueryBuilderParameterizedSql, QueryBuilderPath, RuleModel } from '@openng/optimus-ui/types/querybuilder';

/**
 * The rule tree engine: building, editing, validating, evaluating and converting a `RuleModel`.
 *
 * Everything here is pure. A tree is never mutated: every edit returns a new tree that shares the
 * untouched branches with the old one, so a component can hold the tree in a signal and let
 * identity decide what to redraw.
 *
 * @module querybuilder-engine
 */

// ---------------------------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------------------------

const LABELS: Record<string, string> = {
    equal: 'Equal',
    notequal: 'Not equal',
    greaterthan: 'Greater than',
    greaterthanorequal: 'Greater than or equal',
    lessthan: 'Less than',
    lessthanorequal: 'Less than or equal',
    startswith: 'Starts with',
    endswith: 'Ends with',
    contains: 'Contains',
    notcontains: 'Does not contain',
    between: 'Between',
    notbetween: 'Not between',
    in: 'In',
    notin: 'Not in',
    isnull: 'Is null',
    isnotnull: 'Is not null',
    isempty: 'Is empty',
    isnotempty: 'Is not empty'
};

const OPERATORS_BY_TYPE: Record<QueryBuilderFieldType, QueryBuilderOperatorKey[]> = {
    string: ['equal', 'notequal', 'startswith', 'endswith', 'contains', 'notcontains', 'in', 'notin', 'isempty', 'isnotempty', 'isnull', 'isnotnull'],
    number: ['equal', 'notequal', 'greaterthan', 'greaterthanorequal', 'lessthan', 'lessthanorequal', 'between', 'notbetween', 'in', 'notin', 'isnull', 'isnotnull'],
    boolean: ['equal', 'notequal'],
    date: ['equal', 'notequal', 'greaterthan', 'greaterthanorequal', 'lessthan', 'lessthanorequal', 'between', 'notbetween', 'isnull', 'isnotnull'],
    datetime: ['equal', 'notequal', 'greaterthan', 'greaterthanorequal', 'lessthan', 'lessthanorequal', 'between', 'notbetween', 'isnull', 'isnotnull']
};

/** Operators whose value is a list. */
const LIST_OPERATORS = new Set(['in', 'notin']);
/** Operators whose value is a `[from, to]` pair. */
const RANGE_OPERATORS = new Set(['between', 'notbetween']);
/** Operators that take no value. */
const UNARY_OPERATORS = new Set(['isnull', 'isnotnull', 'isempty', 'isnotempty']);

/** The label of an operator key. */
export function operatorLabel(key: string): string {
    return LABELS[key] ?? key;
}

/** The operators a column offers: its own list, or the default for its type. */
export function operatorsFor(column: Pick<QueryBuilderColumn, 'type' | 'operators'> | undefined): QueryBuilderOperator[] {
    if (column?.operators?.length) return column.operators.map((op) => ({ key: op.key, value: op.value ?? operatorLabel(op.key) }));

    return OPERATORS_BY_TYPE[column?.type ?? 'string'].map((key) => ({ key, value: LABELS[key] }));
}

/** `true` when the operator takes a list value. */
export const isListOperator = (operator: string | undefined): boolean => !!operator && LIST_OPERATORS.has(operator);

/** `true` when the operator takes a `[from, to]` value. */
export const isRangeOperator = (operator: string | undefined): boolean => !!operator && RANGE_OPERATORS.has(operator);

/** `true` when the operator takes no value. */
export const isUnaryOperator = (operator: string | undefined): boolean => !!operator && UNARY_OPERATORS.has(operator);

/** The value a freshly picked operator starts with. */
export function emptyValueFor(operator: string | undefined, type: QueryBuilderFieldType = 'string'): any {
    if (isListOperator(operator)) return [];
    if (isRangeOperator(operator)) return [null, null];
    if (isUnaryOperator(operator)) return null;

    return type === 'boolean' ? true : null;
}

// ---------------------------------------------------------------------------------------------
// Tree
// ---------------------------------------------------------------------------------------------

/** `true` for a group node, `false` for a leaf. */
export const isGroup = (node: RuleModel | undefined | null): boolean => !!node && Array.isArray(node.rules);

/** A new empty group. */
export const createGroup = (condition: 'and' | 'or' = 'and', rules: RuleModel[] = []): RuleModel => ({ condition, rules });

/** A new leaf, defaulting to the column's first operator. */
export function createRule(column: QueryBuilderColumn | undefined): RuleModel {
    if (!column) return { field: '', operator: '', value: null };

    const type = column.type ?? 'string';
    const operator = operatorsFor(column)[0]?.key ?? 'equal';

    return { field: column.field, label: column.label ?? column.field, type, operator, value: emptyValueFor(operator, type) };
}

/** The node at `path`, or `undefined` when the path leaves the tree. */
export function getAt(root: RuleModel, path: QueryBuilderPath): RuleModel | undefined {
    let node: RuleModel | undefined = root;

    for (const index of path) {
        node = node?.rules?.[index];
        if (!node) return undefined;
    }

    return node;
}

/** Rebuilds the branch down `path`, replacing the node there with `update(node)`. `undefined` removes it. */
function replaceAt(root: RuleModel, path: QueryBuilderPath, update: (node: RuleModel) => RuleModel | undefined): RuleModel {
    if (!path.length) return update(root) ?? createGroup(root.condition ?? 'and');

    const [index, ...rest] = path;
    const rules = root.rules ?? [];
    const child = rules[index];

    if (!child) return root;

    const next = rest.length ? replaceAt(child, rest, update) : update(child);
    const copy = rules.slice();

    if (next) copy[index] = next;
    else copy.splice(index, 1);

    return { ...root, rules: copy };
}

/** Appends `node` (or inserts it at `index`) in the group at `groupPath`. */
export function insertNode(root: RuleModel, groupPath: QueryBuilderPath, node: RuleModel, index?: number): RuleModel {
    return replaceAt(root, groupPath, (group) => {
        const rules = (group.rules ?? []).slice();

        rules.splice(index ?? rules.length, 0, node);

        return { ...group, rules };
    });
}

/** Removes the node at `path`. The root cannot be removed, it is emptied instead. */
export function removeNode(root: RuleModel, path: QueryBuilderPath): RuleModel {
    if (!path.length) return { ...root, rules: [] };

    return replaceAt(root, path, () => undefined);
}

/** Merges `patch` into the node at `path`. */
export function updateNode(root: RuleModel, path: QueryBuilderPath, patch: Partial<RuleModel>): RuleModel {
    return replaceAt(root, path, (node) => ({ ...node, ...patch }));
}

/** How many groups the tree holds, root included. */
export function countGroups(root: RuleModel): number {
    return isGroup(root) ? 1 + (root.rules ?? []).reduce((total, child) => total + countGroups(child), 0) : 0;
}

/** How many leaves the tree holds. */
export function countRules(root: RuleModel): number {
    return isGroup(root) ? (root.rules ?? []).reduce((total, child) => total + countRules(child), 0) : 1;
}

/** `true` when `a` and `b` are the same tree by value. */
export function equalRules(a: RuleModel | undefined, b: RuleModel | undefined): boolean {
    return JSON.stringify(a ?? null, replacer) === JSON.stringify(b ?? null, replacer);
}

function replacer(_key: string, value: any): any {
    return value instanceof Date ? value.toISOString() : value;
}

// ---------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------

/** The reason a leaf is invalid, or `null` when it is fine. */
export function validateRule(rule: RuleModel, column?: QueryBuilderColumn): string | null {
    if (!rule.field) return 'field';
    if (!rule.operator) return 'operator';
    if (isUnaryOperator(rule.operator)) return null;

    const value = rule.value;

    if (isRangeOperator(rule.operator)) {
        if (!Array.isArray(value) || value.length !== 2 || value.some(isBlank)) return 'range';
    } else if (isListOperator(rule.operator)) {
        if (!Array.isArray(value) || !value.length) return 'list';
    } else if (isBlank(value)) {
        return 'required';
    }

    const v = column?.validation;
    const items = Array.isArray(value) ? value : [value];

    if (v) {
        for (const item of items) {
            if (typeof item === 'number') {
                if (Number.isNaN(item)) return 'number';
                if (v.min !== undefined && item < v.min) return 'min';
                if (v.max !== undefined && item > v.max) return 'max';
            } else if (typeof item === 'string') {
                if (v.minLength !== undefined && item.length < v.minLength) return 'minLength';
                if (v.maxLength !== undefined && item.length > v.maxLength) return 'maxLength';
            }
        }
    }

    return null;
}

const isBlank = (value: any): boolean => value === null || value === undefined || value === '' || (typeof value === 'number' && Number.isNaN(value));

/** A copy of the tree with every invalid leaf and every group left empty by that removed. The root stays. */
export function getValidRules(root: RuleModel, columns: QueryBuilderColumn[] = []): RuleModel {
    const prune = (node: RuleModel, isRoot: boolean): RuleModel | undefined => {
        if (!isGroup(node))
            return validateRule(
                node,
                columns.find((c) => c.field === node.field)
            )
                ? undefined
                : node;

        const rules = (node.rules ?? []).map((child) => prune(child, false)).filter((child): child is RuleModel => !!child);

        return rules.length || isRoot ? { ...node, rules } : undefined;
    };

    return prune(root, true)!;
}

// ---------------------------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------------------------

/** Options of {@link evaluate}. */
export interface EvaluateOptions {
    /** Compare strings without regard to case. Default `true`, like Syncfusion's predicates. */
    ignoreCase?: boolean;
}

function read(row: any, field: string): any {
    if (row == null) return undefined;
    if (field in Object(row)) return row[field];

    return field.split('.').reduce((value, key) => (value == null ? undefined : value[key]), row);
}

function comparable(value: any, ignoreCase: boolean): any {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return ignoreCase ? value.toLowerCase() : value;

    return value;
}

function sameKind(a: any, b: any, ignoreCase: boolean): [any, any] {
    // A string against a Date column is an ISO date; compare them as instants.
    if (a instanceof Date && typeof b === 'string') return [a.getTime(), new Date(b).getTime()];
    if (b instanceof Date && typeof a === 'string') return [new Date(a).getTime(), b.getTime()];

    return [comparable(a, ignoreCase), comparable(b, ignoreCase)];
}

function evaluateRule(row: any, rule: RuleModel, ignoreCase: boolean): boolean {
    const actual = read(row, rule.field ?? '');
    const operator = rule.operator ?? '';
    const empty = actual === null || actual === undefined;

    switch (operator) {
        case 'isnull':
            return empty;
        case 'isnotnull':
            return !empty;
        case 'isempty':
            return empty || actual === '';
        case 'isnotempty':
            return !empty && actual !== '';
    }

    const eq = (a: any, b: any) => {
        const [x, y] = sameKind(a, b, ignoreCase);

        return x === y;
    };
    const cmp = (a: any, b: any) => {
        const [x, y] = sameKind(a, b, ignoreCase);

        return x < y ? -1 : x > y ? 1 : 0;
    };
    const text = (v: any) => comparable(String(v ?? ''), ignoreCase) as string;

    switch (operator) {
        case 'equal':
            return eq(actual, rule.value);
        case 'notequal':
            return !eq(actual, rule.value);
        case 'greaterthan':
            return !empty && cmp(actual, rule.value) > 0;
        case 'greaterthanorequal':
            return !empty && cmp(actual, rule.value) >= 0;
        case 'lessthan':
            return !empty && cmp(actual, rule.value) < 0;
        case 'lessthanorequal':
            return !empty && cmp(actual, rule.value) <= 0;
        case 'startswith':
            return text(actual).startsWith(text(rule.value));
        case 'endswith':
            return text(actual).endsWith(text(rule.value));
        case 'contains':
            return text(actual).includes(text(rule.value));
        case 'notcontains':
            return !text(actual).includes(text(rule.value));
        case 'in':
            return (rule.value ?? []).some((v: any) => eq(actual, v));
        case 'notin':
            return !(rule.value ?? []).some((v: any) => eq(actual, v));
        case 'between':
            return !empty && cmp(actual, rule.value?.[0]) >= 0 && cmp(actual, rule.value?.[1]) <= 0;
        case 'notbetween':
            return empty || cmp(actual, rule.value?.[0]) < 0 || cmp(actual, rule.value?.[1]) > 0;
        default:
            return false;
    }
}

/** `true` when `row` satisfies the tree. An empty group is satisfied by every row. */
export function evaluate(row: any, root: RuleModel, options: EvaluateOptions = {}): boolean {
    const ignoreCase = options.ignoreCase ?? true;

    const walk = (node: RuleModel): boolean => {
        if (!isGroup(node)) return evaluateRule(row, node, ignoreCase);

        const rules = node.rules ?? [];
        const result = !rules.length ? true : node.condition === 'or' ? rules.some(walk) : rules.every(walk);

        return node.not ? !result : result;
    };

    return walk(root);
}

/** A predicate for `Array.prototype.filter`. Mirrors Syncfusion's `getPredicate`. */
export const toPredicate = (root: RuleModel, options?: EvaluateOptions) => (row: any) => evaluate(row, root, options);

// ---------------------------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------------------------

/** Options of {@link toSql}. */
export interface ToSqlOptions {
    /** Wraps a field name, for example in double quotes. */
    quote?: (field: string) => string;
}

const SQL_COMPARE: Record<string, string> = {
    equal: '=',
    notequal: '<>',
    greaterthan: '>',
    greaterthanorequal: '>=',
    lessthan: '<',
    lessthanorequal: '<='
};

function sqlLiteral(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (value instanceof Date) return `'${value.toISOString()}'`;
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';

    return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSql(root: RuleModel, options: ToSqlOptions, bind?: (value: any) => string): string {
    const quote = options.quote ?? ((field: string) => field);
    const lit = (value: any) => (bind ? bind(value) : sqlLiteral(value));

    const leaf = (rule: RuleModel): string => {
        const field = quote(rule.field ?? '');
        const op = rule.operator ?? '';
        const value = rule.value;

        if (op in SQL_COMPARE) return `${field} ${SQL_COMPARE[op]} ${lit(value)}`;

        switch (op) {
            case 'startswith':
                return `${field} LIKE ${lit(`${value}%`)}`;
            case 'endswith':
                return `${field} LIKE ${lit(`%${value}`)}`;
            case 'contains':
                return `${field} LIKE ${lit(`%${value}%`)}`;
            case 'notcontains':
                return `${field} NOT LIKE ${lit(`%${value}%`)}`;
            case 'in':
            case 'notin':
                return `${field} ${op === 'in' ? 'IN' : 'NOT IN'} (${(value ?? []).map(lit).join(', ')})`;
            case 'between':
            case 'notbetween':
                return `${field} ${op === 'between' ? 'BETWEEN' : 'NOT BETWEEN'} ${lit(value?.[0])} AND ${lit(value?.[1])}`;
            case 'isnull':
                return `${field} IS NULL`;
            case 'isnotnull':
                return `${field} IS NOT NULL`;
            case 'isempty':
                return `${field} = ''`;
            case 'isnotempty':
                return `${field} <> ''`;
            default:
                return '';
        }
    };

    const group = (node: RuleModel): string => {
        const parts = (node.rules ?? []).map((child) => (isGroup(child) ? group(child) : leaf(child))).filter(Boolean);

        if (!parts.length) return '';

        const body = `(${parts.join(node.condition === 'or' ? ' OR ' : ' AND ')})`;

        return node.not ? `NOT ${body}` : body;
    };

    return group(root);
}

/** The tree as a SQL `WHERE` expression. Mirrors Syncfusion's `getSqlFromRules`. */
export function toSql(root: RuleModel, options: ToSqlOptions = {}): string {
    return buildSql(root, options);
}

/** The tree as a SQL expression with `?` placeholders and the values apart. Mirrors `getParameterizedSql`. */
export function toParameterizedSql(root: RuleModel, options: ToSqlOptions = {}): QueryBuilderParameterizedSql {
    const params: any[] = [];
    const sql = buildSql(root, options, (value) => {
        params.push(value instanceof Date ? value.toISOString() : value);

        return '?';
    });

    return { sql, params };
}

// ---------------------------------------------------------------------------------------------
// SQL parser
// ---------------------------------------------------------------------------------------------

/** Thrown when a SQL or Mongo query cannot be read into a rule tree. */
export class QueryBuilderParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QueryBuilderParseError';
    }
}

type Token = { t: 'id' | 'str' | 'num' | 'op' | 'lp' | 'rp' | 'comma' | 'kw'; v: string };

const KEYWORDS = new Set(['AND', 'OR', 'NOT', 'LIKE', 'IN', 'BETWEEN', 'IS', 'NULL', 'TRUE', 'FALSE']);

function tokenize(sql: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < sql.length) {
        const c = sql[i];

        if (/\s/.test(c)) {
            i++;
        } else if (c === '(') {
            tokens.push({ t: 'lp', v: c });
            i++;
        } else if (c === ')') {
            tokens.push({ t: 'rp', v: c });
            i++;
        } else if (c === ',') {
            tokens.push({ t: 'comma', v: c });
            i++;
        } else if (c === "'") {
            let out = '';

            i++;

            for (;;) {
                if (i >= sql.length) throw new QueryBuilderParseError('Unterminated string');
                if (sql[i] === "'" && sql[i + 1] === "'") {
                    out += "'";
                    i += 2;
                } else if (sql[i] === "'") {
                    i++;
                    break;
                } else {
                    out += sql[i++];
                }
            }

            tokens.push({ t: 'str', v: out });
        } else if (c === '"' || c === '`' || c === '[') {
            const close = c === '[' ? ']' : c;
            const end = sql.indexOf(close, i + 1);

            if (end < 0) throw new QueryBuilderParseError('Unterminated identifier');

            tokens.push({ t: 'id', v: sql.slice(i + 1, end) });
            i = end + 1;
        } else if (/[<>=!]/.test(c)) {
            const two = sql.slice(i, i + 2);
            const op = ['<>', '!=', '<=', '>='].includes(two) ? two : c;

            if (op === '!') throw new QueryBuilderParseError('Unexpected "!"');

            tokens.push({ t: 'op', v: op });
            i += op.length;
        } else if (/[0-9]/.test(c) || (c === '-' && /[0-9]/.test(sql[i + 1] ?? ''))) {
            const m = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(sql.slice(i))!;

            tokens.push({ t: 'num', v: m[0] });
            i += m[0].length;
        } else if (/[A-Za-z_$]/.test(c)) {
            const m = /^[A-Za-z_$][\w$.]*/.exec(sql.slice(i))!;
            const upper = m[0].toUpperCase();

            tokens.push(KEYWORDS.has(upper) ? { t: 'kw', v: upper } : { t: 'id', v: m[0] });
            i += m[0].length;
        } else {
            throw new QueryBuilderParseError(`Unexpected "${c}"`);
        }
    }

    return tokens;
}

type Parsed = { node: RuleModel; paren: boolean };

/**
 * Reads a SQL `WHERE` expression into a rule tree. Mirrors Syncfusion's `setRulesFromSql`.
 *
 * It reads what {@link toSql} writes and the ordinary hand-written forms: `AND`, `OR`, `NOT`,
 * parentheses, the six comparisons, `LIKE` with a leading and/or trailing `%`, `IN`, `BETWEEN`
 * and `IS [NOT] NULL`. Anything else throws a {@link QueryBuilderParseError}.
 */
export function fromSql(sql: string, columns: QueryBuilderColumn[] = []): RuleModel {
    const tokens = tokenize(sql);
    let pos = 0;

    const peek = () => tokens[pos];
    const next = () => tokens[pos++];
    const isKw = (v: string) => peek()?.t === 'kw' && peek().v === v;
    const eatKw = (v: string) => (isKw(v) ? (pos++, true) : false);
    const expect = (t: Token['t'], what: string) => {
        const token = next();

        if (token?.t !== t) throw new QueryBuilderParseError(`Expected ${what}`);

        return token;
    };

    const typeOf = (field: string, fallback: QueryBuilderFieldType): QueryBuilderFieldType => columns.find((c) => c.field === field)?.type ?? fallback;

    const literal = (): { value: any; type: QueryBuilderFieldType } => {
        const token = next();

        if (!token) throw new QueryBuilderParseError('Expected a value');
        if (token.t === 'str') return { value: token.v, type: 'string' };
        if (token.t === 'num') return { value: Number(token.v), type: 'number' };
        if (token.t === 'kw' && (token.v === 'TRUE' || token.v === 'FALSE')) return { value: token.v === 'TRUE', type: 'boolean' };
        if (token.t === 'kw' && token.v === 'NULL') return { value: null, type: 'string' };

        throw new QueryBuilderParseError(`Unexpected "${token.v}"`);
    };

    const leaf = (): RuleModel => {
        const id = expect('id', 'a field name').v;
        let operator: string;
        let value: any = null;
        let type: QueryBuilderFieldType = 'string';

        if (peek()?.t === 'op') {
            const sym = next().v;
            const map: Record<string, string> = { '=': 'equal', '<>': 'notequal', '!=': 'notequal', '>': 'greaterthan', '>=': 'greaterthanorequal', '<': 'lessthan', '<=': 'lessthanorequal' };
            const lit = literal();

            operator = map[sym];
            value = lit.value;
            type = lit.type;

            if (value === '' && operator === 'equal') {
                operator = 'isempty';
                value = null;
            } else if (value === '' && operator === 'notequal') {
                operator = 'isnotempty';
                value = null;
            }
        } else {
            const negated = eatKw('NOT');

            if (eatKw('LIKE')) {
                const lit = literal();
                const pattern = String(lit.value);
                const lead = pattern.startsWith('%');
                const trail = pattern.endsWith('%') && pattern.length > (lead ? 1 : 0);
                const core = pattern.slice(lead ? 1 : 0, trail ? -1 : undefined);

                if (/[%_]/.test(core)) throw new QueryBuilderParseError(`Unsupported LIKE pattern "${pattern}"`);

                operator = lead && trail ? 'contains' : trail ? 'startswith' : lead ? 'endswith' : 'equal';
                if (negated && operator !== 'contains') throw new QueryBuilderParseError('NOT LIKE is only supported for contains');
                if (negated) operator = 'notcontains';

                value = core;
            } else if (eatKw('IN')) {
                expect('lp', '"("');

                const list: any[] = [];

                do {
                    const lit = literal();

                    list.push(lit.value);
                    type = lit.type;
                } while (peek()?.t === 'comma' && next());

                expect('rp', '")"');

                operator = negated ? 'notin' : 'in';
                value = list;
            } else if (eatKw('BETWEEN')) {
                const a = literal();

                if (!eatKw('AND')) throw new QueryBuilderParseError('Expected AND in BETWEEN');

                const b = literal();

                operator = negated ? 'notbetween' : 'between';
                value = [a.value, b.value];
                type = a.type;
            } else if (!negated && eatKw('IS')) {
                const not = eatKw('NOT');

                if (!eatKw('NULL')) throw new QueryBuilderParseError('Expected NULL after IS');

                operator = not ? 'isnotnull' : 'isnull';
            } else {
                throw new QueryBuilderParseError(`Unexpected "${peek()?.v ?? 'end of input'}"`);
            }
        }

        const column = columns.find((c) => c.field === id);

        return { field: id, label: column?.label ?? id, type: typeOf(id, type), operator, value };
    };

    const primary = (): Parsed => {
        if (peek()?.t === 'lp') {
            next();

            const inner = orExpr();

            expect('rp', '")"');

            const node = isGroup(inner.node) && !inner.node.not ? inner.node : createGroup('and', [inner.node]);

            return { node, paren: true };
        }

        return { node: leaf(), paren: false };
    };

    const unary = (): Parsed => {
        if (isKw('NOT') && tokens[pos + 1]?.t === 'lp') {
            next();

            const inner = primary();
            const group = isGroup(inner.node) ? inner.node : createGroup('and', [inner.node]);

            return { node: { ...group, not: !group.not }, paren: true };
        }

        return primary();
    };

    const chain = (condition: 'and' | 'or', operand: () => Parsed, keyword: string): Parsed => {
        const first = operand();

        if (!isKw(keyword)) return first;

        const rules: RuleModel[] = [];

        const add = (item: Parsed) => {
            // A bare chain of the same kind folds into this one; a parenthesised group is the author's grouping.
            if (!item.paren && isGroup(item.node) && item.node.condition === condition) rules.push(...(item.node.rules ?? []));
            else rules.push(item.node);
        };

        add(first);

        while (eatKw(keyword)) add(operand());

        return { node: createGroup(condition, rules), paren: false };
    };

    const andExpr = (): Parsed => chain('and', unary, 'AND');
    function orExpr(): Parsed {
        return chain('or', andExpr, 'OR');
    }

    if (!tokens.length) return createGroup('and');

    const result = orExpr();

    if (pos < tokens.length) throw new QueryBuilderParseError(`Unexpected "${tokens[pos].v}"`);

    return isGroup(result.node) ? result.node : createGroup('and', [result.node]);
}

// ---------------------------------------------------------------------------------------------
// Mongo
// ---------------------------------------------------------------------------------------------

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const unescapeRegex = (text: string) => text.replace(/\\(.)/g, '$1');

function mongoLeaf(rule: RuleModel): Record<string, any> {
    const f = rule.field ?? '';
    const v = rule.value;
    const regex = (pattern: string) => ({ $regex: pattern, $options: 'i' });

    switch (rule.operator) {
        case 'equal':
            return { [f]: { $eq: v } };
        case 'notequal':
            return { [f]: { $ne: v } };
        case 'greaterthan':
            return { [f]: { $gt: v } };
        case 'greaterthanorequal':
            return { [f]: { $gte: v } };
        case 'lessthan':
            return { [f]: { $lt: v } };
        case 'lessthanorequal':
            return { [f]: { $lte: v } };
        case 'startswith':
            return { [f]: regex(`^${escapeRegex(String(v))}`) };
        case 'endswith':
            return { [f]: regex(`${escapeRegex(String(v))}$`) };
        case 'contains':
            return { [f]: regex(escapeRegex(String(v))) };
        case 'notcontains':
            return { [f]: { $not: new RegExp(escapeRegex(String(v)), 'i') } };
        case 'in':
            return { [f]: { $in: v ?? [] } };
        case 'notin':
            return { [f]: { $nin: v ?? [] } };
        case 'between':
            return { [f]: { $gte: v?.[0], $lte: v?.[1] } };
        case 'notbetween':
            return { $or: [{ [f]: { $lt: v?.[0] } }, { [f]: { $gt: v?.[1] } }] };
        case 'isnull':
            return { [f]: { $eq: null } };
        case 'isnotnull':
            return { [f]: { $ne: null } };
        case 'isempty':
            return { [f]: { $eq: '' } };
        case 'isnotempty':
            return { [f]: { $ne: '' } };
        default:
            return {};
    }
}

/** The tree as a MongoDB filter document. Mirrors Syncfusion's `getMongoQuery`. */
export function toMongo(root: RuleModel): Record<string, any> {
    const group = (node: RuleModel): Record<string, any> => {
        const parts = (node.rules ?? []).map((child) => (isGroup(child) ? group(child) : mongoLeaf(child))).filter((part) => Object.keys(part).length);

        if (!parts.length) return {};

        const body = { [node.condition === 'or' ? '$or' : '$and']: parts };

        return node.not ? { $nor: [body] } : body;
    };

    return group(root);
}

/** Reads a MongoDB filter document produced by {@link toMongo}, or a hand-written one of the same shapes. */
export function fromMongo(query: Record<string, any>, columns: QueryBuilderColumn[] = []): RuleModel {
    const leaf = (field: string, op: string, value: any): RuleModel => {
        const column = columns.find((c) => c.field === field);
        const type = column?.type ?? (typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string');

        return { field, label: column?.label ?? field, type, operator: op, value };
    };

    const readField = (field: string, spec: any): RuleModel => {
        if (spec === null || typeof spec !== 'object' || spec instanceof Date || spec instanceof RegExp) {
            if (spec instanceof RegExp) return readRegex(field, spec.source);

            return spec === null ? leaf(field, 'isnull', null) : leaf(field, 'equal', spec);
        }

        const keys = Object.keys(spec);

        if (keys.includes('$regex')) return readRegex(field, String(spec.$regex));
        if ('$gte' in spec && '$lte' in spec) return leaf(field, 'between', [spec.$gte, spec.$lte]);
        if (keys.length === 1) {
            const [key] = keys;
            const v = spec[key];
            const table: Record<string, string> = { $eq: 'equal', $ne: 'notequal', $gt: 'greaterthan', $gte: 'greaterthanorequal', $lt: 'lessthan', $lte: 'lessthanorequal', $in: 'in', $nin: 'notin' };

            if (key === '$eq' && v === null) return leaf(field, 'isnull', null);
            if (key === '$ne' && v === null) return leaf(field, 'isnotnull', null);
            if (key === '$eq' && v === '') return leaf(field, 'isempty', null);
            if (key === '$ne' && v === '') return leaf(field, 'isnotempty', null);
            if (key === '$not' && v instanceof RegExp) return { ...readRegex(field, v.source), operator: 'notcontains' };
            if (table[key]) return leaf(field, table[key], v);
        }

        throw new QueryBuilderParseError(`Unsupported condition on "${field}"`);
    };

    const readRegex = (field: string, source: string): RuleModel => {
        const lead = source.startsWith('^');
        const trail = source.endsWith('$') && !source.endsWith('\\$');
        const core = unescapeRegex(source.slice(lead ? 1 : 0, trail ? -1 : undefined));

        return leaf(field, lead ? 'startswith' : trail ? 'endswith' : 'contains', core);
    };

    const group = (doc: Record<string, any>): RuleModel => {
        const keys = Object.keys(doc);

        if (keys.length === 1 && (keys[0] === '$and' || keys[0] === '$or')) {
            return createGroup(
                keys[0] === '$and' ? 'and' : 'or',
                doc[keys[0]].map((child: any) => node(child))
            );
        }

        if (keys.length === 1 && keys[0] === '$nor') {
            const inner = node(doc.$nor[0]);

            return { ...(isGroup(inner) ? inner : createGroup('and', [inner])), not: true };
        }

        return createGroup(
            'and',
            keys.map((key) => readField(key, doc[key]))
        );
    };

    const node = (doc: Record<string, any>): RuleModel => {
        const keys = Object.keys(doc);

        // `{ $or: [a, b] }` with the same field on both sides is how `notbetween` is written.
        if (keys.length === 1 && keys[0] === '$or' && doc.$or.length === 2) {
            const [a, b] = doc.$or;
            const fa = Object.keys(a)[0];
            const fb = Object.keys(b)[0];

            if (Object.keys(a).length === 1 && Object.keys(b).length === 1 && fa === fb && a[fa]?.$lt !== undefined && b[fb]?.$gt !== undefined) return leaf(fa, 'notbetween', [a[fa].$lt, b[fb].$gt]);
        }

        if (keys.length === 1 && keys[0].startsWith('$')) return group(doc);
        if (keys.length === 1) return readField(keys[0], doc[keys[0]]);

        return group(doc);
    };

    if (!query || !Object.keys(query).length) return createGroup('and');

    const result = node(query);

    return isGroup(result) ? result : createGroup('and', [result]);
}

// ---------------------------------------------------------------------------------------------
// Feathers
// ---------------------------------------------------------------------------------------------

function feathersLeaf(rule: RuleModel, negate: boolean): Record<string, any> {
    const f = rule.field ?? '';
    const v = rule.value;
    const pick = <T>(positive: T, negative: T): T => (negate ? negative : positive);

    switch (rule.operator) {
        case 'equal':
            return pick({ [f]: v }, { [f]: { $ne: v } });
        case 'notequal':
            return pick({ [f]: { $ne: v } }, { [f]: v });
        case 'greaterthan':
            return pick({ [f]: { $gt: v } }, { [f]: { $lte: v } });
        case 'greaterthanorequal':
            return pick({ [f]: { $gte: v } }, { [f]: { $lt: v } });
        case 'lessthan':
            return pick({ [f]: { $lt: v } }, { [f]: { $gte: v } });
        case 'lessthanorequal':
            return pick({ [f]: { $lte: v } }, { [f]: { $gt: v } });
        case 'startswith':
            return { [f]: { [pick('$ilike', '$notilike')]: `${v}%` } };
        case 'endswith':
            return { [f]: { [pick('$ilike', '$notilike')]: `%${v}` } };
        case 'contains':
            return { [f]: { [pick('$ilike', '$notilike')]: `%${v}%` } };
        case 'notcontains':
            return { [f]: { [pick('$notilike', '$ilike')]: `%${v}%` } };
        case 'in':
            return { [f]: { [pick('$in', '$nin')]: v ?? [] } };
        case 'notin':
            return { [f]: { [pick('$nin', '$in')]: v ?? [] } };
        case 'between':
            return pick({ [f]: { $gte: v?.[0], $lte: v?.[1] } }, { $or: [{ [f]: { $lt: v?.[0] } }, { [f]: { $gt: v?.[1] } }] });
        case 'notbetween':
            return pick({ $or: [{ [f]: { $lt: v?.[0] } }, { [f]: { $gt: v?.[1] } }] }, { [f]: { $gte: v?.[0], $lte: v?.[1] } });
        case 'isnull':
            return pick({ [f]: null }, { [f]: { $ne: null } });
        case 'isnotnull':
            return pick({ [f]: { $ne: null } }, { [f]: null });
        case 'isempty':
            return pick({ [f]: '' }, { [f]: { $ne: '' } });
        case 'isnotempty':
            return pick({ [f]: { $ne: '' } }, { [f]: '' });
        default:
            return {};
    }
}

/**
 * The tree as a FeathersJS `query`, for `feathers-knex` and the other adapters that read `$or`,
 * `$in`, `$nin`, `$ne`, `$gt`... plus `$ilike` and `$notilike` for the text operators.
 *
 * Feathers has no `$not`, so a negated group is pushed down onto its leaves by De Morgan's laws.
 */
export function toFeathers(root: RuleModel): Record<string, any> {
    const walk = (node: RuleModel, negate: boolean): Record<string, any> => {
        if (!isGroup(node)) return feathersLeaf(node, negate);

        const flip = negate !== !!node.not;
        const effective = flip ? (node.condition === 'or' ? 'and' : 'or') : (node.condition ?? 'and');
        const parts = (node.rules ?? []).map((child) => walk(child, flip)).filter((part) => Object.keys(part).length);

        if (!parts.length) return {};
        if (effective === 'or') return { $or: parts };

        // An AND of single-key, distinct-field leaves reads best flat: `{ age: { $gt: 5 }, name: 'x' }`.
        const keys = parts.map((part) => Object.keys(part));
        const flat = keys.every((k) => k.length === 1 && !k[0].startsWith('$')) && new Set(keys.map((k) => k[0])).size === parts.length;

        return flat ? Object.assign({}, ...parts) : { $and: parts };
    };

    return walk(root, false);
}
