import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { OpenngIcons } from '@openng/optimus-ui/api';

/**
 * Picking one of the library's icons by name.
 *
 * Every glyph this component draws comes from the OpenNG icon set — the `pi pi-*` classes catalogued
 * in {@link OpenngIcons} and shipped by `@openng/icons`. Nothing is drawn by hand here, and no icon is
 * added to the library for this component's sake: the set already carries all of them.
 *
 * The indirection exists so a call site can ask for `copy` without repeating a class string, and so
 * the whole mapping is in one place if a product wants to read it.
 *
 * An application replacing a glyph does not come here: every toolbar entry takes an `iconCss` class of
 * its own, drawn instead of the built-in one whenever it is set — which is the same `pi pi-*` contract.
 *
 * @module aiassistview-icons
 */

/** Which glyph a supplied control draws. @group Types */
export type AssistIconName =
    | 'send'
    | 'stop'
    | 'microphone'
    | 'paperclip'
    | 'copy'
    | 'thumbs-up'
    | 'thumbs-down'
    | 'speaker'
    | 'speaker-off'
    | 'sparkles'
    | 'user'
    | 'file'
    | 'tool'
    | 'check'
    | 'times'
    | 'refresh'
    | 'pencil'
    | 'trash'
    | 'plus'
    | 'search'
    | 'chevron-down'
    | 'chevron-left'
    | 'chevron-right'
    | 'arrow-down'
    | 'exclamation-triangle'
    | 'spinner';

/** What each name resolves to in the OpenNG icon set. @internal */
const GLYPHS: Record<AssistIconName, string> = {
    send: OpenngIcons.SEND,
    stop: OpenngIcons.STOP,
    microphone: OpenngIcons.MICROPHONE,
    paperclip: OpenngIcons.PAPERCLIP,
    copy: OpenngIcons.COPY,
    'thumbs-up': OpenngIcons.THUMBS_UP,
    'thumbs-down': OpenngIcons.THUMBS_DOWN,
    speaker: OpenngIcons.VOLUME_UP,
    'speaker-off': OpenngIcons.VOLUME_OFF,
    sparkles: OpenngIcons.SPARKLES,
    user: OpenngIcons.USER,
    file: OpenngIcons.FILE,
    tool: OpenngIcons.WRENCH,
    check: OpenngIcons.CHECK,
    times: OpenngIcons.TIMES,
    refresh: OpenngIcons.REFRESH,
    pencil: OpenngIcons.PENCIL,
    trash: OpenngIcons.TRASH,
    plus: OpenngIcons.PLUS,
    search: OpenngIcons.SEARCH,
    'chevron-down': OpenngIcons.CHEVRON_DOWN,
    'chevron-left': OpenngIcons.CHEVRON_LEFT,
    'chevron-right': OpenngIcons.CHEVRON_RIGHT,
    'arrow-down': OpenngIcons.ARROW_DOWN,
    'exclamation-triangle': OpenngIcons.EXCLAMATION_TRIANGLE,
    spinner: OpenngIcons.SPINNER
};

/**
 * One glyph.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-glyph',
    standalone: true,
    template: `<span [class]="cssClass()"></span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-aiassistview-glyph', 'aria-hidden': 'true' }
})
export class AssistGlyph {
    /** Which glyph to draw. */
    readonly name = input.required<AssistIconName>();

    /** Whether the glyph spins, for the one that reports work in progress. */
    readonly spin = input(false);

    /** @internal */
    protected readonly cssClass = computed(() => `${GLYPHS[this.name()] ?? ''}${this.spin() ? ' pi-spin' : ''}`);
}
