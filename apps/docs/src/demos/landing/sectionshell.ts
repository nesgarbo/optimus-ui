/**
 * Shared shape for every home section: one vertical rhythm, one container width, and one
 * way of writing the eyebrow/heading/lede stack. Sections import these instead of
 * repeating class strings, so the page keeps a single measure.
 */
export const SECTION = 'py-20 sm:py-28 lg:py-36';

export const CONTAINER = 'max-w-6xl mx-auto! px-6';

export const EYEBROW = 'text-sm uppercase font-mono tracking-wide text-muted-color';

export const HEADING = 'mt-4 text-3xl! sm:text-4xl! lg:text-5xl! font-normal! tracking-tight text-surface-900 dark:text-surface-0';

export const LEDE = 'mt-4 text-base sm:text-lg text-muted-color';

/** Two columns on wide screens, one narrow measure below it. */
export const TWO_COLUMNS = 'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-md sm:max-w-xl mx-auto! lg:max-w-none!';

/** The install/command chip: a terminal line, dark in both schemes. */
export const TERMINAL = 'bg-surface-950 dark:bg-surface-900 rounded-md px-3.5 py-2 w-fit border border-surface-800 dark:border-surface-700';

export const TERMINAL_CODE = 'text-sm font-mono text-surface-300 select-all';

export const CARD = 'rounded-xl border border-surface bg-surface-0 dark:bg-surface-900';
