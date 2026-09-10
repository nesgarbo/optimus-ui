import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { fxHourly, SESSION_PAIRS, type HourSlot } from '@/doc/charts/data/fxTrading';

const SESSION_COLORS: Record<string, string> = {
    Sydney: '#818cf8',
    Tokyo: '#0ea5e9',
    'Tokyo / London': '#06b6d4',
    London: '#0891b2',
    'London / New York': '#ea580c',
    'New York': '#d97706'
};

@Component({
    selector: 'types-polar-polar-global-fx-market-24-hour-trading-volume-cycle-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The <i>colors</i> input receives a session-lookup function so each bar picks its own hue by trading session, encoding the dominant market alongside bar length. The 24-spoke layout maps relative volume around the clock, making the
                London/New York overlap spike clearly visible. The custom tooltip surfaces the most-active currency pairs per hour.
            </p>
            <p>#### SvgPolarFxTradingDemo.ts</p>
            <p>#### fxTrading.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 800 }">
                        <p-chart-polar [data]="data" categoryXField="hour" valueYField="volume" [color]="barColor" />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="3" [gridOpacity]="0.3" />
                        <p-chart-tooltip>
                            <ng-template pChartTooltipDef let-ctx>
                                @if (item(ctx.index); as it) {
                                    <div style="padding:10px 14px;min-width:220px;background:rgba(10,10,10,0.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:8px;border:1px solid rgba(255,255,255,0.1);color:#fff">
                                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                                            <span [style]="'width:9px;height:9px;border-radius:50%;flex-shrink:0;background:' + sessionColor(it.session)"></span>
                                            <span style="font-weight:600;font-size:13px">{{ it.hour }}:00 – {{ it.hour }}:59 UTC</span>
                                        </div>
                                        <div style="font-size:11px;opacity:0.5;margin-bottom:8px;padding-left:17px">{{ it.session }}</div>
                                        <div style="margin-bottom:6px">
                                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                                                <span style="opacity:0.7">Volume index</span>
                                                <span style="font-weight:700;font-family:ui-monospace,monospace">{{ it.volume }}</span>
                                            </div>
                                            <div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden">
                                                <div [style]="'height:100%;border-radius:2px;width:' + it.volume + '%;background:' + sessionColor(it.session)"></div>
                                            </div>
                                        </div>
                                        @if (pairs(it.session).length) {
                                            <div style="padding-top:6px;border-top:1px solid rgba(255,255,255,0.1)">
                                                <div style="font-size:10px;opacity:0.45;margin-bottom:4px">Most active pairs</div>
                                                <div style="display:flex;gap:4px;flex-wrap:wrap">
                                                    @for (pr of pairs(it.session); track pr) {
                                                        <span
                                                            [style]="
                                                                'font-size:10px;padding:2px 5px;border-radius:3px;font-family:ui-monospace,monospace;font-weight:600;background:' + sessionColor(it.session) + '22;color:' + sessionColor(it.session)
                                                            "
                                                            >{{ pr }}</span
                                                        >
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-hover [brightness]="1.12" />
                        <p-chart-title text="Global FX Market — 24-Hour Trading Volume Cycle" />
                        <p-chart-caption text="London / NY overlap (13:00–16:00 UTC) drives 3× the volume of Tokyo's quiet early hours · colour encodes active session · volume index, peak = 100" />
                        <p-chart-export-menu filename="fx-market-24h-trading-cycle" />
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
export class PolarPolarGlobalFxMarket24HourTradingVolumeCycleDoc {
    readonly data = fxHourly;
    readonly barColor = (ctx: { datum: HourSlot }) => SESSION_COLORS[ctx.datum.session] ?? '#94a3b8';

    item(index: number): HourSlot | undefined {
        return this.data[index];
    }

    sessionColor(session: string): string {
        return SESSION_COLORS[session] ?? '#94a3b8';
    }

    pairs(session: string): string[] {
        return SESSION_PAIRS[session] ?? [];
    }
}
