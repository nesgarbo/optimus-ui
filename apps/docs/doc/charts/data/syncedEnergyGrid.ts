const HOURS = Array.from({ length: 24 }, (_, h) => `${h.toString().padStart(2, '0')}:00`);

export const energy = HOURS.map((hour, h) => {
    const solarArc = Math.max(0, Math.sin(((h - 6) / 13) * Math.PI));
    const solar = +(solarArc * 18).toFixed(1);
    const wind = +(6 + Math.sin(h / 4) * 2.5).toFixed(1);
    const hydro = +(4 + Math.cos(h / 6) * 0.4).toFixed(1);
    const demand = +(28 + Math.sin(((h - 8) / 6) * Math.PI) * 12 + Math.sin(((h - 17) / 4) * Math.PI) * 10).toFixed(1);
    const gas = +Math.max(2, demand - solar - wind - hydro).toFixed(1);
    const renewables = +Math.min(100, Math.max(0, ((solar + wind + hydro) / demand) * 100)).toFixed(1);
    const frequency = +(50 + Math.sin(h / 3.5) * 0.1 + Math.cos(h / 7) * 0.06).toFixed(3);

    return {
        hour,
        solar,
        wind,
        hydro,
        gas,
        demand,
        renewables: +renewables,
        frequency
    };
});
