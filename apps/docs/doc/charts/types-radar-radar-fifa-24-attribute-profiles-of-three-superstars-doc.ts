import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { footballStars as data } from '@/doc/charts/data/footballStars';

@Component({
    selector: 'types-radar-radar-fifa-24-attribute-profiles-of-three-superstars-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>fillOpacity</i> keeps three overlapping polygons individually readable where they intersect. A custom <i>ChartTooltip</i> renders an inline mini bar-chart row per series, bolding the leader at each spoke. <i>ChartLegend</i> at the
                top handles dataset toggling.
            </p>
            <p>#### SvgRadarFootballStarsDemo.ts</p>
            <p>#### footballStars.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700 }">
                        <p-chart-radar id="messi" [data]="data" categoryXField="attr" valueYField="messi" name="Messi" color="#ff6fae" [fillOpacity]="0.15" [lineStrokeWidth]="2" [markerSize]="4" />
                        <p-chart-radar id="mbappe" [data]="data" categoryXField="attr" valueYField="mbappe" name="Mbappé" color="#5daeea" [fillOpacity]="0.15" [lineStrokeWidth]="2" [markerSize]="4" />
                        <p-chart-radar id="haaland" [data]="data" categoryXField="attr" valueYField="haaland" name="Haaland" color="#5ccf9f" [fillOpacity]="0.15" [lineStrokeWidth]="2" [markerSize]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-tooltip mode="shared" />
                        <p-chart-hover />
                        <p-chart-legend position="top" />
                        <p-chart-title text="FIFA 24 — Attribute Profiles of Three Superstars" />
                        <p-chart-caption text="Mbappé leads Pace (97) · Messi leads Dribbling (94) and Passing (90) · Haaland leads Shooting (93) and Physical (88)" />
                        <p-chart-export-menu filename="fifa-superstars-radar" />
                        <p-chart-accessibility />
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
export class RadarRadarFifa24AttributeProfilesOfThreeSuperstarsDoc {
    readonly data = data;
}
