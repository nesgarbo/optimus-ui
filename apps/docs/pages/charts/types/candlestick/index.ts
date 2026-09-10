import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { CandlestickImport2Doc } from '@/doc/charts/types/candlestick/import-2-doc';
import { CandlestickBasicDoc } from '@/doc/charts/types/candlestick/basic-doc';
import { CandlestickOhlcBarsDoc } from '@/doc/charts/types/candlestick/ohlc-bars-doc';
import { CandlestickHollowDoc } from '@/doc/charts/types/candlestick/hollow-doc';
import { CandlestickColorsDoc } from '@/doc/charts/types/candlestick/colors-doc';
import { CandlestickCandleStylingDoc } from '@/doc/charts/types/candlestick/candle-styling-doc';
import { CandlestickDeclarativeDoc } from '@/doc/charts/types/candlestick/declarative-doc';
import { CandlestickTitleAndCaptionDoc } from '@/doc/charts/types/candlestick/title-and-caption-doc';
import { CandlestickHoverDoc } from '@/doc/charts/types/candlestick/hover-doc';
import { CandlestickTooltipDoc } from '@/doc/charts/types/candlestick/tooltip-doc';
import { CandlestickAxesDoc } from '@/doc/charts/types/candlestick/axes-doc';
import { CandlestickDataLabelsDoc } from '@/doc/charts/types/candlestick/data-labels-doc';
import { CandlestickZoomAndNavigatorDoc } from '@/doc/charts/types/candlestick/zoom-and-navigator-doc';
import { CandlestickAnnotationDoc } from '@/doc/charts/types/candlestick/annotation-doc';
import { CandlestickReferenceLinesAndBandsDoc } from '@/doc/charts/types/candlestick/reference-lines-and-bands-doc';
import { CandlestickAnimationDoc } from '@/doc/charts/types/candlestick/animation-doc';
import { CandlestickExportDoc } from '@/doc/charts/types/candlestick/export-doc';
import { CandlestickResponsiveDoc } from '@/doc/charts/types/candlestick/responsive-doc';
import { CandlestickAccessibilityDoc } from '@/doc/charts/types/candlestick/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Candlestick & OHLC - Optimus UI"
        header="Candlestick & OHLC"
        description="Financial OHLC chart showing open, high, low, and close prices per time period. Supports candlestick, hollow, and OHLC bar variants."
        [docs]="docs"
        [apiDocs]="['ChartCandlestick']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesCandlestickDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: CandlestickImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: CandlestickBasicDoc
        },
        {
            id: 'ohlc-bars',
            label: 'OHLC Bars',
            component: CandlestickOhlcBarsDoc
        },
        {
            id: 'hollow',
            label: 'Hollow',
            component: CandlestickHollowDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: CandlestickColorsDoc
        },
        {
            id: 'candle-styling',
            label: 'Candle Styling',
            component: CandlestickCandleStylingDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: CandlestickDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: CandlestickTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: CandlestickHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: CandlestickTooltipDoc
        },
        {
            id: 'axes',
            label: 'Axes',
            component: CandlestickAxesDoc
        },
        {
            id: 'data-labels',
            label: 'Data Labels',
            component: CandlestickDataLabelsDoc
        },
        {
            id: 'zoom-and-navigator',
            label: 'Zoom & Navigator',
            component: CandlestickZoomAndNavigatorDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: CandlestickAnnotationDoc
        },
        {
            id: 'reference-lines-and-bands',
            label: 'Reference Lines & Bands',
            component: CandlestickReferenceLinesAndBandsDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: CandlestickAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: CandlestickExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: CandlestickResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: CandlestickAccessibilityDoc
        }
    ];
}
