import { NgModule } from '@angular/core';
import { AIAssistView } from './aiassistview';
import { ASSIST_BLOCK_VIEWS } from './aiassistview-blocks';
import { AssistGlyph } from './aiassistview-icons';
import { AssistAttachmentList, AssistPromptMessage, AssistResponseMessage, AssistTurn } from './aiassistview-message';
import { ASSIST_PART_COMPONENTS } from './aiassistview-parts';
import { ASSIST_DEFS } from './aiassistview-registry';
import { AssistToolbar } from './aiassistview-toolbar';

/** The transcript pieces: a turn and the two halves it is made of. @internal */
const MESSAGES = [AssistTurn, AssistPromptMessage, AssistResponseMessage, AssistAttachmentList];

/**
 * The complete AIAssistView composition surface.
 *
 * Everything in one import, which is the normal consumer path: the root alone covers the batteries-
 * included case, and the parts are here for the compositions that replace one surface at a time.
 *
 * @group Components
 */
@NgModule({
    imports: [AIAssistView, ...ASSIST_PART_COMPONENTS, ...MESSAGES, ...ASSIST_BLOCK_VIEWS, AssistToolbar, AssistGlyph, ...ASSIST_DEFS],
    exports: [AIAssistView, ...ASSIST_PART_COMPONENTS, ...MESSAGES, ...ASSIST_BLOCK_VIEWS, AssistToolbar, AssistGlyph, ...ASSIST_DEFS]
})
export class AIAssistViewModule {}

/**
 * Only the template definitions.
 *
 * For a surface composed out of the individual standalone parts that still wants the `*Def`
 * directives without pulling the whole runtime into its declarations.
 *
 * @group Components
 */
@NgModule({
    imports: [...ASSIST_DEFS],
    exports: [...ASSIST_DEFS]
})
export class AIAssistViewTemplatesModule {}
