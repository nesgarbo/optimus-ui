import { computed, DestroyRef, inject, signal } from '@angular/core';

export interface KpiRow {
    kpi: string;
    score: number;
}

export const KPIS = ['Revenue Growth', 'Cust. Satisfaction', 'Market Share', 'Product Quality', 'Eng. Velocity', 'Cost Efficiency'];
export const TARGET = 75;

export const quarterlyScores: Record<string, number[]> = {
    'Q1 2023': [42, 58, 35, 52, 48, 65],
    'Q2 2023': [48, 63, 40, 57, 54, 67],
    'Q3 2023': [55, 68, 44, 62, 60, 70],
    'Q4 2023': [63, 72, 50, 67, 65, 73],
    'Q1 2024': [69, 74, 54, 71, 68, 76],
    'Q2 2024': [74, 78, 59, 75, 73, 79],
    'Q3 2024': [80, 82, 64, 79, 77, 82],
    'Q4 2024': [85, 86, 69, 83, 81, 85]
};

export const quarters = Object.keys(quarterlyScores);

const STEP_MS = 800;

const selectedIdx = signal(0);
const isPlaying = signal(false);
let timer: ReturnType<typeof setInterval> | null = null;
let subscribers = 0;

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {
        const next = selectedIdx() + 1;

        if (next >= quarters.length) {
            stopTimer();
            isPlaying.set(false);

            return;
        }

        selectedIdx.set(next);
    }, STEP_MS);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

export function togglePlay() {
    if (isPlaying()) {
        isPlaying.set(false);
        stopTimer();

        return;
    }

    if (selectedIdx() >= quarters.length - 1) selectedIdx.set(0);

    isPlaying.set(true);
    startTimer();
}

export function setIdx(idx: number) {
    selectedIdx.set(idx);
}

export function useKpiPlayback() {
    subscribers++;
    if (isPlaying()) startTimer();

    const data = computed<KpiRow[]>(() => KPIS.map((kpi, i) => ({ kpi, score: quarterlyScores[quarters[selectedIdx()]][i] })));

    inject(DestroyRef).onDestroy(() => {
        subscribers--;
        if (subscribers <= 0) stopTimer();
    });

    return { selectedIdx, isPlaying, data, togglePlay, setIdx };
}
