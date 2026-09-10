import { DestroyRef, type Signal, inject, signal } from '@angular/core';

export const WINDOW = 60;
export const INTERVAL_MS = 1000;

let rngState = 7;

function seededRandom() {
    let t = (rngState += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export interface Candle {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export function nextCandle(prev: Candle): Candle {
    const open = prev.close;
    const meanReversion = (1.05 - open) * 0.08;
    const drift = (seededRandom() - 0.5) * 0.0006 + meanReversion;
    const close = +(open + drift).toFixed(5);
    const vol = 0.0002 + seededRandom() * 0.0004;
    const high = +(Math.max(open, close) + seededRandom() * vol).toFixed(5);
    const low = +(Math.min(open, close) - seededRandom() * vol).toFixed(5);

    return { ts: Date.now(), open, high, low, close };
}

function seed(n: number): Candle[] {
    const out: Candle[] = [];
    let prev: Candle = {
        ts: Date.now() - n * INTERVAL_MS,
        open: 1.0502,
        high: 1.0503,
        low: 1.0501,
        close: 1.0502
    };

    for (let i = n; i > 0; i--) {
        const c = nextCandle(prev);

        c.ts = Date.now() - i * INTERVAL_MS;
        out.push(c);
        prev = c;
    }

    return out;
}

export function nextSpread(): number {
    return +(0.1 + seededRandom() * 0.3).toFixed(1);
}

let feed: ReturnType<typeof signal<Candle[]>> | null = null;
let spread: ReturnType<typeof signal<number>> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let subscribers = 0;

function tick() {
    const f = feed!;
    const prev = f()[f().length - 1];

    if (!prev) return;

    const next = [...f(), nextCandle(prev)];

    if (next.length > WINDOW) next.splice(0, next.length - WINDOW);

    f.set(next);
    spread!.set(nextSpread());
}

export function useForexTick(): { data: Signal<Candle[]>; spreadPips: Signal<number> } {
    if (!feed) feed = signal(seed(WINDOW));

    if (!spread) spread = signal(0.1);

    if (subscribers === 0 && !timer) timer = setInterval(tick, INTERVAL_MS);

    subscribers++;

    inject(DestroyRef).onDestroy(() => {
        subscribers--;

        if (subscribers <= 0 && timer) {
            clearInterval(timer);
            timer = null;
        }
    });

    return { data: feed.asReadonly(), spreadPips: spread.asReadonly() };
}
