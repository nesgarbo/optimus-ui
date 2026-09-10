import { DestroyRef, type Signal, inject, signal } from '@angular/core';

export interface PricePoint {
    ts: number;
    price: number;
}

export const WINDOW = 50;
export const INTERVAL_MS = 1200;
export const INITIAL_PRICE = 182.5;

let rngState = 42;

function seededRandom() {
    let t = (rngState += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function simulatePrice(prev: number) {
    const drift = (seededRandom() - 0.498) * 1.8;
    const vol = (seededRandom() - 0.5) * 0.6;

    return +(prev + drift + vol).toFixed(2);
}

function seed(count: number) {
    const points: PricePoint[] = [];
    let price = INITIAL_PRICE;
    const now = Date.now();

    for (let i = count; i > 0; i--) {
        price = simulatePrice(price);
        points.push({ ts: now - i * INTERVAL_MS, price });
    }

    return points;
}

let feed: ReturnType<typeof signal<PricePoint[]>> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let subscribers = 0;

function tick() {
    const f = feed!;
    const prev = f()[f().length - 1];
    const price = simulatePrice(prev.price);
    const next = [...f(), { ts: Date.now(), price }];

    if (next.length > WINDOW) next.splice(0, next.length - WINDOW);

    f.set(next);
}

export function usePriceFeed(): Signal<PricePoint[]> {
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
