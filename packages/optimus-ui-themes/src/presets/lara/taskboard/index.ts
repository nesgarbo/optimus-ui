import type { TaskBoardDesignTokens, TaskBoardTokenSections } from '@openng/optimus-ui-themes/types/taskboard';

export const root: TaskBoardTokenSections.Root = {
    color: '{text.color}',
    borderRadius: '{border.radius.lg}',
    borderRadiusSm: '{border.radius.sm}'
};

export const empty: TaskBoardTokenSections.Empty = {
    color: '{text.muted.color}'
};

export const columns: TaskBoardTokenSections.Columns = {
    padding: '0.75rem'
};

export const column: TaskBoardTokenSections.Column = {
    gap: '0.75rem',
    // Suelo y techo, no un ancho: entre 280 y 380 una columna cabe cuatro veces en un portátil y
    // sigue siendo legible, y con `flex: 1 0` reparte el espacio de sobra en vez de dejar un hueco
    // al final de la pista.
    minWidth: '280px',
    maxWidth: '380px',
    borderRadius: '{border.radius.lg}',
    // 3.125rem es el alto que deja el chevron de 1.75rem con su padding de 0.75rem sin recortarse,
    // y es también el ancho útil de una columna plegada.
    headerMinHeight: '3.125rem',
    bodyPadding: '0.5rem',
    footerPadding: '0.5rem'
};

export const columnStatus: TaskBoardTokenSections.ColumnStatus = {
    todoColor: '{blue.500}',
    inProgressColor: '{yellow.500}',
    doneColor: '{green.500}',
    blockedColor: '{red.500}'
};

export const card: TaskBoardTokenSections.Card = {
    gap: '0.5rem',
    borderRadius: '{border.radius.lg}',
    selectedRingColor: '{primary.color}'
};

export const dropIndicator: TaskBoardTokenSections.DropIndicator = {
    color: '{primary.color}'
};

export const dragPreview: TaskBoardTokenSections.DragPreview = {
    // Grado y medio: suficiente para que la tarjeta se lea como levantada del tablero, y poco como
    // para no desalinearla del hueco que va a ocupar.
    rotation: '1.5deg'
};

export const focus: TaskBoardTokenSections.Focus = {
    ringColor: '{focus.ring.color}',
    ringWidth: '2px'
};

export const swimlane: TaskBoardTokenSections.Swimlane = {
    headerWidth: '180px',
    minHeight: '120px',
    cellMinHeight: '60px'
};

export const scrollbar: TaskBoardTokenSections.Scrollbar = {
    width: 'thin',
    track: 'transparent'
};

export const transition: TaskBoardTokenSections.Transition = {
    duration: '0.2s',
    timing: 'ease'
};

export const wip: TaskBoardTokenSections.Wip = {
    exceededCountColor: '{primary.contrast.color}'
};

export const colorScheme: TaskBoardTokenSections.ColorScheme = {
    light: {
        root: {
            // El tablero es el suelo y las columnas se apoyan encima: surface.50 detrás y surface.100
            // delante. Al revés las columnas desaparecerían en el fondo.
            background: '{surface.50}'
        },
        hover: {
            background: '{surface.100}'
        },
        column: {
            background: '{surface.100}',
            pinnedShadow: 'linear-gradient(to right, rgba(0, 0, 0, 0.04), transparent)',
            pinnedShadowRtl: 'linear-gradient(to left, rgba(0, 0, 0, 0.04), transparent)'
        },
        dragPreview: {
            shadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        },
        swimlane: {
            headerBackground: '{surface.50}',
            borderColor: '{surface.200}'
        },
        scrollbar: {
            thumb: '{surface.300}'
        },
        meta: {
            neutralBorderColor: '{surface.300}',
            neutralBackground: '{surface.100}',
            neutralColor: '{surface.600}',
            infoBorderColor: '{sky.300}',
            infoBackground: '{sky.50}',
            infoColor: '{sky.700}',
            warningBorderColor: '{amber.300}',
            warningBackground: '{amber.50}',
            warningColor: '{amber.700}',
            dangerBorderColor: '{red.300}',
            dangerBackground: '{red.50}',
            dangerColor: '{red.700}'
        }
    },
    dark: {
        root: {
            background: '{surface.950}'
        },
        hover: {
            background: '{surface.800}'
        },
        column: {
            background: '{surface.900}',
            pinnedShadow: 'linear-gradient(to right, rgba(255, 255, 255, 0.06), transparent)',
            pinnedShadowRtl: 'linear-gradient(to left, rgba(255, 255, 255, 0.06), transparent)'
        },
        dragPreview: {
            shadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        },
        swimlane: {
            headerBackground: '{surface.900}',
            borderColor: '{surface.700}'
        },
        scrollbar: {
            thumb: '{surface.600}'
        },
        // En oscuro las insignias van con fondo translúcido en vez de un tono claro del color: un
        // amber.50 sobre surface.900 es una mancha, y el borde ya da el color.
        meta: {
            neutralBorderColor: '{surface.600}',
            neutralBackground: 'color-mix(in srgb, {surface.700} 72%, transparent)',
            neutralColor: '{surface.300}',
            infoBorderColor: 'color-mix(in srgb, {sky.400} 42%, transparent)',
            infoBackground: 'color-mix(in srgb, {sky.500} 14%, transparent)',
            infoColor: '{sky.200}',
            warningBorderColor: 'color-mix(in srgb, {amber.400} 40%, transparent)',
            warningBackground: 'color-mix(in srgb, {amber.500} 14%, transparent)',
            warningColor: '{amber.200}',
            dangerBorderColor: 'color-mix(in srgb, {red.400} 42%, transparent)',
            dangerBackground: 'color-mix(in srgb, {red.500} 14%, transparent)',
            dangerColor: '{red.200}'
        }
    }
};

export default {
    root,
    empty,
    columns,
    column,
    columnStatus,
    card,
    dropIndicator,
    dragPreview,
    focus,
    swimlane,
    scrollbar,
    transition,
    wip,
    colorScheme
} satisfies TaskBoardDesignTokens;
