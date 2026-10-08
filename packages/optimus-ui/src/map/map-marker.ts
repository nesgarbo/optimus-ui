import { booleanAttribute, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, input, model, numberAttribute, output, untracked, viewChild, ViewEncapsulation } from '@angular/core';
import type { MapLngLat } from '@openng/optimus-ui/types/map';
import type { Marker, Popup } from 'maplibre-gl';
import { MAP_CONTEXT } from './map-context';

/**
 * MapMarker puts a pin on a map.
 *
 * Its text, `popupText`, or what is written inside the tag, opens in a popup when the pin is clicked. `lngLat` is a model, so
 * `[(lngLat)]` follows a pin that is dragged.
 *
 * @group Components
 */
@Component({
    selector: 'p-map-marker',
    standalone: true,
    template: `<div #content class="p-map-marker-source"><ng-content /></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' }
})
export class MapMarker {
    private readonly context = inject(MAP_CONTEXT);
    private readonly destroyRef = inject(DestroyRef);
    private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

    /**
     * Where the pin is, as `[longitude, latitude]`. Supports `[(lngLat)]`.
     * @group Props
     */
    readonly lngLat = model<MapLngLat>([0, 0]);
    /**
     * Colour of the pin.
     * @group Props
     */
    readonly color = input('#3b82f6');
    /**
     * Lets the user drag the pin.
     * @group Props
     */
    readonly draggable = input(false, { transform: booleanAttribute });
    /**
     * Which point of the pin is at the place: `center`, `top`, `bottom`, `left`, `right`, or a corner.
     * @group Props
     */
    readonly anchor = input<'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom');
    /**
     * Turns the pin, in degrees.
     * @group Props
     */
    readonly rotation = input(0, { transform: numberAttribute });
    /**
     * Text of the popup. A popup with markup is written inside the tag.
     * @group Props
     */
    readonly popupText = input('');
    /**
     * Shows the popup. Supports `[(popupOpen)]`.
     * @group Props
     */
    readonly popupOpen = model(false);
    /**
     * Name for assistive technology.
     * @group Props
     */
    readonly label = input('');

    /**
     * Emitted when the pin is clicked.
     * @group Emits
     */
    readonly pinClick = output<MouseEvent>();
    /**
     * Emitted when a drag of the pin ends.
     * @group Emits
     */
    readonly dragEnd = output<MapLngLat>();

    private marker: Marker | null = null;
    private popup: Popup | null = null;

    constructor() {
        effect(() => {
            const map = this.context.map();
            const lib = this.context.lib();

            if (!map || !lib) return;

            untracked(() => {
                const marker = new lib.Marker({ color: this.color(), draggable: this.draggable(), anchor: this.anchor(), rotation: this.rotation() }).setLngLat(this.lngLat()).addTo(map);
                const element = marker.getElement();

                element.setAttribute('role', 'img');
                element.setAttribute('aria-label', this.label() || this.popupText() || 'Marker');
                element.addEventListener('click', (event) => this.pinClick.emit(event));
                marker.on('dragend', () => {
                    const p = marker.getLngLat();

                    this.lngLat.set([p.lng, p.lat]);
                    this.dragEnd.emit([p.lng, p.lat]);
                });

                this.marker = marker;
                this.syncPopup(lib);
            });

            return () => {
                this.marker?.remove();
                this.popup?.remove();
                this.marker = null;
                this.popup = null;
            };
        });

        // What can change while the pin is there.
        effect(() => {
            const at = this.lngLat();
            const color = this.color();
            const draggable = this.draggable();
            const rotation = this.rotation();

            untracked(() => {
                const marker = this.marker;

                if (!marker) return;

                const now = marker.getLngLat();

                if (now.lng !== at[0] || now.lat !== at[1]) marker.setLngLat(at);

                marker.setDraggable(draggable);
                marker.setRotation(rotation);

                // The default pin takes its colour from the fill of its path.
                marker
                    .getElement()
                    .querySelectorAll('path[fill]')
                    .forEach((p) => p.setAttribute('fill', color));
            });
        });

        effect(() => {
            this.popupText();
            this.popupOpen();

            const lib = this.context.lib();

            untracked(() => lib && this.marker && this.syncPopup(lib));
        });

        this.destroyRef.onDestroy(() => {
            this.marker?.remove();
            this.popup?.remove();
        });
    }

    private syncPopup(lib: typeof import('maplibre-gl')): void {
        const marker = this.marker;

        if (!marker) return;

        const content = this.content().nativeElement;
        const text = this.popupText();
        const hasContent = !!text || content.childNodes.length > 0;

        if (!hasContent) {
            this.popup?.remove();
            this.popup = null;
            marker.setPopup(null);

            return;
        }

        if (!this.popup) {
            this.popup = new lib.Popup({ offset: 24 });
            this.popup.on('open', () => this.popupOpen.set(true));
            this.popup.on('close', () => this.popupOpen.set(false));
            marker.setPopup(this.popup);
        }

        if (text) this.popup.setText(text);
        else this.popup.setDOMContent(content.cloneNode(true) as HTMLElement);

        if (this.popupOpen() !== this.popup.isOpen()) marker.togglePopup();
    }

    /** The MapLibre marker, once the map is ready. */
    getMarker(): Marker | null {
        return this.marker;
    }
}
