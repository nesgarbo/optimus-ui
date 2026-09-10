import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { TreemapImport2Doc } from '@/doc/charts/types/treemap/treemap/import-2-doc';
import { TreemapAlphabetIncQ32024RevenueBySegmentDoc } from '@/doc/charts/types/treemap/treemap/alphabet-inc-q3-2024-revenue-by-segment-doc';
import { TreemapWorldSLargestStockExchangesMarketCapVs2025YtdDoc } from '@/doc/charts/types/treemap/treemap/world-s-largest-stock-exchanges-market-cap-vs-2025-ytd-doc';
import { TreemapFortuneGlobal500Top15ByFy2023RevenueDoc } from '@/doc/charts/types/treemap/treemap/fortune-global-500-top-15-by-fy2023-revenue-doc';
import { TreemapLlmsIntegrationDoc } from '@/doc/charts/types/treemap/treemap/llms-integration-doc';
import { TreemapLlmsIntegration2Doc } from '@/doc/charts/types/treemap/treemap/llms-integration-2-doc';
import { TreemapOverviewDoc } from '@/doc/charts/types/treemap/treemap/overview-doc';
import { TreemapPricingDoc } from '@/doc/charts/types/treemap/treemap/pricing-doc';
import { TreemapComingSoonDoc } from '@/doc/charts/types/treemap/treemap/coming-soon-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Treemap Examples - Optimus UI"
        header="Treemap Examples"
        description="Treemap examples using hierarchy drilldown, colorValueField gradient mapping, and custom renderContent cell rendering."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesTreemapTreemapDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: TreemapImport2Doc
        },
        {
            id: 'alphabet-inc-q3-2024-revenue-by-segment',
            label: 'Alphabet Inc.: Q3 2024 Revenue by Segment',
            component: TreemapAlphabetIncQ32024RevenueBySegmentDoc
        },
        {
            id: 'world-s-largest-stock-exchanges-market-cap-vs-2025-ytd',
            label: "World's Largest Stock Exchanges: Market Cap vs 2025 YTD",
            component: TreemapWorldSLargestStockExchangesMarketCapVs2025YtdDoc
        },
        {
            id: 'fortune-global-500-top-15-by-fy2023-revenue',
            label: 'Fortune Global 500: Top 15 by FY2023 Revenue',
            component: TreemapFortuneGlobal500Top15ByFy2023RevenueDoc
        },
        {
            id: 'llms-integration',
            label: 'LLMs Integration',
            component: TreemapLlmsIntegrationDoc
        },
        {
            id: 'llms-integration-2',
            label: 'LLMs Integration',
            component: TreemapLlmsIntegration2Doc
        },
        {
            id: 'overview',
            label: 'overview',
            component: TreemapOverviewDoc
        },
        {
            id: 'pricing',
            label: 'Pricing',
            component: TreemapPricingDoc
        },
        {
            id: 'coming-soon',
            label: 'Coming Soon',
            component: TreemapComingSoonDoc
        }
    ];
}
