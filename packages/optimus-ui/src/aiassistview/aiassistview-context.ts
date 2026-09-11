import { InjectionToken, type Signal } from '@angular/core';
import type {
    AssistAttachment,
    AssistContextClickPayload,
    AssistPrompt,
    AssistResponseBlock,
    AssistSuggestion,
    AssistThinkingBlock,
    AssistThinkingStage,
    AssistToolBlock,
    AssistToolbarItem,
    AssistToolbarItemClickPayload,
    AssistView
} from '@openng/optimus-ui/types/aiassistview';

/**
 * The narrow contexts the parts read, and the shapes the `let-` bindings of a template get.
 *
 * Two mechanisms, one purpose. An injected context is what a nested COMPONENT reads — it needs no
 * inputs threaded down through three levels of markup. A template context is what an inline
 * `<ng-template>` reads. Both describe the same data; keeping them in one file is what stops them
 * drifting apart.
 *
 * @module aiassistview-context
 */

/* -------------------------------------------------------------------------------------------------
 * Injected contexts
 * ---------------------------------------------------------------------------------------------- */

/** What a part placed inside one turn can read about it. @group Interface */
export interface AssistTurnContext {
    /** The turn. */
    readonly turn: Signal<AssistPrompt>;
    /** Where the turn sits in the transcript. */
    readonly index: Signal<number>;
    /** Whether this is the newest turn. */
    readonly last: Signal<boolean>;
    /** Whether the answer is still arriving. */
    readonly streaming: Signal<boolean>;
}

/** Injected by every part rendered inside one turn. @group Interface */
export const ASSIST_TURN_CONTEXT = new InjectionToken<AssistTurnContext>('ASSIST_TURN_CONTEXT');

/** What a part placed inside a reasoning panel can read. @group Interface */
export interface AssistThinkingContext {
    /** The block. */
    readonly block: Signal<AssistThinkingBlock>;
    /** Whether the panel is folded. */
    readonly collapsed: Signal<boolean>;
    /** Folds or unfolds the panel. */
    toggle(): void;
}

/** Injected by every part rendered inside a reasoning panel. @group Interface */
export const ASSIST_THINKING_CONTEXT = new InjectionToken<AssistThinkingContext>('ASSIST_THINKING_CONTEXT');

/* -------------------------------------------------------------------------------------------------
 * Template contexts
 * ---------------------------------------------------------------------------------------------- */

/** `let-` bindings of the prompt template. @group Interface */
export interface AssistPromptTemplateContext {
    /** The turn. */
    $implicit: AssistPrompt;
    /** The turn, named. */
    turn: AssistPrompt;
    /** Where it sits. */
    index: number;
    /** What was asked. */
    prompt: string;
    /** Files sent with it. */
    attachedFiles: AssistAttachment[];
    /** Whether this is the newest turn. */
    last: boolean;
}

/** `let-` bindings of the response template. @group Interface */
export interface AssistResponseTemplateContext {
    /** The turn. */
    $implicit: AssistPrompt;
    /** The turn, named. */
    turn: AssistPrompt;
    /** Where it sits. */
    index: number;
    /** The answer, as text. */
    response: string;
    /** The answer, as blocks. */
    blocks: AssistResponseBlock[];
    /** Whether the answer is still arriving. */
    streaming: boolean;
    /** Whether this is the newest turn. */
    last: boolean;
}

/** `let-` bindings of the block template. @group Interface */
export interface AssistBlockTemplateContext {
    /** The block. */
    $implicit: AssistResponseBlock;
    /** The block, named. */
    block: AssistResponseBlock;
    /** The turn it belongs to. */
    turn: AssistPrompt;
    /** Where that turn sits. */
    index: number;
}

/** `let-` bindings of a registered tool template. @group Interface */
export interface AssistToolTemplateContext {
    /** The block. */
    $implicit: AssistToolBlock;
    /** The block, named. */
    block: AssistToolBlock;
    /** What the model passed the tool. */
    props: any;
    /** What the tool returned. */
    result: any;
    /** The turn it belongs to. */
    turn: AssistPrompt;
}

/** `let-` bindings of a reasoning-stage template. @group Interface */
export interface AssistStageTemplateContext {
    /** The step. */
    $implicit: AssistThinkingStage;
    /** The step, named. */
    stage: AssistThinkingStage;
    /** Where it sits in the timeline. */
    index: number;
    /** The panel it belongs to. */
    block: AssistThinkingBlock;
}

/** `let-` bindings of the suggestion template. @group Interface */
export interface AssistSuggestionTemplateContext {
    /** The suggestion. */
    $implicit: AssistSuggestion;
    /** The suggestion, named. */
    suggestion: AssistSuggestion;
    /** Where it sits. */
    index: number;
}

/** `let-` bindings of a custom view's template. @group Interface */
export interface AssistViewTemplateContext {
    /** The view. */
    $implicit: AssistView;
    /** The view, named. */
    view: AssistView;
    /** Where it sits in the switcher. */
    index: number;
}

/** `let-` bindings of a toolbar item's template. @group Interface */
export interface AssistToolbarItemTemplateContext {
    /** The entry. */
    $implicit: AssistToolbarItem;
    /** The entry, named. */
    item: AssistToolbarItem;
    /** Which toolbar it came from. */
    toolbar: 'header' | 'prompt' | 'response' | 'footer';
    /** The turn the strip belongs to, for the prompt and response toolbars. */
    turn?: AssistPrompt;
    /** Where that turn sits. */
    index?: number;
}

/** `let-` bindings of the attachment template. @group Interface */
export interface AssistAttachmentTemplateContext {
    /** The attachment. */
    $implicit: AssistAttachment;
    /** The attachment, named. */
    file: AssistAttachment;
    /** Where it sits. */
    index: number;
    /** Whether it is still in the editor rather than already sent. */
    editable: boolean;
}

/** `let-` bindings of the footer template. @group Interface */
export interface AssistFooterTemplateContext {
    /** What the editor holds. */
    $implicit: string;
    /** What the editor holds, named. */
    value: string;
    /** Whether an answer is arriving. */
    busy: boolean;
    /** Attachments the editor is carrying. */
    attachedFiles: AssistAttachment[];
    /** Sends the given text, or the editor's own. */
    send: (prompt?: string) => void;
    /** Ends the arriving answer. */
    stop: () => void;
}

/** `let-` bindings of the banner template. @group Interface */
export interface AssistBannerTemplateContext {
    /** Sends a prompt, so a banner can offer starters of its own. */
    send: (prompt: string) => void;
}

/* -------------------------------------------------------------------------------------------------
 * Commands
 * ---------------------------------------------------------------------------------------------- */

/**
 * What the supplied parts ask the root to do.
 *
 * The parts hold no behaviour of their own. A bubble's copy button does not know how to copy — it
 * calls `copyTurn`, and the root decides whether the application cancelled it, what goes on the
 * clipboard and what the live region says. That is what keeps a replacement part honest: it can only
 * do what the root already does.
 *
 * @group Interface
 */
export interface AssistCommands {
    /** Sends the editor's text, or the text given. */
    send(prompt?: string): void;
    /** Ends the arriving answer. */
    stop(): void;
    /** Reruns one turn, keeping the earlier answer as a regeneration. */
    regenerate(index: number): void;
    /** Puts one turn's answer on the clipboard. */
    copyTurn(index: number): void;
    /** Marks a turn helpful, or takes the mark back. */
    feedback(index: number, feedback: 'like' | 'dislike'): void;
    /** Opens one turn's prompt for rewriting. */
    beginEdit(index: number): void;
    /** Accepts a rewritten prompt and reruns the turn. */
    commitEdit(index: number, prompt: string): void;
    /** Abandons a rewrite. */
    cancelEdit(): void;
    /** Drops one turn. */
    deleteTurn(index: number): void;
    /** Reads one turn's answer aloud, or stops reading it. */
    toggleSpeech(index: number): void;
    /** Steps through one turn's regenerated answers. */
    navigateResponse(index: number, delta: number): void;
    /** Reruns a turn that failed. */
    retry(index: number): void;
    /** Reports a toolbar entry. */
    toolbarItemClick(payload: AssistToolbarItemClickPayload): void;
    /** Reports a reasoning chip. */
    contextClick(payload: AssistContextClickPayload): void;
    /** Takes a suggestion chip. */
    suggestionClick(suggestion: AssistSuggestion, index: number): void;
    /** Opens the file dialog. */
    pickFiles(): void;
    /** Takes one attachment back out of the editor. */
    removeAttachment(id: string | undefined): void;
    /** Starts or stops dictation. */
    toggleListening(): void;
    /** Scrolls the transcript to its newest turn. */
    scrollToBottom(): void;
}

/** What every supplied part injects to reach its assistant's behaviour. @group Interface */
export const ASSIST_COMMANDS = new InjectionToken<AssistCommands>('ASSIST_COMMANDS');
