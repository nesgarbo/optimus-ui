/**
 *
 * AIAssistView Design Tokens
 *
 * @module aiassistview
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace AIAssistViewTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken aiassistview.background
         */
        background?: string;
        /**
         * Border color of root
         *
         * @designToken aiassistview.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken aiassistview.border.radius
         */
        borderRadius?: string;
        /**
         * Color of root
         *
         * @designToken aiassistview.color
         */
        color?: string;
        /**
         * Line height of root
         *
         * @designToken aiassistview.line.height
         */
        lineHeight?: string;
    }
    interface Muted {
        /**
         * Color of muted
         *
         * @designToken aiassistview.muted.color
         */
        color?: string;
    }
    interface Author {
        /**
         * Color of author
         *
         * @designToken aiassistview.author.color
         */
        color?: string;
        /**
         * Font size of author
         *
         * @designToken aiassistview.author.font.size
         */
        fontSize?: string;
    }
    interface Timestamp {
        /**
         * Font size of timestamp
         *
         * @designToken aiassistview.timestamp.font.size
         */
        fontSize?: string;
    }
    interface Link {
        /**
         * Color of link
         *
         * @designToken aiassistview.link.color
         */
        color?: string;
    }
    interface Quote {
        /**
         * Border color of quote
         *
         * @designToken aiassistview.quote.border.color
         */
        borderColor?: string;
    }
    interface Drop {
        /**
         * Border color of drop
         *
         * @designToken aiassistview.drop.border.color
         */
        borderColor?: string;
    }
    interface Disabled {
        /**
         * Opacity of disabled
         *
         * @designToken aiassistview.disabled.opacity
         */
        opacity?: string;
    }
    interface Transition {
        /**
         * Duration of transition
         *
         * @designToken aiassistview.transition.duration
         */
        duration?: string;
    }
    interface Focus {
        /**
         * Ring color of focus
         *
         * @designToken aiassistview.focus.ring.color
         */
        ringColor?: string;
        /**
         * Ring style of focus
         *
         * @designToken aiassistview.focus.ring.style
         */
        ringStyle?: string;
        /**
         * Ring width of focus
         *
         * @designToken aiassistview.focus.ring.width
         */
        ringWidth?: string;
    }
    interface Meta {
        /**
         * Font size of meta
         *
         * @designToken aiassistview.meta.font.size
         */
        fontSize?: string;
    }
    interface Header {
        /**
         * Font weight of header
         *
         * @designToken aiassistview.header.font.weight
         */
        fontWeight?: string;
        /**
         * Gap of header
         *
         * @designToken aiassistview.header.gap
         */
        gap?: string;
    }
    interface Footer {
        /**
         * Background of footer
         *
         * @designToken aiassistview.footer.background
         */
        background?: string;
        /**
         * Border color of footer
         *
         * @designToken aiassistview.footer.border.color
         */
        borderColor?: string;
        /**
         * Gap of footer
         *
         * @designToken aiassistview.footer.gap
         */
        gap?: string;
        /**
         * Padding of footer
         *
         * @designToken aiassistview.footer.padding
         */
        padding?: string;
    }
    interface Content {
        /**
         * Max width of content
         *
         * @designToken aiassistview.content.max.width
         */
        maxWidth?: string;
        /**
         * Padding of content
         *
         * @designToken aiassistview.content.padding
         */
        padding?: string;
    }
    interface Turn {
        /**
         * Gap of turn
         *
         * @designToken aiassistview.turn.gap
         */
        gap?: string;
        /**
         * Inner gap of turn
         *
         * @designToken aiassistview.turn.inner.gap
         */
        innerGap?: string;
    }
    interface Message {
        /**
         * Gap of message
         *
         * @designToken aiassistview.message.gap
         */
        gap?: string;
        /**
         * Inner gap of message
         *
         * @designToken aiassistview.message.inner.gap
         */
        innerGap?: string;
    }
    interface Avatar {
        /**
         * Assistant background of avatar
         *
         * @designToken aiassistview.avatar.assistant.background
         */
        assistantBackground?: string;
        /**
         * Assistant color of avatar
         *
         * @designToken aiassistview.avatar.assistant.color
         */
        assistantColor?: string;
    }
    interface Prompt {
        /**
         * Background of prompt
         *
         * @designToken aiassistview.prompt.background
         */
        background?: string;
        /**
         * Border color of prompt
         *
         * @designToken aiassistview.prompt.border.color
         */
        borderColor?: string;
        /**
         * Border radius of prompt
         *
         * @designToken aiassistview.prompt.border.radius
         */
        borderRadius?: string;
        /**
         * Max width of prompt
         *
         * @designToken aiassistview.prompt.max.width
         */
        maxWidth?: string;
        /**
         * Padding of prompt
         *
         * @designToken aiassistview.prompt.padding
         */
        padding?: string;
    }
    interface Block {
        /**
         * Gap of block
         *
         * @designToken aiassistview.block.gap
         */
        gap?: string;
    }
    interface Panel {
        /**
         * Header padding of panel
         *
         * @designToken aiassistview.panel.header.padding
         */
        headerPadding?: string;
    }
    interface Code {
        /**
         * Background of code
         *
         * @designToken aiassistview.code.background
         */
        background?: string;
        /**
         * Color of code
         *
         * @designToken aiassistview.code.color
         */
        color?: string;
        /**
         * Font family of code
         *
         * @designToken aiassistview.code.font.family
         */
        fontFamily?: string;
        /**
         * Font size of code
         *
         * @designToken aiassistview.code.font.size
         */
        fontSize?: string;
        /**
         * Inline background of code
         *
         * @designToken aiassistview.code.inline.background
         */
        inlineBackground?: string;
        /**
         * Inline border radius of code
         *
         * @designToken aiassistview.code.inline.border.radius
         */
        inlineBorderRadius?: string;
        /**
         * Inline color of code
         *
         * @designToken aiassistview.code.inline.color
         */
        inlineColor?: string;
        /**
         * Padding of code
         *
         * @designToken aiassistview.code.padding
         */
        padding?: string;
    }
    interface Thinking {
        /**
         * Active color of thinking
         *
         * @designToken aiassistview.thinking.active.color
         */
        activeColor?: string;
    }
    interface Stages {
        /**
         * Padding of stages
         *
         * @designToken aiassistview.stages.padding
         */
        padding?: string;
    }
    interface Stage {
        /**
         * Completed color of stage
         *
         * @designToken aiassistview.stage.completed.color
         */
        completedColor?: string;
        /**
         * Failed color of stage
         *
         * @designToken aiassistview.stage.failed.color
         */
        failedColor?: string;
        /**
         * Gap of stage
         *
         * @designToken aiassistview.stage.gap
         */
        gap?: string;
        /**
         * Padding y of stage
         *
         * @designToken aiassistview.stage.padding.y
         */
        paddingY?: string;
        /**
         * Progress color of stage
         *
         * @designToken aiassistview.stage.progress.color
         */
        progressColor?: string;
        /**
         * Rail color of stage
         *
         * @designToken aiassistview.stage.rail.color
         */
        railColor?: string;
        /**
         * Rail width of stage
         *
         * @designToken aiassistview.stage.rail.width
         */
        railWidth?: string;
    }
    interface Context {
        /**
         * Font size of context
         *
         * @designToken aiassistview.context.font.size
         */
        fontSize?: string;
        /**
         * Padding x of context
         *
         * @designToken aiassistview.context.padding.x
         */
        paddingX?: string;
        /**
         * Padding y of context
         *
         * @designToken aiassistview.context.padding.y
         */
        paddingY?: string;
    }
    interface Badge {
        /**
         * Failed color of badge
         *
         * @designToken aiassistview.badge.failed.color
         */
        failedColor?: string;
        /**
         * Success color of badge
         *
         * @designToken aiassistview.badge.success.color
         */
        successColor?: string;
        /**
         * Warning color of badge
         *
         * @designToken aiassistview.badge.warning.color
         */
        warningColor?: string;
    }
    interface Table {
        /**
         * Border color of table
         *
         * @designToken aiassistview.table.border.color
         */
        borderColor?: string;
        /**
         * Cell padding of table
         *
         * @designToken aiassistview.table.cell.padding
         */
        cellPadding?: string;
        /**
         * Header background of table
         *
         * @designToken aiassistview.table.header.background
         */
        headerBackground?: string;
    }
    interface Banner {
        /**
         * Gap of banner
         *
         * @designToken aiassistview.banner.gap
         */
        gap?: string;
        /**
         * Icon color of banner
         *
         * @designToken aiassistview.banner.icon.color
         */
        iconColor?: string;
        /**
         * Padding block of banner
         *
         * @designToken aiassistview.banner.padding.block
         */
        paddingBlock?: string;
        /**
         * Title font size of banner
         *
         * @designToken aiassistview.banner.title.font.size
         */
        titleFontSize?: string;
    }
    interface Suggestion {
        /**
         * Gap of suggestion
         *
         * @designToken aiassistview.suggestion.gap
         */
        gap?: string;
    }
    interface Toolbar {
        /**
         * Gap of toolbar
         *
         * @designToken aiassistview.toolbar.gap
         */
        gap?: string;
    }
    interface Editor {
        /**
         * Max height of editor
         *
         * @designToken aiassistview.editor.max.height
         */
        maxHeight?: string;
    }
    interface Compact {
        /**
         * Prompt padding of compact
         *
         * @designToken aiassistview.compact.prompt.padding
         */
        promptPadding?: string;
        /**
         * Turn gap of compact
         *
         * @designToken aiassistview.compact.turn.gap
         */
        turnGap?: string;
    }
    interface Scrollbar {
        /**
         * Thumb color of scrollbar
         *
         * @designToken aiassistview.scrollbar.thumb.color
         */
        thumbColor?: string;
    }
    type ColorScheme = CS<AIAssistViewDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

export interface AIAssistViewDesignTokens extends DesignTokens<AIAssistViewDesignTokens> {
    root?: AIAssistViewTokenSections.Root;
    muted?: AIAssistViewTokenSections.Muted;
    author?: AIAssistViewTokenSections.Author;
    timestamp?: AIAssistViewTokenSections.Timestamp;
    link?: AIAssistViewTokenSections.Link;
    quote?: AIAssistViewTokenSections.Quote;
    drop?: AIAssistViewTokenSections.Drop;
    disabled?: AIAssistViewTokenSections.Disabled;
    transition?: AIAssistViewTokenSections.Transition;
    focus?: AIAssistViewTokenSections.Focus;
    meta?: AIAssistViewTokenSections.Meta;
    header?: AIAssistViewTokenSections.Header;
    footer?: AIAssistViewTokenSections.Footer;
    content?: AIAssistViewTokenSections.Content;
    turn?: AIAssistViewTokenSections.Turn;
    message?: AIAssistViewTokenSections.Message;
    avatar?: AIAssistViewTokenSections.Avatar;
    prompt?: AIAssistViewTokenSections.Prompt;
    block?: AIAssistViewTokenSections.Block;
    panel?: AIAssistViewTokenSections.Panel;
    code?: AIAssistViewTokenSections.Code;
    thinking?: AIAssistViewTokenSections.Thinking;
    stages?: AIAssistViewTokenSections.Stages;
    stage?: AIAssistViewTokenSections.Stage;
    context?: AIAssistViewTokenSections.Context;
    badge?: AIAssistViewTokenSections.Badge;
    table?: AIAssistViewTokenSections.Table;
    banner?: AIAssistViewTokenSections.Banner;
    suggestion?: AIAssistViewTokenSections.Suggestion;
    toolbar?: AIAssistViewTokenSections.Toolbar;
    editor?: AIAssistViewTokenSections.Editor;
    compact?: AIAssistViewTokenSections.Compact;
    scrollbar?: AIAssistViewTokenSections.Scrollbar;
}
