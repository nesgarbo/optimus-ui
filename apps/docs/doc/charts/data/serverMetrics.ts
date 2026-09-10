import { DestroyRef, type Signal, inject, signal } from '@angular/core';

export interface ServerMetric {
    ts: number;
    cpu: number;
    mem: number;
}

export const WINDOW = 60;
export const INTERVAL_MS = 1000;

let rngState = 123;

function seededRandom() {
    let t = (rngState += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function simulateCpu(prev: number) {
    const drift = (seededRandom() - 0.48) * 12;
    const spike = seededRandom() < 0.04 ? 25 : 0;

    return Math.min(100, Math.max(5, prev + drift + spike));
}

export function simulateMemory(prev: number) {
    const drift = (seededRandom() - 0.5) * 3;

    return Math.min(95, Math.max(30, prev + drift));
}

function seed(count: number) {
    const points: ServerMetric[] = [];
    let cpu = 35 + seededRandom() * 20;
    let mem = 55 + seededRandom() * 10;
    const now = Date.now();

    for (let i = count; i > 0; i--) {
        cpu = simulateCpu(cpu);
        mem = simulateMemory(mem);
        points.push({
            ts: now - i * INTERVAL_MS,
            cpu: +cpu.toFixed(1),
            mem: +mem.toFixed(1)
        });
    }

    return points;
}

let feed: ReturnType<typeof signal<ServerMetric[]>> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let subscribers = 0;

function tick() {
    const f = feed!;
    const prev = f()[f().length - 1];
    const cpu = +simulateCpu(prev.cpu).toFixed(1);
    const mem = +simulateMemory(prev.mem).toFixed(1);
    const next = [...f(), { ts: Date.now(), cpu, mem }];

    if (next.length > WINDOW) next.splice(0, next.length - WINDOW);

    f.set(next);
}

/** Shared live feed — one ref-counted timer across every consumer (mirrors the Vue composable). */
export function useServerMetrics(): Signal<ServerMetric[]> {
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
