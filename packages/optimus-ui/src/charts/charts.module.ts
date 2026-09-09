import { NgModule } from '@angular/core';
import { ChartCanvas } from './chart-canvas';
import { ChartGroup } from './chart-group';
import { ChartSvg } from './chart-svg';
import { ChartXAxis, ChartYAxis } from './features/chart-axis';
import { ChartHover } from './features/chart-hover';
import { ChartBar } from './series/chart-bar';
import { ChartOverlap, ChartRange, ChartStacked, ChartWaterfall } from './series/chart-groups';
import { ChartLine } from './series/chart-line';

/**
 * Every chart part in one import.
 *
 * The parts are standalone, so importing them individually works and tree-shakes better. This
 * module exists for the templates that use most of them and would rather not maintain the list.
 *
 * Note the name: `ChartModule` belongs to the chart.js-backed `p-chart`, which is a separate
 * component and stays as it is.
 */
const PARTS = [ChartSvg, ChartCanvas, ChartGroup, ChartLine, ChartBar, ChartStacked, ChartWaterfall, ChartOverlap, ChartRange, ChartXAxis, ChartYAxis, ChartHover] as const;

@NgModule({
    imports: [...PARTS],
    exports: [...PARTS]
})
export class ChartsModule {}
