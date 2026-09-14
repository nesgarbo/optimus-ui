import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistDensity, AssistLayout, AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'appearance-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>layout</i> defaults to <i>flat</i>: the transcript is laid out the way the library lays out a comment thread — an avatar, an author, and the text — so the answer reads as page prose and the panels, tables and code samples inside it
                have nothing to fight. <i>bubble</i> opts into the familiar chat shape, with the reader's message right-aligned in a tinted lozenge. <i>density</i> tightens the spacing and <i>rtl</i> flips the whole surface.
            </p>
            <p>The surface sizes itself against its container rather than the viewport: below roughly 480px the avatars go and the bubbles take the width back, so the same component works docked in a drawer and filling a page.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-3 mb-4">
                <p-button [outlined]="true" severity="secondary" size="small" [label]="'Layout: ' + layout()" (onClick)="layout.set(layout() === 'bubble' ? 'flat' : 'bubble')" />
                <p-button [outlined]="true" severity="secondary" size="small" [label]="'Density: ' + density()" (onClick)="density.set(density() === 'comfortable' ? 'compact' : 'comfortable')" />
                <p-button [outlined]="true" severity="secondary" size="small" [label]="'RTL: ' + (rtl() ? 'on' : 'off')" (onClick)="rtl.set(!rtl())" />
                <p-button [outlined]="true" severity="secondary" size="small" [label]="'Avatars: ' + (avatars() ? 'on' : 'off')" (onClick)="avatars.set(!avatars())" />
            </div>
            <div style="height: 30rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Appearance" [layout]="layout()" [density]="density()" [rtl]="rtl()" [showAvatars]="avatars()" showSendHint (promptRequest)="onPrompt($event)" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class AppearanceDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([{ id: 'seed', prompt: 'Explain Angular signals', response: answerFor('signals'), status: 'complete' }]);

    readonly layout = signal<AssistLayout>('bubble');

    readonly density = signal<AssistDensity>('comfortable');

    readonly rtl = signal(false);

    readonly avatars = signal(true);

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }
}
