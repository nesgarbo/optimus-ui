/**
 * Reading a hovered datum for the tooltip.
 *
 * A series binds its category and value to a `FieldAccessor`: a field name, a callback, or a
 * per-item array. The tooltip used to read only the string form, so a series bound with a function
 * -- which the chart itself drew perfectly well -- showed the row index and no value on hover. These
 * go through the same accessor readers the chart does, so the tooltip cannot disagree with the marks.
 */
import { readCategory, readNumeric } from './accessor';

type Props = Record<string, unknown>;

/** The accessor a series puts its categories on, falling back to the documented default field. */
function categoryAccessorOf(props: Props): never {
    return (props['categoryXField'] ?? props['categoryYField'] ?? props['categoryField'] ?? 'category') as never;
}

/** The accessor a series measures its value with, falling back to the documented default field. */
function valueAccessorOf(props: Props): never {
    return (props['valueYField'] ?? props['valueXField'] ?? props['valueField'] ?? 'value') as never;
}

/** The category of one datum. */
export function categoryOf(props: Props, datum: unknown, index: number, seriesIndex: number, seriesId: string): string {
    const accessor = categoryAccessorOf(props);

    // A datum with no value in the field reads as its index, as it did when only field names worked.
    return readCategory(accessor, datum, index, seriesIndex, seriesId);
}

/** The measured value of one datum, or `null` when it has none. */
export function valueOf(props: Props, datum: unknown, index: number, seriesIndex: number, seriesId: string): number | null {
    return readNumeric(valueAccessorOf(props), datum, index, seriesIndex, seriesId, 'value');
}

const CATEGORY_INDEXES = new WeakMap<object, { accessor: unknown; byCategory: Map<string, number> }>();

/**
 * The index of the first datum in a category.
 *
 * Built once per data array and accessor and reused on every hover; a `findIndex` per series per
 * pointer move made a shared tooltip over a long series cost a full scan each time.
 */
export function indexOfCategory(props: Props, data: readonly unknown[], category: string, seriesIndex: number, seriesId: string): number {
    const accessor = categoryAccessorOf(props);
    let cached = CATEGORY_INDEXES.get(data);

    if (!cached || cached.accessor !== accessor) {
        const byCategory = new Map<string, number>();

        data.forEach((datum, index) => {
            const key = readCategory(accessor, datum, index, seriesIndex, seriesId);

            if (!byCategory.has(key)) byCategory.set(key, index);
        });

        cached = { accessor, byCategory };
        CATEGORY_INDEXES.set(data, cached);
    }

    return cached.byCategory.get(category) ?? -1;
}
