import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { europe, northAmerica, asiaPacific, latinOther, OECD_AVG_SPEND, OECD_AVG_LIFE, spendRanks } from '@/doc/charts/data/oecdHealthcare';

const REGIONS = {
    europe: { name: 'Europe', color: '#5daeea', data: europe },
    northamerica: { name: 'North America', color: '#e5484d', data: northAmerica },
    asiapacific: { name: 'Asia-Pacific', color: '#5ccf9f', data: asiaPacific },
    latinother: { name: 'Latin America & Other', color: '#ffad5a', data: latinOther }
};

const CHAR_W = 6.1;

interface UsaCallout {
    cx: number;
    cy: number;
    bx: number;
    by: number;
    bw: number;
    bh: number;
    fs: number;
    lineH: number;
    padY: number;
    lines: string[];
}

@Component({
    selector: 'types-scatter-bubble-bubble-oecd-healthcare-spend-vs-outcome-2022-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Bubble area encodes population so large-country circles read differently from small-country ones at the same X/Y position. Two <i>ChartReferenceLine</i>s divide the plot at OECD average spend and life expectancy;
                <i>ChartAnnotation</i> highlights the US as the highest-spend, below-average-life-expectancy outlier. The custom tooltip surfaces each country's spend rank across all 31 nations and its deviation from the OECD average.
            </p>
            <p>#### SvgBubbleOecdHealthcareDemo.ts</p>
            <p>#### oecdHealthcare.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-scatter id="europe" [data]="regions.europe.data" valueXField="spend" valueYField="life" sizeField="pop" [color]="regions.europe.color" [name]="regions.europe.name" [minSize]="8" [maxSize]="44" />
                    <p-chart-scatter id="northamerica" [data]="regions.northamerica.data" valueXField="spend" valueYField="life" sizeField="pop" [color]="regions.northamerica.color" [name]="regions.northamerica.name" [minSize]="8" [maxSize]="44" />
                    <p-chart-scatter id="asiapacific" [data]="regions.asiapacific.data" valueXField="spend" valueYField="life" sizeField="pop" [color]="regions.asiapacific.color" [name]="regions.asiapacific.name" [minSize]="8" [maxSize]="44" />
                    <p-chart-scatter id="latinother" [data]="regions.latinother.data" valueXField="spend" valueYField="life" sizeField="pop" [color]="regions.latinother.color" [name]="regions.latinother.name" [minSize]="8" [maxSize]="44" />
                    <p-chart-reference-line
                        [x]="oecdAvgSpend"
                        stroke="#64748b"
                        [lineStrokeWidth]="1.25"
                        [lineDash]="[4, 4]"
                        [label]="'OECD avg spend · $' + oecdAvgSpend.toLocaleString()"
                        labelPosition="end"
                        labelColor="#ffffff"
                        labelBackground="#475569"
                        [labelBackgroundOpacity]="0.85"
                        [labelPadding]="6"
                        [labelBorderRadius]="4"
                        [labelFontSize]="11"
                        [labelFontWeight]="600"
                    />
                    <p-chart-reference-line
                        [y]="oecdAvgLife"
                        stroke="#64748b"
                        [lineStrokeWidth]="1.25"
                        [lineDash]="[4, 4]"
                        [label]="'OECD avg life · ' + oecdAvgLife + ' yr'"
                        labelPosition="start"
                        labelColor="#ffffff"
                        labelBackground="#475569"
                        [labelBackgroundOpacity]="0.85"
                        [labelPadding]="6"
                        [labelBorderRadius]="4"
                        [labelFontSize]="11"
                        [labelFontWeight]="600"
                    />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (usaCallout(ctx); as u) {
                                <svg:g>
                                    <svg:circle [attr.cx]="u.cx" [attr.cy]="u.cy" r="40" fill="none" stroke="#e5484d" stroke-width="1.25" stroke-dasharray="4 3" opacity="0.45" />
                                    <svg:line [attr.x1]="u.bx + u.bw" [attr.y1]="u.by + u.bh / 2" [attr.x2]="u.cx - 41" [attr.y2]="u.cy" stroke="#e5484d" stroke-width="1" opacity="0.9" />
                                    <svg:rect [attr.x]="u.bx" [attr.y]="u.by" [attr.width]="u.bw" [attr.height]="u.bh" rx="4" ry="4" fill="rgba(239,68,68,0.95)" />
                                    @for (line of u.lines; track line; let i = $index) {
                                        <svg:text [attr.x]="u.bx + u.bw / 2" [attr.y]="u.by + u.padY + u.lineH / 2 + i * u.lineH" text-anchor="middle" dominant-baseline="central" [attr.font-size]="u.fs" font-weight="600" fill="#ffffff">
                                            {{ line }}
                                        </svg:text>
                                    }
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-legend position="top" />
                    <p-chart-hover [brightness]="1.1" />
                    <p-chart-x-axis label="Health spending per capita (PPP USD, 2022)" [tickFormat]="formatSpend" />
                    <p-chart-y-axis label="Life expectancy at birth (years)" [startFromZero]="false" [tickFormat]="formatLife" />
                    <p-chart-title text="OECD healthcare — spend vs outcome, 2022" />
                    <p-chart-caption text="Bubble = population (M) · Source: OECD Health Statistics 2023 · World Bank · UN Population Division" />
                    <p-chart-export-menu filename="oecd-healthcare-2022" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BubbleOecdHealthcareSpendVsOutcome2022Doc {
    readonly regions = REGIONS;
    readonly oecdAvgSpend = OECD_AVG_SPEND;
    readonly oecdAvgLife = OECD_AVG_LIFE;
    readonly formatSpend = (v: TickValue) => `$${(Number(v) / 1000).toFixed(0)}k`;
    readonly formatLife = (v: TickValue) => `${Number(v)} yr`;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const region = REGIONS[ctx.datasetId as keyof typeof REGIONS];

        if (!region) return [];

        const country = region.data[ctx.index!];

        if (!country) return [];

        const rank = spendRanks.get(country.name);
        const lifeDelta = country.life - OECD_AVG_LIFE;
        const lifeColor = lifeDelta >= 0 ? '#10a981' : '#e5484d';

        return [
            { label: country.name, value: '' },
            { label: 'OECD spend rank', value: `#${rank}` },
            { label: 'Spend per capita', value: `$${country.spend.toLocaleString()}` },
            { label: 'Life expectancy', value: `${country.life.toFixed(1)} yr` },
            { label: 'Population', value: `${country.pop < 10 ? country.pop.toFixed(1) : Math.round(country.pop)} M` },
            { label: 'vs OECD avg life', value: `${lifeDelta >= 0 ? '+' : ''}${lifeDelta.toFixed(1)} yr`, color: lifeColor }
        ];
    };

    usaCallout(actx: AnnotationContext): UsaCallout | null {
        if (!actx.xScale || !actx.yScale) return null;

        const usa = northAmerica.find((c) => c.name === 'USA')!;
        const cx = actx.xScale(usa.spend);
        const cy = actx.yScale(usa.life);

        if (cx == null || cy == null) return null;

        const fs = actx.responsive.pick({ xs: 9, sm: 10, md: 11 });
        const lines = actx.responsive.pick({
            xs: ['USA — highest spend,', 'below-avg life expectancy'],
            md: ['USA — highest spend, below-avg life expectancy']
        });
        const cw = CHAR_W * (fs / 11);
        const padX = 8;
        const padY = 5;
        const lineH = fs + 4;
        const tw = Math.max(...lines.map((l) => l.length * cw));
        const bw = tw + padX * 2;
        const bh = lines.length * lineH + padY * 2;

        return { cx, cy, bx: cx - bw - 14, by: cy - bh / 2, bw, bh, fs, lineH, padY, lines };
    }
}
