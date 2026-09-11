import { Directive, InjectionToken, type Signal, TemplateRef, inject, input } from '@angular/core';
import type {
    AssistAttachmentTemplateContext,
    AssistBannerTemplateContext,
    AssistBlockTemplateContext,
    AssistFooterTemplateContext,
    AssistPromptTemplateContext,
    AssistResponseTemplateContext,
    AssistStageTemplateContext,
    AssistSuggestionTemplateContext,
    AssistToolTemplateContext,
    AssistToolbarItemTemplateContext,
    AssistViewTemplateContext
} from './aiassistview-context';

/**
 * The template definitions.
 *
 * Syncfusion's equivalents are `string | Function` inputs: a template is either an HTML string the
 * component parses, or a factory the component calls. Both give up Angular's type checking, its
 * change detection and its content projection at once.
 *
 * Here each one is a `*Def` directive holding a real `TemplateRef`. `let-` bindings are typed through
 * `ngTemplateContextGuard`, the template is compiled by Angular, and a component placed inside it
 * behaves like a component placed anywhere else.
 *
 * @module aiassistview-registry
 */

/**
 * Body of a prompt bubble.
 *
 * `<ng-template pAssistPromptDef let-turn let-index="index">`
 *
 * @group Components
 */
@Directive({ selector: '[pAssistPromptDef]', standalone: true })
export class AssistPromptDef {
    /** @internal The template itself, stamped by the transcript. */
    readonly template = inject<TemplateRef<AssistPromptTemplateContext>>(TemplateRef);

    /** @internal Unused: present so the microsyntax form parses. */
    readonly pAssistPromptDef = input<unknown>(undefined);

    /** @internal Narrows `let-` bindings to the prompt context. */
    static ngTemplateContextGuard(_directive: AssistPromptDef, context: unknown): context is AssistPromptTemplateContext {
        return true;
    }
}

/**
 * Body of a response.
 *
 * Replaces the whole answer, blocks included. To keep the block rendering and change only one kind
 * of block, use {@link AssistBlockDef} instead.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistResponseDef]', standalone: true })
export class AssistResponseDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistResponseTemplateContext>>(TemplateRef);

    /** @internal */
    readonly pAssistResponseDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistResponseDef, context: unknown): context is AssistResponseTemplateContext {
        return true;
    }
}

/**
 * Body of one response block, whatever its kind.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistBlockDef]', standalone: true })
export class AssistBlockDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistBlockTemplateContext>>(TemplateRef);

    /** @internal */
    readonly pAssistBlockDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistBlockDef, context: unknown): context is AssistBlockTemplateContext {
        return true;
    }
}

/**
 * Body of one tool call.
 *
 * The `pAssistToolDef` value names which tool this template draws, so several can sit side by side:
 * `<ng-template pAssistToolDef="weather" let-props="props">`.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistToolDef]', standalone: true })
export class AssistToolDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistToolTemplateContext>>(TemplateRef);

    /** Which `toolName` this template draws. Left empty, it draws every tool without one of its own. */
    readonly pAssistToolDef = input<string>('');

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistToolDef, context: unknown): context is AssistToolTemplateContext {
        return true;
    }
}

/**
 * Body of one reasoning step.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistStageDef]', standalone: true })
export class AssistStageDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistStageTemplateContext>>(TemplateRef);

    /** @internal */
    readonly pAssistStageDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistStageDef, context: unknown): context is AssistStageTemplateContext {
        return true;
    }
}

/**
 * Body of one suggestion chip.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistSuggestionDef]', standalone: true })
export class AssistSuggestionDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistSuggestionTemplateContext>>(TemplateRef);

    /** @internal */
    readonly pAssistSuggestionDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistSuggestionDef, context: unknown): context is AssistSuggestionTemplateContext {
        return true;
    }
}

/**
 * Content of one custom view.
 *
 * The `pAssistViewDef` value names the view's `id`, so one transcript can carry several custom
 * surfaces: `<ng-template pAssistViewDef="history">`.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistViewDef]', standalone: true })
export class AssistViewDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistViewTemplateContext>>(TemplateRef);

    /** Which view's `id` this template fills. */
    readonly pAssistViewDef = input<string>('');

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistViewDef, context: unknown): context is AssistViewTemplateContext {
        return true;
    }
}

/**
 * Body of one toolbar entry, for entries whose `type` is `template`.
 *
 * The `pAssistToolbarItemDef` value names the entry's `id`.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistToolbarItemDef]', standalone: true })
export class AssistToolbarItemDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistToolbarItemTemplateContext>>(TemplateRef);

    /** Which entry's `id` this template draws. */
    readonly pAssistToolbarItemDef = input<string>('');

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistToolbarItemDef, context: unknown): context is AssistToolbarItemTemplateContext {
        return true;
    }
}

/**
 * Body of one attachment chip.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistAttachmentDef]', standalone: true })
export class AssistAttachmentDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistAttachmentTemplateContext>>(TemplateRef);

    /** @internal */
    readonly pAssistAttachmentDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistAttachmentDef, context: unknown): context is AssistAttachmentTemplateContext {
        return true;
    }
}

/**
 * The empty state, shown while the transcript has no turns.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistBannerDef]', standalone: true })
export class AssistBannerDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistBannerTemplateContext>>(TemplateRef);

    /** @internal */
    readonly pAssistBannerDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistBannerDef, context: unknown): context is AssistBannerTemplateContext {
        return true;
    }
}

/**
 * The whole footer, editor included.
 *
 * The escape hatch for a product that wants its own composer: the context hands over `send` and
 * `stop`, so the replacement keeps the transcript's behaviour without reimplementing it.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistFooterDef]', standalone: true })
export class AssistFooterDef {
    /** @internal */
    readonly template = inject<TemplateRef<AssistFooterTemplateContext>>(TemplateRef);

    /** @internal */
    readonly pAssistFooterDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: AssistFooterDef, context: unknown): context is AssistFooterTemplateContext {
        return true;
    }
}

/**
 * The header, replacing the title, the view switcher and the header toolbar together.
 *
 * @group Components
 */
@Directive({ selector: '[pAssistHeaderDef]', standalone: true })
export class AssistHeaderDef {
    /** @internal */
    readonly template = inject<TemplateRef<void>>(TemplateRef);

    /** @internal */
    readonly pAssistHeaderDef = input<unknown>(undefined);
}

/** Every definition, for the module to import and export in one go. @internal */
export const ASSIST_DEFS = [AssistPromptDef, AssistResponseDef, AssistBlockDef, AssistToolDef, AssistStageDef, AssistSuggestionDef, AssistViewDef, AssistToolbarItemDef, AssistAttachmentDef, AssistBannerDef, AssistFooterDef, AssistHeaderDef] as const;

/**
 * Every definition the root found in its content, as signals.
 *
 * A part looks its template up here instead of querying for it, so a `Def` may sit anywhere in the
 * projected content — inside an `@if`, inside another component's template — and still be found. It
 * is also what keeps the deep parts free of inputs: a response four levels down reads the block
 * template without anything having threaded it through.
 *
 * @group Interface
 */
export interface AssistTemplates {
    /** Replaces the prompt bubble's body. */
    readonly prompt: Signal<AssistPromptDef | undefined>;
    /** Replaces the whole answer. */
    readonly response: Signal<AssistResponseDef | undefined>;
    /** Replaces one block, whatever its kind. */
    readonly block: Signal<AssistBlockDef | undefined>;
    /** The tool renderers, keyed by the name each one declared. */
    readonly tools: Signal<readonly AssistToolDef[]>;
    /** Replaces one reasoning step. */
    readonly stage: Signal<AssistStageDef | undefined>;
    /** Replaces one suggestion chip. */
    readonly suggestion: Signal<AssistSuggestionDef | undefined>;
    /** The custom view bodies, keyed by view id. */
    readonly views: Signal<readonly AssistViewDef[]>;
    /** The toolbar entry bodies, keyed by entry id. */
    readonly toolbarItems: Signal<readonly AssistToolbarItemDef[]>;
    /** Replaces one attachment chip. */
    readonly attachment: Signal<AssistAttachmentDef | undefined>;
    /** Replaces the empty state. */
    readonly banner: Signal<AssistBannerDef | undefined>;
    /** Replaces the whole footer. */
    readonly footer: Signal<AssistFooterDef | undefined>;
    /** Replaces the whole header. */
    readonly header: Signal<AssistHeaderDef | undefined>;
}

/** What every part injects to reach the templates its assistant was given. @group Interface */
export const ASSIST_TEMPLATES = new InjectionToken<AssistTemplates>('ASSIST_TEMPLATES');
