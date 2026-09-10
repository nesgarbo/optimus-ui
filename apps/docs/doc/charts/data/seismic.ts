export const CURRENT_PPM = 422.8;
export const PREV_PPM = 421.4;

export const MIN_PPM = 280;
export const MAX_PPM = 450;

export const SAFE_LIMIT = 350;
export const WATCH_LIMIT = 400;

export const ZONE_RANGES: Record<string, string> = {
    Safe: `${MIN_PPM} – ${SAFE_LIMIT} ppm`,
    Watch: `${SAFE_LIMIT} – ${WATCH_LIMIT} ppm`,
    Critical: `${WATCH_LIMIT} – ${MAX_PPM} ppm`
};

export const ZONE_DESC: Record<string, string> = {
    Safe: 'Pre-industrial to safe upper boundary',
    Watch: 'Elevated — above the 350 ppm safe limit',
    Critical: 'Dangerous — first crossed 400 ppm in 2013'
};
