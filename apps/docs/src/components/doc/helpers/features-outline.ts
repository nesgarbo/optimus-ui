import { Doc } from '@/domain/doc';

/**
 * The shape of a component page.
 *
 * A page declares its demos as a flat list, which used to be rendered as one heading
 * after another — a reader landing on it met eighteen examples with nothing telling them
 * how to get started. This groups that same list into the three things a reader wants in
 * order: how to use the component, what it can do, and how it behaves for assistive
 * technology.
 *
 * Nothing here reads from the demo sources, so a page gets the structure by existing.
 */
export function featuresOutline(docs: Doc[]): Doc[] {
    if (!docs?.length) {
        return docs;
    }

    const importDoc = docs.find((doc) => doc.id === 'import');
    const accessibility = docs.find((doc) => doc.id === 'accessibility');

    // A page can declare its own opening section; otherwise the minimum working snippet
    // is the "basic" demo, or the first one when a page named its opener something else.
    const usageDoc = docs.find((doc) => doc.id === 'usage');
    const basic = usageDoc ?? docs.find((doc) => doc.id === 'basic') ?? docs.find((doc) => doc !== importDoc && doc !== accessibility && !!doc.component);

    const usageComponents = [importDoc?.component, basic?.component].filter(Boolean);

    const examples = docs.filter((doc) => doc !== importDoc && doc !== accessibility && doc !== basic).flatMap(flatten);

    const outline: Doc[] = [];

    if (usageComponents.length) {
        outline.push({
            id: 'usage',
            label: 'Usage',
            components: usageComponents
        });
    }

    if (examples.length) {
        outline.push({
            id: 'examples',
            label: 'Examples',
            divider: true,
            children: examples
        });
    }

    if (accessibility) {
        outline.push(accessibility);
    }

    return outline.length ? outline : docs;
}

/**
 * A few pages group their demos one level deeper — Galleria has an "Indicator" group of
 * four. Examples is a single level, so a group is spread into its demos and each keeps
 * its own heading, qualified by the group it came from.
 */
function flatten(doc: Doc): Doc[] {
    if (!doc.children?.length) {
        return [doc];
    }

    return doc.children.flatMap((child) => flatten({ ...child, label: qualify(doc, child) }));
}

function qualify(group: Doc, child: Doc): string {
    if (!child.label || !group.label || group.id === 'examples' || child.label.startsWith(group.label)) {
        return child.label ?? group.label ?? '';
    }

    return `${group.label}: ${child.label}`;
}
