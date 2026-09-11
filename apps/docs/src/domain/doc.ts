export interface Doc {
    id?: string;
    description?: string;
    label?: string;
    component?: any;
    /** Rendered one after another under the section heading, without headings of their own. */
    components?: any[];
    doc?: Doc[];
    children?: Doc[];
    /** Rendered as a rule across the column: a heading that only opens what follows. */
    divider?: boolean;
    /** Interface entries are documented inline and are left out of the page index. */
    isInterface?: boolean;
}
