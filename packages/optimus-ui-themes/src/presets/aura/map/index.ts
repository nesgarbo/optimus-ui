import type { MapDesignTokens, MapTokenSections } from '@openng/optimus-ui-themes/types/map';

export const root: MapTokenSections.Root = {
    background: '{content.hover.background}',
    color: '{text.color}',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    height: '24rem'
};

export default {
    root
} satisfies MapDesignTokens;
