import type { QueryBuilderDesignTokens, QueryBuilderTokenSections } from '@openng/optimus-ui-themes/types/querybuilder';

export const root: QueryBuilderTokenSections.Root = {
    background: '{content.background}',
    color: '{content.color}',
    gap: '0.75rem'
};

export const group: QueryBuilderTokenSections.Group = {
    background: '{content.background}',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    padding: '0.75rem',
    gap: '0.5rem'
};

export const header: QueryBuilderTokenSections.Header = {
    gap: '0.5rem'
};

export const rule: QueryBuilderTokenSections.Rule = {
    gap: '0.5rem',
    padding: '0.125rem 0'
};

export const error: QueryBuilderTokenSections.Error = {
    color: '{form.field.invalid.border.color}',
    fontSize: '0.8125rem'
};

export const empty: QueryBuilderTokenSections.Empty = {
    color: '{text.muted.color}',
    padding: '0.5rem 0'
};

export default {
    root,
    group,
    header,
    rule,
    error,
    empty
} satisfies QueryBuilderDesignTokens;
