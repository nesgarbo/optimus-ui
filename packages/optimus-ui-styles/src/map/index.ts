export const style = /*css*/ `
    .p-map {
        position: relative;
        display: block;
        height: dt('map.height');
        min-height: 8rem;
        background: dt('map.background');
        border: 1px solid dt('map.border.color');
        border-radius: dt('map.border.radius');
        overflow: hidden;
    }

    .p-map-container {
        position: absolute;
        inset: 0;
    }

    .p-map-failed::after {
        content: attr(data-message);
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        text-align: center;
        color: dt('map.color');
    }

    .p-map-marker-source {
        display: none;
    }
`;
