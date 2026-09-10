import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { PRICES } from './demo-data';

@Component({
    selector: 'candlestick-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>Candlestick reads four prices per period and sits on the same machinery as line and area. The direction drives the colour: a close above the open is a rise, below it a fall, and equal is a doji.</p>
            <p>
                In <i>hollow</i> mode "up" is measured against the <i>previous</i> close instead, which is the distinction between a candle that rose today and one that closed above yesterday — and a rising hollow candle is drawn as an outline, so a
                run of gains reads as a chain of empty bodies. <i>ohlc</i> drops the body entirely: the open is a tick to the left and the close one to the right.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-col gap-4">
                <div style="height: 18rem">
                    <p-chart-svg>
                        <p-chart-candlestick [data]="data" categoryXField="date" name="ACME" />
                        <p-chart-x-axis [tickRotation]="-35" />
                        <p-chart-y-axis />
                        <p-chart-tooltip />
                        <p-chart-hover />
                    </p-chart-svg>
                </div>
                <div style="height: 18rem">
                    <p-chart-svg>
                        <p-chart-candlestick [data]="data" categoryXField="date" name="ACME" variant="hollow" />
                        <p-chart-x-axis [tickRotation]="-35" />
                        <p-chart-y-axis />
                        <p-chart-tooltip />
                    </p-chart-svg>
                </div>
                <div style="height: 18rem">
                    <p-chart-svg>
                        <p-chart-candlestick [data]="data" categoryXField="date" name="ACME" variant="ohlc" />
                        <p-chart-x-axis [tickRotation]="-35" />
                        <p-chart-y-axis />
                        <p-chart-tooltip />
                    </p-chart-svg>
                </div>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class CandlestickDoc {
    data = PRICES;
}
