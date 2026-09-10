import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { aaplVolume } from '@/doc/charts/data/aaplVolume';

const AVG_CLOSE = +(aaplVolume.reduce((s, r) => s + r.close, 0) / aaplVolume.length).toFixed(2);
const MAX_VOLUME = Math.max(...aaplVolume.map((r) => r.volume));
const VOL_AXIS_MAX = Math.round(MAX_VOLUME * 5.5);

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

@Component({
    selector: 'types-candlestick-candlestick-aapl-q1-2024-with-volume-sub-pane-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Dual y-axes pair price candles on the right with volume bars on the left. <i>[max]="180"</i> clamps the bar tops so volume never competes with the wicks. A <i>ChartReferenceLine</i> on the price axis marks the quarter's average close.
                The shared crosshair tooltip carries the hover position across both panes. For multi-pane combinations see the <a href="/charts/types/combo">Combo gallery</a>.
            </p>
            <p>#### SvgCandlestickAaplVolumeDemo.ts</p>
            <p>#### aaplVolume.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 450, easing: 'easeOutCubic' }">
                        <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" name="AAPL" yAxisId="price" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.7" />
                        <p-chart-bar [data]="data" categoryXField="date" valueYField="volume" name="Volume" color="#94a3b8" yAxisId="volume" [opacity]="0.55" />
                        <p-chart-reference-line yAxisId="price" [y]="avgClose" stroke="#7c8cff" [lineStrokeWidth]="1" [lineDash]="[3, 3]" [label]="avgLabel" labelPosition="end" labelBackground="#7c8cff" labelColor="#fff" [labelPadding]="4" />
                        <p-chart-x-axis type="time" gapless [min]="minDate" [max]="maxDate" [tickRotation]="-35" [tickFormat]="formatDate" />
                        <p-chart-y-axis id="price" position="right" [tickFormat]="formatPrice" [chartPaddingMin]="0.32" />
                        <p-chart-y-axis id="volume" position="left" [tickFormat]="formatVolume" [max]="volAxisMax" [tickInterval]="50" [gridLines]="false" [showTicks]="false" />
                        <p-chart-tooltip mode="shared" [crosshair]="{ x: true, y: true, dashArray: [3, 3], color: '#94a3b8' }" />
                        <p-chart-hover />
                        <p-chart-zoom mode="x" />
                        <p-chart-legend position="top" />
                        <p-chart-title text="AAPL — Q1 2024 daily price + volume" />
                        <p-chart-caption text="Price candles on the right axis · daily volume bars on the left axis pushed below the price band · dashed reference line marks the quarter's average closing price" />
                        <p-chart-export-menu filename="aapl-q1-2024-volume" />
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
export class CandlestickCandlestickAaplQ12024WithVolumeSubPaneDoc {
    readonly data = aaplVolume;
    readonly avgClose = AVG_CLOSE;
    readonly volAxisMax = VOL_AXIS_MAX;
    readonly avgLabel = `Q1 avg $${AVG_CLOSE.toFixed(2)}`;
    readonly minDate = aaplVolume[0].date;
    readonly maxDate = aaplVolume[aaplVolume.length - 1].date;

    readonly formatPrice = (v: TickValue) => `$${Number(v).toFixed(0)}`;
    readonly formatVolume = (v: TickValue) => {
        const n = Number(v);

        if (n > MAX_VOLUME * 1.1) return '';

        return `${n.toFixed(0)}M`;
    };
    readonly formatDate = (v: TickValue) => dateFormatter.format(new Date(v));
}
