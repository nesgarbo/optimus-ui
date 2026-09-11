import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import type { AssistListeningState, AssistSpeechToTextOptions, AssistTextToSpeechOptions } from '@openng/optimus-ui/types/aiassistview';

/**
 * Dictation and read-aloud, over the browser's own engines.
 *
 * Both APIs are optional in the platform and neither exists on the server, so everything here is
 * written to be a no-op rather than a throw when the engine is missing: an assistant rendered on the
 * server, or opened in a browser without SpeechRecognition, simply does not offer the button.
 *
 * @module aiassistview-speech
 */

/** The slice of the un-typed `SpeechRecognition` this file uses. @internal */
interface RecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
}

/** What the assistant is told each time dictation moves. @group Interface */
export interface AssistSpeechUpdate {
    /** Where the microphone is. */
    state: AssistListeningState;
    /** What has been heard so far. */
    transcript: string;
    /** Whether that transcript is still provisional. */
    interim: boolean;
    /** What went wrong, when `state` is `error`. */
    error?: string;
}

/**
 * One assistant's speech engines.
 *
 * Provided by the root rather than at the root injector, so two assistants on a page cannot end up
 * sharing one microphone session or cutting each other's read-aloud short.
 *
 * @group Service
 */
@Injectable()
export class AssistSpeech {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT);

    private recognition: RecognitionLike | null = null;
    private silenceTimer: ReturnType<typeof setTimeout> | null = null;
    private finalTranscript = '';

    /** Where the microphone is. */
    readonly listeningState = signal<AssistListeningState>('inactive');

    /** Whether a voice is speaking. */
    readonly speaking = signal(false);

    /** Whether this browser can take dictation at all. */
    readonly recognitionSupported = isPlatformBrowser(this.platformId) && !!this.speechRecognitionConstructor();

    /** Whether this browser can read text aloud at all. */
    readonly synthesisSupported = isPlatformBrowser(this.platformId) && 'speechSynthesis' in (this.document.defaultView ?? {});

    /* --------------------------------------------------------------------------------------------
     * Dictation
     * ----------------------------------------------------------------------------------------- */

    /**
     * Starts listening.
     *
     * Calling it while already listening stops instead, because the button is one control with two
     * meanings and the caller should not have to track which one it currently is.
     */
    start(options: AssistSpeechToTextOptions, onUpdate: (update: AssistSpeechUpdate) => void): void {
        if (!this.recognitionSupported) {
            onUpdate({ state: 'error', transcript: '', interim: false, error: 'unsupported' });

            return;
        }

        if (this.listeningState() === 'listening') {
            this.stop();

            return;
        }

        const Constructor = this.speechRecognitionConstructor()!;
        const recognition: RecognitionLike = new Constructor();

        recognition.lang = options.lang || this.document.documentElement.lang || 'en-US';
        recognition.continuous = true;
        recognition.interimResults = options.allowInterimResults ?? true;

        this.finalTranscript = '';

        recognition.onresult = (event: any) => {
            let interim = '';

            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                const result = event.results[index];

                if (result.isFinal) this.finalTranscript += result[0].transcript;
                else interim += result[0].transcript;
            }

            onUpdate({ state: 'listening', transcript: (this.finalTranscript + interim).trimStart(), interim: interim.length > 0 });
            this.armSilenceTimer(options);
        };

        recognition.onerror = (event: any) => {
            this.clearSilenceTimer();
            this.listeningState.set('error');
            onUpdate({ state: 'error', transcript: this.finalTranscript, interim: false, error: event?.error ?? 'error' });
        };

        recognition.onend = () => {
            this.clearSilenceTimer();
            this.recognition = null;

            // An error already reported itself; overwriting it with a plain stop would lose the reason
            // the microphone went away.
            if (this.listeningState() === 'error') return;

            this.listeningState.set('stopped');
            onUpdate({ state: 'stopped', transcript: this.finalTranscript.trim(), interim: false });
        };

        this.recognition = recognition;
        this.listeningState.set('listening');

        try {
            recognition.start();
        } catch {
            // Chrome throws when `start` lands while a previous session is still tearing down. The
            // `onend` of that session is about to fire, so there is nothing useful to do here.
            this.listeningState.set('error');
            this.recognition = null;
            onUpdate({ state: 'error', transcript: '', interim: false, error: 'busy' });
        }
    }

    /** Stops listening, keeping what was heard. */
    stop(): void {
        this.clearSilenceTimer();
        this.recognition?.stop();
    }

    /** Stops listening and throws away what was heard. */
    abort(): void {
        this.clearSilenceTimer();
        this.recognition?.abort();
        this.recognition = null;
        this.listeningState.set('inactive');
    }

    /* --------------------------------------------------------------------------------------------
     * Read-aloud
     * ----------------------------------------------------------------------------------------- */

    /** Reads `text` aloud, cutting off whatever was being read. */
    speak(text: string, options: AssistTextToSpeechOptions, onEnd?: () => void): void {
        if (!this.synthesisSupported || !text.trim()) return;

        const view = this.document.defaultView!;
        const synthesis = view.speechSynthesis;

        synthesis.cancel();

        const utterance = new view.SpeechSynthesisUtterance(text);

        utterance.lang = options.lang || this.document.documentElement.lang || 'en-US';
        utterance.pitch = options.pitch ?? 1;
        utterance.rate = options.rate ?? 1;
        utterance.volume = options.volume ?? 1;

        if (options.voice) {
            const voice = synthesis.getVoices().find((candidate) => candidate.name === options.voice);

            if (voice) utterance.voice = voice;
        }

        utterance.onend = () => {
            this.speaking.set(false);
            onEnd?.();
        };

        utterance.onerror = () => {
            this.speaking.set(false);
            onEnd?.();
        };

        this.speaking.set(true);
        synthesis.speak(utterance);
    }

    /** Stops reading. */
    cancelSpeech(): void {
        if (!this.synthesisSupported) return;

        this.document.defaultView!.speechSynthesis.cancel();
        this.speaking.set(false);
    }

    /** Tears both engines down. Called by the root when it is destroyed. */
    dispose(): void {
        this.abort();
        this.cancelSpeech();
    }

    /* --------------------------------------------------------------------------------------------
     * Internals
     * ----------------------------------------------------------------------------------------- */

    private speechRecognitionConstructor(): (new () => RecognitionLike) | undefined {
        const view = this.document.defaultView as any;

        return view?.SpeechRecognition ?? view?.webkitSpeechRecognition;
    }

    /**
     * Ends the session after a silence.
     *
     * `continuous` recognition does not end itself, so without this the microphone stays open until
     * the reader remembers to press the button again.
     */
    private armSilenceTimer(options: AssistSpeechToTextOptions): void {
        this.clearSilenceTimer();

        const timeout = options.silenceTimeout ?? 2500;

        if (timeout <= 0) return;

        this.silenceTimer = setTimeout(() => this.stop(), timeout);
    }

    private clearSilenceTimer(): void {
        if (this.silenceTimer == null) return;

        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
    }
}
