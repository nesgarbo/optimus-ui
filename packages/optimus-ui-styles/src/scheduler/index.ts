export const style = /*css*/ `
    .p-scheduler {
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: dt('scheduler.background');
        color: dt('scheduler.color');
        border: 1px solid dt('scheduler.border.color');
        border-radius: dt('scheduler.border.radius');
        overflow: hidden;
    }

    .p-scheduler-header {
        display: flex;
        align-items: center;
        gap: dt('scheduler.header.gap');
        padding: dt('scheduler.header.padding');
        background: dt('scheduler.header.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-navigation {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    /* El título centrado de verdad: flex:1 en los tres lados, no solo en el del medio, o el
       título se descentra en cuanto la nav y el selector miden distinto. */
    .p-scheduler-navigation,
    .p-scheduler-view-selector {
        flex: 1 0 auto;
    }

    .p-scheduler-view-selector {
        justify-content: flex-end;
    }

    /* nowrap + ellipsis y NO wrap: el título es el ancla visual de la cabecera y partido en tres
       líneas por un selector de vista ancho le cambiaba el alto a toda la barra. Si no cabe, se
       recorta. */
    .p-scheduler-title {
        flex: 0 1 auto;
        min-inline-size: 0;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: dt('scheduler.title.font.size');
        font-weight: dt('scheduler.title.font.weight');
        color: dt('scheduler.title.color');
    }

    .p-scheduler-view-selector {
        display: flex;
        align-items: center;
        gap: 0.125rem;
    }

    /* La etiqueta que sale cuando solo hay una vista: un botón que no lleva a ningún sitio invita a
       pulsarlo, así que con una sola vista disponible el selector imprime texto. */
    .p-scheduler-view-label {
        padding: 0.25rem 0.5rem;
        font-size: 0.8125rem;
        color: dt('scheduler.gutter.color');
        white-space: nowrap;
    }

    .p-scheduler-view-button,
    .p-scheduler-today-button,
    .p-scheduler-nav-button {
        padding: 0.25rem 0.5rem;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: dt('scheduler.color');
        font-size: 0.8125rem;
        white-space: nowrap;
        cursor: pointer;
    }

    .p-scheduler-view-button:hover,
    .p-scheduler-today-button:hover,
    .p-scheduler-nav-button:hover {
        background: dt('scheduler.day.hover.background');
    }

    .p-scheduler-today-button {
        color: dt('scheduler.accent.color');
        font-weight: 500;
    }

    /* Bordes FÍSICOS y no lógicos: la flecha es una esquina rotada, y con border-inline-end la
       esquina se movía sola en RTL y la rotación dejaba de apuntar a ningún lado. En RTL lo que se
       invierte son las rotaciones, abajo. */
    .p-scheduler-nav-icon {
        display: inline-block;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-top: 1.5px solid currentColor;
        border-right: 1.5px solid currentColor;
    }

    .p-scheduler-nav-icon-prev {
        transform: rotate(-135deg);
    }

    .p-scheduler-nav-icon-next {
        transform: rotate(45deg);
    }

    /* "Anterior" apunta hacia donde se lee hacia atrás, que en RTL es la derecha. */
    [dir='rtl'] .p-scheduler-nav-icon-prev {
        transform: rotate(45deg);
    }

    [dir='rtl'] .p-scheduler-nav-icon-next {
        transform: rotate(-135deg);
    }

    /* Fondo y color SIEMPRE juntos: con solo el fondo, un tema cuyo highlight sea un relleno
       oscuro deja la etiqueta invisible. */
    .p-scheduler-view-button[data-selected] {
        background: dt('scheduler.selected.background');
        color: dt('scheduler.selected.color');
        font-weight: 600;
    }

    /* Los componentes semánticos son FRONTERAS DE CONTEXTO, no cajas: cuando se usan como
       definición, su elemento anfitrión queda dentro de la superficie que sustituyen —una celda
       flex, una rejilla— y como elemento en línea partía ese layout: los hijos dejaban de ser
       ítems flex del padre, así que un margin-inline-start:auto no empujaba nada y el gap
       desaparecía. display:contents los saca del layout y deja sus hijos donde el renderer los
       espera, sin quitarlos del DOM: los data-slot y los selectores de prueba siguen ahí. */
    p-scheduler-event,
    p-scheduler-time-grid-event,
    p-scheduler-all-day-event,
    p-scheduler-month-event,
    p-scheduler-agenda-event,
    p-scheduler-day-header,
    p-scheduler-all-day-cell,
    p-scheduler-time-gutter,
    p-scheduler-time-grid-cell,
    p-scheduler-work-cell,
    p-scheduler-month-header-cell,
    p-scheduler-month-cell,
    p-scheduler-month-cell-number,
    p-scheduler-month-day-cell,
    p-scheduler-month-more-link,
    p-scheduler-mini-month-header,
    p-scheduler-mini-month-cell,
    p-scheduler-agenda-date-header,
    p-scheduler-timeline-header-cell,
    p-scheduler-timeline-cell,
    p-scheduler-timeline-event,
    p-scheduler-resource-column-header,
    p-scheduler-resource-area-header,
    p-scheduler-resource-header,
    p-scheduler-resource,
    p-scheduler-resource-group,
    p-scheduler-resource-row,
    p-scheduler-resource-aggregate-badge {
        display: contents;
    }

    .p-scheduler-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: auto;
    }

    /* ── Rejilla horaria: día y semana ────────────────────────────────────── */

    .p-scheduler-time-grid {
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    /* El mínimo de columna sale de una variable con el token como respaldo: cuando las columnas son
       recursos y no días hay muchas más y necesitan otro suelo, y quien lo decide es la vista. */
    .p-scheduler-time-grid-header,
    .p-scheduler-time-grid-body,
    .p-scheduler-time-grid-groups {
        display: grid;
        grid-template-columns: dt('scheduler.gutter.width') repeat(var(--p-scheduler-columns, 1), minmax(var(--p-scheduler-column-min-width, dt('scheduler.day.min.width')), 1fr));
    }

    .p-scheduler-time-grid-groups {
        position: sticky;
        inset-block-start: 0;
        z-index: 2;
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-resource-column-header {
        grid-column: span var(--p-scheduler-column-span, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: dt('scheduler.day.header.padding');
        border-inline-start: 1px solid dt('scheduler.border.color');
        font-size: 0.8125rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
    }

    /* Pegada por debajo de la banda de grupos, que mide lo mismo que una cabecera de día. */
    .p-scheduler-time-grid[data-grouping='resource'] .p-scheduler-time-grid-header,
    .p-scheduler-time-grid[data-grouping='date'] .p-scheduler-time-grid-header {
        top: calc(dt('scheduler.day.header.padding') * 2 + 1.2em);
    }

    .p-scheduler-time-grid-header {
        position: sticky;
        top: 0;
        z-index: 1;
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-day-header-cell {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.3rem;
        padding: dt('scheduler.day.header.padding');
        border-inline-start: 1px solid dt('scheduler.border.color');
        font-size: 0.8125rem;
    }

    .p-scheduler-day-header-number {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    .p-scheduler-day-header-resource {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .p-scheduler-day-header-weekday {
        letter-spacing: 0.04em;
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-day-header-cell[data-today] .p-scheduler-day-header-weekday {
        color: inherit;
    }

    .p-scheduler-day-header-cell[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
        font-weight: 700;
    }

    .p-scheduler-day-header-cell[data-weekend] {
        background: dt('scheduler.weekend.background');
    }

    .p-scheduler-all-day-row {
        display: grid;
        grid-template-columns: dt('scheduler.gutter.width') 1fr;
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-all-day-gutter {
        padding: 0.25rem 0.5rem;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        text-align: end;
    }

    .p-scheduler-all-day-lanes {
        position: relative;
        display: grid;
        grid-template-columns: repeat(var(--p-scheduler-columns, 1), 1fr);
        min-height: calc(var(--p-scheduler-all-day-rows, 1) * dt('scheduler.all.day.row.height'));
    }

    .p-scheduler-all-day-cell {
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-all-day-event,
    .p-scheduler-month-bar {
        position: absolute;
        box-sizing: border-box;
        inset-block-start: calc(var(--p-scheduler-event-row, 0) * dt('scheduler.all.day.row.height'));
        display: flex;
        align-items: center;
        gap: 0.25rem;
        block-size: calc(dt('scheduler.all.day.row.height') - 2px);
        padding-inline: dt('scheduler.event.padding.x');
        border-radius: dt('scheduler.event.border.radius');
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        font-weight: 600;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    /* Las barras del mes arrancan justo debajo de la banda del número. */
    .p-scheduler-month-bar {
        inset-block-start: calc(dt('scheduler.month.cell.padding') + dt('scheduler.month.number.height') + var(--p-scheduler-event-row, 0) * dt('scheduler.all.day.row.height'));
        z-index: 1;
    }

    /* Un evento con hora dentro del mes es punto + título + hora, sin caja: media docena de
       rectángulos rellenos en una celda de 6rem no se leen. */


    .p-scheduler-time-gutter-spacer {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-time-gutter-slot {
        position: relative;
        block-size: dt('scheduler.slot.height');
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        font-variant-numeric: tabular-nums;
    }

    /* La etiqueta va posicionada y con nowrap: si se parte en dos líneas, la franja crece y la
       columna de horas deja de cuadrar con la rejilla — que es exactamente lo que pasaba. */
    .p-scheduler-time-gutter-label {
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0.5rem;
        transform: translateY(-50%);
        white-space: nowrap;
    }

    .p-scheduler-time-gutter-slot:first-child .p-scheduler-time-gutter-label {
        transform: none;
    }

    .p-scheduler-time-grid-column {
        position: relative;
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    /* El rayado va por encima del fondo de la celda (comercial o no) y por debajo de los eventos,
       igual que el tinte de hoy: son dos hechos distintos sobre la misma celda y los dos tienen que
       poder verse. */
    .p-scheduler-time-grid-cell[data-blocked],
    .p-scheduler-timeline-cell[data-blocked] {
        background-image: dt('scheduler.blocked.background');
        cursor: not-allowed;
    }

    /* Tinte de la columna entera, no solo de su cabecera: es lo que deja localizar hoy sin leer.
       Va en un ::before por encima de las celdas y NO como fondo de la columna: las celdas pintan su
       propio fondo (horario comercial o no) y tapaban el tinte de la columna que tienen detrás. El
       token es translúcido, así que el sombreado de debajo se sigue viendo, y los eventos —que son
       hermanos posicionados posteriores— quedan por encima. */
    .p-scheduler-time-grid-column[data-today]::before {
        content: '';
        position: absolute;
        inset: 0;
        background: dt('scheduler.today.background');
        pointer-events: none;
    }

    .p-scheduler-time-grid-cell {
        block-size: dt('scheduler.slot.height');
        border-bottom: 1px dashed dt('scheduler.border.color');
    }

    .p-scheduler-time-grid-cell[data-major] {
        border-bottom-style: solid;
    }

    /* El sombreado de fuera de horario solo entra si la página CONFIGURÓ horario comercial: sin la
       condición, una rejilla sin horario definido salía entera del color de "no laborable", que es
       lo contrario de lo que dice. */
    .p-scheduler-time-grid-cell[data-business] {
        background: dt('scheduler.business.background');
    }

    .p-scheduler-time-grid[data-business-hours] .p-scheduler-time-grid-cell:not([data-business]) {
        background: dt('scheduler.non.business.background');
    }

    .p-scheduler-time-grid-event {
        position: absolute;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 0.0625rem;
        min-block-size: 1.25rem;
        padding: 0.1875rem 0.375rem;
        border-radius: dt('scheduler.event.border.radius');
        /* El acento tiñe el relleno Y pinta el borde: el fondo sale del propio color del evento a
           baja opacidad con color-mix, no de un token fijo, para que cada categoría se distinga. */
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        line-height: 1.25;
        cursor: pointer;
        overflow: hidden;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-title {
        font-weight: 600;
    }

    /* min-inline-size: 0 es imprescindible para que el ellipsis funcione dentro de un flex; sin
       ello el título fuerza el ancho y el evento desborda en vez de recortarse. */
    .p-scheduler-time-grid-event > * {
        min-inline-size: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-time-grid-event[data-selected],
    .p-scheduler-month-event[data-selected],
    .p-scheduler-agenda-event[data-selected] {
        box-shadow: 0 0 0 2px dt('scheduler.focus.ring.color');
    }

    .p-scheduler-time-grid-event[data-continues-before] {
        border-start-start-radius: 0;
        border-start-end-radius: 0;
    }

    .p-scheduler-time-grid-event[data-continues-after] {
        border-end-start-radius: 0;
        border-end-end-radius: 0;
    }

    .p-scheduler-event-time {
        flex: 0 0 auto;
        font-size: dt('scheduler.event.time.font.size');
        font-variant-numeric: tabular-nums;
        color: dt('scheduler.gutter.color');
    }



    .p-scheduler-event-title {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* El anillo de foco de una celda vacía va por DENTRO: una celda de la rejilla horaria mide
       28px de alto y un outline por fuera lo tapa la celda siguiente. Sin esto, navegar con las
       flechas mueve un foco invisible, que es peor que no navegar. */
    [data-nav-cell]:focus-visible {
        outline: 0;
        box-shadow: inset 0 0 0 2px dt('scheduler.focus.ring.color');
        z-index: 1;
    }

    /* ── Huecos de cita ───────────────────────────────────────────────────── */

    /* Detrás de los eventos (z-index por debajo, sin puntero salvo el clic) y con el color de
       "disponible" del tema. Un hueco lleno se raya como un bloqueo, porque para reservar es lo
       mismo. */
    .p-scheduler-appointment-slot {
        position: absolute;
        inset-inline: 0;
        z-index: 0;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 0.0625rem 0.25rem;
        background: dt('scheduler.slot.available.background');
        border-block: 1px solid color-mix(in srgb, dt('scheduler.accent.color') 35%, transparent);
        font-size: dt('scheduler.event.time.font.size');
        color: dt('scheduler.gutter.color');
        cursor: pointer;
    }

    .p-scheduler-appointment-slot[data-full] {
        background-image: dt('scheduler.blocked.background');
        cursor: not-allowed;
    }

    /* data-display=grid tiñe el hueco de la celda entera sin borde ni etiqueta: es para cuando lo que importa
       es la mancha y no el detalle. */
    .p-scheduler-appointment-slot[data-display='grid'] {
        border-block: 0;
    }

    .p-scheduler-appointment-slot[data-display='grid'] .p-scheduler-appointment-slot-label {
        display: none;
    }

    /* data-display=indicator no tiñe nada: una barra de 3px en el borde de la columna, para una rejilla
       demasiado densa como para pintarle fondos. */
    .p-scheduler-appointment-slot[data-display='indicator'] {
        inset-inline: auto 0;
        inline-size: 3px;
        padding: 0;
        border-block: 0;
        background: dt('scheduler.accent.color');
    }

    .p-scheduler-appointment-slot[data-display='indicator'] .p-scheduler-appointment-slot-label {
        display: none;
    }

    /* ── Arrastre y redimensión ───────────────────────────────────────────── */

    /* touch-action: none en la superficie arrastrable y no en el contenedor: sin ello, un arrastre
       con el dedo lo interpreta el navegador como scroll y el evento no se mueve; ponerlo más arriba
       mataría el scroll de la rejilla entera. */
    /* user-select: none en lo arrastrable, y en TODO el Scheduler mientras hay un arrastre en curso:
       en macOS el gesto empezaba una selección de texto, y a partir de ahí el navegador arrastra la
       selección en vez de dejar que el componente siga el puntero. */
    [data-draggable],
    .p-scheduler-event-resize-handle {
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
    }

    [data-draggable] {
        cursor: grab;
    }

    .p-scheduler[data-interacting] {
        user-select: none;
        -webkit-user-select: none;
    }

    [data-dragging],
    [data-resizing] {
        z-index: 4;
        cursor: grabbing;
        opacity: 0.85;
        box-shadow: 0 4px 12px -6px rgba(0, 0, 0, 0.5);
    }

    /* El tirador es una franja de 6px sobre el borde del evento. No lleva fondo: se nota por el
       cursor, y un asa visible en cada cita llena la rejilla de ruido. */
    .p-scheduler-event-resize-handle {
        position: absolute;
        z-index: 3;
        touch-action: none;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-resize-handle {
        inset-inline: 0;
        block-size: 6px;
        cursor: ns-resize;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-resize-handle[data-edge='start'] {
        inset-block-start: 0;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-resize-handle[data-edge='end'] {
        inset-block-end: 0;
    }

    .p-scheduler-timeline-event .p-scheduler-event-resize-handle {
        inset-block: 0;
        inline-size: 6px;
        cursor: ew-resize;
    }

    .p-scheduler-timeline-event .p-scheduler-event-resize-handle[data-edge='start'] {
        inset-inline-start: 0;
    }

    .p-scheduler-timeline-event .p-scheduler-event-resize-handle[data-edge='end'] {
        inset-inline-end: 0;
    }

    .p-scheduler-now-indicator {
        position: absolute;
        inset-inline: 0;
        z-index: 2;
        block-size: 0;
        border-top: 2px solid dt('scheduler.now.indicator.color');
        pointer-events: none;
    }

    .p-scheduler-now-indicator::before {
        content: '';
        position: absolute;
        inset-block-start: -0.25rem;
        inset-inline-start: 0;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: dt('scheduler.now.indicator.color');
    }

    /* ── Rejilla de mes ───────────────────────────────────────────────────── */

    .p-scheduler-month {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }

    .p-scheduler-month-header {
        display: grid;
        grid-template-columns: repeat(7, minmax(dt('scheduler.month.day.min.width'), 1fr));
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    /* Los mismos separadores que el cuerpo, menos el primero: sin ellos la fila de días de la
       semana flotaba sobre una rejilla que sí los lleva. */
    .p-scheduler-month-header-cell + .p-scheduler-month-header-cell {
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-month-header-cell {
        padding: 0.5rem;
        font-size: dt('scheduler.gutter.font.size');
        font-weight: 600;
        letter-spacing: 0.06em;
        color: dt('scheduler.gutter.color');
        text-align: center;
    }

    .p-scheduler-month-body {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .p-scheduler-month-week {
        position: relative;
        display: grid;
        grid-template-columns: repeat(7, minmax(dt('scheduler.month.day.min.width'), 1fr));
        flex: 1;
        min-height: calc(dt('scheduler.month.cell.min.height') + var(--p-scheduler-month-rows, 1) * dt('scheduler.all.day.row.height'));
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-all-day-event {
        z-index: 1;
    }

    .p-scheduler-month-cell {
        display: flex;
        flex-direction: column;
        padding: dt('scheduler.month.cell.padding');
        border-inline-start: 1px solid dt('scheduler.border.color');
        cursor: pointer;
    }

    .p-scheduler-month-cell:hover {
        background: dt('scheduler.day.hover.background');
    }

    .p-scheduler-month-cell[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
    }

    .p-scheduler-month-cell[data-weekend] {
        background: dt('scheduler.weekend.background');
    }

    .p-scheduler-month-cell[data-other-month] {
        background: dt('scheduler.other.month.background');
        color: dt('scheduler.other.month.color');
    }

    .p-scheduler-month-cell[data-selected] {
        background: dt('scheduler.selected.background');
        color: dt('scheduler.selected.color');
    }

    /* Banda de altura fija para el número: es la que reservan los eventos de debajo, así que su
       alto NO puede depender del contenido o las barras se le montarían encima. */
    .p-scheduler-month-cell-number {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        block-size: dt('scheduler.month.number.height');
        font-size: dt('scheduler.month.number.font.size');
        font-weight: 600;
    }

    .p-scheduler-month-cell[data-today] .p-scheduler-month-cell-number {
        /* Aquí sí va el relleno sólido, con su color de contraste: marcar el día, no invertir la
           celda entera. */
        inline-size: dt('scheduler.month.number.height');
        justify-content: center;
        border-radius: 999px;
        background: dt('scheduler.today.badge.background');
        color: dt('scheduler.today.badge.color');
        font-weight: 600;
    }

    /* Hoy NO tiñe la celda del mes: el círculo del número ya lo dice y el tinte pelearía con el
       relleno de los eventos. En la rejilla horaria sí, porque ahí no hay número. */
    .p-scheduler-month-cell[data-today] {
        background: transparent;
    }

    .p-scheduler-month-day-cell {
        display: flex;
        flex-direction: column;
        gap: 0.0625rem;
        flex: 1;
        min-height: 0;
    }

    /* Un evento de un día es una fila DENTRO de la celda, no una barra posicionada: como barra
       medía 2h/168h de la semana, o sea 7px, y solo se veía el punto. */
    .p-scheduler-month-event {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        inline-size: 100%;
        min-block-size: dt('scheduler.all.day.row.height');
        padding-inline: 0.125rem;
        border: 0;
        border-radius: dt('scheduler.event.border.radius');
        background: transparent;
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        text-align: start;
        cursor: pointer;
        overflow: hidden;
    }

    .p-scheduler-month-event:hover {
        background: dt('scheduler.day.hover.background');
    }

    .p-scheduler-month-event .p-scheduler-event-title {
        flex: 0 1 auto;
        min-inline-size: 0;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-month-event .p-scheduler-event-time {
        margin-inline-start: auto;
        white-space: nowrap;
    }

    /* La lista de la celda empieza por debajo de las barras que pisan ESE día. */
    .p-scheduler-month-day-cell {
        margin-block-start: calc(var(--p-scheduler-bar-rows, 0) * dt('scheduler.all.day.row.height'));
    }

    .p-scheduler-event-dot {
        flex: 0 0 auto;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: dt('scheduler.event.border.accent');
    }

    /* Justo debajo del último evento y no al fondo de la celda: con margin-top:auto el enlace se
       despegaba de la lista que resume y quedaba flotando en el hueco. */
    .p-scheduler-month-more-link {
        align-self: flex-start;
        padding: 0 0.25rem;
        border: 0;
        background: transparent;
        color: dt('scheduler.more.link.color');
        font-size: dt('scheduler.event.font.size');
        cursor: pointer;
    }

    /* Cabecera de un grid de mes por recurso, y la etiqueta de recurso dentro de una celda. */
    .p-scheduler-month-resource-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('scheduler.resource.area.row.padding');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        font-weight: 600;
    }

    /* Los grids apilados necesitan una raya entre ellos, o el último día de uno y el primero del
       siguiente se leen como la misma rejilla. */
    .p-scheduler-view-month .p-scheduler-month + .p-scheduler-month {
        border-top: 2px solid dt('scheduler.border.color');
    }

    .p-scheduler-month-resource-group {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding-inline: 0.125rem;
        font-size: dt('scheduler.event.time.font.size');
        color: dt('scheduler.gutter.color');
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
        overflow: hidden;
    }

    /* ── Agenda ───────────────────────────────────────────────────────────── */

    .p-scheduler-agenda {
        display: flex;
        flex-direction: column;
    }

    .p-scheduler-agenda-date-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('scheduler.agenda.header.padding');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        position: sticky;
        top: 0;
    }

    .p-scheduler-agenda-heading {
        display: flex;
        flex-direction: column;
    }

    .p-scheduler-agenda-date-header[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
    }

    .p-scheduler-agenda-day {
        font-size: dt('scheduler.gutter.font.size');
        font-weight: 700;
        letter-spacing: 0.06em;
        color: dt('scheduler.accent.color');
    }

    .p-scheduler-agenda-date {
        font-weight: 600;
    }

    .p-scheduler-agenda-count {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-inline-start: auto;
        min-inline-size: 1.5rem;
        block-size: 1.5rem;
        padding-inline: 0.375rem;
        border: 1px solid dt('scheduler.border.color');
        border-radius: 999px;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        font-variant-numeric: tabular-nums;
    }

    /* La fila es gutter + tarjeta, no una sola caja: el acento pegado al borde del contenedor se
       leía como un borde del panel, y la lista quedaba desalineada respecto al gutter horario de
       las vistas de día y semana.
       Y ninguna de las dos lleva borde: con una línea bajo la fila y otra al lado del gutter, la
       agenda se leía como una tabla de celdas vacías. Lo que separa las citas es el aire entre
       tarjetas, y lo que separa los días es la cabecera pegajosa. */
    .p-scheduler-agenda-row {
        display: grid;
        grid-template-columns: dt('scheduler.agenda.gutter.width') minmax(0, 1fr);
    }

    .p-scheduler-agenda-event {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block: 0.25rem;
        margin-inline-end: 0.5rem;
        padding: dt('scheduler.agenda.row.padding');
        border-start-end-radius: dt('scheduler.event.border.radius');
        border-end-end-radius: dt('scheduler.event.border.radius');
        /* Mismo relleno teñido que el evento de la rejilla: en la agenda el color de la categoría
           es la única pista de qué es cada cita, porque no hay geometría que la sitúe. */
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        cursor: pointer;
    }

    .p-scheduler-agenda-event:hover {
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) calc(dt('scheduler.event.fill.opacity') + 8%), dt('scheduler.background'));
    }

    .p-scheduler-agenda-event .p-scheduler-event-title {
        min-inline-size: 0;
    }

    /* Al final de la fila y no pegada al título: la hora es un dato de apoyo y en una columna
       propia se puede recorrer la lista en vertical leyendo solo horas. */
    .p-scheduler-agenda-event-time {
        flex: 0 0 auto;
        margin-inline-start: auto;
        font-variant-numeric: tabular-nums;
        color: dt('scheduler.gutter.color');
        font-size: dt('scheduler.event.time.font.size');
    }

    .p-scheduler-agenda-empty,
    .p-scheduler-view-unavailable {
        padding: 3rem 1rem;
        text-align: center;
        color: dt('scheduler.gutter.color');
    }

    /* ── Año: doce minimeses ──────────────────────────────────────────────── */

    /* auto-fill sobre el ancho mínimo de la tarjeta y no cuatro columnas fijas: con cuatro fijas,
       un panel de 730px dejaba el minimes en 150px y la celda del día en 19px, o sea los números
       tocándose. Así el año pone las columnas que caben —cuatro en pantalla ancha, tres en una
       tarjeta de documentación, una en el móvil— y la celda del día no baja nunca de tamaño
       legible. Sustituye al media query que había: el umbral lo pone el contenido, no el viewport,
       que es lo que importa cuando el Scheduler vive dentro de un panel. */
    .p-scheduler-year {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(dt('scheduler.mini.month.min.width'), 1fr));
        gap: dt('scheduler.mini.month.gap');
        padding: dt('scheduler.mini.month.gap');
        overflow: auto;
    }

    /* Sin padding en la tarjeta: lo llevan la cabecera y la rejilla. Con padding aquí el interior
       perdía 24px de ancho y el minimes salía apretado respecto a la referencia. */
    .p-scheduler-mini-month {
        display: flex;
        flex-direction: column;
        border: 1px solid dt('scheduler.border.color');
        border-radius: dt('scheduler.mini.month.border.radius');
        overflow: hidden;
    }

    .p-scheduler-mini-month-header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: dt('scheduler.mini.month.padding');
        /* Separador bajo el nombre del mes: sin él la cabecera y la rejilla se leen como un bloque
           y el minimes pierde el aire que lo hace parecer un calendario. */
        border-bottom: 1px solid dt('scheduler.border.color');
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
    }

    /* Columnas a 1fr: ocupan TODO el ancho de la tarjeta. Clavarlas al tamaño del día dejaba la
       rejilla más estrecha que la tarjeta y descentrada respecto a la cabecera. */
    .p-scheduler-mini-month-grid {
        display: grid;
        /* minmax(0,1fr) y no 1fr a secas: 1fr equivale a minmax(auto,1fr) y el ancho mínimo del
           número ensancha la columna, así que las siete sumaban más que la tarjeta. Con 0 dividen
           exacto. OJO: nada de acentos graves en estos comentarios, cierran el template literal. */
        grid-template-columns: repeat(7, minmax(0, 1fr));
        padding-block-start: dt('scheduler.mini.month.grid.padding');
    }

    .p-scheduler-mini-month-weekday {
        display: flex;
        align-items: center;
        justify-content: center;
        block-size: dt('scheduler.mini.month.day.size');
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-mini-month-day {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        /* Celda CUADRADA: el ancho lo pone la columna (1fr del ancho de la tarjeta) y aspect-ratio
           iguala el alto. Con un block-size fijo la celda salía rectangular y el badge de hoy, un
           óvalo. El min-block-size solo entra en tarjetas muy estrechas, donde 1fr baja del tamaño
           legible del número. */
        aspect-ratio: 1;
        min-block-size: dt('scheduler.mini.month.day.size');
        border: 0;
        /* Radio al 50%: sobre una celda cuadrada da un círculo exacto, tanto en hover como en el
           día de hoy. */
        border-radius: 50%;
        padding: 0;
        background: transparent;
        color: inherit;
        font-size: dt('scheduler.mini.month.font.size');
        line-height: 1;
        font-variant-numeric: tabular-nums;
        cursor: pointer;
    }

    .p-scheduler-mini-month-day:hover {
        background: dt('scheduler.day.hover.background');
    }

    /* El fin de semana con su propio color: en una rejilla de 17px sin cabecera visible es lo que
       deja encontrar el sábado sin contar columnas. No se aplica al mes ajeno, que ya va atenuado, ni
       a hoy, que lleva su círculo. */
    .p-scheduler-mini-month-day-weekend:not(.p-scheduler-mini-month-day-other):not([data-today]) {
        color: dt('scheduler.mini.month.weekend.color');
    }

    /* Vacía pero cuadrada como las demás: solo ocupa su hueco en la rejilla para que el mes empiece
       en su columna correcta y las seis filas midan igual en los doce minimeses. */
    .p-scheduler-mini-month-day-other {
        color: dt('scheduler.other.month.color');
        pointer-events: none;
    }

    /* :not(-other) porque la rejilla es de 42 días fijos y arrastra días del mes siguiente: sin el
       filtro, el 8 de septiembre pintaba también su círculo en la tarjeta de agosto, en una celda
       vacía. */
    .p-scheduler-mini-month-day[data-selected]:not([data-today]):not(.p-scheduler-mini-month-day-other) {
        background: dt('scheduler.selected.background');
        color: dt('scheduler.selected.color');
    }

    .p-scheduler-mini-month-day[data-today]:not(.p-scheduler-mini-month-day-other) {
        background: dt('scheduler.today.badge.background');
        color: dt('scheduler.today.badge.color');
        font-weight: 600;
    }

    /* El indicador va DEBAJO del número, no al lado: a este tamaño un punto en línea empuja la
       cifra y descuadra la rejilla del minimes. El offset va en % y no en px porque la celda crece
       con el ancho de la tarjeta, y 1px fijo lo pegaba al borde del círculo. */
    .p-scheduler-mini-month-indicator {
        position: absolute;
        inset-block-end: 12%;
        inline-size: 0.25rem;
        block-size: 0.25rem;
        border-radius: 50%;
        background: var(--p-scheduler-mini-month-indicator-background, dt('scheduler.accent.color'));
    }

    .p-scheduler-mini-month-day[data-today] .p-scheduler-mini-month-indicator {
        background: currentColor;
    }

    /* ── Timeline: el día en horizontal ───────────────────────────────────── */

    .p-scheduler-timeline {
        display: flex;
        min-height: 0;
        overflow: hidden;
    }

    /* El carril de recursos va sticky y NO en su propio scroller: dos scrollers en paralelo hay que
       sincronizarlos a mano y se desfasan en cuanto algo más mueve la página. */
    .p-scheduler-resource-area {
        position: sticky;
        inset-inline-start: 0;
        z-index: 2;
        flex: 0 0 dt('scheduler.resource.area.width');
        inline-size: dt('scheduler.resource.area.width');
        background: dt('scheduler.resource.area.background');
        border-inline-end: 1px solid dt('scheduler.border.color');
    }

    /* El hueco sobre el carril mide lo que mida la cabecera del eje: las bandas de contexto que
       tenga la escala más la fila de columnas. Con un 3 fijo, un timeline de mes —que solo lleva la
       banda del periodo— dejaba el carril desplazado una banda entera. */
    .p-scheduler-timeline-resource .p-scheduler-resource-area-header {
        block-size: calc((var(--p-scheduler-timeline-tiers, 0) + 1) * dt('scheduler.timeline.header.height'));
    }

    .p-scheduler-resource-area-header {
        display: flex;
        align-items: center;
        block-size: dt('scheduler.timeline.header.height');
        padding: dt('scheduler.resource.area.header.padding');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        font-weight: 600;
    }

    .p-scheduler-resource {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-block-size: calc(var(--p-scheduler-timeline-rows, 1) * dt('scheduler.resource.area.row.height'));
        padding: dt('scheduler.resource.area.row.padding');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-resource-dot {
        flex: 0 0 auto;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: dt('scheduler.event.border.accent');
    }

    .p-scheduler-resource-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .p-scheduler-resource-count {
        margin-inline-start: auto;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        font-variant-numeric: tabular-nums;
    }

    .p-scheduler-timeline-scroll {
        flex: 1;
        min-inline-size: 0;
        overflow: auto;
    }

    .p-scheduler-timeline-header,
    .p-scheduler-timeline-cells {
        display: grid;
        grid-template-columns: repeat(var(--p-scheduler-timeline-cols, 1), minmax(dt('scheduler.timeline.slot.width'), 1fr));
    }

    /* Las bandas comparten la plantilla de columnas del eje, y cada celda abarca las que le tocan
       con grid-column: span. Es lo único que las mantiene cuadradas con las horas cuando el eje
       mide 168 columnas y hay scroll horizontal. */
    .p-scheduler-timeline-tier {
        display: grid;
        grid-template-columns: repeat(var(--p-scheduler-timeline-cols, 1), minmax(dt('scheduler.timeline.slot.width'), 1fr));
        position: sticky;
        inset-block-start: calc(var(--p-scheduler-timeline-tier-index, 0) * dt('scheduler.timeline.header.height'));
        z-index: 1;
    }

    /* SIN overflow: hidden. La etiqueta de dentro es pegajosa, y un ancestro con overflow recortado
       se convierte en su contenedor de scroll: la etiqueta se quedaba pegada al borde izquierdo de su
       propia celda —varias pantallas a la izquierda— en vez de al del eje, y la banda salía vacía. */
    .p-scheduler-timeline-tier-cell {
        grid-column: span var(--p-scheduler-timeline-span, 1);
        display: flex;
        align-items: center;
        block-size: dt('scheduler.timeline.header.height');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        white-space: nowrap;
    }

    /* Pegajosa dentro de su propia celda: mientras el periodo siga a la vista, su nombre sigue a la
       vista, aunque la celda empiece varias pantallas a la izquierda. */
    .p-scheduler-timeline-tier-label {
        position: sticky;
        inset-inline-start: 0;
        max-inline-size: 100%;
        padding-inline: 0.5rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-timeline-tier-cell + .p-scheduler-timeline-tier-cell {
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-timeline-tier[data-tier='period'] .p-scheduler-timeline-tier-cell {
        font-weight: 600;
    }

    .p-scheduler-timeline-tier[data-tier='day'] .p-scheduler-timeline-tier-cell {
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-timeline-tier-cell[data-today],
    .p-scheduler-timeline-header-cell[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
        font-weight: 600;
    }

    /* Pegada por debajo de las bandas, no en 0: si no, al hacer scroll vertical la fila de columnas
       se monta encima del periodo. */
    .p-scheduler-timeline-header {
        position: sticky;
        inset-block-start: calc(var(--p-scheduler-timeline-tiers, 0) * dt('scheduler.timeline.header.height'));
        z-index: 1;
        block-size: dt('scheduler.timeline.header.height');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-timeline-header-cell {
        display: flex;
        align-items: center;
        padding-inline: 0.375rem;
        border-inline-start: 1px solid dt('scheduler.border.color');
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        white-space: nowrap;
    }

    /* El carril mide lo mismo que el eje —no lo que el contenedor—, porque el ancho del evento va
       en % y se resuelve contra su padre posicionado. Sin esto un evento de 4 h se pintaba a un
       tercio de su tamaño en cuanto el timeline necesitaba scroll. */
    .p-scheduler-timeline-lane,
    .p-scheduler-timeline-header,
    .p-scheduler-timeline-tier {
        inline-size: max(100%, calc(var(--p-scheduler-timeline-cols, 1) * dt('scheduler.timeline.slot.width')));
    }

    .p-scheduler-timeline-lane {
        position: relative;
        min-block-size: calc(var(--p-scheduler-timeline-rows, 1) * dt('scheduler.timeline.row.height'));
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-timeline-cells {
        position: absolute;
        inset: 0;
    }

    .p-scheduler-timeline-cell {
        border-inline-start: 1px dashed dt('scheduler.border.color');
    }

    .p-scheduler-timeline-cell[data-major] {
        border-inline-start-style: solid;
    }

    /* Hoy se tiñe también en horizontal: es la única pista de dónde cae el día actual cuando el eje
       abarca una semana, un mes o un año y hay que buscarlo con scroll. */
    .p-scheduler-timeline-cell[data-today] {
        background: dt('scheduler.today.background');
    }

    .p-scheduler-timeline-event {
        position: absolute;
        box-sizing: border-box;
        inset-block-start: calc(var(--p-scheduler-event-row, 0) * dt('scheduler.timeline.row.height') + (dt('scheduler.timeline.row.height') - dt('scheduler.timeline.event.height')) / 2);
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0;
        block-size: dt('scheduler.timeline.event.height');
        padding-inline: dt('scheduler.event.padding.x');
        border-radius: dt('scheduler.timeline.event.border.radius');
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
    }

    .p-scheduler-timeline-event .p-scheduler-event-title {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-timeline-empty {
        padding: 3rem 1rem;
        text-align: center;
        color: dt('scheduler.gutter.color');
    }

    /* ── Leyenda, selección y carga ───────────────────────────────────────── */

    .p-scheduler-category-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        padding: dt('scheduler.legend.padding');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-category-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.125rem 0.5rem;
        border: 1px solid dt('scheduler.border.color');
        border-radius: 999px;
        background: dt('scheduler.category.legend.item.background');
        cursor: pointer;
    }

    .p-scheduler-category-legend-item:not([data-selected]) {
        opacity: 0.45;
    }

    .p-scheduler-category-legend-swatch {
        inline-size: 0.625rem;
        block-size: 0.625rem;
        border-radius: 50%;
    }

    .p-scheduler-category-legend-count {
        font-variant-numeric: tabular-nums;
        color: dt('scheduler.category.legend.count.color');
    }

    .p-scheduler-selection-toolbar:not([data-selection-active]) {
        display: none;
    }

    .p-scheduler-selection-toolbar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('scheduler.legend.padding');
        background: dt('scheduler.selected.background');
    }

    .p-scheduler-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    /* ── Overlays ─────────────────────────────────────────────────────────── */

    .p-scheduler-more-popover-panel,
    .p-scheduler-overlay-panel {
        position: absolute;
        z-index: 1000;
        min-inline-size: 12rem;
        max-inline-size: 22rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        background: dt('scheduler.background');
        color: dt('scheduler.color');
        border: 1px solid dt('scheduler.border.color');
        border-radius: dt('scheduler.border.radius');
        box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.4);
    }

    .p-scheduler-more-popover-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        font-weight: 600;
    }

    .p-scheduler-more-popover-close {
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 1.125rem;
        line-height: 1;
    }

    .p-scheduler-more-popover-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.375rem;
        border: 0;
        border-radius: dt('scheduler.event.border.radius');
        background: transparent;
        color: inherit;
        text-align: start;
        cursor: pointer;
    }

    .p-scheduler-more-popover-item:hover {
        background: dt('scheduler.event.hover.background');
    }

    .p-scheduler-overlay-title {
        font-weight: 600;
    }

    .p-scheduler-overlay-time {
        font-size: dt('scheduler.event.time.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-overlay-actions {
        display: flex;
        gap: 0.375rem;
    }

    .p-scheduler-disabled {
        pointer-events: none;
        opacity: 0.6;
    }

    /* ── Impresión ────────────────────────────────────────────────────────── */

    /* Un Scheduler impreso no tiene scroll ni cabeceras pegajosas: lo que en pantalla es una ventana
       con desplazamiento, en papel es todo el contenido de una vez. Sin esto se imprime el trozo
       visible y nada más, que es el fallo clásico de imprimir un calendario. */
    @media print {
        .p-scheduler {
            border: 0;
            block-size: auto !important;
            max-block-size: none !important;
        }

        .p-scheduler-content,
        .p-scheduler-timeline,
        .p-scheduler-timeline-scroll,
        .p-scheduler-year {
            overflow: visible !important;
        }

        /* Pegajoso en papel no significa nada, y encima superpone la cabecera sobre el contenido de
           la primera página. */
        .p-scheduler-time-grid-header,
        .p-scheduler-time-grid-groups,
        .p-scheduler-timeline-header,
        .p-scheduler-timeline-tier,
        .p-scheduler-resource-area,
        .p-scheduler-agenda-date-header {
            position: static !important;
        }

        /* Los controles no se pueden pulsar en una hoja. */
        .p-scheduler-navigation,
        .p-scheduler-view-selector,
        .p-scheduler-event-resize-handle,
        .p-scheduler-month-more-link,
        .p-scheduler-more-popover,
        .p-scheduler-quick-info,
        .p-scheduler-popover,
        .p-scheduler-context-menu,
        .p-scheduler-selection-toolbar {
            display: none !important;
        }

        /* Una semana, un día de agenda o un carril de recurso partidos entre dos páginas son
           ilegibles: es la unidad que hay que mantener entera. */
        .p-scheduler-month-week,
        .p-scheduler-agenda-group,
        .p-scheduler-resource,
        .p-scheduler-timeline-lane {
            break-inside: avoid;
        }

        /* El color ES el dato: sin esto el navegador imprime los rellenos de categoría en blanco y
           todos los eventos pasan a ser el mismo evento. */
        .p-scheduler,
        .p-scheduler * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }

    /* Sin motion para quien lo pida: el indicador de "ahora" y los hovers no necesitan animación. */
    @media (prefers-reduced-motion: reduce) {
        .p-scheduler * {
            transition: none !important;
            animation: none !important;
        }
    }
`;
