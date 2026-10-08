export const style = /*css*/ `
    .p-mention {
        display: contents;
    }

    /* The popup lives in the top layer: it needs fixed placement and none of the UA popover chrome. */
    .p-mention-popup {
        position: fixed;
        inset: auto;
        margin: 0;
        min-width: 12rem;
        max-width: 24rem;
        overflow: auto;
        box-sizing: border-box;
        padding: dt('mention.padding');
        background: dt('mention.background');
        color: dt('mention.color');
        border: 1px solid dt('mention.border.color');
        border-radius: dt('mention.border.radius');
        box-shadow: dt('mention.shadow');
    }

    .p-mention-popup:not(:popover-open) {
        display: none;
    }

    .p-mention-list {
        display: flex;
        flex-direction: column;
        gap: dt('mention.gap');
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .p-mention-item {
        display: flex;
        align-items: center;
        gap: dt('mention.item.gap');
        padding: dt('mention.item.padding');
        border-radius: dt('mention.item.border.radius');
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-mention-item-active {
        background: dt('mention.item.focus.background');
        color: dt('mention.item.focus.color');
    }

    .p-mention-item-disabled {
        opacity: 0.5;
        cursor: default;
    }

    .p-mention-group {
        padding: dt('mention.group.padding');
        color: dt('mention.group.color');
        font-weight: dt('mention.group.font.weight');
    }

    .p-mention-empty {
        padding: dt('mention.empty.padding');
        color: dt('mention.empty.color');
    }

    .p-mention-header {
        padding: dt('mention.item.padding');
    }

    .p-mention-chip {
        display: inline-block;
        padding: dt('mention.chip.padding');
        background: dt('mention.chip.background');
        color: dt('mention.chip.color');
        border-radius: dt('mention.chip.border.radius');
    }
`;
