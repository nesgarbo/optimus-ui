import { DestroyRef, type Signal, inject, signal } from '@angular/core';

export const WINDOW = 48;
export const INTERVAL_MS = 5000;

let rngState = 314;

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
    const drift = (seededRandom() - 0.495) * 240 + Math.sin(rngState / 40000) * 60;
    const close = +(open + drift).toFixed(2);
    const vol = 120 + seededRandom() * 260;
    const high = +(Math.max(open, close) + seededRandom() * vol).toFixed(2);
    const low = +(Math.min(open, close) - seededRandom() * vol).toFixed(2);

    return { ts: Date.now(), open, high, low, close };
}

function seed(n: number): Candle[] {
    const out: Candle[] = [];
    let prev: Candle = {
        ts: Date.now() - n * INTERVAL_MS,
        open: 95000,
        high: 95100,
        low: 94900,
        close: 95000
    };

    for (let i = n; i > 0; i--) {
        const c = nextCandle(prev);

        c.ts = Date.now() - i * INTERVAL_MS;
        out.push(c);
        prev = c;
    }

    return out;
}

let feed: ReturnType<typeof signal<Candle[]>> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let subscribers = 0;

function tick() {
    const f = feed!;
    const prev = f()[f().length - 1];

    if (!prev) return;

    const next = [...f(), nextCandle(prev)];

    if (next.length > WINDOW) next.splice(0, next.length - WINDOW);

    f.set(next);
}

export function useCryptoStream(): Signal<Candle[]> {
    if (!feed) feed = signal(seed(WINDOW));

    if (subscribers === 0 && !timer) timer = setInterval(tick, INTERVAL_MS);

    subscribers++;

    inject(DestroyRef).onDestroy(() => {
        subscribers--;

        if (subscribers <= 0 && timer) {
            clearInterval(timer);
            timer = null;
        }
    });

    return feed.asReadonly();
}
