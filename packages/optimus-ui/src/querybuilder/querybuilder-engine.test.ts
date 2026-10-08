import type { RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { describe, expect, it } from 'vitest';
import {
    QueryBuilderParseError,
    countGroups,
    countRules,
    createGroup,
    createRule,
    evaluate,
    fromMongo,
    fromSql,
    getAt,
    getValidRules,
    insertNode,
    operatorsFor,
    removeNode,
    toFeathers,
    toMongo,
    toParameterizedSql,
    toPredicate,
    toSql,
    updateNode,
    validateRule
} from './querybuilder-engine';

const tree: RuleModel = {
    condition: 'and',
    rules: [
        { field: 'name', operator: 'startswith', value: 'Jo', type: 'string' },
        {
            condition: 'or',
            rules: [
                { field: 'age', operator: 'greaterthan', value: 30, type: 'number' },
                { field: 'city', operator: 'in', value: ['Madrid', 'Roma'], type: 'string' }
            ]
        }
    ]
};

describe('tree editing', () => {
    it('inserts, updates and removes without touching the original', () => {
        const rule = { field: 'x', operator: 'equal', value: 1 };
        const added = insertNode(tree, [1], rule);

        expect(getAt(added, [1, 2])).toEqual(rule);
        expect(tree.rules![1].rules).toHaveLength(2);
        expect(added.rules![0]).toBe(tree.rules![0]);

        const edited = updateNode(added, [1, 2], { value: 2 });

        expect(getAt(edited, [1, 2])!.value).toBe(2);
        expect(removeNode(edited, [1, 2])).toEqual(tree);
        expect(removeNode(tree, [])).toEqual({ condition: 'and', rules: [] });
    });

    it('counts', () => {
        expect(countGroups(tree)).toBe(2);
        expect(countRules(tree)).toBe(3);
    });

    it('builds a leaf from a column with its first operator', () => {
        expect(createRule({ field: 'age', type: 'number' })).toMatchObject({ field: 'age', operator: 'equal', type: 'number' });
        expect(operatorsFor({ type: 'boolean' }).map((o) => o.key)).toEqual(['equal', 'notequal']);
    });
});

describe('validation', () => {
    it('flags missing parts and bad values', () => {
        expect(validateRule({ field: '', operator: 'equal', value: 1 })).toBe('field');
        expect(validateRule({ field: 'a', operator: 'equal', value: '' })).toBe('required');
        expect(validateRule({ field: 'a', operator: 'between', value: [1, null] })).toBe('range');
        expect(validateRule({ field: 'a', operator: 'in', value: [] })).toBe('list');
        expect(validateRule({ field: 'a', operator: 'isnull' })).toBeNull();
        expect(validateRule({ field: 'a', operator: 'equal', value: 5 }, { field: 'a', validation: { max: 3 } })).toBe('max');
    });

    it('prunes invalid leaves and the groups they empty, keeping the root', () => {
        const dirty: RuleModel = createGroup('and', [{ field: 'a', operator: 'equal', value: '' }, createGroup('or', [{ field: 'b', operator: 'equal', value: '' }])]);

        expect(getValidRules(dirty)).toEqual({ condition: 'and', rules: [] });
        expect(getValidRules(tree)).toEqual(tree);
    });
});

describe('evaluate', () => {
    const rows = [
        { name: 'John', age: 40, city: 'Paris' },
        { name: 'Joan', age: 20, city: 'Roma' },
        { name: 'Mary', age: 50, city: 'Madrid' }
    ];

    it('applies the tree', () => {
        expect(rows.filter(toPredicate(tree)).map((r) => r.name)).toEqual(['John', 'Joan']);
    });

    it('is case-insensitive by default and honours not and empty groups', () => {
        expect(evaluate({ name: 'JOHN' }, createGroup('and', [{ field: 'name', operator: 'equal', value: 'john' }]))).toBe(true);
        expect(evaluate({ name: 'JOHN' }, createGroup('and', [{ field: 'name', operator: 'equal', value: 'john' }]), { ignoreCase: false })).toBe(false);
        expect(evaluate({}, { ...createGroup('and'), not: true })).toBe(false);
        expect(evaluate({}, createGroup('and'))).toBe(true);
    });

    it('compares dates, ranges and nested fields', () => {
        const row = { when: new Date('2026-05-10'), a: { b: 3 } };

        expect(evaluate(row, createGroup('and', [{ field: 'when', operator: 'between', value: ['2026-05-01', '2026-05-31'] }]))).toBe(true);
        expect(evaluate(row, createGroup('and', [{ field: 'a.b', operator: 'notbetween', value: [1, 2] }]))).toBe(true);
        expect(evaluate({ s: '' }, createGroup('and', [{ field: 's', operator: 'isempty' }]))).toBe(true);
    });
});

describe('SQL', () => {
    it('writes SQL', () => {
        expect(toSql(tree)).toBe("(name LIKE 'Jo%' AND (age > 30 OR city IN ('Madrid', 'Roma')))");
        expect(toSql({ ...createGroup('or', [{ field: 'n', operator: 'equal', value: "O'Brien" }]), not: true })).toBe("NOT (n = 'O''Brien')");
        expect(toSql(createGroup('and'))).toBe('');
        expect(toSql(tree, { quote: (f) => `"${f}"` })).toContain('"name" LIKE');
    });

    it('binds parameters', () => {
        expect(toParameterizedSql(tree)).toEqual({ sql: '(name LIKE ? AND (age > ? OR city IN (?, ?)))', params: ['Jo%', 30, 'Madrid', 'Roma'] });
    });

    it('round-trips', () => {
        const back = fromSql(toSql(tree));

        expect(back).toMatchObject({ condition: 'and' });
        expect(toSql(back)).toBe(toSql(tree));
        expect(back.rules![0]).toMatchObject({ field: 'name', operator: 'startswith', value: 'Jo' });
    });

    it('reads hand-written SQL', () => {
        const q = fromSql("a = 1 AND b <> 'x' OR c BETWEEN 1 AND 5 AND d IS NOT NULL AND NOT (e IN (1,2))");

        expect(q.condition).toBe('or');
        expect(q.rules).toHaveLength(2);
        expect(q.rules![1].rules!.map((r) => r.operator)).toEqual(['between', 'isnotnull', undefined]);
        expect(q.rules![1].rules![2]).toMatchObject({ not: true });
    });

    it('folds a plain chain but keeps explicit parentheses', () => {
        expect(fromSql('a = 1 AND b = 2 AND c = 3').rules).toHaveLength(3);
        expect(fromSql('(a = 1 AND b = 2) AND c = 3').rules).toHaveLength(2);
        expect(fromSql('a = 1').rules).toHaveLength(1);
    });

    it('maps empty-string equality and every LIKE shape', () => {
        expect(fromSql("a = ''").rules![0].operator).toBe('isempty');
        expect(fromSql("a LIKE '%x%'").rules![0].operator).toBe('contains');
        expect(fromSql("a LIKE '%x'").rules![0].operator).toBe('endswith');
        expect(fromSql("a NOT LIKE '%x%'").rules![0].operator).toBe('notcontains');
    });

    it('rejects what it does not understand', () => {
        expect(() => fromSql('a = ')).toThrow(QueryBuilderParseError);
        expect(() => fromSql("a LIKE 'x%y'")).toThrow(QueryBuilderParseError);
        expect(() => fromSql('a = 1 b')).toThrow(QueryBuilderParseError);
        expect(() => fromSql("a = 'x")).toThrow(QueryBuilderParseError);
    });
});

describe('Mongo', () => {
    it('writes and reads back', () => {
        const doc = toMongo(tree);

        expect(doc.$and[0]).toEqual({ name: { $regex: '^Jo', $options: 'i' } });
        expect(doc.$and[1].$or[1]).toEqual({ city: { $in: ['Madrid', 'Roma'] } });

        const back = fromMongo(doc);

        expect(toMongo(back)).toEqual(doc);
    });

    it('round-trips every operator', () => {
        const ops: RuleModel[] = [
            { field: 'a', operator: 'equal', value: 1 },
            { field: 'a', operator: 'notequal', value: 1 },
            { field: 'a', operator: 'greaterthanorequal', value: 1 },
            { field: 'a', operator: 'contains', value: 'x.y' },
            { field: 'a', operator: 'notcontains', value: 'x' },
            { field: 'a', operator: 'endswith', value: 'x' },
            { field: 'a', operator: 'between', value: [1, 2] },
            { field: 'a', operator: 'notbetween', value: [1, 2] },
            { field: 'a', operator: 'isnull' },
            { field: 'a', operator: 'isnotempty' },
            { field: 'a', operator: 'notin', value: [1] }
        ];

        for (const op of ops) {
            const back = fromMongo(toMongo(createGroup('and', [op])));

            expect(back.rules![0].operator, op.operator).toBe(op.operator);
        }
    });

    it('wraps a negated group in $nor', () => {
        const doc = toMongo({ ...createGroup('and', [{ field: 'a', operator: 'equal', value: 1 }]), not: true });

        expect(doc).toEqual({ $nor: [{ $and: [{ a: { $eq: 1 } }] }] });
        expect(fromMongo(doc).not).toBe(true);
    });
});

describe('Feathers', () => {
    it('writes a flat query where it can', () => {
        expect(
            toFeathers(
                createGroup('and', [
                    { field: 'age', operator: 'greaterthan', value: 3 },
                    { field: 'name', operator: 'equal', value: 'x' }
                ])
            )
        ).toEqual({ age: { $gt: 3 }, name: 'x' });
    });

    it('keeps $and when a field repeats, and nests $or', () => {
        expect(
            toFeathers(
                createGroup('and', [
                    { field: 'a', operator: 'greaterthan', value: 1 },
                    { field: 'a', operator: 'lessthan', value: 5 }
                ])
            )
        ).toEqual({ $and: [{ a: { $gt: 1 } }, { a: { $lt: 5 } }] });
        expect(toFeathers(tree)).toEqual({ $and: [{ name: { $ilike: 'Jo%' } }, { $or: [{ age: { $gt: 30 } }, { city: { $in: ['Madrid', 'Roma'] } }] }] });
    });

    it('pushes a negated group down with De Morgan', () => {
        const not = {
            ...createGroup('or', [
                { field: 'a', operator: 'equal', value: 1 },
                { field: 'b', operator: 'contains', value: 'x' }
            ]),
            not: true
        };

        expect(toFeathers(not)).toEqual({ a: { $ne: 1 }, b: { $notilike: '%x%' } });
    });
});
