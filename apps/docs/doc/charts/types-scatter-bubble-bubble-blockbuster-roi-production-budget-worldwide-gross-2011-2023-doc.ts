import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow } from '@openng/optimus-ui/charts';
import { disney, universal, warner, paramount, sony, type Film } from '@/doc/charts/data/boxOffice';
import { injectIsDarkMode } from '@/doc/charts/_shared/inject-chart-theme';

const STUDIOS = {
    disney: { name: 'Disney / Marvel / Lucasfilm', color: '#ff6fae', data: disney },
    universal: { name: 'Universal', color: '#5daeea', data: universal },
    warner: { name: 'Warner Bros', color: '#7c8cff', data: warner },
    paramount: { name: 'Paramount', color: '#ffad5a', data: paramount },
    sony: { name: 'Sony / Columbia', color: '#5ccf9f', data: sony }
};

function formatMoneyValue(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(2)}B`;

    return `$${n}M`;
}

function calloutColors(dark: boolean) {
    return {
        bg: dark ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.94)',
        border: dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
        text: dark ? '#f8fafc' : '#0f172a',
        connector: dark ? 'rgba(255,255,255,0.28)' : 'rgba(15,23,42,0.28)'
    };
}

function measureTextWidth(text: string, fontFamily: string): number {
    if (typeof document === 'undefined') return text.length * 6.4;

    const c2d = document.createElement('canvas').getContext('2d');

    if (!c2d) return text.length * 6.4;

    c2d.font = `600 10.5px ${fontFamily}`;

    return c2d.measureText(text).width;
}

interface RoiLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    fs: number;
}

interface Highlight {
    px: number;
    py: number;
    tx: number;
    ty: number;
    rx: number;
    w: number;
    bh: number;
    fs: number;
    anchor: string;
    title: string;
    bg: string;
    border: string;
    text: string;
    connector: string;
}

@Component({
    selector: 'types-scatter-bubble-bubble-blockbuster-roi-production-budget-worldwide-gross-2011-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartXAxis type="logarithmic"</i> and <i>ChartYAxis type="logarithmic"</i> collapse the data so ROI thresholds appear as straight diagonals regardless of scale. A <i>ChartAnnotation</i> with <i>placement="beforeData"</i> fills the
                profitable band and draws three ROI reference diagonals before any data renders; a second <i>ChartAnnotation</i> spotlights three notable outliers. <i>tickFormat</i> on both axes doubles as the tooltip number formatter, turning raw
                values into <i>$2.8B</i> without a custom render callback.
            </p>
            <p>#### SvgBubbleBoxOfficeDemo.ts</p>
            <p>#### boxOffice.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g>
                                    @for (l of roiLines(ctx); track l.label) {
                                        <svg:line [attr.x1]="l.x1" [attr.y1]="l.y1" [attr.x2]="l.x2" [attr.y2]="l.y2" stroke="#94a3b8" stroke-width="1" stroke-dasharray="5 4" opacity="0.55" />
                                        <svg:text [attr.x]="l.x2 - 6" [attr.y]="l.y2 - 4" text-anchor="end" [attr.font-size]="l.fs" font-weight="600" opacity="0.85">{{ l.label }}</svg:text>
                                    }
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-scatter id="disney" [data]="studios.disney.data" valueXField="budget" valueYField="gross" sizeField="franchise" [color]="studios.disney.color" [name]="studios.disney.name" [minSize]="8" [maxSize]="28" />
                        <p-chart-scatter id="universal" [data]="studios.universal.data" valueXField="budget" valueYField="gross" sizeField="franchise" [color]="studios.universal.color" [name]="studios.universal.name" [minSize]="8" [maxSize]="28" />
                        <p-chart-scatter id="warner" [data]="studios.warner.data" valueXField="budget" valueYField="gross" sizeField="franchise" [color]="studios.warner.color" [name]="studios.warner.name" [minSize]="8" [maxSize]="28" />
                        <p-chart-scatter id="paramount" [data]="studios.paramount.data" valueXField="budget" valueYField="gross" sizeField="franchise" [color]="studios.paramount.color" [name]="studios.paramount.name" [minSize]="8" [maxSize]="28" />
                        <p-chart-scatter id="sony" [data]="studios.sony.data" valueXField="budget" valueYField="gross" sizeField="franchise" [color]="studios.sony.color" [name]="studios.sony.name" [minSize]="8" [maxSize]="28" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g>
                                    @for (c of highlights(ctx); track c.title) {
                                        <svg:line [attr.x1]="c.px" [attr.y1]="c.py" [attr.x2]="c.tx" [attr.y2]="c.ty" [attr.stroke]="c.connector" stroke-width="1" stroke-dasharray="2 3" />
                                        <svg:rect [attr.x]="c.rx" [attr.y]="c.ty - c.bh / 2" [attr.width]="c.w" [attr.height]="c.bh" rx="4" ry="4" [attr.fill]="c.bg" [attr.stroke]="c.border" stroke-width="1" />
                                        <svg:text [attr.x]="c.tx" [attr.y]="c.ty" [attr.text-anchor]="c.anchor" dominant-baseline="central" [attr.font-size]="c.fs" font-weight="600" [attr.fill]="c.text">{{ c.title }}</svg:text>
                                    }
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-legend position="top" />
                        <p-chart-hover [brightness]="1.1" />
                        <p-chart-x-axis label="Production budget" type="logarithmic" [tickFormat]="formatMoney" />
                        <p-chart-y-axis label="Worldwide box-office gross" type="logarithmic" [tickFormat]="formatMoney" />
                        <p-chart-title text="Blockbuster ROI — budget vs worldwide gross, 2011–2023" />
                        <p-chart-caption text="Bubble = films in franchise · Log-log axes collapse constant-ROI lines into straight parallels · Source: Box Office Mojo · The-Numbers.com" />
                        <p-chart-export-menu filename="blockbuster-roi-2011-2023" />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterBubbleBubbleBlockbusterRoiProductionBudgetWorldwideGross20112023Doc {
    readonly isDark = injectIsDarkMode();
    readonly studios = STUDIOS;
    readonly formatMoney = (v: TickValue) => formatMoneyValue(Number(v));

    readonly tooltipRows = (_value: number, ctx: { label: string; index?: number }): TooltipRow[] => {
        const studio = Object.values(STUDIOS).find((s) => s.name === ctx.label);
        const film = studio?.data[ctx.index!] as Film | undefined;

        if (!film) return [];

        const roi = film.gross / film.budget;
        const roiColor = roi >= 2 ? '#10a981' : roi >= 1 ? '#ffad5a' : '#e5484d';

        return [
            { label: film.title, value: '' },
            { label: 'Budget', value: formatMoneyValue(film.budget) },
            { label: 'Worldwide gross', value: formatMoneyValue(film.gross) },
            { label: 'ROI', value: `${roi.toFixed(1)}×`, color: roiColor }
        ];
    };

    roiLines(actx: AnnotationContext): RoiLine[] {
        if (!actx.xScale || !actx.yScale) return [];

        const area = actx.chartArea;
        const fs = actx.responsive.pick({ xs: 9, sm: 10, md: 10.5 });
        const lines: RoiLine[] = [];

        for (const { roi, label } of [
            { roi: 5, label: '5× ROI' },
            { roi: 10, label: '10× ROI' }
        ]) {
            const samples: { x: number; y: number }[] = [];

            for (let b = 30; b <= 600; b += 5) {
                const x = actx.xScale(b);
                const y = actx.yScale(b * roi);

                if (x == null || y == null) continue;

                if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) samples.push({ x, y });
            }

            if (samples.length < 2) continue;

            const a = samples[0]!;
            const b = samples[samples.length - 1]!;

            lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, label, fs });
        }

        return lines;
    }

    highlights(actx: AnnotationContext): Highlight[] {
        if (!actx.xScale || !actx.yScale) return [];

        const colors = calloutColors(this.isDark());
        const callouts = [
            { title: 'Endgame · 7.9× ROI', budget: 356, gross: 2799, dx: -10, dy: -22, anchor: 'end' as const },
            { title: 'Joker · 19.5× ROI', budget: 55, gross: 1074, dx: 14, dy: -4, anchor: 'start' as const },
            { title: 'Top Gun: Mav · 8.8× ROI', budget: 170, gross: 1496, dx: 12, dy: 14, anchor: 'start' as const }
        ];
        const out: Highlight[] = [];

        for (const c of callouts) {
            const px = actx.xScale(c.budget);
            const py = actx.yScale(c.gross);

            if (px == null || py == null) continue;

            const tx = px + c.dx;
            const ty = py + c.dy;
            const tw = measureTextWidth(c.title, actx.fontFamily);
            const rx = c.anchor === 'end' ? tx - tw - 6 : tx - 6;
            const fs = actx.responsive.pick({ xs: 9, sm: 10, md: 10.5 });
            const bh = actx.responsive.pick({ xs: 13, sm: 14, md: 16 });

            out.push({ px, py, tx, ty, rx, w: tw + 12, bh, fs, anchor: c.anchor, title: c.title, ...colors });
        }

        return out;
    }
}
