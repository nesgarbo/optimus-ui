import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { pointGuards, shootingGuards, smallForwards, powerForwards, centers, ptsRanked, astRanked } from '@/doc/charts/data/nbaPositions';

const COLORS = {
    pg: '#5daeea',
    sg: '#ffad5a',
    sf: '#7c8cff',
    pf: '#ff6fae',
    c: '#5ccf9f'
};

const positions = {
    pg: { name: 'Point Guard', data: pointGuards, color: COLORS.pg },
    sg: { name: 'Shooting Guard', data: shootingGuards, color: COLORS.sg },
    sf: { name: 'Small Forward', data: smallForwards, color: COLORS.sf },
    pf: { name: 'Power Forward', data: powerForwards, color: COLORS.pf },
    c: { name: 'Center', data: centers, color: COLORS.c }
};

@Component({
    selector: 'types-scatter-bubble-scatter-nba-2023-24-scorers-vs-playmakers-by-position-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Five <i>ChartScatter</i> series assign a distinct marker shape per position: circle for PG, square for SG, triangle for SF, cross for PF, and star for C. Shapes keep position clusters visually separable even when
                <i>ChartLegend</i> items are toggled. <i>ChartAnnotation</i> paints a soft ring and callout pill around three statistical outliers: the assists leader, the scoring leader, and a positional anomaly.
            </p>
            <p>#### SvgScatterNbaPositionsDemo.ts</p>
            <p>#### nbaPositions.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-scatter id="pg" [data]="pointGuards" valueXField="ast" valueYField="pts" [color]="colors.pg" name="Point Guards" markerShape="circle" [markerSize]="9" />
                    <p-chart-scatter id="sg" [data]="shootingGuards" valueXField="ast" valueYField="pts" [color]="colors.sg" name="Shooting Guards" markerShape="square" [markerSize]="9" />
                    <p-chart-scatter id="sf" [data]="smallForwards" valueXField="ast" valueYField="pts" [color]="colors.sf" name="Small Forwards" markerShape="triangle" [markerSize]="10" />
                    <p-chart-scatter id="pf" [data]="powerForwards" valueXField="ast" valueYField="pts" [color]="colors.pf" name="Power Forwards" markerShape="cross" [markerSize]="11" />
                    <p-chart-scatter id="c" [data]="centers" valueXField="ast" valueYField="pts" [color]="colors.c" name="Centers" markerShape="star" [markerSize]="11" />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-legend position="top" />
                    <p-chart-hover [brightness]="1.1" />
                    <p-chart-x-axis label="Assists per game" />
                    <p-chart-y-axis label="Points per game" />
                    <p-chart-title text="NBA 2023-24 — scorers vs playmakers, by position" />
                    <p-chart-caption text="Per-game averages · 18+ PPG or 7+ APG threshold · Source: NBA.com/stats · Basketball-Reference" />
                    <p-chart-export-menu filename="nba-2023-24-scorers-vs-playmakers" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterNba202324ScorersVsPlaymakersByPositionDoc {
    readonly pointGuards = pointGuards;
    readonly shootingGuards = shootingGuards;
    readonly smallForwards = smallForwards;
    readonly powerForwards = powerForwards;
    readonly centers = centers;
    readonly colors = COLORS;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const pos = positions[ctx.datasetId as keyof typeof positions];

        if (!pos) return [];

        const player = pos.data[ctx.index!];

        if (!player) return [];

        const ptsRank = ptsRanked.findIndex((p) => p.name === player.name) + 1;
        const astRank = astRanked.findIndex((p) => p.name === player.name) + 1;

        return [
            { label: player.name, value: '' },
            { label: pos.name, value: `${player.abbr} · ${player.team}`, color: pos.color },
            { label: 'Points / game', value: `${player.pts.toFixed(1)} (#${ptsRank})` },
            { label: 'Assists / game', value: `${player.ast.toFixed(1)} (#${astRank})` }
        ];
    };
}
