import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type FillValue } from '@openng/optimus-ui/charts';
import { saasTier as data } from '@/doc/charts/data/saasTier';

const GRAD: Record<string, FillValue> = {
    free: {
        linearGradient: { direction: 'vertical' },
        stops: [
            { offset: 0, color: '#94a3b8' },
            { offset: 1, color: '#64748b' }
        ]
    },
    pro: {
        linearGradient: { direction: 'vertical' },
        stops: [
            { offset: 0, color: '#7dd3fc' },
            { offset: 1, color: '#5daeea' }
        ]
    },
    enterprise: {
        linearGradient: { direction: 'vertical' },
        stops: [
            { offset: 0, color: '#a78bfa' },
            { offset: 1, color: '#7c8cff' }
        ]
    }
};

@Component({
    selector: 'types-radar-stacked-saas-platform-monthly-usage-by-plan-tier-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>curve="smooth"</i> softens the polygon outlines to spline curves. Each series takes a vertical <i>GradientColor</i> object, giving the stacked rings depth at the fill level. The tooltip shows each tier's share of the hovered metric
                as both a percentage and a raw value.
            </p>
            <p>#### SvgRadarStackedSaasTierDemo.ts</p>
            <p>#### saasTier.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700 }">
                        <p-chart-stacked>
                            <p-chart-radar id="free" [data]="data" categoryXField="metric" valueYField="free" name="Free" [color]="grad.free" [fillOpacity]="0.6" [lineStrokeWidth]="1.2" curve="smooth" />
                            <p-chart-radar id="pro" [data]="data" categoryXField="metric" valueYField="pro" name="Pro" [color]="grad.pro" [fillOpacity]="0.65" [lineStrokeWidth]="1.2" curve="smooth" />
                            <p-chart-radar id="enterprise" [data]="data" categoryXField="metric" valueYField="enterprise" name="Enterprise" [color]="grad.enterprise" [fillOpacity]="0.7" [lineStrokeWidth]="2" curve="smooth" />
                        </p-chart-stacked>
                        <p-chart-x-axis />
                        <p-chart-y-axis gridShape="circle" [tickCount]="5" />
                        <p-chart-tooltip mode="shared" [valueFormatter]="format" />
                        <p-chart-hover />
                        <p-chart-legend position="top" />
                        <p-chart-title text="SaaS Platform — Monthly Usage by Plan Tier" />
                        <p-chart-caption text="Enterprise leads API Calls, Integrations, and Workspace Seats · Free tier drives Active Users and Sessions · outer ring = total across all tiers" />
                        <p-chart-export-menu filename="saas-usage-stacked-radar" />
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
export class RadarStackedSaasPlatformMonthlyUsageByPlanTierDoc {
    readonly data = data;
    readonly grad = GRAD;
    readonly format = (v: number) => `${v}K`;
}
