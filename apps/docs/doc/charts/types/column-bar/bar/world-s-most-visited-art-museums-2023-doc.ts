import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type ItemContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { mostVisitedMuseums as data } from '@/doc/charts/data/mostVisitedMuseums';

const BLOCKBUSTER_MIN = 5.0;
const BLOCKBUSTER_MAX = Math.ceil(Math.max(...data.map((d) => d.visitors)));
const RANK_COLORS = ['#2531a8', '#2176ff', '#36b7d6', '#5daeea', '#4ecdc4', '#7c8cff', '#a78bfa', '#94a3b8'];
const CALLOUT_COLOR = '#ffad5a';
const BLOCKBUSTER_COLOR = '#7c8cff';

interface Callout {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    bx: number;
    by: number;
    bw: number;
    bh: number;
}

@Component({
    selector: 'types-column-bar-bar-world-s-most-visited-art-museums-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartReferenceBand</i> draws a shaded threshold strip so bars that clear it stand out visually. A <i>color</i> callback applies an ordered cool palette so rank encodes in both bar height and fill. <i>ChartDataLabels</i> labels each
                bar directly, and the tooltip adds city, year-over-year change, and a conditional tier flag.
            </p>
            <p>#### SvgBarMostVisitedMuseumsDemo.ts</p>
            <p>#### mostVisitedMuseums.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                <p-chart-bar [data]="data" categoryXField="museum" valueYField="visitors" [color]="barColorAccessor" [borderRadius]="4" [categoryGap]="0.28" />
                <p-chart-reference-band [y1]="blockbusterMin" [y2]="blockbusterMax" label="Blockbuster tier (5M+)" [fill]="blockbusterColor" [fillOpacity]="0.08" labelPosition="end" />
                <p-chart-data-labels display="value" [formatter]="formatMillions" [fontSize]="10" />
                <p-chart-annotation>
                    <ng-template pChartAnnotationDef let-ctx>
                        @let c = callout(ctx);
                        @if (c) {
                            <svg:g>
                                <svg:line [attr.x1]="c.x1" [attr.y1]="c.y1" [attr.x2]="c.x2" [attr.y2]="c.y2" [attr.stroke]="calloutColor" stroke-width="1" stroke-dasharray="4 3" opacity="0.6" />
                                <svg:rect [attr.x]="c.bx" [attr.y]="c.by" [attr.width]="c.bw" [attr.height]="c.bh" rx="4" fill="none" [attr.stroke]="calloutColor" stroke-width="1.5" opacity="0.7" />
                                <svg:text [attr.x]="c.bx + 8" [attr.y]="c.by + 13" font-size="11" font-weight="600" opacity="0.9">Louvre: 8.86M visitors</svg:text>
                                <svg:text [attr.x]="c.bx + 8" [attr.y]="c.by + 27" font-size="10" opacity="0.55">Still #1 worldwide · +14% YoY</svg:text>
                            </svg:g>
                        }
                    </ng-template>
                </p-chart-annotation>
                <p-chart-tooltip [valueFormatter]="tooltipRows" />
                <p-chart-hover />
                <p-chart-x-axis [tickRotation]="-30" />
                <p-chart-y-axis [tickFormat]="formatAxis" />
                <p-chart-title text="World's Most-Visited Art Museums, 2023" />
                <p-chart-caption text="Annual visitors in millions · Source: TEA/AECOM Theme Index & Museum Report 2023" />
                <p-chart-export-menu filename="most-visited-museums-2023" />
                <p-chart-accessibility />
            </p-chart-svg>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarWorldSMostVisitedArtMuseums2023Doc {
    readonly data = data;
    readonly blockbusterMin = BLOCKBUSTER_MIN;
    readonly blockbusterMax = BLOCKBUSTER_MAX;
    readonly blockbusterColor = BLOCKBUSTER_COLOR;
    readonly calloutColor = CALLOUT_COLOR;

    readonly barColorAccessor = (ctx: ItemContext): string => RANK_COLORS[ctx.index % RANK_COLORS.length];
    readonly formatMillions = (v: number): string => (Number(v) === 0 ? '' : `${Number(v).toFixed(2)}M`);
    readonly formatAxis = (v: TickValue): string => `${Number(v).toFixed(0)}M`;

    callout(ctx: AnnotationContext): Callout | null {
        const { chartArea, xScale, yScale } = ctx;

        if (!chartArea || !xScale || !yScale) return null;

        const bw = 172;
        const bh = 36;
        const bx = chartArea.x + chartArea.width - bw;
        const by = chartArea.y + 8;

        return { x1: xScale(0), y1: yScale(data[0].visitors) - 4, x2: bx, y2: by + bh, bx, by, bw, bh };
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index!];

        if (!item) return [];

        const rank = ctx.index! + 1;
        const yoyLabel = item.yoy >= 0 ? `+${item.yoy.toFixed(1)}%` : `${item.yoy.toFixed(1)}%`;
        const yoyColor = item.yoy > 0 ? '#10a981' : item.yoy < 0 ? '#e5484d' : '#94a3b8';

        const rows: TooltipRow[] = [
            { label: '', value: item.city },
            { label: 'Rank', value: `#${rank}` },
            { label: 'Annual visitors', value: `${item.visitors.toFixed(2)}M` },
            { label: 'YoY change', value: yoyLabel, color: yoyColor }
        ];

        if (item.visitors >= BLOCKBUSTER_MIN) {
            rows.push({ label: '', value: 'In the 5M+ blockbuster tier' });
        }

        return rows;
    };
}
