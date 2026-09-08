import type { SchedulerDesignTokens, SchedulerTokenSections } from '@openng/optimus-ui-themes/types/scheduler';

export const root: SchedulerTokenSections.Root = {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    borderRadius: '{border.radius.md}'
};

export const accent: SchedulerTokenSections.Accent = {
    color: '{primary.color}'
};

export const header: SchedulerTokenSections.Header = {
    padding: '0.75rem 1rem',
    gap: '0.75rem',
    background: '{content.background}'
};

export const title: SchedulerTokenSections.Title = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '{text.color}'
};

export const gutter: SchedulerTokenSections.Gutter = {
    width: '4rem',
    fontSize: '0.75rem',
    color: '{text.muted.color}'
};

export const day: SchedulerTokenSections.Day = {
    // Suelo y no ancho: en un contenedor ancho la columna crece con 1fr. A 8rem, una semana pedía
    // 840px y aparecía scroll horizontal dentro de un panel de 730px —siete días cortados por la
    // mitad se leen peor que siete días estrechos—.
    minWidth: '6rem',
    hoverBackground: '{content.hover.background}',
    headerPadding: '0.5rem'
};

export const slot: SchedulerTokenSections.Slot = {
    height: '1.75rem'
};

export const allDay: SchedulerTokenSections.AllDay = {
    rowHeight: '1.375rem'
};

export const otherMonth: SchedulerTokenSections.OtherMonth = {
    color: '{text.muted.color}'
};

export const focus: SchedulerTokenSections.Focus = {
    ringColor: '{primary.color}'
};

export const event: SchedulerTokenSections.Event = {
    color: '{text.color}',
    borderAccent: '{primary.color}',
    borderRadius: '{border.radius.sm}',
    fontSize: '0.75rem',
    timeFontSize: '0.6875rem',
    paddingX: '0.375rem',
    paddingY: '0.125rem',
    // 18 % del color del evento sobre el fondo: suficiente para distinguir categorías de un vistazo
    // y bajo de sobra para que el texto siga cumpliendo contraste en claro y en oscuro.
    fillOpacity: '18%'
};

export const business: SchedulerTokenSections.Business = {
    background: '{content.background}'
};

/**
 * El hueco bloqueado no lleva un color plano sino un rayado: un relleno sólido se confunde con el
 * de fuera de horario o con el tinte de hoy, y "aquí no se puede" tiene que leerse distinto de
 * "aquí no se suele".
 */
/**
 * El hueco disponible se tiñe con el acento a muy baja opacidad: tiene que verse por DEBAJO de los
 * eventos sin competir con ellos, y un color propio lo convertiría en una tercera cosa que aprender.
 */
export const slotAvailable: SchedulerTokenSections.SlotAvailable = {
    background: 'color-mix(in srgb, {primary.color}, transparent 94%)'
};

export const blocked: SchedulerTokenSections.Blocked = {
    background: 'repeating-linear-gradient(135deg, color-mix(in srgb, {text.muted.color}, transparent 88%) 0 4px, transparent 4px 8px)'
};

export const month: SchedulerTokenSections.Month = {
    dayMinWidth: '6rem',
    cellMinHeight: '5.5rem',
    cellPadding: '0.25rem',
    numberFontSize: '0.8125rem',
    numberHeight: '1.5rem'
};

// Geometría en PX y no en rem, medida sobre la referencia: estas cifras son decisiones de layout
// (ancho del carril, alto de fila, hueco de la rejilla) y tienen que salir iguales aunque la app
// anfitriona use una base tipográfica distinta —el docs usa 14px y la referencia 16px—. Los tamaños
// de FUENTE sí van en rem, para que sigan escalando con el anfitrión.
export const miniMonth: SchedulerTokenSections.MiniMonth = {
    gap: '16px',
    padding: '8px',
    gridPadding: '6px',
    // Ancho MÍNIMO de la tarjeta, no fijo: la rejilla del año es auto-fill, así que en un panel
    // estrecho baja de columnas en vez de apretar los doce minimeses. Con cuatro columnas fijas la
    // celda del día bajaba a 19px y los números se tocaban.
    minWidth: '180px',
    daySize: '17px',
    fontSize: '1rem',
    borderRadius: '8px'
};

/**
 * El fin de semana del minimes va en el color primario, como en la referencia. Es el único sitio
 * donde se distingue: en el mes hay columnas y cabecera para saber qué día es, pero en una rejilla
 * de 17px sin cabecera visible el color es lo que deja encontrar el sábado de un vistazo.
 */
export const miniMonthWeekend: SchedulerTokenSections.MiniMonthWeekend = {
    color: '{primary.color}'
};

export const timeline: SchedulerTokenSections.Timeline = {
    slotWidth: '80px',
    rowHeight: '48px',
    headerHeight: '36px',
    eventHeight: '36px',
    // Cuadrado, como la referencia: en un eje horizontal las esquinas redondeadas de barras
    // contiguas dejan un diente entre ellas.
    eventBorderRadius: '0'
};

export const resourceArea: SchedulerTokenSections.ResourceArea = {
    width: '240px',
    background: '{content.background}',
    headerPadding: '12px 16px',
    rowPadding: '8px 16px',
    rowHeight: '48px'
};

export const agenda: SchedulerTokenSections.Agenda = {
    headerPadding: '0.5rem 0.75rem',
    rowPadding: '0.5rem 0.75rem',
    // La franja vacía a la izquierda de cada fila: alinea la lista con el gutter horario de las
    // vistas de día y semana, para que cambiar de vista no desplace el contenido. A 0 desaparece.
    gutterWidth: '5rem'
};

export const legend: SchedulerTokenSections.Legend = {
    padding: '0.5rem 1rem'
};

export const categoryLegend: SchedulerTokenSections.CategoryLegend = {
    itemBackground: '{content.background}',
    countColor: '{text.muted.color}'
};

export const moreLink: SchedulerTokenSections.MoreLink = {
    color: '{primary.color}'
};

export const nowIndicator: SchedulerTokenSections.NowIndicator = {
    // Literal a propósito: `red` es una paleta primitiva y un tema que sustituya las primitivas
    // dejaría la línea de "ahora" sin resolver, o sea negra y confundible con un borde.
    color: '#ef4444'
};

/**
 * Todo lo que depende de la superficie va aquí y NO en el cuerpo: `{surface.50}` es un primitivo y
 * no cambia con el tema, así que en oscuro dejaba las columnas de fin de semana en blanco. Los
 * tokens del cuerpo son los que sí son válidos en los dos modos (semánticos o medidas).
 */
export const colorScheme: SchedulerTokenSections.ColorScheme = {
    light: {
        weekday: { background: '{surface.50}' },
        // Los días del mes vecino sí llevan tinte: es lo que hace que la rejilla se lea como UN mes
        // con relleno a los lados, y no como seis semanas sueltas. Con el número atenuado a secas,
        // la primera fila parecía parte de septiembre.
        otherMonth: { background: '{surface.50}' },
        // El fin de semana NO se tiñe. Con la columna del sábado y el domingo en gris, el gris de
        // "hoy" y el de las horas no laborables dejaban de decir nada: tres cosas distintas con el
        // mismo tinte. El token se queda para quien quiera recuperarlo.
        weekend: { background: 'transparent' },
        nonBusiness: { background: '{surface.50}' },
        today: {
            // El primario a baja opacidad, no `{highlight.background}`: highlight es el relleno de
            // "seleccionado" y hay temas (el de esta documentación entre ellos) que lo definen como
            // un sólido oscuro, con lo que hoy salía como una banda negra. Un color-mix contra
            // `transparent` compone sobre el fondo que tenga la celda debajo y sale tinte en claro y
            // en oscuro sin dos valores distintos. Y un gris plano no servía: dejaba hoy igual que
            // el fin de semana y que una hora no laborable.
            background: 'color-mix(in srgb, {primary.color}, transparent 90%)',
            color: '{primary.color}',
            // El círculo del número pide algo más de cuerpo que el tinte de la columna, porque mide
            // 24px y no una columna entera.
            badgeBackground: 'color-mix(in srgb, {primary.color}, transparent 85%)',
            badgeColor: '{primary.color}'
        },
        // La selección va un paso por encima del realce de hoy, no al mismo nivel: si las dos
        // usaran `highlight.background`, el día seleccionado y el día de hoy serían la misma celda.
        selected: { background: '{highlight.focus.background}', color: '{highlight.focus.color}' },
        event: { background: '{surface.50}', hoverBackground: '{surface.100}' }
    },
    dark: {
        weekday: { background: '{surface.800}' },
        otherMonth: { background: '{surface.950}' },
        weekend: { background: 'transparent' },
        nonBusiness: { background: '{surface.900}' },
        today: {
            background: 'color-mix(in srgb, {primary.color}, transparent 88%)',
            color: '{primary.color}',
            badgeBackground: 'color-mix(in srgb, {primary.color}, transparent 82%)',
            badgeColor: '{primary.color}'
        },
        selected: { background: '{highlight.focus.background}', color: '{highlight.focus.color}' },
        event: { background: '{surface.800}', hoverBackground: '{surface.700}' }
    }
};

export default {
    root,
    accent,
    header,
    title,
    gutter,
    day,
    slot,
    allDay,
    otherMonth,
    focus,
    event,
    business,
    blocked,
    slotAvailable,
    month,
    miniMonth,
    miniMonthWeekend,
    timeline,
    resourceArea,
    agenda,
    legend,
    categoryLegend,
    moreLink,
    nowIndicator,
    colorScheme
} satisfies SchedulerDesignTokens;
