import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { engineeringTeams as data } from '@/doc/charts/data/engineeringTeams';

@Component({
    selector: 'types-radar-radar-engineering-team-assessment-reference-bands-and-lines-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartReferenceBand</i> shades performance tiers using <i>y1</i>/<i>y2</i> bounds; <i>ChartReferenceLine</i> marks the exact threshold values as dashed rings. The same components used on cartesian charts work on radar with no extra
                API. The tooltip classifies each spoke into the same tier bands with color-coded chips.
            </p>
            <p>#### SvgRadarReferenceZonesDemo.ts</p>
            <p>#### engineeringTeams.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-reference-band [y1]="0" [y2]="50" fill="#ff7a66" [fillOpacity]="0.07" />
                    <p-chart-reference-band [y1]="50" [y2]="75" fill="#5daeea" [fillOpacity]="0.08" />
                    <p-chart-reference-band [y1]="75" [y2]="100" fill="#5ccf9f" [fillOpacity]="0.09" />
                    <p-chart-reference-line [y]="50" stroke="#ff7a66" [lineStrokeWidth]="1" [lineDash]="[5, 4]" label="Watch" />
                    <p-chart-reference-line [y]="75" stroke="#5ccf9f" [lineStrokeWidth]="1" [lineDash]="[5, 4]" label="Ready" />
                    <p-chart-radar id="alpha" [data]="data" categoryXField="axis" valueYField="alpha" name="Team Alpha" color="#5daeea" [fillOpacity]="0.18" [lineStrokeWidth]="2" />
                    <p-chart-radar id="beta" [data]="data" categoryXField="axis" valueYField="beta" name="Team Beta" color="#ffad5a" [fillOpacity]="0.18" [lineStrokeWidth]="2" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-hover />
                    <p-chart-legend position="top" />
                    <p-chart-title text="Engineering Team Performance Assessment" />
                    <p-chart-caption text="Coral watch zone 0-50 · Azure build zone 50-75 · Mint ready zone 75-100 · dashed rings = thresholds" />
                    <p-chart-export-menu filename="team-performance-radar" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadarEngineeringTeamAssessmentReferenceBandsAndLinesDoc {
    readonly data = data;
}
