import type { AIAssistViewDesignTokens, AIAssistViewTokenSections } from '@openng/optimus-ui-themes/types/aiassistview';

// Almost every value below resolves to a SEMANTIC token rather than a palette step. That is what makes
// the surface look like the rest of the library rather than like a chat widget dropped into it: the
// transcript sits on the same `content` ground as a panel, the header is a toolbar, the boxed blocks
// are panels, and a re-themed primary colour moves the assistant with it.
//
// The list is short on purpose. Everything interactive — buttons, chips, tabs, the field, the panels —
// is a real component and carries its own tokens; what is left here is the layout and the few surfaces
// this component invents.

export const root: AIAssistViewTokenSections.Root = {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    // A step above the stock content radius. The assistant is a surface a reader sits inside for
    // minutes at a time, not a row in a table, and the softer corner is what separates the two.
    borderRadius: '{border.radius.xl}',
    lineHeight: '1.65'
};

export const muted: AIAssistViewTokenSections.Muted = {
    color: '{text.muted.color}'
};

export const author: AIAssistViewTokenSections.Author = {
    color: '{text.color}',
    fontSize: '0.8125rem'
};

export const timestamp: AIAssistViewTokenSections.Timestamp = {
    fontSize: '0.75rem'
};

export const link: AIAssistViewTokenSections.Link = {
    color: '{primary.color}'
};

export const quote: AIAssistViewTokenSections.Quote = {
    borderColor: '{content.border.color}'
};

export const drop: AIAssistViewTokenSections.Drop = {
    borderColor: '{primary.color}'
};

export const disabled: AIAssistViewTokenSections.Disabled = {
    opacity: '0.6'
};

export const transition: AIAssistViewTokenSections.Transition = {
    duration: '{transition.duration}'
};

export const focus: AIAssistViewTokenSections.Focus = {
    ringWidth: '{focus.ring.width}',
    ringStyle: '{focus.ring.style}',
    ringColor: '{focus.ring.color}'
};

export const meta: AIAssistViewTokenSections.Meta = {
    fontSize: '0.875rem'
};

export const header: AIAssistViewTokenSections.Header = {
    gap: '0.75rem',
    fontWeight: '600'
};

export const footer: AIAssistViewTokenSections.Footer = {
    padding: '0.75rem 1.125rem',
    gap: '0.5rem',
    background: '{content.background}',
    borderColor: '{content.border.color}'
};

export const content: AIAssistViewTokenSections.Content = {
    padding: '1.125rem',
    // A measure, not a width: past roughly 75 characters the eye loses the line start, and an assistant
    // answer is prose before it is anything else.
    maxWidth: '48rem'
};

export const turn: AIAssistViewTokenSections.Turn = {
    gap: '2rem',
    innerGap: '1rem'
};

export const message: AIAssistViewTokenSections.Message = {
    gap: '0.75rem',
    innerGap: '0.375rem'
};

export const avatar: AIAssistViewTokenSections.Avatar = {
    // The theme's primary, so the answering side is marked with the same colour the send button and
    // the links carry. `highlight.background` looked right in the stock preset and turned near-black
    // in one with a dark primary.
    assistantBackground: '{primary.color}',
    assistantColor: '{primary.contrast.color}'
};

export const prompt: AIAssistViewTokenSections.Prompt = {
    padding: '0.625rem 0.875rem',
    borderRadius: '{content.border.radius}',
    maxWidth: '80%'
};

export const block: AIAssistViewTokenSections.Block = {
    gap: '0.875rem'
};

export const panel: AIAssistViewTokenSections.Panel = {
    // A panel header sized for a page section is too tall for something that repeats several times
    // inside one answer.
    headerPadding: '0.5rem 0.75rem'
};

export const code: AIAssistViewTokenSections.Code = {
    padding: '0.75rem',
    color: '{content.color}',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.8125rem',
    inlineBorderRadius: '{border.radius.sm}'
};

export const thinking: AIAssistViewTokenSections.Thinking = {
    activeColor: '{primary.color}'
};

export const stages: AIAssistViewTokenSections.Stages = {
    padding: '0.625rem 0.75rem'
};

export const stage: AIAssistViewTokenSections.Stage = {
    railWidth: '1rem',
    gap: '0.625rem',
    paddingY: '0.3125rem',
    railColor: '{content.border.color}',
    completedColor: '{green.500}',
    progressColor: '{primary.color}',
    failedColor: '{red.500}'
};

export const context: AIAssistViewTokenSections.Context = {
    fontSize: '0.75rem',
    paddingY: '0.125rem',
    paddingX: '0.5rem'
};

export const badge: AIAssistViewTokenSections.Badge = {
    successColor: '{green.500}',
    warningColor: '{amber.500}',
    failedColor: '{red.500}'
};

export const table: AIAssistViewTokenSections.Table = {
    borderColor: '{content.border.color}',
    cellPadding: '0.375rem 0.625rem'
};

export const banner: AIAssistViewTokenSections.Banner = {
    gap: '0.5rem',
    paddingBlock: '2rem',
    titleFontSize: '1.125rem',
    iconColor: '{primary.color}'
};

export const suggestion: AIAssistViewTokenSections.Suggestion = {
    gap: '0.5rem'
};

export const toolbar: AIAssistViewTokenSections.Toolbar = {
    gap: '0.25rem'
};

export const editor: AIAssistViewTokenSections.Editor = {
    maxHeight: '12rem'
};

export const compact: AIAssistViewTokenSections.Compact = {
    turnGap: '1.125rem',
    promptPadding: '0.5rem 0.75rem'
};

export const colorScheme: AIAssistViewTokenSections.ColorScheme = {
    light: {
        scrollbar: {
            thumbColor: '{surface.300}'
        },
        prompt: {
            background: '{surface.100}',
            borderColor: '{surface.200}'
        },
        code: {
            background: '{surface.50}',
            inlineBackground: '{surface.100}',
            inlineColor: '{surface.800}'
        },
        table: {
            headerBackground: '{surface.50}'
        }
    },
    dark: {
        scrollbar: {
            thumbColor: '{surface.600}'
        },
        prompt: {
            background: '{surface.800}',
            borderColor: '{surface.700}'
        },
        code: {
            background: '{surface.900}',
            inlineBackground: '{surface.800}',
            inlineColor: '{surface.100}'
        },
        table: {
            headerBackground: 'color-mix(in srgb, {surface.800} 60%, transparent)'
        }
    }
};

export default {
    root,
    muted,
    author,
    timestamp,
    link,
    quote,
    drop,
    disabled,
    transition,
    focus,
    meta,
    header,
    footer,
    content,
    turn,
    message,
    avatar,
    prompt,
    block,
    panel,
    code,
    thinking,
    stages,
    stage,
    context,
    badge,
    table,
    banner,
    suggestion,
    toolbar,
    editor,
    compact,
    colorScheme
} satisfies AIAssistViewDesignTokens;
