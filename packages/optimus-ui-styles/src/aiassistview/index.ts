export const style = /*css*/ `
    .p-aiassistview {
        display: flex;
        flex-direction: column;
        position: relative;
        min-height: 0;
        height: 100%;
        overflow: hidden;
        background: dt('aiassistview.background');
        color: dt('aiassistview.color');
        border: 1px solid dt('aiassistview.border.color');
        border-radius: dt('aiassistview.border.radius');
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        /* The transcript sizes itself against the surface, not the viewport: an assistant docked in a
           drawer and one filling a page are the same component at different container widths. */
        container-type: inline-size;
        container-name: aiassistview;
    }

    .p-aiassistview:focus,
    .p-aiassistview:focus-visible {
        outline: none;
    }

    .p-aiassistview-disabled {
        pointer-events: none;
        opacity: dt('aiassistview.disabled.opacity');
    }

    /* ---------------------------------------------------------------------------------------------
       Header and footer bands
       ------------------------------------------------------------------------------------------ */

    /* The header IS a Toolbar, so it brings its own padding, border colour and background. All that is
       left is turning its free-standing box into a band: no side or top border, no corners.
       The root class is part of the selector deliberately — a bare .p-aiassistview-header ties on
       specificity with .p-toolbar, and the Toolbar's own stylesheet is injected second, so the tie
       goes to the box. */
    .p-aiassistview .p-aiassistview-header {
        flex: 0 0 auto;
        border-inline: 0 none;
        border-block-start: 0 none;
        border-radius: 0;
        gap: dt('aiassistview.header.gap');
    }

    .p-aiassistview-header-start {
        display: flex;
        align-items: center;
        gap: dt('aiassistview.header.gap');
        min-width: 0;
    }

    .p-aiassistview-title {
        font-weight: dt('aiassistview.header.font.weight');
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* The switcher's tablist draws its own bottom border; inside a toolbar that border sits a few
       pixels above the toolbar's own and reads as a double rule. */
    .p-aiassistview .p-aiassistview-header .p-tablist,
    .p-aiassistview .p-aiassistview-header .p-tablist-tab-list {
        border: 0 none;
        background: transparent;
    }

    .p-aiassistview-footer {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.footer.gap');
        flex: 0 0 auto;
        padding: dt('aiassistview.footer.padding');
        border-block-start: 1px solid dt('aiassistview.footer.border.color');
        background: dt('aiassistview.footer.background');
    }

    .p-aiassistview-footer-inner {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.footer.gap');
        inline-size: 100%;
        max-inline-size: dt('aiassistview.content.max.width');
        margin-inline: auto;
    }

    /* ---------------------------------------------------------------------------------------------
       Transcript
       ------------------------------------------------------------------------------------------ */

    .p-aiassistview-body {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
    }

    .p-aiassistview-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        padding: dt('aiassistview.content.padding');
        scroll-behavior: smooth;
        scrollbar-width: thin;
        scrollbar-color: dt('aiassistview.scrollbar.thumb.color') transparent;
    }

    @media (prefers-reduced-motion: reduce) {
        .p-aiassistview-content {
            scroll-behavior: auto;
        }
    }

    .p-aiassistview-content::-webkit-scrollbar {
        inline-size: 0.5rem;
    }

    .p-aiassistview-content::-webkit-scrollbar-thumb {
        background: dt('aiassistview.scrollbar.thumb.color');
        border-radius: dt('aiassistview.border.radius');
    }

    .p-aiassistview-content:focus-visible {
        outline: dt('aiassistview.focus.ring.width') dt('aiassistview.focus.ring.style') dt('aiassistview.focus.ring.color');
        outline-offset: calc(-1 * dt('aiassistview.focus.ring.width'));
    }

    .p-aiassistview-turns {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.turn.gap');
        max-inline-size: dt('aiassistview.content.max.width');
        margin-inline: auto;
    }

    .p-aiassistview-turn {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.turn.inner.gap');
    }

    /* A message is a row of a list, the way a comment thread or a timeline entry is: avatar, author,
       body. Not a chat bubble — a tinted lozenge would fight every panel, table and code sample the
       answer itself contains, and there is no bubble anywhere else in the library to match. */
    .p-aiassistview-message {
        display: flex;
        align-items: flex-start;
        gap: dt('aiassistview.message.gap');
    }

    /* The avatar must not be a shrinkable flex item: the body grows to fill the row, and without this
       the avatar is squeezed to a sliver on one side and not on the other. */
    .p-aiassistview-avatar {
        flex: 0 0 auto;
    }

    .p-aiassistview-avatar-assistant {
        background: dt('aiassistview.avatar.assistant.background');
        color: dt('aiassistview.avatar.assistant.color');
    }

    .p-aiassistview-message-body {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.message.inner.gap');
        min-width: 0;
        flex: 1 1 auto;
    }

    .p-aiassistview-author {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        font-weight: 600;
        font-size: dt('aiassistview.author.font.size');
        letter-spacing: 0.01em;
        color: dt('aiassistview.author.color');
    }

    .p-aiassistview-timestamp {
        font-weight: 400;
        font-size: dt('aiassistview.timestamp.font.size');
        color: dt('aiassistview.muted.color');
        font-variant-numeric: tabular-nums;
    }

    .p-aiassistview-prompt-content,
    .p-aiassistview-response-content {
        line-height: dt('aiassistview.line.height');
        overflow-wrap: anywhere;
        min-width: 0;
    }

    .p-aiassistview-prompt-text {
        margin: 0;
        white-space: pre-wrap;
    }

    /* The bubble layout is kept for products that want the familiar chat shape. It is the opt-in, not
       the default. */
    .p-aiassistview-bubble .p-aiassistview-message-prompt {
        flex-direction: row-reverse;
    }

    .p-aiassistview-bubble .p-aiassistview-message-prompt .p-aiassistview-message-body {
        align-items: flex-end;
        flex: 0 1 auto;
        max-inline-size: dt('aiassistview.prompt.max.width');
    }

    .p-aiassistview-bubble .p-aiassistview-author {
        display: none;
    }

    .p-aiassistview-bubble .p-aiassistview-prompt-content {
        padding: dt('aiassistview.prompt.padding');
        border: 1px solid dt('aiassistview.prompt.border.color');
        border-radius: dt('aiassistview.prompt.border.radius');
        background: dt('aiassistview.prompt.background');
    }

    .p-aiassistview-message-actions {
        display: flex;
        align-items: center;
        gap: dt('aiassistview.toolbar.gap');
        flex-wrap: wrap;
    }

    /* A strip that only appears on hover is invisible to a pointer that never hovers, so on touch and
       under keyboard focus it is always out. */
    .p-aiassistview-actions-on-hover {
        opacity: 0;
        transition: opacity dt('aiassistview.transition.duration');
    }

    .p-aiassistview-message:hover .p-aiassistview-actions-on-hover,
    .p-aiassistview-message:focus-within .p-aiassistview-actions-on-hover {
        opacity: 1;
    }

    @media (hover: none) {
        .p-aiassistview-actions-on-hover {
            opacity: 1;
        }
    }

    .p-aiassistview-response-nav {
        display: inline-flex;
        align-items: center;
        gap: dt('aiassistview.toolbar.gap');
        color: dt('aiassistview.muted.color');
        font-size: dt('aiassistview.meta.font.size');
        font-variant-numeric: tabular-nums;
    }

    .p-aiassistview-usage {
        color: dt('aiassistview.muted.color');
        font-size: dt('aiassistview.meta.font.size');
        font-variant-numeric: tabular-nums;
    }

    .p-aiassistview-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: dt('aiassistview.toolbar.gap');
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .p-aiassistview-attachment-meta {
        color: dt('aiassistview.muted.color');
        font-variant-numeric: tabular-nums;
    }

    .p-aiassistview-attachment-progress {
        inline-size: 4rem;
    }

    .p-aiassistview-citations {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: dt('aiassistview.toolbar.gap');
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .p-aiassistview-citations-label {
        color: dt('aiassistview.muted.color');
        font-size: dt('aiassistview.meta.font.size');
    }

    .p-aiassistview-citation {
        text-decoration: none;
        color: inherit;
    }

    /* ---------------------------------------------------------------------------------------------
       Blocks
       ------------------------------------------------------------------------------------------ */

    .p-aiassistview-blocks {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.block.gap');
        min-width: 0;
    }

    .p-aiassistview-text > :first-child {
        margin-block-start: 0;
    }

    .p-aiassistview-text > :last-child {
        margin-block-end: 0;
    }

    .p-aiassistview-text p {
        margin-block: 0.5em;
    }

    .p-aiassistview-text h1,
    .p-aiassistview-text h2,
    .p-aiassistview-text h3,
    .p-aiassistview-text h4,
    .p-aiassistview-text h5,
    .p-aiassistview-text h6 {
        margin-block: 1em 0.5em;
        font-weight: 600;
        line-height: 1.3;
    }

    .p-aiassistview-text h1 { font-size: 1.375em; }
    .p-aiassistview-text h2 { font-size: 1.25em; }
    .p-aiassistview-text h3 { font-size: 1.125em; }
    .p-aiassistview-text h4,
    .p-aiassistview-text h5,
    .p-aiassistview-text h6 { font-size: 1em; }

    .p-aiassistview-text ul,
    .p-aiassistview-text ol {
        margin-block: 0.5em;
        padding-inline-start: 1.5em;
    }

    .p-aiassistview-text li {
        margin-block: 0.125em;
    }

    .p-aiassistview-text a {
        color: dt('aiassistview.link.color');
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .p-aiassistview-text hr {
        margin-block: 1em;
        border: 0 none;
        border-block-start: 1px solid dt('aiassistview.border.color');
    }

    .p-aiassistview-text code {
        padding: 0.125em 0.375em;
        border-radius: dt('aiassistview.code.inline.border.radius');
        background: dt('aiassistview.code.inline.background');
        color: dt('aiassistview.code.inline.color');
        font-family: dt('aiassistview.code.font.family');
        font-size: 0.875em;
    }

    .p-aiassistview-text blockquote {
        margin-block: 0.5em;
        margin-inline: 0;
        padding-inline-start: 0.75em;
        border-inline-start: 2px solid dt('aiassistview.quote.border.color');
        color: dt('aiassistview.muted.color');
    }

    .p-aiassistview-text table {
        border-collapse: collapse;
        inline-size: 100%;
        margin-block: 0.5em;
        font-size: 0.9375em;
    }

    .p-aiassistview-text th,
    .p-aiassistview-text td {
        border: 1px solid dt('aiassistview.table.border.color');
        padding: dt('aiassistview.table.cell.padding');
        text-align: start;
    }

    .p-aiassistview-text th {
        background: dt('aiassistview.table.header.background');
        font-weight: 600;
    }

    .p-aiassistview-text img {
        max-inline-size: 100%;
        border-radius: dt('aiassistview.border.radius');
    }

    /* The boxed blocks ARE panels. Two things are adjusted: the header band tightens, because a panel
       header sized for a page section is too tall for something that repeats inside an answer, and the
       content loses its padding where the block supplies its own. */
    .p-aiassistview-block-panel > .p-panel-header {
        padding: dt('aiassistview.panel.header.padding');
    }

    .p-aiassistview-block-panel .p-panel-title {
        font-weight: 600;
        font-size: dt('aiassistview.meta.font.size');
    }

    .p-aiassistview-block-panel .p-panel-content {
        padding: 0;
    }

    .p-aiassistview-panel-title {
        display: inline-flex;
        align-items: center;
        gap: dt('aiassistview.toolbar.gap');
    }

    .p-aiassistview-panel-label {
        font-weight: 400;
        color: dt('aiassistview.muted.color');
        font-family: dt('aiassistview.code.font.family');
    }

    .p-aiassistview-code pre {
        margin: 0;
        padding: dt('aiassistview.code.padding');
        overflow-x: auto;
        background: dt('aiassistview.code.background');
        font-family: dt('aiassistview.code.font.family');
        font-size: dt('aiassistview.code.font.size');
        line-height: 1.5;
        color: dt('aiassistview.code.color');
    }

    .p-aiassistview-code pre code {
        font: inherit;
        background: none;
        padding: 0;
        color: inherit;
    }

    /* ---------------------------------------------------------------------------------------------
       Reasoning
       ------------------------------------------------------------------------------------------ */

    .p-aiassistview-thinking-active .p-panel-title {
        color: dt('aiassistview.thinking.active.color');
    }

    .p-aiassistview-thinking-active .p-panel-title .p-icon {
        animation: p-aiassistview-pulse 1.4s ease-in-out infinite;
    }

    .p-aiassistview-duration {
        font-weight: 400;
        color: dt('aiassistview.muted.color');
        font-variant-numeric: tabular-nums;
    }

    .p-aiassistview-stages {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: dt('aiassistview.stages.padding');
        list-style: none;
        font-size: dt('aiassistview.meta.font.size');
        color: dt('aiassistview.muted.color');
    }

    .p-aiassistview-stage {
        display: grid;
        grid-template-columns: dt('aiassistview.stage.rail.width') 1fr;
        column-gap: dt('aiassistview.stage.gap');
        padding-block: dt('aiassistview.stage.padding.y');
    }

    /* The rail is drawn from the icon cell rather than as a border on the row: a border would stop at
       the last row's edge and leave the final marker hanging off the end of the line. */
    .p-aiassistview-stage-rail {
        position: relative;
        display: flex;
        justify-content: center;
        padding-block-start: 0.125rem;
        color: dt('aiassistview.muted.color');
    }

    .p-aiassistview-stage:not(:last-child) .p-aiassistview-stage-rail::after {
        content: '';
        position: absolute;
        inset-block-start: 1.125rem;
        inset-block-end: calc(-1 * dt('aiassistview.stage.padding.y'));
        inline-size: 1px;
        background: dt('aiassistview.stage.rail.color');
    }

    .p-aiassistview-stage-completed .p-aiassistview-stage-rail {
        color: dt('aiassistview.stage.completed.color');
    }

    .p-aiassistview-stage-inProgress .p-aiassistview-stage-rail {
        color: dt('aiassistview.stage.progress.color');
    }

    .p-aiassistview-stage-inProgress .p-aiassistview-stage-rail .p-icon {
        animation: p-aiassistview-pulse 1.4s ease-in-out infinite;
    }

    .p-aiassistview-stage-failed .p-aiassistview-stage-rail {
        color: dt('aiassistview.stage.failed.color');
    }

    .p-aiassistview-stage-content {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.toolbar.gap');
        min-width: 0;
    }

    .p-aiassistview-context {
        display: flex;
        flex-wrap: wrap;
        gap: dt('aiassistview.toolbar.gap');
    }

    /* The chips the reasoning steps carry are the library's chips, only smaller and with a status dot
       in front — a tag or a badge beside each one would double the visual weight of a step. */
    .p-aiassistview-context-item {
        font-size: dt('aiassistview.context.font.size');
        padding-block: dt('aiassistview.context.padding.y');
        padding-inline: dt('aiassistview.context.padding.x');
    }

    .p-aiassistview-context-item[role='button'] {
        cursor: pointer;
    }

    .p-aiassistview-context-item[data-assist-badge]::before {
        content: '';
        inline-size: 0.4375rem;
        block-size: 0.4375rem;
        border-radius: 50%;
        flex: 0 0 auto;
        margin-inline-end: 0.375rem;
        background: dt('aiassistview.muted.color');
    }

    .p-aiassistview-context-item[data-assist-badge='success']::before {
        background: dt('aiassistview.badge.success.color');
    }

    .p-aiassistview-context-item[data-assist-badge='warning']::before {
        background: dt('aiassistview.badge.warning.color');
    }

    .p-aiassistview-context-item[data-assist-badge='failed']::before {
        background: dt('aiassistview.badge.failed.color');
    }

    .p-aiassistview-glyph {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
    }

    .p-aiassistview-toolbar-separator {
        block-size: 1.25rem;
        margin-inline: dt('aiassistview.toolbar.gap');
    }

    /* ---------------------------------------------------------------------------------------------
       Empty state, suggestions, scroll button
       ------------------------------------------------------------------------------------------ */

    .p-aiassistview-banner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: dt('aiassistview.banner.gap');
        min-block-size: 100%;
        padding-block: dt('aiassistview.banner.padding.block');
        text-align: center;
        color: dt('aiassistview.muted.color');
    }

    .p-aiassistview-banner-icon {
        color: dt('aiassistview.banner.icon.color');
    }

    .p-aiassistview-banner-title {
        font-size: dt('aiassistview.banner.title.font.size');
        font-weight: 600;
        color: dt('aiassistview.color');
    }

    .p-aiassistview-suggestions {
        display: flex;
        flex-direction: column;
        gap: dt('aiassistview.suggestion.gap');
        max-inline-size: dt('aiassistview.content.max.width');
        margin-inline: auto;
        margin-block-start: dt('aiassistview.turn.gap');
    }

    .p-aiassistview-suggestions-header {
        font-size: dt('aiassistview.meta.font.size');
        font-weight: 500;
        color: dt('aiassistview.muted.color');
    }

    .p-aiassistview-suggestion-list {
        display: flex;
        flex-wrap: wrap;
        gap: dt('aiassistview.suggestion.gap');
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .p-aiassistview-suggestion-description {
        display: block;
        font-size: dt('aiassistview.meta.font.size');
        opacity: 0.75;
    }

    .p-aiassistview-scroll-bottom {
        position: absolute;
        inset-block-end: dt('aiassistview.content.padding');
        inset-inline-start: 50%;
        transform: translateX(-50%);
        z-index: 1;
    }

    .p-aiassistview-rtl .p-aiassistview-scroll-bottom {
        transform: translateX(50%);
    }

    /* ---------------------------------------------------------------------------------------------
       Composer
       ------------------------------------------------------------------------------------------ */

    /* The composer IS an input group. It draws its own border, its own corners and its own addon
       separators, and the field inside it draws its own focus ring — so there is nothing to restate
       here beyond the one thing a chat composer needs that a one-line group does not: a field that
       grows. The addons keep the group's own behaviour and fill its height, exactly as they do around
       any other field. */
    /* An addon centres its button, and a button is a fixed 2rem while the field beside it is a line
       of text plus padding — a pixel or three taller. Centred, that difference shows as a band of
       addon background above and below the button. Stretching it makes the button the addon. */
    .p-aiassistview-composer .p-inputgroupaddon > p-button,
    .p-aiassistview-composer .p-inputgroupaddon > p-button > .p-button {
        align-self: stretch;
        block-size: auto;
    }

    .p-aiassistview-composer .p-aiassistview-editor.p-textarea {
        /* The group hands its growth to the .p-inputtext class, and a textarea carries .p-textarea
           instead — so without this the field only ever takes the width of its own content and the
           group collapses around it. */
        flex: 1 1 auto;
        inline-size: 1%;
        /* The field grows with what it holds and then scrolls, so a pasted essay cannot eat the
           transcript. */
        max-block-size: dt('aiassistview.editor.max.height');
        resize: none;
        overflow-y: auto;
    }

    .p-aiassistview-dropping .p-aiassistview-editor.p-textarea {
        border-color: dt('aiassistview.drop.border.color');
        border-style: dashed;
    }

    .p-aiassistview-listening {
        animation: p-aiassistview-pulse 1.4s ease-in-out infinite;
    }

    .p-aiassistview-hint {
        color: dt('aiassistview.muted.color');
        font-size: dt('aiassistview.meta.font.size');
    }

    /* ---------------------------------------------------------------------------------------------
       Streaming indicators
       ------------------------------------------------------------------------------------------ */

    .p-aiassistview-caret {
        display: inline-block;
        inline-size: 0.45em;
        block-size: 1em;
        margin-inline-start: 0.125em;
        vertical-align: text-bottom;
        background: currentColor;
        border-radius: 1px;
        animation: p-aiassistview-blink 1s steps(2, start) infinite;
    }

    .p-aiassistview-typing {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding-block: 0.375rem;
    }

    .p-aiassistview-typing span {
        inline-size: 0.375rem;
        block-size: 0.375rem;
        border-radius: 50%;
        background: dt('aiassistview.muted.color');
        animation: p-aiassistview-bounce 1.2s ease-in-out infinite;
    }

    .p-aiassistview-typing span:nth-child(2) {
        animation-delay: 0.15s;
    }

    .p-aiassistview-typing span:nth-child(3) {
        animation-delay: 0.3s;
    }

    /* ---------------------------------------------------------------------------------------------
       Custom views, density, live regions
       ------------------------------------------------------------------------------------------ */

    .p-aiassistview-custom-view {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: dt('aiassistview.content.padding');
    }

    .p-aiassistview-compact .p-aiassistview-turns {
        gap: dt('aiassistview.compact.turn.gap');
    }

    .p-aiassistview-compact .p-aiassistview-bubble .p-aiassistview-prompt-content {
        padding: dt('aiassistview.compact.prompt.padding');
    }

    .p-aiassistview-live-region {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }

    /* A narrow container is a drawer or a phone: the rows take the width back and the avatars go,
       because 2.5rem of gutter on a 320px column is most of the reading area. */
    @container aiassistview (max-width: 480px) {
        .p-aiassistview-bubble .p-aiassistview-message-prompt .p-aiassistview-message-body {
            max-inline-size: 100%;
        }

        .p-aiassistview-avatar {
            display: none;
        }
    }

    @keyframes p-aiassistview-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }

    @keyframes p-aiassistview-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }

    @keyframes p-aiassistview-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-0.25rem); }
    }

    @media (prefers-reduced-motion: reduce) {
        .p-aiassistview *,
        .p-aiassistview *::before,
        .p-aiassistview *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;
