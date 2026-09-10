import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRenderContext } from '@openng/optimus-ui/charts';
import { consultingPhases as data, HOURLY_RATE } from '@/doc/charts/data/consultingPhases';

const PHASE = {
    discovery: { color: '#5daeea', label: 'Discovery' },
    build: { color: '#ffad5a', label: 'Build' },
    deploy: { color: '#5ccf9f', label: 'Deploy' }
};

type Row = (typeof data)[number];
interface Seg {
    key: string;
    val: number;
    color: string;
    label: string;
    pct: number;
}

@Component({
    selector: 'types-radar-stacked-digital-transformation-engagement-hours-by-service-phase-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Three <i>ChartRadar</i> series inside <i>ChartStacked</i> build concentric phase rings; the outermost ring represents total hours per service spoke. <i>ChartLegend</i> is interactive: toggle any phase to watch the rings recompute. A
                custom <i>ChartTooltip</i> leads with an inline stacked-bar breakdown of the hovered service's phase mix.
            </p>
            <p>#### SvgRadarStackedConsultingPhasesDemo.ts</p>
            <p>#### consultingPhases.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 800 }">
                    <p-chart-stacked>
                        <p-chart-radar id="discovery" [data]="data" categoryXField="service" valueYField="discovery" name="Discovery" color="#5daeea" [fillOpacity]="0.65" [lineStrokeWidth]="1" />
                        <p-chart-radar id="build" [data]="data" categoryXField="service" valueYField="build" name="Build" color="#ffad5a" [fillOpacity]="0.7" [lineStrokeWidth]="1" />
                        <p-chart-radar id="deploy" [data]="data" categoryXField="service" valueYField="deploy" name="Deploy" color="#5ccf9f" [fillOpacity]="0.65" [lineStrokeWidth]="2" />
                    </p-chart-stacked>
                    <p-chart-x-axis />
                    <p-chart-y-axis gridShape="polygon" [tickCount]="4" gridStyle="dashed" />
                    <p-chart-tooltip>
                        <ng-template pChartTooltipDef let-ctx>
                            @let row = rowFor(ctx);
                            @if (row) {
                                @let t = tip(row);
                                <div style="padding:10px 14px;min-width:240px;background:rgba(10,10,10,0.78);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:8px;border:1px solid rgba(255,255,255,0.1);color:#fff">
                                    <div style="font-weight:600;font-size:13px;margin-bottom:8px">{{ row.service }}</div>
                                    <div style="display:flex;height:8px;border-radius:3px;overflow:hidden;margin-bottom:8px;background:rgba(255,255,255,0.06)">
                                        @for (s of t.segs; track s.key) {
                                            <span [style]="'background:' + s.color + ';width:' + s.pct + '%'"></span>
                                        }
                                    </div>
                                    @for (s of t.segs; track s.key) {
                                        <div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-top:2px">
                                            <span [style]="'width:8px;height:8px;border-radius:2px;flex-shrink:0;background:' + s.color"></span>
                                            <span style="width:76px;opacity:0.7">{{ s.label }}</span>
                                            <span style="flex:1;font-family:ui-monospace,SFMono-Regular,monospace;font-weight:600;text-align:right">{{ s.val }}h</span>
                                        </div>
                                    }
                                    <div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.12);font-size:12px">
                                        <div style="display:flex;justify-content:space-between">
                                            <span style="opacity:0.55">Total hours</span>
                                            <span style="font-family:ui-monospace,SFMono-Regular,monospace;font-weight:700">{{ t.total }}h</span>
                                        </div>
                                        <div style="display:flex;justify-content:space-between;margin-top:2px">
                                            <span style="opacity:0.55">&#64; \${{ hourlyRate }}/h</span>
                                            <span style="font-family:ui-monospace,SFMono-Regular,monospace;font-weight:700;color:#ffad5a">\${{ billing(t.total) }}</span>
                                        </div>
                                    </div>
                                </div>
                            }
                        </ng-template>
                    </p-chart-tooltip>
                    <p-chart-hover />
                    <p-chart-legend position="bottom" />
                    <p-chart-title text="Digital Transformation Engagement — Hours by Service × Phase" />
                    <p-chart-caption text="Three-phase stack on six service lines · dashed polygon grid · Deploy (outer ring) shows total committed hours · tooltip breaks down phase mix and billing estimate" />
                    <p-chart-export-menu filename="consulting-hours-stacked-radar" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedDigitalTransformationEngagementHoursByServicePhaseDoc {
    readonly data = data;
    readonly hourlyRate = HOURLY_RATE;

    rowFor(ctx: TooltipRenderContext): Row | undefined {
        return data.find((d) => d.service === ctx.label);
    }

    tip(row: Row): { segs: Seg[]; total: number } {
        const total = row.discovery + row.build + row.deploy;
        const segs: Seg[] = [
            { key: 'discovery', val: row.discovery, color: PHASE.discovery.color, label: PHASE.discovery.label, pct: (row.discovery / total) * 100 },
            { key: 'build', val: row.build, color: PHASE.build.color, label: PHASE.build.label, pct: (row.build / total) * 100 },
            { key: 'deploy', val: row.deploy, color: PHASE.deploy.color, label: PHASE.deploy.label, pct: (row.deploy / total) * 100 }
        ];

        return { segs, total };
    }

    billing(total: number): string {
        return (total * HOURLY_RATE).toLocaleString('en-US');
    }
}
