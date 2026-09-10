import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityBasicDoc } from '@/doc/charts/reference-accessibility-basic-doc';
import { AccessibilityColorVisionDoc } from '@/doc/charts/reference-accessibility-color-vision-doc';
import { AccessibilityCustomDescriptionDoc } from '@/doc/charts/reference-accessibility-custom-description-doc';
import { AccessibilityDisablingAccessibilityDoc } from '@/doc/charts/reference-accessibility-disabling-accessibility-doc';
import { AccessibilityFocusIndicatorDoc } from '@/doc/charts/reference-accessibility-focus-indicator-doc';
import { AccessibilityImportDoc } from '@/doc/charts/reference-accessibility-import-doc';
import { AccessibilityKeyboardNavigationDoc } from '@/doc/charts/reference-accessibility-keyboard-navigation-doc';
import { AccessibilityLandmarkVerbosityDoc } from '@/doc/charts/reference-accessibility-landmark-verbosity-doc';
import { AccessibilityPointDescriptionsDoc } from '@/doc/charts/reference-accessibility-point-descriptions-doc';
import { AccessibilityScreenReaderDataTableDoc } from '@/doc/charts/reference-accessibility-screen-reader-data-table-doc';
import { AnimationBasicDoc } from '@/doc/charts/configuration-animation-basic-doc';
import { AnimationCustomEasingDoc } from '@/doc/charts/configuration-animation-custom-easing-doc';
import { AnimationDisablingAnimationDoc } from '@/doc/charts/configuration-animation-disabling-animation-doc';
import { AnimationDurationDoc } from '@/doc/charts/configuration-animation-duration-doc';
import { AnimationEasingDoc } from '@/doc/charts/configuration-animation-easing-doc';
import { AnimationImportDoc } from '@/doc/charts/configuration-animation-import-doc';
import { AnimationLoopingPropertyAnimationsDoc } from '@/doc/charts/configuration-animation-looping-property-animations-doc';
import { AnimationTransitionsDoc } from '@/doc/charts/configuration-animation-transitions-doc';
import { AnnotationBasicDoc } from '@/doc/charts/configuration-annotation-basic-doc';
import { AnnotationDarkModeDoc } from '@/doc/charts/configuration-annotation-dark-mode-doc';
import { AnnotationImportDoc } from '@/doc/charts/configuration-annotation-import-doc';
import { AnnotationMultiAxisPositioningDoc } from '@/doc/charts/configuration-annotation-multi-axis-positioning-doc';
import { AnnotationMultipleAnnotationsDoc } from '@/doc/charts/configuration-annotation-multiple-annotations-doc';
import { AnnotationPositioningAtDataValuesDoc } from '@/doc/charts/configuration-annotation-positioning-at-data-values-doc';
import { AnnotationRadialChartsDoc } from '@/doc/charts/configuration-annotation-radial-charts-doc';
import { ApiImportDoc } from '@/doc/charts/reference-api-import-doc';
import { ArchitectureAnimationDoc } from '@/doc/charts/getting-started-architecture-animation-doc';
import { ArchitectureChartTypesDoc } from '@/doc/charts/getting-started-architecture-chart-types-doc';
import { ArchitectureCompoundApiDoc } from '@/doc/charts/getting-started-architecture-compound-api-doc';
import { ArchitectureDataModelDoc } from '@/doc/charts/getting-started-architecture-data-model-doc';
import { ArchitectureDualRenderingDoc } from '@/doc/charts/getting-started-architecture-dual-rendering-doc';
import { ArchitectureFeatureSurfaceDoc } from '@/doc/charts/getting-started-architecture-feature-surface-doc';
import { ArchitectureFirstChartDoc } from '@/doc/charts/getting-started-architecture-first-chart-doc';
import { ArchitectureImperativeApiDoc } from '@/doc/charts/getting-started-architecture-imperative-api-doc';
import { ArchitectureImportDoc } from '@/doc/charts/getting-started-architecture-import-doc';
import { ArchitectureMultiChartSyncDoc } from '@/doc/charts/getting-started-architecture-multi-chart-sync-doc';
import { AxesAxisGroupingDoc } from '@/doc/charts/configuration-axes-axis-grouping-doc';
import { AxesAxisTitleDoc } from '@/doc/charts/configuration-axes-axis-title-doc';
import { AxesBasicDoc } from '@/doc/charts/configuration-axes-basic-doc';
import { AxesCustomTickRenderDoc } from '@/doc/charts/configuration-axes-custom-tick-render-doc';
import { AxesDataGroupingDoc } from '@/doc/charts/configuration-axes-data-grouping-doc';
import { AxesDomainDoc } from '@/doc/charts/configuration-axes-domain-doc';
import { AxesGridLinesDoc } from '@/doc/charts/configuration-axes-grid-lines-doc';
import { AxesHiddenAxisDoc } from '@/doc/charts/configuration-axes-hidden-axis-doc';
import { AxesImportDoc } from '@/doc/charts/configuration-axes-import-doc';
import { AxesLinearAxisDoc } from '@/doc/charts/configuration-axes-linear-axis-doc';
import { AxesLogarithmicDoc } from '@/doc/charts/configuration-axes-logarithmic-doc';
import { AxesMultipleAxesDoc } from '@/doc/charts/configuration-axes-multiple-axes-doc';
import { AxesReversedDoc } from '@/doc/charts/configuration-axes-reversed-doc';
import { AxesTickFormattingDoc } from '@/doc/charts/configuration-axes-tick-formatting-doc';
import { AxesTickStylingDoc } from '@/doc/charts/configuration-axes-tick-styling-doc';
import { AxesTimeAxisDoc } from '@/doc/charts/configuration-axes-time-axis-doc';
import { AxesTimeZoneDoc } from '@/doc/charts/configuration-axes-time-zone-doc';
import { CandlestickAccessibilityDoc } from '@/doc/charts/types-candlestick-accessibility-doc';
import { CandlestickAnimationDoc } from '@/doc/charts/types-candlestick-animation-doc';
import { CandlestickAnnotationDoc } from '@/doc/charts/types-candlestick-annotation-doc';
import { CandlestickAxesDoc } from '@/doc/charts/types-candlestick-axes-doc';
import { CandlestickBasicDoc } from '@/doc/charts/types-candlestick-basic-doc';
import { CandlestickCandleStylingDoc } from '@/doc/charts/types-candlestick-candle-styling-doc';
import { CandlestickCandlestickAaplQ12024WithVolumeSubPaneDoc } from '@/doc/charts/types-candlestick-candlestick-aapl-q1-2024-with-volume-sub-pane-doc';
import { CandlestickCandlestickAppleIncAapl2024DailyOhlcDoc } from '@/doc/charts/types-candlestick-candlestick-apple-inc-aapl-2024-daily-ohlc-doc';
import { CandlestickCandlestickBitcoinBtcUsdWeeklyNov2021ToDec2024Doc } from '@/doc/charts/types-candlestick-candlestick-bitcoin-btc-usd-weekly-nov-2021-to-dec-2024-doc';
import { CandlestickCandlestickImportDoc } from '@/doc/charts/types-candlestick-candlestick-import-doc';
import { CandlestickColorsDoc } from '@/doc/charts/types-candlestick-colors-doc';
import { CandlestickDataLabelsDoc } from '@/doc/charts/types-candlestick-data-labels-doc';
import { CandlestickDeclarativeDoc } from '@/doc/charts/types-candlestick-declarative-doc';
import { CandlestickExportDoc } from '@/doc/charts/types-candlestick-export-doc';
import { CandlestickHollowDoc } from '@/doc/charts/types-candlestick-hollow-doc';
import { CandlestickHollowEurUsdH22024DailyHollowCandlesDoc } from '@/doc/charts/types-candlestick-hollow-eur-usd-h2-2024-daily-hollow-candles-doc';
import { CandlestickHollowImportDoc } from '@/doc/charts/types-candlestick-hollow-import-doc';
import { CandlestickHollowTeslaIncTsla2024WeeklyHollowCandlesDoc } from '@/doc/charts/types-candlestick-hollow-tesla-inc-tsla-2024-weekly-hollow-candles-doc';
import { CandlestickHoverDoc } from '@/doc/charts/types-candlestick-hover-doc';
import { CandlestickImportDoc } from '@/doc/charts/types-candlestick-import-doc';
import { CandlestickLiveDataBtcUsdHighFrequencyStreamDoc } from '@/doc/charts/types-candlestick-live-data-btc-usd-high-frequency-stream-doc';
import { CandlestickLiveDataEurUsdLiveTickStreamDoc } from '@/doc/charts/types-candlestick-live-data-eur-usd-live-tick-stream-doc';
import { CandlestickLiveDataImportDoc } from '@/doc/charts/types-candlestick-live-data-import-doc';
import { CandlestickOhlcBarsDoc } from '@/doc/charts/types-candlestick-ohlc-bars-doc';
import { CandlestickOhlcGoldSpotXauUsd2024WeeklyOhlcDoc } from '@/doc/charts/types-candlestick-ohlc-gold-spot-xau-usd-2024-weekly-ohlc-doc';
import { CandlestickOhlcImportDoc } from '@/doc/charts/types-candlestick-ohlc-import-doc';
import { CandlestickOhlcWtiCrudeOilCl12024WeeklyOhlcDoc } from '@/doc/charts/types-candlestick-ohlc-wti-crude-oil-cl1-2024-weekly-ohlc-doc';
import { CandlestickPlaygroundImportDoc } from '@/doc/charts/types-candlestick-playground-import-doc';
import { CandlestickPlaygroundPlaygroundDoc } from '@/doc/charts/types-candlestick-playground-playground-doc';
import { CandlestickReferenceLinesAndBandsDoc } from '@/doc/charts/types-candlestick-reference-lines-and-bands-doc';
import { CandlestickResponsiveDoc } from '@/doc/charts/types-candlestick-responsive-doc';
import { CandlestickTitleAndCaptionDoc } from '@/doc/charts/types-candlestick-title-and-caption-doc';
import { CandlestickTooltipDoc } from '@/doc/charts/types-candlestick-tooltip-doc';
import { CandlestickZoomAndNavigatorDoc } from '@/doc/charts/types-candlestick-zoom-and-navigator-doc';
import { ColumnBarAccessibilityDoc } from '@/doc/charts/types-column-bar-accessibility-doc';
import { ColumnBarAnimationDoc } from '@/doc/charts/types-column-bar-animation-doc';
import { ColumnBarAnnotationDoc } from '@/doc/charts/types-column-bar-annotation-doc';
import { ColumnBarAxesDoc } from '@/doc/charts/types-column-bar-axes-doc';
import { ColumnBarBarImportDoc } from '@/doc/charts/types-column-bar-bar-import-doc';
import { ColumnBarBarParis2024SummerOlympicsGoldMedalsTop12CountriesDoc } from '@/doc/charts/types-column-bar-bar-paris-2024-summer-olympics-gold-medals-top-12-countries-doc';
import { ColumnBarBarPrimeuiThemedBarChartDoc } from '@/doc/charts/types-column-bar-bar-primeui-themed-bar-chart-doc';
import { ColumnBarBarSizingDoc } from '@/doc/charts/types-column-bar-bar-sizing-doc';
import { ColumnBarBarWorldSLargestMetropolitanAreasByPopulation2024Doc } from '@/doc/charts/types-column-bar-bar-world-s-largest-metropolitan-areas-by-population-2024-doc';
import { ColumnBarBarWorldSMostVisitedArtMuseums2023Doc } from '@/doc/charts/types-column-bar-bar-world-s-most-visited-art-museums-2023-doc';
import { ColumnBarBasicDoc } from '@/doc/charts/types-column-bar-basic-doc';
import { ColumnBarBorderDoc } from '@/doc/charts/types-column-bar-border-doc';
import { ColumnBarColorsDoc } from '@/doc/charts/types-column-bar-colors-doc';
import { ColumnBarCustomShapeDoc } from '@/doc/charts/types-column-bar-custom-shape-doc';
import { ColumnBarDataLabelsDoc } from '@/doc/charts/types-column-bar-data-labels-doc';
import { ColumnBarDeclarativeDoc } from '@/doc/charts/types-column-bar-declarative-doc';
import { ColumnBarExportDoc } from '@/doc/charts/types-column-bar-export-doc';
import { ColumnBarFloatingRangeDoc } from '@/doc/charts/types-column-bar-floating-range-doc';
import { ColumnBarGradientColorDoc } from '@/doc/charts/types-column-bar-gradient-color-doc';
import { ColumnBarGroupedDoc } from '@/doc/charts/types-column-bar-grouped-doc';
import { ColumnBarGroupedG7RanddExpenditureByFundingSource2022Doc } from '@/doc/charts/types-column-bar-grouped-g7-randd-expenditure-by-funding-source-2022-doc';
import { ColumnBarGroupedImportDoc } from '@/doc/charts/types-column-bar-grouped-import-doc';
import { ColumnBarGroupedLabourForceParticipationByGenderAndRegion2023Doc } from '@/doc/charts/types-column-bar-grouped-labour-force-participation-by-gender-and-region-2023-doc';
import { ColumnBarHorizontalDoc } from '@/doc/charts/types-column-bar-horizontal-doc';
import { ColumnBarHoverDoc } from '@/doc/charts/types-column-bar-hover-doc';
import { ColumnBarImportDoc } from '@/doc/charts/types-column-bar-import-doc';
import { ColumnBarLegendDoc } from '@/doc/charts/types-column-bar-legend-doc';
import { ColumnBarNegativeValuesDoc } from '@/doc/charts/types-column-bar-negative-values-doc';
import { ColumnBarNullValuesDoc } from '@/doc/charts/types-column-bar-null-values-doc';
import { ColumnBarOverlapDoc } from '@/doc/charts/types-column-bar-overlap-doc';
import { ColumnBarPercentStackedDoc } from '@/doc/charts/types-column-bar-percent-stacked-doc';
import { ColumnBarPlaygroundImportDoc } from '@/doc/charts/types-column-bar-playground-import-doc';
import { ColumnBarPlaygroundPlaygroundDoc } from '@/doc/charts/types-column-bar-playground-playground-doc';
import { ColumnBarReferenceLinesAndBandsDoc } from '@/doc/charts/types-column-bar-reference-lines-and-bands-doc';
import { ColumnBarResponsiveDoc } from '@/doc/charts/types-column-bar-responsive-doc';
import { ColumnBarSortedDoc } from '@/doc/charts/types-column-bar-sorted-doc';
import { ColumnBarStackedDoc } from '@/doc/charts/types-column-bar-stacked-doc';
import { ColumnBarStackedElectricityGenerationMixByCountry2023Doc } from '@/doc/charts/types-column-bar-stacked-electricity-generation-mix-by-country-2023-doc';
import { ColumnBarStackedGlobalElectricVehicleSalesByRegion20192023Doc } from '@/doc/charts/types-column-bar-stacked-global-electric-vehicle-sales-by-region-2019-2023-doc';
import { ColumnBarStackedImportDoc } from '@/doc/charts/types-column-bar-stacked-import-doc';
import { ColumnBarStackedRevenueCompositionGroupedStackedWithReferenceBandsDoc } from '@/doc/charts/types-column-bar-stacked-revenue-composition-grouped-stacked-with-reference-bands-doc';
import { ColumnBarStackedWorldPopulationByAgeGroupAndSex2024Doc } from '@/doc/charts/types-column-bar-stacked-world-population-by-age-group-and-sex-2024-doc';
import { ColumnBarTitleAndCaptionDoc } from '@/doc/charts/types-column-bar-title-and-caption-doc';
import { ColumnBarTooltipDoc } from '@/doc/charts/types-column-bar-tooltip-doc';
import { ColumnBarVariwideDoc } from '@/doc/charts/types-column-bar-variwide-doc';
import { ColumnBarWaterfallDoc } from '@/doc/charts/types-column-bar-waterfall-doc';
import { ColumnBarWaterfallEu27GovernmentRevenueAndSpending2022Doc } from '@/doc/charts/types-column-bar-waterfall-eu-27-government-revenue-and-spending-2022-doc';
import { ColumnBarWaterfallFy2023EbitdaBridgeStackedWaterfallDoc } from '@/doc/charts/types-column-bar-waterfall-fy-2023-ebitda-bridge-stacked-waterfall-doc';
import { ColumnBarWaterfallGlobalCarbonBudget2022SourcesSinksNetAccumulationDoc } from '@/doc/charts/types-column-bar-waterfall-global-carbon-budget-2022-sources-sinks-net-accumulation-doc';
import { ColumnBarWaterfallImportDoc } from '@/doc/charts/types-column-bar-waterfall-import-doc';
import { ColumnBarZoomAndNavigatorDoc } from '@/doc/charts/types-column-bar-zoom-and-navigator-doc';
import { ComboBarAndAreaDoc } from '@/doc/charts/types-combo-bar-and-area-doc';
import { ComboBarAndLineDoc } from '@/doc/charts/types-combo-bar-and-line-doc';
import { ComboDualAxisDoc } from '@/doc/charts/types-combo-dual-axis-doc';
import { ComboExamplesChannelEfficiencyQuadrantsDoc } from '@/doc/charts/types-combo-examples-channel-efficiency-quadrants-doc';
import { ComboExamplesClimateDashboardRainfallTemperatureDoc } from '@/doc/charts/types-combo-examples-climate-dashboard-rainfall-temperature-doc';
import { ComboExamplesEconomicForecastEnvelopeDoc } from '@/doc/charts/types-combo-examples-economic-forecast-envelope-doc';
import { ComboExamplesImportDoc } from '@/doc/charts/types-combo-examples-import-doc';
import { ComboExamplesProductCapabilityBenchmarkRadarPolarDoc } from '@/doc/charts/types-combo-examples-product-capability-benchmark-radar-polar-doc';
import { ComboExamplesRevenueMixVsTargetWithGrowthOverlayDoc } from '@/doc/charts/types-combo-examples-revenue-mix-vs-target-with-growth-overlay-doc';
import { ComboExamplesStockPriceVolumeDoc } from '@/doc/charts/types-combo-examples-stock-price-volume-doc';
import { ComboImportDoc } from '@/doc/charts/types-combo-import-doc';
import { ComboLineAndScatterDoc } from '@/doc/charts/types-combo-line-and-scatter-doc';
import { ComboLineAndScatterOnACategoryAxisDoc } from '@/doc/charts/types-combo-line-and-scatter-on-a-category-axis-doc';
import { ComboPolarAndRadarDoc } from '@/doc/charts/types-combo-polar-and-radar-doc';
import { ComboSharedTooltipDoc } from '@/doc/charts/types-combo-shared-tooltip-doc';
import { ComboStackedBarAndLineDoc } from '@/doc/charts/types-combo-stacked-bar-and-line-doc';
import { DataLabelsAlignToDoc } from '@/doc/charts/configuration-data-labels-align-to-doc';
import { DataLabelsBasicDoc } from '@/doc/charts/configuration-data-labels-basic-doc';
import { DataLabelsCustomLabelDoc } from '@/doc/charts/configuration-data-labels-custom-label-doc';
import { DataLabelsDisplayModeDoc } from '@/doc/charts/configuration-data-labels-display-mode-doc';
import { DataLabelsFormatterDoc } from '@/doc/charts/configuration-data-labels-formatter-doc';
import { DataLabelsImportDoc } from '@/doc/charts/configuration-data-labels-import-doc';
import { DataLabelsLeaderLinesDoc } from '@/doc/charts/configuration-data-labels-leader-lines-doc';
import { DataLabelsMinPercentageDoc } from '@/doc/charts/configuration-data-labels-min-percentage-doc';
import { DataLabelsOffsetsDoc } from '@/doc/charts/configuration-data-labels-offsets-doc';
import { DataLabelsStylingDoc } from '@/doc/charts/configuration-data-labels-styling-doc';
import { DecimationAlgorithmsDoc } from '@/doc/charts/configuration-decimation-algorithms-doc';
import { DecimationBasicDoc } from '@/doc/charts/configuration-decimation-basic-doc';
import { DecimationChoosingAnAlgorithmDoc } from '@/doc/charts/configuration-decimation-choosing-an-algorithm-doc';
import { DecimationImportDoc } from '@/doc/charts/configuration-decimation-import-doc';
import { DecimationProgressiveDetailOnZoomDoc } from '@/doc/charts/configuration-decimation-progressive-detail-on-zoom-doc';
import { DecimationSampleCountDoc } from '@/doc/charts/configuration-decimation-sample-count-doc';
import { DecimationThresholdDoc } from '@/doc/charts/configuration-decimation-threshold-doc';
import { ExportBackgroundColorDoc } from '@/doc/charts/configuration-export-background-color-doc';
import { ExportBasicDoc } from '@/doc/charts/configuration-export-basic-doc';
import { ExportButtonPositionDoc } from '@/doc/charts/configuration-export-button-position-doc';
import { ExportExportNotesDoc } from '@/doc/charts/configuration-export-export-notes-doc';
import { ExportFilenameDoc } from '@/doc/charts/configuration-export-filename-doc';
import { ExportImportDoc } from '@/doc/charts/configuration-export-import-doc';
import { ExportMenuItemsDoc } from '@/doc/charts/configuration-export-menu-items-doc';
import { ExportScaleDoc } from '@/doc/charts/configuration-export-scale-doc';
import { HeatmapAccessibilityDoc } from '@/doc/charts/types-heatmap-accessibility-doc';
import { HeatmapAnimationDoc } from '@/doc/charts/types-heatmap-animation-doc';
import { HeatmapAnnotationDoc } from '@/doc/charts/types-heatmap-annotation-doc';
import { HeatmapAxesDoc } from '@/doc/charts/types-heatmap-axes-doc';
import { HeatmapBasicDoc } from '@/doc/charts/types-heatmap-basic-doc';
import { HeatmapCellStylingDoc } from '@/doc/charts/types-heatmap-cell-styling-doc';
import { HeatmapColorRangeDoc } from '@/doc/charts/types-heatmap-color-range-doc';
import { HeatmapCustomContentDoc } from '@/doc/charts/types-heatmap-custom-content-doc';
import { HeatmapDataLabelsDoc } from '@/doc/charts/types-heatmap-data-labels-doc';
import { HeatmapDeclarativeDoc } from '@/doc/charts/types-heatmap-declarative-doc';
import { HeatmapExportDoc } from '@/doc/charts/types-heatmap-export-doc';
import { HeatmapHeatmapImportDoc } from '@/doc/charts/types-heatmap-heatmap-import-doc';
import { HeatmapHeatmapOlympicMedalTableBySportDoc } from '@/doc/charts/types-heatmap-heatmap-olympic-medal-table-by-sport-doc';
import { HeatmapHeatmapSaasMonthlyCohortRetention2024SignupsDoc } from '@/doc/charts/types-heatmap-heatmap-saas-monthly-cohort-retention-2024-signups-doc';
import { HeatmapHeatmapSandp500SectorCorrelationMatrixDailyReturns2023Doc } from '@/doc/charts/types-heatmap-heatmap-sandp-500-sector-correlation-matrix-daily-returns-2023-doc';
import { HeatmapHoverDoc } from '@/doc/charts/types-heatmap-hover-doc';
import { HeatmapImportDoc } from '@/doc/charts/types-heatmap-import-doc';
import { HeatmapLegendDoc } from '@/doc/charts/types-heatmap-legend-doc';
import { HeatmapPlaygroundImportDoc } from '@/doc/charts/types-heatmap-playground-import-doc';
import { HeatmapPlaygroundPlaygroundDoc } from '@/doc/charts/types-heatmap-playground-playground-doc';
import { HeatmapResponsiveDoc } from '@/doc/charts/types-heatmap-responsive-doc';
import { HeatmapSingleColorDoc } from '@/doc/charts/types-heatmap-single-color-doc';
import { HeatmapTitleAndCaptionDoc } from '@/doc/charts/types-heatmap-title-and-caption-doc';
import { HeatmapTooltipDoc } from '@/doc/charts/types-heatmap-tooltip-doc';
import { HoverBasicDoc } from '@/doc/charts/configuration-hover-basic-doc';
import { HoverBorderOverrideDoc } from '@/doc/charts/configuration-hover-border-override-doc';
import { HoverBrightnessAndDimDoc } from '@/doc/charts/configuration-hover-brightness-and-dim-doc';
import { HoverClickDoc } from '@/doc/charts/configuration-hover-click-doc';
import { HoverColorOverrideDoc } from '@/doc/charts/configuration-hover-color-override-doc';
import { HoverImportDoc } from '@/doc/charts/configuration-hover-import-doc';
import { HoverLineMarkerScalingDoc } from '@/doc/charts/configuration-hover-line-marker-scaling-doc';
import { HoverPieOffsetDoc } from '@/doc/charts/configuration-hover-pie-offset-doc';
import { HoverScaleDoc } from '@/doc/charts/configuration-hover-scale-doc';
import { LegendAlignmentDoc } from '@/doc/charts/configuration-legend-alignment-doc';
import { LegendBasicDoc } from '@/doc/charts/configuration-legend-basic-doc';
import { LegendColorLegendDoc } from '@/doc/charts/configuration-legend-color-legend-doc';
import { LegendCustomLegendDoc } from '@/doc/charts/configuration-legend-custom-legend-doc';
import { LegendIconShapeDoc } from '@/doc/charts/configuration-legend-icon-shape-doc';
import { LegendImportDoc } from '@/doc/charts/configuration-legend-import-doc';
import { LegendInteractiveDoc } from '@/doc/charts/configuration-legend-interactive-doc';
import { LegendLayoutDoc } from '@/doc/charts/configuration-legend-layout-doc';
import { LegendOverflowDoc } from '@/doc/charts/configuration-legend-overflow-doc';
import { LegendPositionDoc } from '@/doc/charts/configuration-legend-position-doc';
import { LegendSharedModeDoc } from '@/doc/charts/configuration-legend-shared-mode-doc';
import { LegendStylingDoc } from '@/doc/charts/configuration-legend-styling-doc';
import { LineAreaAccessibilityDoc } from '@/doc/charts/types-line-area-accessibility-doc';
import { LineAreaAnimationDoc } from '@/doc/charts/types-line-area-animation-doc';
import { LineAreaAnnotationDoc } from '@/doc/charts/types-line-area-annotation-doc';
import { LineAreaAreaDoc } from '@/doc/charts/types-line-area-area-doc';
import { LineAreaAreaImportDoc } from '@/doc/charts/types-line-area-area-import-doc';
import { LineAreaAreaUsElectricityGenerationMix20102023Doc } from '@/doc/charts/types-line-area-area-us-electricity-generation-mix-2010-2023-doc';
import { LineAreaAreaUsTreasuryYieldCurve20192024Doc } from '@/doc/charts/types-line-area-area-us-treasury-yield-curve-2019-2024-doc';
import { LineAreaAreaUsUnemploymentRate20002024Doc } from '@/doc/charts/types-line-area-area-us-unemployment-rate-2000-2024-doc';
import { LineAreaAxesDoc } from '@/doc/charts/types-line-area-axes-doc';
import { LineAreaBasicDoc } from '@/doc/charts/types-line-area-basic-doc';
import { LineAreaColorsDoc } from '@/doc/charts/types-line-area-colors-doc';
import { LineAreaCurveTypesDoc } from '@/doc/charts/types-line-area-curve-types-doc';
import { LineAreaCustomMarkersDoc } from '@/doc/charts/types-line-area-custom-markers-doc';
import { LineAreaDataLabelsDoc } from '@/doc/charts/types-line-area-data-labels-doc';
import { LineAreaDeclarativeDoc } from '@/doc/charts/types-line-area-declarative-doc';
import { LineAreaExportDoc } from '@/doc/charts/types-line-area-export-doc';
import { LineAreaGradientColorDoc } from '@/doc/charts/types-line-area-gradient-color-doc';
import { LineAreaHoverDoc } from '@/doc/charts/types-line-area-hover-doc';
import { LineAreaImportDoc } from '@/doc/charts/types-line-area-import-doc';
import { LineAreaLegendDoc } from '@/doc/charts/types-line-area-legend-doc';
import { LineAreaLineBorderDoc } from '@/doc/charts/types-line-area-line-border-doc';
import { LineAreaLineImportDoc } from '@/doc/charts/types-line-area-line-import-doc';
import { LineAreaLineNasaGlobalTemperatureAnomalyDoc } from '@/doc/charts/types-line-area-line-nasa-global-temperature-anomaly-doc';
import { LineAreaLineStylingDoc } from '@/doc/charts/types-line-area-line-styling-doc';
import { LineAreaLineUSUnemploymentRate20002024Doc } from '@/doc/charts/types-line-area-line-u-s-unemployment-rate-2000-2024-doc';
import { LineAreaLineUsStockIndicesNormalisedComparisonDoc } from '@/doc/charts/types-line-area-line-us-stock-indices-normalised-comparison-doc';
import { LineAreaMarkersDoc } from '@/doc/charts/types-line-area-markers-doc';
import { LineAreaNullHandlingDoc } from '@/doc/charts/types-line-area-null-handling-doc';
import { LineAreaPlaygroundImportDoc } from '@/doc/charts/types-line-area-playground-import-doc';
import { LineAreaPlaygroundPlaygroundDoc } from '@/doc/charts/types-line-area-playground-playground-doc';
import { LineAreaRangeAreaDoc } from '@/doc/charts/types-line-area-range-area-doc';
import { LineAreaRangeBrentCrudeOilAnnualPriceRange2005To2023Doc } from '@/doc/charts/types-line-area-range-brent-crude-oil-annual-price-range-2005-to-2023-doc';
import { LineAreaRangeGlobalNumberOfBirthsAndDeaths1950To2100Doc } from '@/doc/charts/types-line-area-range-global-number-of-births-and-deaths-1950-to-2100-doc';
import { LineAreaRangeImportDoc } from '@/doc/charts/types-line-area-range-import-doc';
import { LineAreaRangeLondonSunriseAndSunsetTimesDoc } from '@/doc/charts/types-line-area-range-london-sunrise-and-sunset-times-doc';
import { LineAreaReferenceLinesAndBandsDoc } from '@/doc/charts/types-line-area-reference-lines-and-bands-doc';
import { LineAreaResponsiveDoc } from '@/doc/charts/types-line-area-responsive-doc';
import { LineAreaSegmentStylingDoc } from '@/doc/charts/types-line-area-segment-styling-doc';
import { LineAreaStackedAreaDoc } from '@/doc/charts/types-line-area-stacked-area-doc';
import { LineAreaStackedEu27EnergyMix20132023Doc } from '@/doc/charts/types-line-area-stacked-eu-27-energy-mix-2013-2023-doc';
import { LineAreaStackedImportDoc } from '@/doc/charts/types-line-area-stacked-import-doc';
import { LineAreaStackedUsFederalSpending20002023Doc } from '@/doc/charts/types-line-area-stacked-us-federal-spending-2000-2023-doc';
import { LineAreaTimeSeriesImportDoc } from '@/doc/charts/types-line-area-time-series-import-doc';
import { LineAreaTimeSeriesLiveServerMetricsCpuAndMemoryUtilisationDoc } from '@/doc/charts/types-line-area-time-series-live-server-metrics-cpu-and-memory-utilisation-doc';
import { LineAreaTimeSeriesLiveStockPriceAcmeCorpDoc } from '@/doc/charts/types-line-area-time-series-live-stock-price-acme-corp-doc';
import { LineAreaTitleAndCaptionDoc } from '@/doc/charts/types-line-area-title-and-caption-doc';
import { LineAreaTooltipDoc } from '@/doc/charts/types-line-area-tooltip-doc';
import { LineAreaZoomAndNavigatorDoc } from '@/doc/charts/types-line-area-zoom-and-navigator-doc';
import { LlmsChartPagesDoc } from '@/doc/charts/getting-started-llms-chart-pages-doc';
import { LlmsContextPacksDoc } from '@/doc/charts/getting-started-llms-context-packs-doc';
import { LlmsDemoSourceDoc } from '@/doc/charts/getting-started-llms-demo-source-doc';
import { LlmsGuardrailsDoc } from '@/doc/charts/getting-started-llms-guardrails-doc';
import { LlmsImportDoc } from '@/doc/charts/getting-started-llms-import-doc';
import { LlmsOutputChecklistDoc } from '@/doc/charts/getting-started-llms-output-checklist-doc';
import { LlmsOverviewDoc } from '@/doc/charts/getting-started-llms-overview-doc';
import { LlmsPromptingPatternDoc } from '@/doc/charts/getting-started-llms-prompting-pattern-doc';
import { LocaleCustomTickFormatDoc } from '@/doc/charts/internationalization-locale-custom-tick-format-doc';
import { LocaleDateFormattingDoc } from '@/doc/charts/internationalization-locale-date-formatting-doc';
import { LocaleImportDoc } from '@/doc/charts/internationalization-locale-import-doc';
import { LocaleLocaleAndRtlTogetherDoc } from '@/doc/charts/internationalization-locale-locale-and-rtl-together-doc';
import { LocaleNumberFormattingDoc } from '@/doc/charts/internationalization-locale-number-formatting-doc';
import { LocaleTranslatingChartTextDoc } from '@/doc/charts/internationalization-locale-translating-chart-text-doc';
import { NavigatorBasicDoc } from '@/doc/charts/configuration-navigator-basic-doc';
import { NavigatorHeightAndGapDoc } from '@/doc/charts/configuration-navigator-height-and-gap-doc';
import { NavigatorImportDoc } from '@/doc/charts/configuration-navigator-import-doc';
import { NavigatorSeriesDoc } from '@/doc/charts/configuration-navigator-series-doc';
import { NavigatorStylingDoc } from '@/doc/charts/configuration-navigator-styling-doc';
import { PerformanceAnimationDoc } from '@/doc/charts/reference-performance-animation-doc';
import { PerformanceCustomRenderingDoc } from '@/doc/charts/reference-performance-custom-rendering-doc';
import { PerformanceDecimationDoc } from '@/doc/charts/reference-performance-decimation-doc';
import { PerformanceImportDoc } from '@/doc/charts/reference-performance-import-doc';
import { PerformanceLiveUpdatesDoc } from '@/doc/charts/reference-performance-live-updates-doc';
import { PerformancePerformanceDoc } from '@/doc/charts/reference-performance-performance-doc';
import { PerformancePracticalLimitsDoc } from '@/doc/charts/reference-performance-practical-limits-doc';
import { PerformanceRunnableLargeDataEvidenceDoc } from '@/doc/charts/reference-performance-runnable-large-data-evidence-doc';
import { PerformanceSvgVsCanvasDoc } from '@/doc/charts/reference-performance-svg-vs-canvas-doc';
import { PerformanceZoomAndNavigatorDoc } from '@/doc/charts/reference-performance-zoom-and-navigator-doc';
import { PieDonutAccessibilityDoc } from '@/doc/charts/types-pie-donut-accessibility-doc';
import { PieDonutAnimationDoc } from '@/doc/charts/types-pie-donut-animation-doc';
import { PieDonutAnnotationDoc } from '@/doc/charts/types-pie-donut-annotation-doc';
import { PieDonutBasicDoc } from '@/doc/charts/types-pie-donut-basic-doc';
import { PieDonutBorderDoc } from '@/doc/charts/types-pie-donut-border-doc';
import { PieDonutColorsDoc } from '@/doc/charts/types-pie-donut-colors-doc';
import { PieDonutCustomSliceContentDoc } from '@/doc/charts/types-pie-donut-custom-slice-content-doc';
import { PieDonutDataLabelsDoc } from '@/doc/charts/types-pie-donut-data-labels-doc';
import { PieDonutDeclarativeDoc } from '@/doc/charts/types-pie-donut-declarative-doc';
import { PieDonutDonutBrowserMarketShareDoc } from '@/doc/charts/types-pie-donut-donut-browser-market-share-doc';
import { PieDonutDonutDoc } from '@/doc/charts/types-pie-donut-donut-doc';
import { PieDonutDonutImportDoc } from '@/doc/charts/types-pie-donut-donut-import-doc';
import { PieDonutDonutRenewableEnergyByRegionDoc } from '@/doc/charts/types-pie-donut-donut-renewable-energy-by-region-doc';
import { PieDonutDonutSandp500SectorBreakdownDoc } from '@/doc/charts/types-pie-donut-donut-sandp-500-sector-breakdown-doc';
import { PieDonutExportDoc } from '@/doc/charts/types-pie-donut-export-doc';
import { PieDonutGaugeAtmosphericCoConcentrationMaunaLoaDoc } from '@/doc/charts/types-pie-donut-gauge-atmospheric-co-concentration-mauna-loa-doc';
import { PieDonutGaugeDoc } from '@/doc/charts/types-pie-donut-gauge-doc';
import { PieDonutGaugeGbGridCarbonIntensityDoc } from '@/doc/charts/types-pie-donut-gauge-gb-grid-carbon-intensity-doc';
import { PieDonutGaugeImportDoc } from '@/doc/charts/types-pie-donut-gauge-import-doc';
import { PieDonutGaugeNasaGlobalTemperatureAnomalyDoc } from '@/doc/charts/types-pie-donut-gauge-nasa-global-temperature-anomaly-doc';
import { PieDonutGradientColorDoc } from '@/doc/charts/types-pie-donut-gradient-color-doc';
import { PieDonutHoverDoc } from '@/doc/charts/types-pie-donut-hover-doc';
import { PieDonutImportDoc } from '@/doc/charts/types-pie-donut-import-doc';
import { PieDonutLegendDoc } from '@/doc/charts/types-pie-donut-legend-doc';
import { PieDonutOuterRadiusDoc } from '@/doc/charts/types-pie-donut-outer-radius-doc';
import { PieDonutPieBrowserMarketShareDoc } from '@/doc/charts/types-pie-donut-pie-browser-market-share-doc';
import { PieDonutPieGlobalEnergyMixDoc } from '@/doc/charts/types-pie-donut-pie-global-energy-mix-doc';
import { PieDonutPieIaasCloudMarketShareDoc } from '@/doc/charts/types-pie-donut-pie-iaas-cloud-market-share-doc';
import { PieDonutPieImportDoc } from '@/doc/charts/types-pie-donut-pie-import-doc';
import { PieDonutPieNestedGlobalEvSalesByMarketAndPowertrain2016To2023Doc } from '@/doc/charts/types-pie-donut-pie-nested-global-ev-sales-by-market-and-powertrain-2016-to-2023-doc';
import { PieDonutPieNestedImportDoc } from '@/doc/charts/types-pie-donut-pie-nested-import-doc';
import { PieDonutPieNestedWorldGdpByRegionAndIncomeGroup2023Doc } from '@/doc/charts/types-pie-donut-pie-nested-world-gdp-by-region-and-income-group-2023-doc';
import { PieDonutPieNightingaleImportDoc } from '@/doc/charts/types-pie-donut-pie-nightingale-import-doc';
import { PieDonutPieNightingaleNoaaMonthlyPrecipitation2024Doc } from '@/doc/charts/types-pie-donut-pie-nightingale-noaa-monthly-precipitation-2024-doc';
import { PieDonutPieNightingaleUsTornadoClimatologyDoc } from '@/doc/charts/types-pie-donut-pie-nightingale-us-tornado-climatology-doc';
import { PieDonutPlaygroundImportDoc } from '@/doc/charts/types-pie-donut-playground-import-doc';
import { PieDonutPlaygroundPlaygroundDoc } from '@/doc/charts/types-pie-donut-playground-playground-doc';
import { PieDonutResponsiveDoc } from '@/doc/charts/types-pie-donut-responsive-doc';
import { PieDonutSortedDoc } from '@/doc/charts/types-pie-donut-sorted-doc';
import { PieDonutStackedDoc } from '@/doc/charts/types-pie-donut-stacked-doc';
import { PieDonutTitleAndCaptionDoc } from '@/doc/charts/types-pie-donut-title-and-caption-doc';
import { PieDonutTooltipDoc } from '@/doc/charts/types-pie-donut-tooltip-doc';
import { PieDonutVariableRadiusDoc } from '@/doc/charts/types-pie-donut-variable-radius-doc';
import { PluginsDefiningAPluginDoc } from '@/doc/charts/configuration-plugins-defining-a-plugin-doc';
import { PluginsEventAnnotationsDoc } from '@/doc/charts/configuration-plugins-event-annotations-doc';
import { PluginsImportDoc } from '@/doc/charts/configuration-plugins-import-doc';
import { PluginsLiveStatsDoc } from '@/doc/charts/configuration-plugins-live-stats-doc';
import { PluginsPluginOptionsDoc } from '@/doc/charts/configuration-plugins-plugin-options-doc';
import { PluginsSecurityDoc } from '@/doc/charts/configuration-plugins-security-doc';
import { PluginsThresholdBandsDoc } from '@/doc/charts/configuration-plugins-threshold-bands-doc';
import { PluginsTrendlineDoc } from '@/doc/charts/configuration-plugins-trendline-doc';
import { PluginsWatermarkDoc } from '@/doc/charts/configuration-plugins-watermark-doc';
import { PolarAccessibilityDoc } from '@/doc/charts/types-polar-accessibility-doc';
import { PolarAnimationDoc } from '@/doc/charts/types-polar-animation-doc';
import { PolarAnnotationDoc } from '@/doc/charts/types-polar-annotation-doc';
import { PolarBasicDoc } from '@/doc/charts/types-polar-basic-doc';
import { PolarBorderDoc } from '@/doc/charts/types-polar-border-doc';
import { PolarColorsDoc } from '@/doc/charts/types-polar-colors-doc';
import { PolarDeclarativeDoc } from '@/doc/charts/types-polar-declarative-doc';
import { PolarExportDoc } from '@/doc/charts/types-polar-export-doc';
import { PolarGradientColorDoc } from '@/doc/charts/types-polar-gradient-color-doc';
import { PolarGridShapeDoc } from '@/doc/charts/types-polar-grid-shape-doc';
import { PolarGridStylingDoc } from '@/doc/charts/types-polar-grid-styling-doc';
import { PolarGroupedDoc } from '@/doc/charts/types-polar-grouped-doc';
import { PolarHoverDoc } from '@/doc/charts/types-polar-hover-doc';
import { PolarImportDoc } from '@/doc/charts/types-polar-import-doc';
import { PolarInnerRadiusDoc } from '@/doc/charts/types-polar-inner-radius-doc';
import { PolarLegendDoc } from '@/doc/charts/types-polar-legend-doc';
import { PolarPercentStackedDoc } from '@/doc/charts/types-polar-percent-stacked-doc';
import { PolarPlaygroundImportDoc } from '@/doc/charts/types-polar-playground-import-doc';
import { PolarPlaygroundPlaygroundDoc } from '@/doc/charts/types-polar-playground-playground-doc';
import { PolarPolarGlobalFxMarket24HourTradingVolumeCycleDoc } from '@/doc/charts/types-polar-polar-global-fx-market-24-hour-trading-volume-cycle-doc';
import { PolarPolarHeathrowLhrScheduledDeparturesByHourOfDayDoc } from '@/doc/charts/types-polar-polar-heathrow-lhr-scheduled-departures-by-hour-of-day-doc';
import { PolarPolarImportDoc } from '@/doc/charts/types-polar-polar-import-doc';
import { PolarPolarMonacoGrandPrixSectorPerformanceByTeamDoc } from '@/doc/charts/types-polar-polar-monaco-grand-prix-sector-performance-by-team-doc';
import { PolarResponsiveDoc } from '@/doc/charts/types-polar-responsive-doc';
import { PolarSortedDoc } from '@/doc/charts/types-polar-sorted-doc';
import { PolarStackedDoc } from '@/doc/charts/types-polar-stacked-doc';
import { PolarStackedImportDoc } from '@/doc/charts/types-polar-stacked-import-doc';
import { PolarStackedUkGridMonthlyRenewableGenerationBySourceDoc } from '@/doc/charts/types-polar-stacked-uk-grid-monthly-renewable-generation-by-source-doc';
import { PolarStackedWindGustinessByDirectionSustainedVsGustsDoc } from '@/doc/charts/types-polar-stacked-wind-gustiness-by-direction-sustained-vs-gusts-doc';
import { PolarStackedWindSpeedByDirectionMorningVsAfternoonDoc } from '@/doc/charts/types-polar-stacked-wind-speed-by-direction-morning-vs-afternoon-doc';
import { PolarTitleAndCaptionDoc } from '@/doc/charts/types-polar-title-and-caption-doc';
import { PolarTooltipDoc } from '@/doc/charts/types-polar-tooltip-doc';
import { RadarAccessibilityDoc } from '@/doc/charts/types-radar-accessibility-doc';
import { RadarAnimationDoc } from '@/doc/charts/types-radar-animation-doc';
import { RadarAnnotationDoc } from '@/doc/charts/types-radar-annotation-doc';
import { RadarAxesDoc } from '@/doc/charts/types-radar-axes-doc';
import { RadarBasicDoc } from '@/doc/charts/types-radar-basic-doc';
import { RadarColorsDoc } from '@/doc/charts/types-radar-colors-doc';
import { RadarCurveDoc } from '@/doc/charts/types-radar-curve-doc';
import { RadarCustomMarkersDoc } from '@/doc/charts/types-radar-custom-markers-doc';
import { RadarDeclarativeDoc } from '@/doc/charts/types-radar-declarative-doc';
import { RadarExportDoc } from '@/doc/charts/types-radar-export-doc';
import { RadarFillOpacityDoc } from '@/doc/charts/types-radar-fill-opacity-doc';
import { RadarGradientColorDoc } from '@/doc/charts/types-radar-gradient-color-doc';
import { RadarGridShapeDoc } from '@/doc/charts/types-radar-grid-shape-doc';
import { RadarGridStylingDoc } from '@/doc/charts/types-radar-grid-styling-doc';
import { RadarHoverDoc } from '@/doc/charts/types-radar-hover-doc';
import { RadarImportDoc } from '@/doc/charts/types-radar-import-doc';
import { RadarLegendDoc } from '@/doc/charts/types-radar-legend-doc';
import { RadarLineStylingDoc } from '@/doc/charts/types-radar-line-styling-doc';
import { RadarMarkersDoc } from '@/doc/charts/types-radar-markers-doc';
import { RadarMultiSeriesDoc } from '@/doc/charts/types-radar-multi-series-doc';
import { RadarPlaygroundImportDoc } from '@/doc/charts/types-radar-playground-import-doc';
import { RadarPlaygroundPlaygroundDoc } from '@/doc/charts/types-radar-playground-playground-doc';
import { RadarRadarEngineeringTeamAssessmentReferenceBandsAndLinesDoc } from '@/doc/charts/types-radar-radar-engineering-team-assessment-reference-bands-and-lines-doc';
import { RadarRadarFifa24AttributeProfilesOfThreeSuperstarsDoc } from '@/doc/charts/types-radar-radar-fifa-24-attribute-profiles-of-three-superstars-doc';
import { RadarRadarImportDoc } from '@/doc/charts/types-radar-radar-import-doc';
import { RadarRadarNistCsf20CybersecurityPostureAuditDoc } from '@/doc/charts/types-radar-radar-nist-csf-2-0-cybersecurity-posture-audit-doc';
import { RadarRadarStartupKpiScorecardAnimatedQuarterlyProgressDoc } from '@/doc/charts/types-radar-radar-startup-kpi-scorecard-animated-quarterly-progress-doc';
import { RadarRadarUsEquityFactorTiltsVtvVugMtumDoc } from '@/doc/charts/types-radar-radar-us-equity-factor-tilts-vtv-vug-mtum-doc';
import { RadarReferenceBandsAndLinesDoc } from '@/doc/charts/types-radar-reference-bands-and-lines-doc';
import { RadarResponsiveDoc } from '@/doc/charts/types-radar-responsive-doc';
import { RadarStackedDigitalTransformationEngagementHoursByServicePhaseDoc } from '@/doc/charts/types-radar-stacked-digital-transformation-engagement-hours-by-service-phase-doc';
import { RadarStackedDoc } from '@/doc/charts/types-radar-stacked-doc';
import { RadarStackedGlobalRetailerRevenueMixByRegionQ32025Doc } from '@/doc/charts/types-radar-stacked-global-retailer-revenue-mix-by-region-q3-2025-doc';
import { RadarStackedImportDoc } from '@/doc/charts/types-radar-stacked-import-doc';
import { RadarStackedSaasPlatformMonthlyUsageByPlanTierDoc } from '@/doc/charts/types-radar-stacked-saas-platform-monthly-usage-by-plan-tier-doc';
import { RadarTitleAndCaptionDoc } from '@/doc/charts/types-radar-title-and-caption-doc';
import { RadarTooltipDoc } from '@/doc/charts/types-radar-tooltip-doc';
import { ReferenceLinesBandsImportDoc } from '@/doc/charts/configuration-reference-lines-bands-import-doc';
import { ReferenceLinesBandsLabelDoc } from '@/doc/charts/configuration-reference-lines-bands-label-doc';
import { ReferenceLinesBandsMultipleAxesDoc } from '@/doc/charts/configuration-reference-lines-bands-multiple-axes-doc';
import { ReferenceLinesBandsReferenceBandDoc } from '@/doc/charts/configuration-reference-lines-bands-reference-band-doc';
import { ReferenceLinesBandsReferenceLineDoc } from '@/doc/charts/configuration-reference-lines-bands-reference-line-doc';
import { ReferenceLinesBandsStylingDoc } from '@/doc/charts/configuration-reference-lines-bands-styling-doc';
import { ResponsiveAutoAdaptiveScalingDoc } from '@/doc/charts/reference-responsive-auto-adaptive-scaling-doc';
import { ResponsiveBasicDoc } from '@/doc/charts/reference-responsive-basic-doc';
import { ResponsiveCustomBreakpointsDoc } from '@/doc/charts/reference-responsive-custom-breakpoints-doc';
import { ResponsiveCustomRulesDoc } from '@/doc/charts/reference-responsive-custom-rules-doc';
import { ResponsiveHidingElementsAtSmallSizesDoc } from '@/doc/charts/reference-responsive-hiding-elements-at-small-sizes-doc';
import { ResponsiveImportDoc } from '@/doc/charts/reference-responsive-import-doc';
import { ResponsiveMobileDashboardDoc } from '@/doc/charts/reference-responsive-mobile-dashboard-doc';
import { RtlAutoDirectionDoc } from '@/doc/charts/internationalization-rtl-auto-direction-doc';
import { RtlCartesianChartsDoc } from '@/doc/charts/internationalization-rtl-cartesian-charts-doc';
import { RtlImportDoc } from '@/doc/charts/internationalization-rtl-import-doc';
import { RtlLocalizedTimeSeriesDoc } from '@/doc/charts/internationalization-rtl-localized-time-series-doc';
import { RtlRadialChartsDoc } from '@/doc/charts/internationalization-rtl-radial-charts-doc';
import { ScatterBubbleAccessibilityDoc } from '@/doc/charts/types-scatter-bubble-accessibility-doc';
import { ScatterBubbleAnimationDoc } from '@/doc/charts/types-scatter-bubble-animation-doc';
import { ScatterBubbleAnnotationDoc } from '@/doc/charts/types-scatter-bubble-annotation-doc';
import { ScatterBubbleAxesDoc } from '@/doc/charts/types-scatter-bubble-axes-doc';
import { ScatterBubbleBasicDoc } from '@/doc/charts/types-scatter-bubble-basic-doc';
import { ScatterBubbleBorderDoc } from '@/doc/charts/types-scatter-bubble-border-doc';
import { ScatterBubbleBubbleBlockbusterRoiProductionBudgetWorldwideGross20112023Doc } from '@/doc/charts/types-scatter-bubble-bubble-blockbuster-roi-production-budget-worldwide-gross-2011-2023-doc';
import { ScatterBubbleBubbleDoc } from '@/doc/charts/types-scatter-bubble-bubble-doc';
import { ScatterBubbleBubbleImportDoc } from '@/doc/charts/types-scatter-bubble-bubble-import-doc';
import { ScatterBubbleBubbleMicrosoftProductPortfolioBcgGrowthShareMatrixFy2023Doc } from '@/doc/charts/types-scatter-bubble-bubble-microsoft-product-portfolio-bcg-growth-share-matrix-fy2023-doc';
import { ScatterBubbleBubbleOecdHealthcareSpendVsOutcome2022Doc } from '@/doc/charts/types-scatter-bubble-bubble-oecd-healthcare-spend-vs-outcome-2022-doc';
import { ScatterBubbleColorsDoc } from '@/doc/charts/types-scatter-bubble-colors-doc';
import { ScatterBubbleCustomMarkersDoc } from '@/doc/charts/types-scatter-bubble-custom-markers-doc';
import { ScatterBubbleDataLabelsDoc } from '@/doc/charts/types-scatter-bubble-data-labels-doc';
import { ScatterBubbleDecimationDoc } from '@/doc/charts/types-scatter-bubble-decimation-doc';
import { ScatterBubbleDeclarativeDoc } from '@/doc/charts/types-scatter-bubble-declarative-doc';
import { ScatterBubbleExportDoc } from '@/doc/charts/types-scatter-bubble-export-doc';
import { ScatterBubbleGradientColorDoc } from '@/doc/charts/types-scatter-bubble-gradient-color-doc';
import { ScatterBubbleHoverDoc } from '@/doc/charts/types-scatter-bubble-hover-doc';
import { ScatterBubbleImportDoc } from '@/doc/charts/types-scatter-bubble-import-doc';
import { ScatterBubbleLegendDoc } from '@/doc/charts/types-scatter-bubble-legend-doc';
import { ScatterBubbleMarkersDoc } from '@/doc/charts/types-scatter-bubble-markers-doc';
import { ScatterBubblePlaygroundImportDoc } from '@/doc/charts/types-scatter-bubble-playground-import-doc';
import { ScatterBubblePlaygroundPlaygroundDoc } from '@/doc/charts/types-scatter-bubble-playground-playground-doc';
import { ScatterBubbleReferenceLinesAndBandsDoc } from '@/doc/charts/types-scatter-bubble-reference-lines-and-bands-doc';
import { ScatterBubbleResponsiveDoc } from '@/doc/charts/types-scatter-bubble-responsive-doc';
import { ScatterBubbleScatter100000PointsCanvasBoostModeDoc } from '@/doc/charts/types-scatter-bubble-scatter-100-000-points-canvas-boost-mode-doc';
import { ScatterBubbleScatterImportDoc } from '@/doc/charts/types-scatter-bubble-scatter-import-doc';
import { ScatterBubbleScatterMooreSLawTransistorCountPerMicroprocessor19712024Doc } from '@/doc/charts/types-scatter-bubble-scatter-moore-s-law-transistor-count-per-microprocessor-1971-2024-doc';
import { ScatterBubbleScatterNba202324ScorersVsPlaymakersByPositionDoc } from '@/doc/charts/types-scatter-bubble-scatter-nba-2023-24-scorers-vs-playmakers-by-position-doc';
import { ScatterBubbleScatterUsTechProfitabilityFortune100BySubIndustryFy2023Doc } from '@/doc/charts/types-scatter-bubble-scatter-us-tech-profitability-fortune-100-by-sub-industry-fy2023-doc';
import { ScatterBubbleScatterWindFarmTelemetry100000ReadingsDecimatedDoc } from '@/doc/charts/types-scatter-bubble-scatter-wind-farm-telemetry-100-000-readings-decimated-doc';
import { ScatterBubbleTitleAndCaptionDoc } from '@/doc/charts/types-scatter-bubble-title-and-caption-doc';
import { ScatterBubbleTooltipDoc } from '@/doc/charts/types-scatter-bubble-tooltip-doc';
import { ScatterBubbleZoomAndNavigatorDoc } from '@/doc/charts/types-scatter-bubble-zoom-and-navigator-doc';
import { SetupImport2Doc } from '@/doc/charts/getting-started-setup-import-2-doc';
import { SetupImportDoc } from '@/doc/charts/getting-started-setup-import-doc';
import { SetupInstallationDoc } from '@/doc/charts/getting-started-setup-installation-doc';
import { SetupNextStepsDoc } from '@/doc/charts/getting-started-setup-next-steps-doc';
import { SetupNgmoduleDoc } from '@/doc/charts/getting-started-setup-ngmodule-doc';
import { SetupQuickstartsDoc } from '@/doc/charts/getting-started-setup-quickstarts-doc';
import { SetupStylesDoc } from '@/doc/charts/getting-started-setup-styles-doc';
import { SyncedCrosshairSyncDoc } from '@/doc/charts/types-synced-crosshair-sync-doc';
import { SyncedDashboardDoc } from '@/doc/charts/types-synced-dashboard-doc';
import { SyncedExamplesCandlestickVolumeStackedPanesDoc } from '@/doc/charts/types-synced-examples-candlestick-volume-stacked-panes-doc';
import { SyncedExamplesClimateOverviewDoc } from '@/doc/charts/types-synced-examples-climate-overview-doc';
import { SyncedExamplesECommerceFunnelCategorySyncDoc } from '@/doc/charts/types-synced-examples-e-commerce-funnel-category-sync-doc';
import { SyncedExamplesEnergyGridOperationsDoc } from '@/doc/charts/types-synced-examples-energy-grid-operations-doc';
import { SyncedExamplesFinancialWorkstationPriceVolumeSpreadDoc } from '@/doc/charts/types-synced-examples-financial-workstation-price-volume-spread-doc';
import { SyncedExamplesFleetTelemetryKpiStripDoc } from '@/doc/charts/types-synced-examples-fleet-telemetry-kpi-strip-doc';
import { SyncedExamplesImportDoc } from '@/doc/charts/types-synced-examples-import-doc';
import { SyncedExamplesServerMetricsMonitorDoc } from '@/doc/charts/types-synced-examples-server-metrics-monitor-doc';
import { SyncedExamplesTradingWatchlistSparklinesInTableDoc } from '@/doc/charts/types-synced-examples-trading-watchlist-sparklines-in-table-doc';
import { SyncedFullSyncDoc } from '@/doc/charts/types-synced-full-sync-doc';
import { SyncedImportDoc } from '@/doc/charts/types-synced-import-doc';
import { SyncedSharedLegendDoc } from '@/doc/charts/types-synced-shared-legend-doc';
import { SyncedSyncedZoomDoc } from '@/doc/charts/types-synced-synced-zoom-doc';
import { ThemingCanvasDoc } from '@/doc/charts/reference-theming-canvas-doc';
import { ThemingDefaultPaletteDoc } from '@/doc/charts/reference-theming-default-palette-doc';
import { ThemingImportDoc } from '@/doc/charts/reference-theming-import-doc';
import { ThemingOverviewDoc } from '@/doc/charts/reference-theming-overview-doc';
import { ThemingSvgDoc } from '@/doc/charts/reference-theming-svg-doc';
import { TitleCaptionAlignmentDoc } from '@/doc/charts/configuration-title-caption-alignment-doc';
import { TitleCaptionBasicDoc } from '@/doc/charts/configuration-title-caption-basic-doc';
import { TitleCaptionCaptionDoc } from '@/doc/charts/configuration-title-caption-caption-doc';
import { TitleCaptionFloatingDoc } from '@/doc/charts/configuration-title-caption-floating-doc';
import { TitleCaptionImportDoc } from '@/doc/charts/configuration-title-caption-import-doc';
import { TitleCaptionOffsetsDoc } from '@/doc/charts/configuration-title-caption-offsets-doc';
import { TitleCaptionPositionDoc } from '@/doc/charts/configuration-title-caption-position-doc';
import { TitleCaptionResponsiveScalingDoc } from '@/doc/charts/configuration-title-caption-responsive-scaling-doc';
import { TitleCaptionStylingDoc } from '@/doc/charts/configuration-title-caption-styling-doc';
import { TooltipBasicDoc } from '@/doc/charts/configuration-tooltip-basic-doc';
import { TooltipCrosshairDoc } from '@/doc/charts/configuration-tooltip-crosshair-doc';
import { TooltipCustomTooltipDoc } from '@/doc/charts/configuration-tooltip-custom-tooltip-doc';
import { TooltipImportDoc } from '@/doc/charts/configuration-tooltip-import-doc';
import { TooltipOhlcLayoutDoc } from '@/doc/charts/configuration-tooltip-ohlc-layout-doc';
import { TooltipPositionDoc } from '@/doc/charts/configuration-tooltip-position-doc';
import { TooltipSharedModeDoc } from '@/doc/charts/configuration-tooltip-shared-mode-doc';
import { TooltipSnapStrategyDoc } from '@/doc/charts/configuration-tooltip-snap-strategy-doc';
import { TreeShakingBundleImpactDoc } from '@/doc/charts/reference-tree-shaking-bundle-impact-doc';
import { TreeShakingChartmoduleDoc } from '@/doc/charts/reference-tree-shaking-chartmodule-doc';
import { TreeShakingChoosingAnImportStyleDoc } from '@/doc/charts/reference-tree-shaking-choosing-an-import-style-doc';
import { TreeShakingImportDoc } from '@/doc/charts/reference-tree-shaking-import-doc';
import { TreeShakingStandaloneImportsDoc } from '@/doc/charts/reference-tree-shaking-standalone-imports-doc';
import { TreeShakingSvgAndCanvasDoc } from '@/doc/charts/reference-tree-shaking-svg-and-canvas-doc';
import { TreemapAccessibilityDoc } from '@/doc/charts/types-treemap-accessibility-doc';
import { TreemapAnimationDoc } from '@/doc/charts/types-treemap-animation-doc';
import { TreemapBasicDoc } from '@/doc/charts/types-treemap-basic-doc';
import { TreemapColorRangeDoc } from '@/doc/charts/types-treemap-color-range-doc';
import { TreemapColorsDoc } from '@/doc/charts/types-treemap-colors-doc';
import { TreemapCustomContentDoc } from '@/doc/charts/types-treemap-custom-content-doc';
import { TreemapDataLabelsDoc } from '@/doc/charts/types-treemap-data-labels-doc';
import { TreemapDeclarativeDoc } from '@/doc/charts/types-treemap-declarative-doc';
import { TreemapDrilldownDoc } from '@/doc/charts/types-treemap-drilldown-doc';
import { TreemapExportDoc } from '@/doc/charts/types-treemap-export-doc';
import { TreemapHierarchyDoc } from '@/doc/charts/types-treemap-hierarchy-doc';
import { TreemapHoverDoc } from '@/doc/charts/types-treemap-hover-doc';
import { TreemapImportDoc } from '@/doc/charts/types-treemap-import-doc';
import { TreemapLabelsDoc } from '@/doc/charts/types-treemap-labels-doc';
import { TreemapLayoutDoc } from '@/doc/charts/types-treemap-layout-doc';
import { TreemapLegendDoc } from '@/doc/charts/types-treemap-legend-doc';
import { TreemapPlaygroundImportDoc } from '@/doc/charts/types-treemap-playground-import-doc';
import { TreemapPlaygroundPlaygroundDoc } from '@/doc/charts/types-treemap-playground-playground-doc';
import { TreemapResponsiveDoc } from '@/doc/charts/types-treemap-responsive-doc';
import { TreemapTitleAndCaptionDoc } from '@/doc/charts/types-treemap-title-and-caption-doc';
import { TreemapTooltipDoc } from '@/doc/charts/types-treemap-tooltip-doc';
import { TreemapTreemapAlphabetIncQ32024RevenueBySegmentDoc } from '@/doc/charts/types-treemap-treemap-alphabet-inc-q3-2024-revenue-by-segment-doc';
import { TreemapTreemapComingSoonDoc } from '@/doc/charts/types-treemap-treemap-coming-soon-doc';
import { TreemapTreemapFortuneGlobal500Top15ByFy2023RevenueDoc } from '@/doc/charts/types-treemap-treemap-fortune-global-500-top-15-by-fy2023-revenue-doc';
import { TreemapTreemapImportDoc } from '@/doc/charts/types-treemap-treemap-import-doc';
import { TreemapTreemapLlmsIntegration2Doc } from '@/doc/charts/types-treemap-treemap-llms-integration-2-doc';
import { TreemapTreemapLlmsIntegrationDoc } from '@/doc/charts/types-treemap-treemap-llms-integration-doc';
import { TreemapTreemapOverviewDoc } from '@/doc/charts/types-treemap-treemap-overview-doc';
import { TreemapTreemapPricingDoc } from '@/doc/charts/types-treemap-treemap-pricing-doc';
import { TreemapTreemapWorldSLargestStockExchangesMarketCapVs2025YtdDoc } from '@/doc/charts/types-treemap-treemap-world-s-largest-stock-exchanges-market-cap-vs-2025-ytd-doc';
import { ZoomPanBasicDoc } from '@/doc/charts/configuration-zoom-pan-basic-doc';
import { ZoomPanDragToZoomDoc } from '@/doc/charts/configuration-zoom-pan-drag-to-zoom-doc';
import { ZoomPanImportDoc } from '@/doc/charts/configuration-zoom-pan-import-doc';
import { ZoomPanNavigatorDoc } from '@/doc/charts/configuration-zoom-pan-navigator-doc';
import { ZoomPanPanDoc } from '@/doc/charts/configuration-zoom-pan-pan-doc';
import { ZoomPanProgrammaticControlDoc } from '@/doc/charts/configuration-zoom-pan-programmatic-control-doc';
import { ZoomPanTouchPinchDoc } from '@/doc/charts/configuration-zoom-pan-touch-pinch-doc';
import { ZoomPanWheelZoomDoc } from '@/doc/charts/configuration-zoom-pan-wheel-zoom-doc';
import { ZoomPanZoomAndPanButtonsDoc } from '@/doc/charts/configuration-zoom-pan-zoom-and-pan-buttons-doc';
import { ZoomPanZoomChangeEventDoc } from '@/doc/charts/configuration-zoom-pan-zoom-change-event-doc';
import { ZoomPanZoomLimitsDoc } from '@/doc/charts/configuration-zoom-pan-zoom-limits-doc';
import { ZoomPanZoomModeDoc } from '@/doc/charts/configuration-zoom-pan-zoom-mode-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Component - Optimus UI"
        header="Charts"
        description="Charts is a unified chart system: SVG and Canvas rendering from the same compound API, with axes, legends, tooltips, animation and fully replaceable surfaces."
        [docs]="docs"
        [apiDocs]="[
            'ChartSvg',
            'ChartCanvas',
            'ChartGroup',
            'ChartLine',
            'ChartBar',
            'ChartPie',
            'ChartScatter',
            'ChartRadar',
            'ChartPolar',
            'ChartCandlestick',
            'ChartHeatmap',
            'ChartTreemap',
            'ChartXAxis',
            'ChartYAxis',
            'ChartLegend',
            'ChartColorLegend',
            'ChartTooltip',
            'ChartHover',
            'ChartTitle',
            'ChartCaption',
            'ChartDataLabels',
            'ChartReferenceLine',
            'ChartReferenceBand',
            'ChartAnnotation',
            'ChartZoom',
            'ChartNavigator',
            'ChartExportMenu',
            'ChartAccessibility',
            'ChartResponsive',
            'ChartDecimation',
            'ChartBreadcrumb',
            'ChartAxisGroup',
            'ChartItem'
        ]"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsDemo {
    docs = [
        {
            id: 'getting-started-architecture',
            label: 'Architecture',
            description: 'Understand the chart data model, chart type selection, the compound API, SVG vs Canvas rendering, and the feature surface.',
            children: [
                {
                    id: 'getting-started-architecture-import',
                    label: 'Import',
                    component: ArchitectureImportDoc
                },
                {
                    id: 'getting-started-architecture-first-chart',
                    label: 'First Chart',
                    component: ArchitectureFirstChartDoc
                },
                {
                    id: 'getting-started-architecture-data-model',
                    label: 'Data Model',
                    component: ArchitectureDataModelDoc
                },
                {
                    id: 'getting-started-architecture-chart-types',
                    label: 'Chart Types',
                    component: ArchitectureChartTypesDoc
                },
                {
                    id: 'getting-started-architecture-compound-api',
                    label: 'Compound API',
                    component: ArchitectureCompoundApiDoc
                },
                {
                    id: 'getting-started-architecture-dual-rendering',
                    label: 'Dual rendering',
                    component: ArchitectureDualRenderingDoc
                },
                {
                    id: 'getting-started-architecture-imperative-api',
                    label: 'Imperative API',
                    component: ArchitectureImperativeApiDoc
                },
                {
                    id: 'getting-started-architecture-animation',
                    label: 'Animation',
                    component: ArchitectureAnimationDoc
                },
                {
                    id: 'getting-started-architecture-multi-chart-sync',
                    label: 'Multi-chart sync',
                    component: ArchitectureMultiChartSyncDoc
                },
                {
                    id: 'getting-started-architecture-feature-surface',
                    label: 'Feature Surface',
                    component: ArchitectureFeatureSurfaceDoc
                }
            ]
        },
        {
            id: 'getting-started-llms',
            label: 'LLMs',
            description: 'Use the Angular Chart documentation as structured context for AI assistants and code-generation tools.',
            children: [
                {
                    id: 'getting-started-llms-import',
                    label: 'Import',
                    component: LlmsImportDoc
                },
                {
                    id: 'getting-started-llms-overview',
                    label: 'Overview',
                    component: LlmsOverviewDoc
                },
                {
                    id: 'getting-started-llms-chart-pages',
                    label: 'Chart Pages',
                    component: LlmsChartPagesDoc
                },
                {
                    id: 'getting-started-llms-context-packs',
                    label: 'Context Packs',
                    component: LlmsContextPacksDoc
                },
                {
                    id: 'getting-started-llms-demo-source',
                    label: 'Demo Source',
                    component: LlmsDemoSourceDoc
                },
                {
                    id: 'getting-started-llms-guardrails',
                    label: 'Guardrails',
                    component: LlmsGuardrailsDoc
                },
                {
                    id: 'getting-started-llms-prompting-pattern',
                    label: 'Prompting Pattern',
                    component: LlmsPromptingPatternDoc
                },
                {
                    id: 'getting-started-llms-output-checklist',
                    label: 'Output Checklist',
                    component: LlmsOutputChecklistDoc
                }
            ]
        },
        {
            id: 'getting-started-setup',
            label: 'Setup',
            description: 'Install Angular Charts, load the chart styles, and render the first chart with public package imports.',
            children: [
                {
                    id: 'getting-started-setup-import-2',
                    label: 'Import',
                    component: SetupImport2Doc
                },
                {
                    id: 'getting-started-setup-installation',
                    label: 'Installation',
                    component: SetupInstallationDoc
                },
                {
                    id: 'getting-started-setup-import',
                    label: 'Import',
                    component: SetupImportDoc
                },
                {
                    id: 'getting-started-setup-styles',
                    label: 'Styles',
                    component: SetupStylesDoc
                },
                {
                    id: 'getting-started-setup-ngmodule',
                    label: 'NgModule',
                    component: SetupNgmoduleDoc
                },
                {
                    id: 'getting-started-setup-quickstarts',
                    label: 'Quickstarts',
                    component: SetupQuickstartsDoc
                },
                {
                    id: 'getting-started-setup-next-steps',
                    label: 'Next Steps',
                    component: SetupNextStepsDoc
                }
            ]
        },
        {
            id: 'types-candlestick',
            label: 'Candlestick & OHLC',
            description: 'Financial OHLC chart showing open, high, low, and close prices per time period. Supports candlestick, hollow, and OHLC bar variants.',
            children: [
                {
                    id: 'types-candlestick-import',
                    label: 'Import',
                    component: CandlestickImportDoc
                },
                {
                    id: 'types-candlestick-basic',
                    label: 'Basic',
                    component: CandlestickBasicDoc
                },
                {
                    id: 'types-candlestick-ohlc-bars',
                    label: 'OHLC Bars',
                    component: CandlestickOhlcBarsDoc
                },
                {
                    id: 'types-candlestick-hollow',
                    label: 'Hollow',
                    component: CandlestickHollowDoc
                },
                {
                    id: 'types-candlestick-colors',
                    label: 'Colors',
                    component: CandlestickColorsDoc
                },
                {
                    id: 'types-candlestick-candle-styling',
                    label: 'Candle Styling',
                    component: CandlestickCandleStylingDoc
                },
                {
                    id: 'types-candlestick-declarative',
                    label: 'Declarative',
                    component: CandlestickDeclarativeDoc
                },
                {
                    id: 'types-candlestick-title-and-caption',
                    label: 'Title & Caption',
                    component: CandlestickTitleAndCaptionDoc
                },
                {
                    id: 'types-candlestick-hover',
                    label: 'Hover',
                    component: CandlestickHoverDoc
                },
                {
                    id: 'types-candlestick-tooltip',
                    label: 'Tooltip',
                    component: CandlestickTooltipDoc
                },
                {
                    id: 'types-candlestick-axes',
                    label: 'Axes',
                    component: CandlestickAxesDoc
                },
                {
                    id: 'types-candlestick-data-labels',
                    label: 'Data Labels',
                    component: CandlestickDataLabelsDoc
                },
                {
                    id: 'types-candlestick-zoom-and-navigator',
                    label: 'Zoom & Navigator',
                    component: CandlestickZoomAndNavigatorDoc
                },
                {
                    id: 'types-candlestick-annotation',
                    label: 'Annotation',
                    component: CandlestickAnnotationDoc
                },
                {
                    id: 'types-candlestick-reference-lines-and-bands',
                    label: 'Reference Lines & Bands',
                    component: CandlestickReferenceLinesAndBandsDoc
                },
                {
                    id: 'types-candlestick-animation',
                    label: 'Animation',
                    component: CandlestickAnimationDoc
                },
                {
                    id: 'types-candlestick-export',
                    label: 'Export',
                    component: CandlestickExportDoc
                },
                {
                    id: 'types-candlestick-responsive',
                    label: 'Responsive',
                    component: CandlestickResponsiveDoc
                },
                {
                    id: 'types-candlestick-accessibility',
                    label: 'Accessibility',
                    component: CandlestickAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-candlestick-candlestick',
            label: 'Candlestick Examples',
            description: 'Filled-body candlestick demos on real data. Covers log scale, zoom with navigator, and event annotations.',
            children: [
                {
                    id: 'types-candlestick-candlestick-import',
                    label: 'Import',
                    component: CandlestickCandlestickImportDoc
                },
                {
                    id: 'types-candlestick-candlestick-bitcoin-btc-usd-weekly-nov-2021-to-dec-2024',
                    label: 'Bitcoin (BTC/USD), Weekly, Nov 2021 to Dec 2024',
                    component: CandlestickCandlestickBitcoinBtcUsdWeeklyNov2021ToDec2024Doc
                },
                {
                    id: 'types-candlestick-candlestick-apple-inc-aapl-2024-daily-ohlc',
                    label: 'Apple Inc. (AAPL), 2024 Daily OHLC',
                    component: CandlestickCandlestickAppleIncAapl2024DailyOhlcDoc
                },
                {
                    id: 'types-candlestick-candlestick-aapl-q1-2024-with-volume-sub-pane',
                    label: 'AAPL, Q1 2024 with Volume sub-pane',
                    component: CandlestickCandlestickAaplQ12024WithVolumeSubPaneDoc
                }
            ]
        },
        {
            id: 'types-candlestick-hollow',
            label: 'Hollow Candles Examples',
            description: 'Hollow-body candlestick demos on real data. Covers momentum-based coloring, earnings event annotations, and EMA slope callbacks.',
            children: [
                {
                    id: 'types-candlestick-hollow-import',
                    label: 'Import',
                    component: CandlestickHollowImportDoc
                },
                {
                    id: 'types-candlestick-hollow-tesla-inc-tsla-2024-weekly-hollow-candles',
                    label: 'Tesla, Inc. (TSLA), 2024 Weekly Hollow Candles',
                    component: CandlestickHollowTeslaIncTsla2024WeeklyHollowCandlesDoc
                },
                {
                    id: 'types-candlestick-hollow-eur-usd-h2-2024-daily-hollow-candles',
                    label: 'EUR/USD, H2 2024 Daily Hollow Candles',
                    component: CandlestickHollowEurUsdH22024DailyHollowCandlesDoc
                }
            ]
        },
        {
            id: 'types-candlestick-live-data',
            label: 'Live Candles Examples',
            description: 'Live streaming candlestick demos. Each aggregates ticks into a rolling window with reactive overlays and live annotations.',
            children: [
                {
                    id: 'types-candlestick-live-data-import',
                    label: 'Import',
                    component: CandlestickLiveDataImportDoc
                },
                {
                    id: 'types-candlestick-live-data-btc-usd-high-frequency-stream',
                    label: 'BTC/USD, High-Frequency Stream',
                    component: CandlestickLiveDataBtcUsdHighFrequencyStreamDoc
                },
                {
                    id: 'types-candlestick-live-data-eur-usd-live-tick-stream',
                    label: 'EUR/USD, Live Tick Stream',
                    component: CandlestickLiveDataEurUsdLiveTickStreamDoc
                }
            ]
        },
        {
            id: 'types-candlestick-ohlc',
            label: 'OHLC Examples',
            description: 'OHLC bar chart demos on real data. Each uses variant=&quot;ohlc&quot; with per-bar color callbacks and event annotations.',
            children: [
                {
                    id: 'types-candlestick-ohlc-import',
                    label: 'Import',
                    component: CandlestickOhlcImportDoc
                },
                {
                    id: 'types-candlestick-ohlc-wti-crude-oil-cl1-2024-weekly-ohlc',
                    label: 'WTI Crude Oil (CL1), 2024 Weekly OHLC',
                    component: CandlestickOhlcWtiCrudeOilCl12024WeeklyOhlcDoc
                },
                {
                    id: 'types-candlestick-ohlc-gold-spot-xau-usd-2024-weekly-ohlc',
                    label: 'Gold Spot (XAU/USD), 2024 Weekly OHLC',
                    component: CandlestickOhlcGoldSpotXauUsd2024WeeklyOhlcDoc
                }
            ]
        },
        {
            id: 'types-candlestick-playground',
            label: 'Candlestick & OHLC Playground',
            description: 'Interactive playground for candlestick and OHLC charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-candlestick-playground-import',
                    label: 'Import',
                    component: CandlestickPlaygroundImportDoc
                },
                {
                    id: 'types-candlestick-playground-playground',
                    label: 'Playground',
                    component: CandlestickPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-column-bar',
            label: 'Column & Bar',
            description: 'Vertical columns, horizontal bars, grouped, stacked, waterfall, and custom-shaped bar charts.',
            children: [
                {
                    id: 'types-column-bar-import',
                    label: 'Import',
                    component: ColumnBarImportDoc
                },
                {
                    id: 'types-column-bar-basic',
                    label: 'Basic',
                    component: ColumnBarBasicDoc
                },
                {
                    id: 'types-column-bar-colors',
                    label: 'Colors',
                    component: ColumnBarColorsDoc
                },
                {
                    id: 'types-column-bar-gradient-color',
                    label: 'Gradient Color',
                    component: ColumnBarGradientColorDoc
                },
                {
                    id: 'types-column-bar-grouped',
                    label: 'Grouped',
                    component: ColumnBarGroupedDoc
                },
                {
                    id: 'types-column-bar-horizontal',
                    label: 'Horizontal',
                    component: ColumnBarHorizontalDoc
                },
                {
                    id: 'types-column-bar-sorted',
                    label: 'Sorted',
                    component: ColumnBarSortedDoc
                },
                {
                    id: 'types-column-bar-negative-values',
                    label: 'Negative Values',
                    component: ColumnBarNegativeValuesDoc
                },
                {
                    id: 'types-column-bar-null-values',
                    label: 'Null Values',
                    component: ColumnBarNullValuesDoc
                },
                {
                    id: 'types-column-bar-floating-range',
                    label: 'Floating / Range',
                    component: ColumnBarFloatingRangeDoc
                },
                {
                    id: 'types-column-bar-variwide',
                    label: 'Variwide',
                    component: ColumnBarVariwideDoc
                },
                {
                    id: 'types-column-bar-custom-shape',
                    label: 'Custom Shape',
                    component: ColumnBarCustomShapeDoc
                },
                {
                    id: 'types-column-bar-border',
                    label: 'Border',
                    component: ColumnBarBorderDoc
                },
                {
                    id: 'types-column-bar-bar-sizing',
                    label: 'Bar Sizing',
                    component: ColumnBarBarSizingDoc
                },
                {
                    id: 'types-column-bar-stacked',
                    label: 'Stacked',
                    component: ColumnBarStackedDoc
                },
                {
                    id: 'types-column-bar-percent-stacked',
                    label: 'Percent Stacked',
                    component: ColumnBarPercentStackedDoc
                },
                {
                    id: 'types-column-bar-waterfall',
                    label: 'Waterfall',
                    component: ColumnBarWaterfallDoc
                },
                {
                    id: 'types-column-bar-overlap',
                    label: 'Overlap',
                    component: ColumnBarOverlapDoc
                },
                {
                    id: 'types-column-bar-declarative',
                    label: 'Declarative',
                    component: ColumnBarDeclarativeDoc
                },
                {
                    id: 'types-column-bar-title-and-caption',
                    label: 'Title & Caption',
                    component: ColumnBarTitleAndCaptionDoc
                },
                {
                    id: 'types-column-bar-hover',
                    label: 'Hover',
                    component: ColumnBarHoverDoc
                },
                {
                    id: 'types-column-bar-tooltip',
                    label: 'Tooltip',
                    component: ColumnBarTooltipDoc
                },
                {
                    id: 'types-column-bar-legend',
                    label: 'Legend',
                    component: ColumnBarLegendDoc
                },
                {
                    id: 'types-column-bar-axes',
                    label: 'Axes',
                    component: ColumnBarAxesDoc
                },
                {
                    id: 'types-column-bar-data-labels',
                    label: 'Data Labels',
                    component: ColumnBarDataLabelsDoc
                },
                {
                    id: 'types-column-bar-zoom-and-navigator',
                    label: 'Zoom & Navigator',
                    component: ColumnBarZoomAndNavigatorDoc
                },
                {
                    id: 'types-column-bar-annotation',
                    label: 'Annotation',
                    component: ColumnBarAnnotationDoc
                },
                {
                    id: 'types-column-bar-reference-lines-and-bands',
                    label: 'Reference Lines & Bands',
                    component: ColumnBarReferenceLinesAndBandsDoc
                },
                {
                    id: 'types-column-bar-animation',
                    label: 'Animation',
                    component: ColumnBarAnimationDoc
                },
                {
                    id: 'types-column-bar-export',
                    label: 'Export',
                    component: ColumnBarExportDoc
                },
                {
                    id: 'types-column-bar-responsive',
                    label: 'Responsive',
                    component: ColumnBarResponsiveDoc
                },
                {
                    id: 'types-column-bar-accessibility',
                    label: 'Accessibility',
                    component: ColumnBarAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-column-bar-bar',
            label: 'Bar Examples',
            description: 'Bar chart demos built on real datasets. Each highlights a different rendering or theming capability.',
            children: [
                {
                    id: 'types-column-bar-bar-import',
                    label: 'Import',
                    component: ColumnBarBarImportDoc
                },
                {
                    id: 'types-column-bar-bar-paris-2024-summer-olympics-gold-medals-top-12-countries',
                    label: 'Paris 2024 Summer Olympics, Gold Medals, Top 12 Countries',
                    component: ColumnBarBarParis2024SummerOlympicsGoldMedalsTop12CountriesDoc
                },
                {
                    id: 'types-column-bar-bar-world-s-largest-metropolitan-areas-by-population-2024',
                    label: "World's Largest Metropolitan Areas by Population, 2024",
                    component: ColumnBarBarWorldSLargestMetropolitanAreasByPopulation2024Doc
                },
                {
                    id: 'types-column-bar-bar-world-s-most-visited-art-museums-2023',
                    label: "World's Most-Visited Art Museums, 2023",
                    component: ColumnBarBarWorldSMostVisitedArtMuseums2023Doc
                },
                {
                    id: 'types-column-bar-bar-primeui-themed-bar-chart',
                    label: 'PrimeUI-Themed Bar Chart',
                    component: ColumnBarBarPrimeuiThemedBarChartDoc
                }
            ]
        },
        {
            id: 'types-column-bar-grouped',
            label: 'Grouped Bar Examples',
            description: 'Grouped bar chart demos on real data. Each uses a custom tooltip to show computed values across series.',
            children: [
                {
                    id: 'types-column-bar-grouped-import',
                    label: 'Import',
                    component: ColumnBarGroupedImportDoc
                },
                {
                    id: 'types-column-bar-grouped-g7-randd-expenditure-by-funding-source-2022',
                    label: 'G7 R&D Expenditure by Funding Source, 2022',
                    component: ColumnBarGroupedG7RanddExpenditureByFundingSource2022Doc
                },
                {
                    id: 'types-column-bar-grouped-labour-force-participation-by-gender-and-region-2023',
                    label: 'Labour Force Participation by Gender & Region, 2023',
                    component: ColumnBarGroupedLabourForceParticipationByGenderAndRegion2023Doc
                }
            ]
        },
        {
            id: 'types-column-bar-playground',
            label: 'Column & Bar Playground',
            description: 'Interactive playground for column and bar charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-column-bar-playground-import',
                    label: 'Import',
                    component: ColumnBarPlaygroundImportDoc
                },
                {
                    id: 'types-column-bar-playground-playground',
                    label: 'Playground',
                    component: ColumnBarPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-column-bar-stacked',
            label: 'Stacked Bar Examples',
            description: 'Stacked bar chart demos built on real datasets. Covers normal stacking, percent normalization, and negative stacking patterns.',
            children: [
                {
                    id: 'types-column-bar-stacked-import',
                    label: 'Import',
                    component: ColumnBarStackedImportDoc
                },
                {
                    id: 'types-column-bar-stacked-revenue-composition-grouped-stacked-with-reference-bands',
                    label: 'Revenue Composition, Grouped Stacked with Reference Bands',
                    component: ColumnBarStackedRevenueCompositionGroupedStackedWithReferenceBandsDoc
                },
                {
                    id: 'types-column-bar-stacked-global-electric-vehicle-sales-by-region-2019-2023',
                    label: 'Global Electric Vehicle Sales by Region, 2019–2023',
                    component: ColumnBarStackedGlobalElectricVehicleSalesByRegion20192023Doc
                },
                {
                    id: 'types-column-bar-stacked-electricity-generation-mix-by-country-2023',
                    label: 'Electricity Generation Mix by Country, 2023',
                    component: ColumnBarStackedElectricityGenerationMixByCountry2023Doc
                },
                {
                    id: 'types-column-bar-stacked-world-population-by-age-group-and-sex-2024',
                    label: 'World Population by Age Group and Sex, 2024',
                    component: ColumnBarStackedWorldPopulationByAgeGroupAndSex2024Doc
                }
            ]
        },
        {
            id: 'types-column-bar-waterfall',
            label: 'Waterfall Examples',
            description: 'Waterfall chart demos on real data. Covers color routing by contribution type, horizontal orientation, and stacked waterfall layers.',
            children: [
                {
                    id: 'types-column-bar-waterfall-import',
                    label: 'Import',
                    component: ColumnBarWaterfallImportDoc
                },
                {
                    id: 'types-column-bar-waterfall-eu-27-government-revenue-and-spending-2022',
                    label: 'EU-27 Government Revenue and Spending, 2022',
                    component: ColumnBarWaterfallEu27GovernmentRevenueAndSpending2022Doc
                },
                {
                    id: 'types-column-bar-waterfall-global-carbon-budget-2022-sources-sinks-net-accumulation',
                    label: 'Global Carbon Budget 2022, Sources, Sinks, Net Accumulation',
                    component: ColumnBarWaterfallGlobalCarbonBudget2022SourcesSinksNetAccumulationDoc
                },
                {
                    id: 'types-column-bar-waterfall-fy-2023-ebitda-bridge-stacked-waterfall',
                    label: 'FY 2023 EBITDA Bridge, Stacked Waterfall',
                    component: ColumnBarWaterfallFy2023EbitdaBridgeStackedWaterfallDoc
                }
            ]
        },
        {
            id: 'types-combo',
            label: 'Combo',
            description: 'Combine chart types on a shared category axis. Supports bar, line, area, scatter, polar, and radar in any combination.',
            children: [
                {
                    id: 'types-combo-import',
                    label: 'Import',
                    component: ComboImportDoc
                },
                {
                    id: 'types-combo-bar-and-line',
                    label: 'Bar & Line',
                    component: ComboBarAndLineDoc
                },
                {
                    id: 'types-combo-dual-axis',
                    label: 'Dual Axis',
                    component: ComboDualAxisDoc
                },
                {
                    id: 'types-combo-bar-and-area',
                    label: 'Bar & Area',
                    component: ComboBarAndAreaDoc
                },
                {
                    id: 'types-combo-stacked-bar-and-line',
                    label: 'Stacked Bar & Line',
                    component: ComboStackedBarAndLineDoc
                },
                {
                    id: 'types-combo-line-and-scatter',
                    label: 'Line & Scatter',
                    component: ComboLineAndScatterDoc
                },
                {
                    id: 'types-combo-line-and-scatter-on-a-category-axis',
                    label: 'Line & Scatter on a Category Axis',
                    component: ComboLineAndScatterOnACategoryAxisDoc
                },
                {
                    id: 'types-combo-polar-and-radar',
                    label: 'Polar & Radar',
                    component: ComboPolarAndRadarDoc
                },
                {
                    id: 'types-combo-shared-tooltip',
                    label: 'Shared Tooltip',
                    component: ComboSharedTooltipDoc
                }
            ]
        },
        {
            id: 'types-combo-examples',
            label: 'Combo Examples',
            description: 'Combo chart demos on real data. Each combines multiple chart types to show complementary data views.',
            children: [
                {
                    id: 'types-combo-examples-import',
                    label: 'Import',
                    component: ComboExamplesImportDoc
                },
                {
                    id: 'types-combo-examples-climate-dashboard-rainfall-temperature',
                    label: 'Climate Dashboard: Rainfall + Temperature',
                    component: ComboExamplesClimateDashboardRainfallTemperatureDoc
                },
                {
                    id: 'types-combo-examples-stock-price-volume',
                    label: 'Stock Price + Volume',
                    component: ComboExamplesStockPriceVolumeDoc
                },
                {
                    id: 'types-combo-examples-revenue-mix-vs-target-with-growth-overlay',
                    label: 'Revenue Mix vs Target with Growth Overlay',
                    component: ComboExamplesRevenueMixVsTargetWithGrowthOverlayDoc
                },
                {
                    id: 'types-combo-examples-channel-efficiency-quadrants',
                    label: 'Channel Efficiency Quadrants',
                    component: ComboExamplesChannelEfficiencyQuadrantsDoc
                },
                {
                    id: 'types-combo-examples-economic-forecast-envelope',
                    label: 'Economic Forecast Envelope',
                    component: ComboExamplesEconomicForecastEnvelopeDoc
                },
                {
                    id: 'types-combo-examples-product-capability-benchmark-radar-polar',
                    label: 'Product Capability Benchmark: Radar + Polar',
                    component: ComboExamplesProductCapabilityBenchmarkRadarPolarDoc
                }
            ]
        },
        {
            id: 'types-heatmap',
            label: 'Heatmap',
            description: 'Color-coded grid showing value intensity across two categorical dimensions.',
            children: [
                {
                    id: 'types-heatmap-import',
                    label: 'Import',
                    component: HeatmapImportDoc
                },
                {
                    id: 'types-heatmap-basic',
                    label: 'Basic',
                    component: HeatmapBasicDoc
                },
                {
                    id: 'types-heatmap-color-range',
                    label: 'Color Range',
                    component: HeatmapColorRangeDoc
                },
                {
                    id: 'types-heatmap-single-color',
                    label: 'Single Color',
                    component: HeatmapSingleColorDoc
                },
                {
                    id: 'types-heatmap-cell-styling',
                    label: 'Cell Styling',
                    component: HeatmapCellStylingDoc
                },
                {
                    id: 'types-heatmap-custom-content',
                    label: 'Custom Content',
                    component: HeatmapCustomContentDoc
                },
                {
                    id: 'types-heatmap-declarative',
                    label: 'Declarative',
                    component: HeatmapDeclarativeDoc
                },
                {
                    id: 'types-heatmap-title-and-caption',
                    label: 'Title & Caption',
                    component: HeatmapTitleAndCaptionDoc
                },
                {
                    id: 'types-heatmap-hover',
                    label: 'Hover',
                    component: HeatmapHoverDoc
                },
                {
                    id: 'types-heatmap-tooltip',
                    label: 'Tooltip',
                    component: HeatmapTooltipDoc
                },
                {
                    id: 'types-heatmap-legend',
                    label: 'Legend',
                    component: HeatmapLegendDoc
                },
                {
                    id: 'types-heatmap-axes',
                    label: 'Axes',
                    component: HeatmapAxesDoc
                },
                {
                    id: 'types-heatmap-data-labels',
                    label: 'Data Labels',
                    component: HeatmapDataLabelsDoc
                },
                {
                    id: 'types-heatmap-annotation',
                    label: 'Annotation',
                    component: HeatmapAnnotationDoc
                },
                {
                    id: 'types-heatmap-animation',
                    label: 'Animation',
                    component: HeatmapAnimationDoc
                },
                {
                    id: 'types-heatmap-export',
                    label: 'Export',
                    component: HeatmapExportDoc
                },
                {
                    id: 'types-heatmap-responsive',
                    label: 'Responsive',
                    component: HeatmapResponsiveDoc
                },
                {
                    id: 'types-heatmap-accessibility',
                    label: 'Accessibility',
                    component: HeatmapAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-heatmap-heatmap',
            label: 'Heatmap Examples',
            description: 'Heatmap chart demos built on real datasets. Each uses a different color scale and cell-level labeling strategy.',
            children: [
                {
                    id: 'types-heatmap-heatmap-import',
                    label: 'Import',
                    component: HeatmapHeatmapImportDoc
                },
                {
                    id: 'types-heatmap-heatmap-sandp-500-sector-correlation-matrix-daily-returns-2023',
                    label: 'S&P 500 Sector Correlation Matrix: Daily Returns, 2023',
                    component: HeatmapHeatmapSandp500SectorCorrelationMatrixDailyReturns2023Doc
                },
                {
                    id: 'types-heatmap-heatmap-olympic-medal-table-by-sport',
                    label: 'Olympic Medal Table by Sport',
                    component: HeatmapHeatmapOlympicMedalTableBySportDoc
                },
                {
                    id: 'types-heatmap-heatmap-saas-monthly-cohort-retention-2024-signups',
                    label: 'SaaS Monthly-Cohort Retention: 2024 Signups',
                    component: HeatmapHeatmapSaasMonthlyCohortRetention2024SignupsDoc
                }
            ]
        },
        {
            id: 'types-heatmap-playground',
            label: 'Heatmap Playground',
            description: 'Interactive playground for heatmap charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-heatmap-playground-import',
                    label: 'Import',
                    component: HeatmapPlaygroundImportDoc
                },
                {
                    id: 'types-heatmap-playground-playground',
                    label: 'Playground',
                    component: HeatmapPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-line-area',
            label: 'Line & Area',
            description: 'Line charts for trends and comparisons. Supports area fills, stacking, range bands, and segment-level styling.',
            children: [
                {
                    id: 'types-line-area-import',
                    label: 'Import',
                    component: LineAreaImportDoc
                },
                {
                    id: 'types-line-area-basic',
                    label: 'Basic',
                    component: LineAreaBasicDoc
                },
                {
                    id: 'types-line-area-area',
                    label: 'Area',
                    component: LineAreaAreaDoc
                },
                {
                    id: 'types-line-area-colors',
                    label: 'Colors',
                    component: LineAreaColorsDoc
                },
                {
                    id: 'types-line-area-gradient-color',
                    label: 'Gradient Color',
                    component: LineAreaGradientColorDoc
                },
                {
                    id: 'types-line-area-curve-types',
                    label: 'Curve Types',
                    component: LineAreaCurveTypesDoc
                },
                {
                    id: 'types-line-area-null-handling',
                    label: 'Null Handling',
                    component: LineAreaNullHandlingDoc
                },
                {
                    id: 'types-line-area-segment-styling',
                    label: 'Segment Styling',
                    component: LineAreaSegmentStylingDoc
                },
                {
                    id: 'types-line-area-markers',
                    label: 'Markers',
                    component: LineAreaMarkersDoc
                },
                {
                    id: 'types-line-area-custom-markers',
                    label: 'Custom Markers',
                    component: LineAreaCustomMarkersDoc
                },
                {
                    id: 'types-line-area-line-styling',
                    label: 'Line Styling',
                    component: LineAreaLineStylingDoc
                },
                {
                    id: 'types-line-area-line-border',
                    label: 'Line Border',
                    component: LineAreaLineBorderDoc
                },
                {
                    id: 'types-line-area-stacked-area',
                    label: 'Stacked Area',
                    component: LineAreaStackedAreaDoc
                },
                {
                    id: 'types-line-area-range-area',
                    label: 'Range Area',
                    component: LineAreaRangeAreaDoc
                },
                {
                    id: 'types-line-area-declarative',
                    label: 'Declarative',
                    component: LineAreaDeclarativeDoc
                },
                {
                    id: 'types-line-area-title-and-caption',
                    label: 'Title & Caption',
                    component: LineAreaTitleAndCaptionDoc
                },
                {
                    id: 'types-line-area-hover',
                    label: 'Hover',
                    component: LineAreaHoverDoc
                },
                {
                    id: 'types-line-area-tooltip',
                    label: 'Tooltip',
                    component: LineAreaTooltipDoc
                },
                {
                    id: 'types-line-area-legend',
                    label: 'Legend',
                    component: LineAreaLegendDoc
                },
                {
                    id: 'types-line-area-axes',
                    label: 'Axes',
                    component: LineAreaAxesDoc
                },
                {
                    id: 'types-line-area-data-labels',
                    label: 'Data Labels',
                    component: LineAreaDataLabelsDoc
                },
                {
                    id: 'types-line-area-zoom-and-navigator',
                    label: 'Zoom & Navigator',
                    component: LineAreaZoomAndNavigatorDoc
                },
                {
                    id: 'types-line-area-annotation',
                    label: 'Annotation',
                    component: LineAreaAnnotationDoc
                },
                {
                    id: 'types-line-area-reference-lines-and-bands',
                    label: 'Reference Lines & Bands',
                    component: LineAreaReferenceLinesAndBandsDoc
                },
                {
                    id: 'types-line-area-animation',
                    label: 'Animation',
                    component: LineAreaAnimationDoc
                },
                {
                    id: 'types-line-area-export',
                    label: 'Export',
                    component: LineAreaExportDoc
                },
                {
                    id: 'types-line-area-responsive',
                    label: 'Responsive',
                    component: LineAreaResponsiveDoc
                },
                {
                    id: 'types-line-area-accessibility',
                    label: 'Accessibility',
                    component: LineAreaAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-line-area-area',
            label: 'Area Examples',
            description: 'Examples of area charts with segment fill coloring, reference overlays, and zoom.',
            children: [
                {
                    id: 'types-line-area-area-import',
                    label: 'Import',
                    component: LineAreaAreaImportDoc
                },
                {
                    id: 'types-line-area-area-us-unemployment-rate-2000-2024',
                    label: 'US Unemployment Rate 2000–2024',
                    component: LineAreaAreaUsUnemploymentRate20002024Doc
                },
                {
                    id: 'types-line-area-area-us-electricity-generation-mix-2010-2023',
                    label: 'US Electricity Generation Mix 2010–2023',
                    component: LineAreaAreaUsElectricityGenerationMix20102023Doc
                },
                {
                    id: 'types-line-area-area-us-treasury-yield-curve-2019-2024',
                    label: 'US Treasury Yield Curve 2019–2024',
                    component: LineAreaAreaUsTreasuryYieldCurve20192024Doc
                }
            ]
        },
        {
            id: 'types-line-area-line',
            label: 'Line Examples',
            description: 'Line chart demos built on real datasets. Each combines multiple features in a realistic context.',
            children: [
                {
                    id: 'types-line-area-line-import',
                    label: 'Import',
                    component: LineAreaLineImportDoc
                },
                {
                    id: 'types-line-area-line-nasa-global-temperature-anomaly',
                    label: 'NASA Global Temperature Anomaly',
                    component: LineAreaLineNasaGlobalTemperatureAnomalyDoc
                },
                {
                    id: 'types-line-area-line-u-s-unemployment-rate-2000-2024',
                    label: 'U.S. Unemployment Rate 2000–2024',
                    component: LineAreaLineUSUnemploymentRate20002024Doc
                },
                {
                    id: 'types-line-area-line-us-stock-indices-normalised-comparison',
                    label: 'US Stock Indices: Normalised Comparison',
                    component: LineAreaLineUsStockIndicesNormalisedComparisonDoc
                }
            ]
        },
        {
            id: 'types-line-area-playground',
            label: 'Line & Area Playground',
            description: 'Interactive playground for line and area charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-line-area-playground-import',
                    label: 'Import',
                    component: LineAreaPlaygroundImportDoc
                },
                {
                    id: 'types-line-area-playground-playground',
                    label: 'Playground',
                    component: LineAreaPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-line-area-range',
            label: 'Range Area Examples',
            description: 'Area charts that fill the region between two series. Examples covering different band types.',
            children: [
                {
                    id: 'types-line-area-range-import',
                    label: 'Import',
                    component: LineAreaRangeImportDoc
                },
                {
                    id: 'types-line-area-range-brent-crude-oil-annual-price-range-2005-to-2023',
                    label: 'Brent Crude Oil Annual Price Range, 2005 to 2023',
                    component: LineAreaRangeBrentCrudeOilAnnualPriceRange2005To2023Doc
                },
                {
                    id: 'types-line-area-range-global-number-of-births-and-deaths-1950-to-2100',
                    label: 'Global Number of Births and Deaths, 1950 to 2100',
                    component: LineAreaRangeGlobalNumberOfBirthsAndDeaths1950To2100Doc
                },
                {
                    id: 'types-line-area-range-london-sunrise-and-sunset-times',
                    label: 'London Sunrise & Sunset Times',
                    component: LineAreaRangeLondonSunriseAndSunsetTimesDoc
                }
            ]
        },
        {
            id: 'types-line-area-stacked',
            label: 'Stacked Line Examples',
            description: 'Examples of stacked area charts in absolute and percent normalized mode.',
            children: [
                {
                    id: 'types-line-area-stacked-import',
                    label: 'Import',
                    component: LineAreaStackedImportDoc
                },
                {
                    id: 'types-line-area-stacked-us-federal-spending-2000-2023',
                    label: 'US Federal Spending 2000–2023',
                    component: LineAreaStackedUsFederalSpending20002023Doc
                },
                {
                    id: 'types-line-area-stacked-eu-27-energy-mix-2013-2023',
                    label: 'EU-27 Energy Mix 2013–2023',
                    component: LineAreaStackedEu27EnergyMix20132023Doc
                }
            ]
        },
        {
            id: 'types-line-area-time-series',
            label: 'Time Series Line Examples',
            description: 'Line and area charts on a live time axis. Each demo uses a streaming rolling window.',
            children: [
                {
                    id: 'types-line-area-time-series-import',
                    label: 'Import',
                    component: LineAreaTimeSeriesImportDoc
                },
                {
                    id: 'types-line-area-time-series-live-server-metrics-cpu-and-memory-utilisation',
                    label: 'Live server metrics: CPU and memory utilisation',
                    component: LineAreaTimeSeriesLiveServerMetricsCpuAndMemoryUtilisationDoc
                },
                {
                    id: 'types-line-area-time-series-live-stock-price-acme-corp',
                    label: 'Live stock price: ACME Corp',
                    component: LineAreaTimeSeriesLiveStockPriceAcmeCorpDoc
                }
            ]
        },
        {
            id: 'types-pie-donut',
            label: 'Pie & Donut',
            description: 'Circular charts for part-to-whole relationships. Pie, donut, and gauge variants.',
            children: [
                {
                    id: 'types-pie-donut-import',
                    label: 'Import',
                    component: PieDonutImportDoc
                },
                {
                    id: 'types-pie-donut-basic',
                    label: 'Basic',
                    component: PieDonutBasicDoc
                },
                {
                    id: 'types-pie-donut-donut',
                    label: 'Donut',
                    component: PieDonutDonutDoc
                },
                {
                    id: 'types-pie-donut-gauge',
                    label: 'Gauge',
                    component: PieDonutGaugeDoc
                },
                {
                    id: 'types-pie-donut-colors',
                    label: 'Colors',
                    component: PieDonutColorsDoc
                },
                {
                    id: 'types-pie-donut-gradient-color',
                    label: 'Gradient Color',
                    component: PieDonutGradientColorDoc
                },
                {
                    id: 'types-pie-donut-sorted',
                    label: 'Sorted',
                    component: PieDonutSortedDoc
                },
                {
                    id: 'types-pie-donut-outer-radius',
                    label: 'Outer Radius',
                    component: PieDonutOuterRadiusDoc
                },
                {
                    id: 'types-pie-donut-variable-radius',
                    label: 'Variable Radius',
                    component: PieDonutVariableRadiusDoc
                },
                {
                    id: 'types-pie-donut-border',
                    label: 'Border',
                    component: PieDonutBorderDoc
                },
                {
                    id: 'types-pie-donut-custom-slice-content',
                    label: 'Custom Slice Content',
                    component: PieDonutCustomSliceContentDoc
                },
                {
                    id: 'types-pie-donut-stacked',
                    label: 'Stacked',
                    component: PieDonutStackedDoc
                },
                {
                    id: 'types-pie-donut-declarative',
                    label: 'Declarative',
                    component: PieDonutDeclarativeDoc
                },
                {
                    id: 'types-pie-donut-title-and-caption',
                    label: 'Title & Caption',
                    component: PieDonutTitleAndCaptionDoc
                },
                {
                    id: 'types-pie-donut-hover',
                    label: 'Hover',
                    component: PieDonutHoverDoc
                },
                {
                    id: 'types-pie-donut-tooltip',
                    label: 'Tooltip',
                    component: PieDonutTooltipDoc
                },
                {
                    id: 'types-pie-donut-legend',
                    label: 'Legend',
                    component: PieDonutLegendDoc
                },
                {
                    id: 'types-pie-donut-data-labels',
                    label: 'Data Labels',
                    component: PieDonutDataLabelsDoc
                },
                {
                    id: 'types-pie-donut-annotation',
                    label: 'Annotation',
                    component: PieDonutAnnotationDoc
                },
                {
                    id: 'types-pie-donut-animation',
                    label: 'Animation',
                    component: PieDonutAnimationDoc
                },
                {
                    id: 'types-pie-donut-export',
                    label: 'Export',
                    component: PieDonutExportDoc
                },
                {
                    id: 'types-pie-donut-responsive',
                    label: 'Responsive',
                    component: PieDonutResponsiveDoc
                },
                {
                    id: 'types-pie-donut-accessibility',
                    label: 'Accessibility',
                    component: PieDonutAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-pie-donut-donut',
            label: 'Donut Examples',
            description: 'Donut chart demos on real data. Covers animated slice reordering, live annotation content, and custom center readouts.',
            children: [
                {
                    id: 'types-pie-donut-donut-import',
                    label: 'Import',
                    component: PieDonutDonutImportDoc
                },
                {
                    id: 'types-pie-donut-donut-browser-market-share',
                    label: 'Browser Market Share',
                    component: PieDonutDonutBrowserMarketShareDoc
                },
                {
                    id: 'types-pie-donut-donut-sandp-500-sector-breakdown',
                    label: 'S&P 500 Sector Breakdown',
                    component: PieDonutDonutSandp500SectorBreakdownDoc
                },
                {
                    id: 'types-pie-donut-donut-renewable-energy-by-region',
                    label: 'Renewable Energy by Region',
                    component: PieDonutDonutRenewableEnergyByRegionDoc
                }
            ]
        },
        {
            id: 'types-pie-donut-gauge',
            label: 'Gauge Examples',
            description: 'Gauge examples combining color zone segments, ChartAnnotation needles, and interactive zone tooltips.',
            children: [
                {
                    id: 'types-pie-donut-gauge-import',
                    label: 'Import',
                    component: PieDonutGaugeImportDoc
                },
                {
                    id: 'types-pie-donut-gauge-gb-grid-carbon-intensity',
                    label: 'GB Grid Carbon Intensity',
                    component: PieDonutGaugeGbGridCarbonIntensityDoc
                },
                {
                    id: 'types-pie-donut-gauge-atmospheric-co-concentration-mauna-loa',
                    label: 'Atmospheric CO₂ Concentration: Mauna Loa',
                    component: PieDonutGaugeAtmosphericCoConcentrationMaunaLoaDoc
                },
                {
                    id: 'types-pie-donut-gauge-nasa-global-temperature-anomaly',
                    label: 'NASA Global Temperature Anomaly',
                    component: PieDonutGaugeNasaGlobalTemperatureAnomalyDoc
                }
            ]
        },
        {
            id: 'types-pie-donut-pie',
            label: 'Pie Examples',
            description: 'Pie chart demos on real data. Covers custom label rendering, color mapping, and center annotations.',
            children: [
                {
                    id: 'types-pie-donut-pie-import',
                    label: 'Import',
                    component: PieDonutPieImportDoc
                },
                {
                    id: 'types-pie-donut-pie-iaas-cloud-market-share',
                    label: 'IaaS Cloud Market Share',
                    component: PieDonutPieIaasCloudMarketShareDoc
                },
                {
                    id: 'types-pie-donut-pie-browser-market-share',
                    label: 'Browser Market Share',
                    component: PieDonutPieBrowserMarketShareDoc
                },
                {
                    id: 'types-pie-donut-pie-global-energy-mix',
                    label: 'Global Energy Mix',
                    component: PieDonutPieGlobalEnergyMixDoc
                }
            ]
        },
        {
            id: 'types-pie-donut-pie-nested',
            label: 'Nested Pie Examples',
            description: 'Concentric pie rings for hierarchical data using ChartStacked with multiple ChartPie components.',
            children: [
                {
                    id: 'types-pie-donut-pie-nested-import',
                    label: 'Import',
                    component: PieDonutPieNestedImportDoc
                },
                {
                    id: 'types-pie-donut-pie-nested-global-ev-sales-by-market-and-powertrain-2016-to-2023',
                    label: 'Global EV Sales by Market and Powertrain, 2016 to 2023',
                    component: PieDonutPieNestedGlobalEvSalesByMarketAndPowertrain2016To2023Doc
                },
                {
                    id: 'types-pie-donut-pie-nested-world-gdp-by-region-and-income-group-2023',
                    label: 'World GDP by region and income group 2023',
                    component: PieDonutPieNestedWorldGdpByRegionAndIncomeGroup2023Doc
                }
            ]
        },
        {
            id: 'types-pie-donut-pie-nightingale',
            label: 'Nightingale Examples',
            description: 'Rose chart where both angle and outer radius encode data values via sliceRadiusValue.',
            children: [
                {
                    id: 'types-pie-donut-pie-nightingale-import',
                    label: 'Import',
                    component: PieDonutPieNightingaleImportDoc
                },
                {
                    id: 'types-pie-donut-pie-nightingale-us-tornado-climatology',
                    label: 'US Tornado Climatology',
                    component: PieDonutPieNightingaleUsTornadoClimatologyDoc
                },
                {
                    id: 'types-pie-donut-pie-nightingale-noaa-monthly-precipitation-2024',
                    label: 'NOAA Monthly Precipitation 2024',
                    component: PieDonutPieNightingaleNoaaMonthlyPrecipitation2024Doc
                }
            ]
        },
        {
            id: 'types-pie-donut-playground',
            label: 'Pie & Donut Playground',
            description: 'Interactive playground for pie and donut charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-pie-donut-playground-import',
                    label: 'Import',
                    component: PieDonutPlaygroundImportDoc
                },
                {
                    id: 'types-pie-donut-playground-playground',
                    label: 'Playground',
                    component: PieDonutPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-polar',
            label: 'Polar',
            description: 'Nightingale and rose charts with radial bars proportional to value, arranged around a circular axis.',
            children: [
                {
                    id: 'types-polar-import',
                    label: 'Import',
                    component: PolarImportDoc
                },
                {
                    id: 'types-polar-basic',
                    label: 'Basic',
                    component: PolarBasicDoc
                },
                {
                    id: 'types-polar-inner-radius',
                    label: 'Inner Radius',
                    component: PolarInnerRadiusDoc
                },
                {
                    id: 'types-polar-colors',
                    label: 'Colors',
                    component: PolarColorsDoc
                },
                {
                    id: 'types-polar-gradient-color',
                    label: 'Gradient Color',
                    component: PolarGradientColorDoc
                },
                {
                    id: 'types-polar-sorted',
                    label: 'Sorted',
                    component: PolarSortedDoc
                },
                {
                    id: 'types-polar-border',
                    label: 'Border',
                    component: PolarBorderDoc
                },
                {
                    id: 'types-polar-grid-shape',
                    label: 'Grid Shape',
                    component: PolarGridShapeDoc
                },
                {
                    id: 'types-polar-grid-styling',
                    label: 'Grid Styling',
                    component: PolarGridStylingDoc
                },
                {
                    id: 'types-polar-grouped',
                    label: 'Grouped',
                    component: PolarGroupedDoc
                },
                {
                    id: 'types-polar-stacked',
                    label: 'Stacked',
                    component: PolarStackedDoc
                },
                {
                    id: 'types-polar-percent-stacked',
                    label: 'Percent Stacked',
                    component: PolarPercentStackedDoc
                },
                {
                    id: 'types-polar-declarative',
                    label: 'Declarative',
                    component: PolarDeclarativeDoc
                },
                {
                    id: 'types-polar-title-and-caption',
                    label: 'Title & Caption',
                    component: PolarTitleAndCaptionDoc
                },
                {
                    id: 'types-polar-hover',
                    label: 'Hover',
                    component: PolarHoverDoc
                },
                {
                    id: 'types-polar-tooltip',
                    label: 'Tooltip',
                    component: PolarTooltipDoc
                },
                {
                    id: 'types-polar-legend',
                    label: 'Legend',
                    component: PolarLegendDoc
                },
                {
                    id: 'types-polar-annotation',
                    label: 'Annotation',
                    component: PolarAnnotationDoc
                },
                {
                    id: 'types-polar-animation',
                    label: 'Animation',
                    component: PolarAnimationDoc
                },
                {
                    id: 'types-polar-export',
                    label: 'Export',
                    component: PolarExportDoc
                },
                {
                    id: 'types-polar-responsive',
                    label: 'Responsive',
                    component: PolarResponsiveDoc
                },
                {
                    id: 'types-polar-accessibility',
                    label: 'Accessibility',
                    component: PolarAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-polar-playground',
            label: 'Polar Playground',
            description: 'Interactive playground for polar charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-polar-playground-import',
                    label: 'Import',
                    component: PolarPlaygroundImportDoc
                },
                {
                    id: 'types-polar-playground-playground',
                    label: 'Playground',
                    component: PolarPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-polar-polar',
            label: 'Polar Examples',
            description: 'Polar chart examples using grouped series, custom color functions, and per-hour tooltip rendering across cyclical datasets.',
            children: [
                {
                    id: 'types-polar-polar-import',
                    label: 'Import',
                    component: PolarPolarImportDoc
                },
                {
                    id: 'types-polar-polar-monaco-grand-prix-sector-performance-by-team',
                    label: 'Monaco Grand Prix: Sector Performance by Team',
                    component: PolarPolarMonacoGrandPrixSectorPerformanceByTeamDoc
                },
                {
                    id: 'types-polar-polar-heathrow-lhr-scheduled-departures-by-hour-of-day',
                    label: 'Heathrow LHR: Scheduled Departures by Hour of Day',
                    component: PolarPolarHeathrowLhrScheduledDeparturesByHourOfDayDoc
                },
                {
                    id: 'types-polar-polar-global-fx-market-24-hour-trading-volume-cycle',
                    label: 'Global FX Market: 24-Hour Trading Volume Cycle',
                    component: PolarPolarGlobalFxMarket24HourTradingVolumeCycleDoc
                }
            ]
        },
        {
            id: 'types-polar-stacked',
            label: 'Stacked Polar Examples',
            description: 'Stacked polar bar chart examples using ChartStacked in both absolute and percent-normalized configurations.',
            children: [
                {
                    id: 'types-polar-stacked-import',
                    label: 'Import',
                    component: PolarStackedImportDoc
                },
                {
                    id: 'types-polar-stacked-uk-grid-monthly-renewable-generation-by-source',
                    label: 'UK Grid: Monthly Renewable Generation by Source',
                    component: PolarStackedUkGridMonthlyRenewableGenerationBySourceDoc
                },
                {
                    id: 'types-polar-stacked-wind-speed-by-direction-morning-vs-afternoon',
                    label: 'Wind Speed by Direction: Morning vs Afternoon',
                    component: PolarStackedWindSpeedByDirectionMorningVsAfternoonDoc
                },
                {
                    id: 'types-polar-stacked-wind-gustiness-by-direction-sustained-vs-gusts',
                    label: 'Wind Gustiness by Direction: Sustained vs Gusts',
                    component: PolarStackedWindGustinessByDirectionSustainedVsGustsDoc
                }
            ]
        },
        {
            id: 'types-radar',
            label: 'Radar',
            description: 'Multivariate data on radial axes. Each series renders a polygon across shared spoke labels, suitable for comparing profiles and performance across dimensions.',
            children: [
                {
                    id: 'types-radar-import',
                    label: 'Import',
                    component: RadarImportDoc
                },
                {
                    id: 'types-radar-basic',
                    label: 'Basic',
                    component: RadarBasicDoc
                },
                {
                    id: 'types-radar-multi-series',
                    label: 'Multi-Series',
                    component: RadarMultiSeriesDoc
                },
                {
                    id: 'types-radar-colors',
                    label: 'Colors',
                    component: RadarColorsDoc
                },
                {
                    id: 'types-radar-gradient-color',
                    label: 'Gradient Color',
                    component: RadarGradientColorDoc
                },
                {
                    id: 'types-radar-fill-opacity',
                    label: 'Fill Opacity',
                    component: RadarFillOpacityDoc
                },
                {
                    id: 'types-radar-curve',
                    label: 'Curve',
                    component: RadarCurveDoc
                },
                {
                    id: 'types-radar-markers',
                    label: 'Markers',
                    component: RadarMarkersDoc
                },
                {
                    id: 'types-radar-custom-markers',
                    label: 'Custom Markers',
                    component: RadarCustomMarkersDoc
                },
                {
                    id: 'types-radar-line-styling',
                    label: 'Line Styling',
                    component: RadarLineStylingDoc
                },
                {
                    id: 'types-radar-grid-shape',
                    label: 'Grid Shape',
                    component: RadarGridShapeDoc
                },
                {
                    id: 'types-radar-grid-styling',
                    label: 'Grid Styling',
                    component: RadarGridStylingDoc
                },
                {
                    id: 'types-radar-stacked',
                    label: 'Stacked',
                    component: RadarStackedDoc
                },
                {
                    id: 'types-radar-declarative',
                    label: 'Declarative',
                    component: RadarDeclarativeDoc
                },
                {
                    id: 'types-radar-title-and-caption',
                    label: 'Title & Caption',
                    component: RadarTitleAndCaptionDoc
                },
                {
                    id: 'types-radar-hover',
                    label: 'Hover',
                    component: RadarHoverDoc
                },
                {
                    id: 'types-radar-tooltip',
                    label: 'Tooltip',
                    component: RadarTooltipDoc
                },
                {
                    id: 'types-radar-legend',
                    label: 'Legend',
                    component: RadarLegendDoc
                },
                {
                    id: 'types-radar-axes',
                    label: 'Axes',
                    component: RadarAxesDoc
                },
                {
                    id: 'types-radar-annotation',
                    label: 'Annotation',
                    component: RadarAnnotationDoc
                },
                {
                    id: 'types-radar-reference-bands-and-lines',
                    label: 'Reference Bands & Lines',
                    component: RadarReferenceBandsAndLinesDoc
                },
                {
                    id: 'types-radar-animation',
                    label: 'Animation',
                    component: RadarAnimationDoc
                },
                {
                    id: 'types-radar-export',
                    label: 'Export',
                    component: RadarExportDoc
                },
                {
                    id: 'types-radar-responsive',
                    label: 'Responsive',
                    component: RadarResponsiveDoc
                },
                {
                    id: 'types-radar-accessibility',
                    label: 'Accessibility',
                    component: RadarAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-radar-playground',
            label: 'Radar Playground',
            description: 'Interactive playground for radar charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-radar-playground-import',
                    label: 'Import',
                    component: RadarPlaygroundImportDoc
                },
                {
                    id: 'types-radar-playground-playground',
                    label: 'Playground',
                    component: RadarPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-radar-radar',
            label: 'Radar Examples',
            description: 'Radar chart demos built on real datasets. Covers gradient fills, curve styles, reference zones, and animated data transitions.',
            children: [
                {
                    id: 'types-radar-radar-import',
                    label: 'Import',
                    component: RadarRadarImportDoc
                },
                {
                    id: 'types-radar-radar-us-equity-factor-tilts-vtv-vug-mtum',
                    label: 'US Equity Factor Tilts: VTV · VUG · MTUM',
                    component: RadarRadarUsEquityFactorTiltsVtvVugMtumDoc
                },
                {
                    id: 'types-radar-radar-fifa-24-attribute-profiles-of-three-superstars',
                    label: 'FIFA 24: Attribute Profiles of Three Superstars',
                    component: RadarRadarFifa24AttributeProfilesOfThreeSuperstarsDoc
                },
                {
                    id: 'types-radar-radar-nist-csf-2-0-cybersecurity-posture-audit',
                    label: 'NIST CSF 2.0: Cybersecurity Posture Audit',
                    component: RadarRadarNistCsf20CybersecurityPostureAuditDoc
                },
                {
                    id: 'types-radar-radar-startup-kpi-scorecard-animated-quarterly-progress',
                    label: 'Startup KPI Scorecard: Animated Quarterly Progress',
                    component: RadarRadarStartupKpiScorecardAnimatedQuarterlyProgressDoc
                },
                {
                    id: 'types-radar-radar-engineering-team-assessment-reference-bands-and-lines',
                    label: 'Engineering Team Assessment: Reference Bands & Lines',
                    component: RadarRadarEngineeringTeamAssessmentReferenceBandsAndLinesDoc
                }
            ]
        },
        {
            id: 'types-radar-stacked',
            label: 'Stacked Radar Examples',
            description: 'Stacked radar demos built on real datasets. Each uses ChartStacked to build concentric rings that represent series contributions per spoke.',
            children: [
                {
                    id: 'types-radar-stacked-import',
                    label: 'Import',
                    component: RadarStackedImportDoc
                },
                {
                    id: 'types-radar-stacked-digital-transformation-engagement-hours-by-service-phase',
                    label: 'Digital Transformation Engagement: Hours by Service × Phase',
                    component: RadarStackedDigitalTransformationEngagementHoursByServicePhaseDoc
                },
                {
                    id: 'types-radar-stacked-saas-platform-monthly-usage-by-plan-tier',
                    label: 'SaaS Platform: Monthly Usage by Plan Tier',
                    component: RadarStackedSaasPlatformMonthlyUsageByPlanTierDoc
                },
                {
                    id: 'types-radar-stacked-global-retailer-revenue-mix-by-region-q3-2025',
                    label: 'Global Retailer: Revenue Mix by Region, Q3 2025',
                    component: RadarStackedGlobalRetailerRevenueMixByRegionQ32025Doc
                }
            ]
        },
        {
            id: 'types-scatter-bubble',
            label: 'Scatter & Bubble',
            description: 'Point-based charts for correlations, clusters, and distributions. Scatter plots with optional bubble sizing.',
            children: [
                {
                    id: 'types-scatter-bubble-import',
                    label: 'Import',
                    component: ScatterBubbleImportDoc
                },
                {
                    id: 'types-scatter-bubble-basic',
                    label: 'Basic',
                    component: ScatterBubbleBasicDoc
                },
                {
                    id: 'types-scatter-bubble-bubble',
                    label: 'Bubble',
                    component: ScatterBubbleBubbleDoc
                },
                {
                    id: 'types-scatter-bubble-colors',
                    label: 'Colors',
                    component: ScatterBubbleColorsDoc
                },
                {
                    id: 'types-scatter-bubble-gradient-color',
                    label: 'Gradient Color',
                    component: ScatterBubbleGradientColorDoc
                },
                {
                    id: 'types-scatter-bubble-markers',
                    label: 'Markers',
                    component: ScatterBubbleMarkersDoc
                },
                {
                    id: 'types-scatter-bubble-custom-markers',
                    label: 'Custom Markers',
                    component: ScatterBubbleCustomMarkersDoc
                },
                {
                    id: 'types-scatter-bubble-border',
                    label: 'Border',
                    component: ScatterBubbleBorderDoc
                },
                {
                    id: 'types-scatter-bubble-declarative',
                    label: 'Declarative',
                    component: ScatterBubbleDeclarativeDoc
                },
                {
                    id: 'types-scatter-bubble-title-and-caption',
                    label: 'Title & Caption',
                    component: ScatterBubbleTitleAndCaptionDoc
                },
                {
                    id: 'types-scatter-bubble-hover',
                    label: 'Hover',
                    component: ScatterBubbleHoverDoc
                },
                {
                    id: 'types-scatter-bubble-tooltip',
                    label: 'Tooltip',
                    component: ScatterBubbleTooltipDoc
                },
                {
                    id: 'types-scatter-bubble-legend',
                    label: 'Legend',
                    component: ScatterBubbleLegendDoc
                },
                {
                    id: 'types-scatter-bubble-axes',
                    label: 'Axes',
                    component: ScatterBubbleAxesDoc
                },
                {
                    id: 'types-scatter-bubble-data-labels',
                    label: 'Data Labels',
                    component: ScatterBubbleDataLabelsDoc
                },
                {
                    id: 'types-scatter-bubble-zoom-and-navigator',
                    label: 'Zoom & Navigator',
                    component: ScatterBubbleZoomAndNavigatorDoc
                },
                {
                    id: 'types-scatter-bubble-annotation',
                    label: 'Annotation',
                    component: ScatterBubbleAnnotationDoc
                },
                {
                    id: 'types-scatter-bubble-reference-lines-and-bands',
                    label: 'Reference Lines & Bands',
                    component: ScatterBubbleReferenceLinesAndBandsDoc
                },
                {
                    id: 'types-scatter-bubble-decimation',
                    label: 'Decimation',
                    component: ScatterBubbleDecimationDoc
                },
                {
                    id: 'types-scatter-bubble-animation',
                    label: 'Animation',
                    component: ScatterBubbleAnimationDoc
                },
                {
                    id: 'types-scatter-bubble-export',
                    label: 'Export',
                    component: ScatterBubbleExportDoc
                },
                {
                    id: 'types-scatter-bubble-responsive',
                    label: 'Responsive',
                    component: ScatterBubbleResponsiveDoc
                },
                {
                    id: 'types-scatter-bubble-accessibility',
                    label: 'Accessibility',
                    component: ScatterBubbleAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-scatter-bubble-bubble',
            label: 'Bubble Examples',
            description: 'Bubble chart examples using sizeField encoding, logarithmic axes, quadrant annotations, and custom legend and tooltip rendering.',
            children: [
                {
                    id: 'types-scatter-bubble-bubble-import',
                    label: 'Import',
                    component: ScatterBubbleBubbleImportDoc
                },
                {
                    id: 'types-scatter-bubble-bubble-microsoft-product-portfolio-bcg-growth-share-matrix-fy2023',
                    label: 'Microsoft Product Portfolio: BCG Growth-Share Matrix, FY2023',
                    component: ScatterBubbleBubbleMicrosoftProductPortfolioBcgGrowthShareMatrixFy2023Doc
                },
                {
                    id: 'types-scatter-bubble-bubble-oecd-healthcare-spend-vs-outcome-2022',
                    label: 'OECD Healthcare: Spend vs Outcome, 2022',
                    component: ScatterBubbleBubbleOecdHealthcareSpendVsOutcome2022Doc
                },
                {
                    id: 'types-scatter-bubble-bubble-blockbuster-roi-production-budget-worldwide-gross-2011-2023',
                    label: 'Blockbuster ROI: Production Budget × Worldwide Gross, 2011–2023',
                    component: ScatterBubbleBubbleBlockbusterRoiProductionBudgetWorldwideGross20112023Doc
                }
            ]
        },
        {
            id: 'types-scatter-bubble-playground',
            label: 'Scatter & Bubble Playground',
            description: 'Interactive playground for scatter and bubble charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-scatter-bubble-playground-import',
                    label: 'Import',
                    component: ScatterBubblePlaygroundImportDoc
                },
                {
                    id: 'types-scatter-bubble-playground-playground',
                    label: 'Playground',
                    component: ScatterBubblePlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-scatter-bubble-scatter',
            label: 'Scatter Examples',
            description: 'Scatter chart examples using custom legend and tooltip rendering, logarithmic axes, decimation, and boost mode for large point clouds.',
            children: [
                {
                    id: 'types-scatter-bubble-scatter-import',
                    label: 'Import',
                    component: ScatterBubbleScatterImportDoc
                },
                {
                    id: 'types-scatter-bubble-scatter-us-tech-profitability-fortune-100-by-sub-industry-fy2023',
                    label: 'US Tech Profitability: Fortune 100 by Sub-Industry, FY2023',
                    component: ScatterBubbleScatterUsTechProfitabilityFortune100BySubIndustryFy2023Doc
                },
                {
                    id: 'types-scatter-bubble-scatter-nba-2023-24-scorers-vs-playmakers-by-position',
                    label: 'NBA 2023-24: Scorers vs Playmakers, by Position',
                    component: ScatterBubbleScatterNba202324ScorersVsPlaymakersByPositionDoc
                },
                {
                    id: 'types-scatter-bubble-scatter-moore-s-law-transistor-count-per-microprocessor-1971-2024',
                    label: "Moore's Law: Transistor Count per Microprocessor, 1971–2024",
                    component: ScatterBubbleScatterMooreSLawTransistorCountPerMicroprocessor19712024Doc
                },
                {
                    id: 'types-scatter-bubble-scatter-wind-farm-telemetry-100-000-readings-decimated',
                    label: 'Wind Farm Telemetry: 100,000 Readings, Decimated',
                    component: ScatterBubbleScatterWindFarmTelemetry100000ReadingsDecimatedDoc
                },
                {
                    id: 'types-scatter-bubble-scatter-100-000-points-canvas-boost-mode',
                    label: '100,000 Points · Canvas + Boost Mode',
                    component: ScatterBubbleScatter100000PointsCanvasBoostModeDoc
                }
            ]
        },
        {
            id: 'types-synced',
            label: 'Synced Charts',
            description: 'Coordinate multiple independent charts with synchronized crosshairs, zoom ranges, and legend visibility using ChartGroup.',
            children: [
                {
                    id: 'types-synced-import',
                    label: 'Import',
                    component: SyncedImportDoc
                },
                {
                    id: 'types-synced-crosshair-sync',
                    label: 'Crosshair Sync',
                    component: SyncedCrosshairSyncDoc
                },
                {
                    id: 'types-synced-shared-legend',
                    label: 'Shared Legend',
                    component: SyncedSharedLegendDoc
                },
                {
                    id: 'types-synced-synced-zoom',
                    label: 'Synced Zoom',
                    component: SyncedSyncedZoomDoc
                },
                {
                    id: 'types-synced-dashboard',
                    label: 'Dashboard',
                    component: SyncedDashboardDoc
                },
                {
                    id: 'types-synced-full-sync',
                    label: 'Full Sync',
                    component: SyncedFullSyncDoc
                }
            ]
        },
        {
            id: 'types-synced-examples',
            label: 'Synced Charts Examples',
            description: 'Synced chart examples using ChartGroup for crosshair sync, zoom lockstep, shared legends, and category sync across mixed chart types.',
            children: [
                {
                    id: 'types-synced-examples-import',
                    label: 'Import',
                    component: SyncedExamplesImportDoc
                },
                {
                    id: 'types-synced-examples-climate-overview',
                    label: 'Climate Overview',
                    component: SyncedExamplesClimateOverviewDoc
                },
                {
                    id: 'types-synced-examples-trading-watchlist-sparklines-in-table',
                    label: 'Trading Watchlist: Sparklines in Table',
                    component: SyncedExamplesTradingWatchlistSparklinesInTableDoc
                },
                {
                    id: 'types-synced-examples-fleet-telemetry-kpi-strip',
                    label: 'Fleet Telemetry: KPI Strip',
                    component: SyncedExamplesFleetTelemetryKpiStripDoc
                },
                {
                    id: 'types-synced-examples-e-commerce-funnel-category-sync',
                    label: 'E-commerce Funnel: Category Sync',
                    component: SyncedExamplesECommerceFunnelCategorySyncDoc
                },
                {
                    id: 'types-synced-examples-server-metrics-monitor',
                    label: 'Server Metrics Monitor',
                    component: SyncedExamplesServerMetricsMonitorDoc
                },
                {
                    id: 'types-synced-examples-energy-grid-operations',
                    label: 'Energy Grid Operations',
                    component: SyncedExamplesEnergyGridOperationsDoc
                },
                {
                    id: 'types-synced-examples-candlestick-volume-stacked-panes',
                    label: 'Candlestick + Volume: Stacked Panes',
                    component: SyncedExamplesCandlestickVolumeStackedPanesDoc
                },
                {
                    id: 'types-synced-examples-financial-workstation-price-volume-spread',
                    label: 'Financial Workstation: Price, Volume, Spread',
                    component: SyncedExamplesFinancialWorkstationPriceVolumeSpreadDoc
                }
            ]
        },
        {
            id: 'types-treemap',
            label: 'Treemap',
            description: 'Nested rectangles sized by value, with hierarchy, drilldown, custom content, and multiple layout algorithms.',
            children: [
                {
                    id: 'types-treemap-import',
                    label: 'Import',
                    component: TreemapImportDoc
                },
                {
                    id: 'types-treemap-basic',
                    label: 'Basic',
                    component: TreemapBasicDoc
                },
                {
                    id: 'types-treemap-colors',
                    label: 'Colors',
                    component: TreemapColorsDoc
                },
                {
                    id: 'types-treemap-color-range',
                    label: 'Color Range',
                    component: TreemapColorRangeDoc
                },
                {
                    id: 'types-treemap-hierarchy',
                    label: 'Hierarchy',
                    component: TreemapHierarchyDoc
                },
                {
                    id: 'types-treemap-drilldown',
                    label: 'Drilldown',
                    component: TreemapDrilldownDoc
                },
                {
                    id: 'types-treemap-layout',
                    label: 'Layout',
                    component: TreemapLayoutDoc
                },
                {
                    id: 'types-treemap-labels',
                    label: 'Labels',
                    component: TreemapLabelsDoc
                },
                {
                    id: 'types-treemap-custom-content',
                    label: 'Custom Content',
                    component: TreemapCustomContentDoc
                },
                {
                    id: 'types-treemap-declarative',
                    label: 'Declarative',
                    component: TreemapDeclarativeDoc
                },
                {
                    id: 'types-treemap-title-and-caption',
                    label: 'Title & Caption',
                    component: TreemapTitleAndCaptionDoc
                },
                {
                    id: 'types-treemap-hover',
                    label: 'Hover',
                    component: TreemapHoverDoc
                },
                {
                    id: 'types-treemap-tooltip',
                    label: 'Tooltip',
                    component: TreemapTooltipDoc
                },
                {
                    id: 'types-treemap-legend',
                    label: 'Legend',
                    component: TreemapLegendDoc
                },
                {
                    id: 'types-treemap-data-labels',
                    label: 'Data Labels',
                    component: TreemapDataLabelsDoc
                },
                {
                    id: 'types-treemap-animation',
                    label: 'Animation',
                    component: TreemapAnimationDoc
                },
                {
                    id: 'types-treemap-export',
                    label: 'Export',
                    component: TreemapExportDoc
                },
                {
                    id: 'types-treemap-responsive',
                    label: 'Responsive',
                    component: TreemapResponsiveDoc
                },
                {
                    id: 'types-treemap-accessibility',
                    label: 'Accessibility',
                    component: TreemapAccessibilityDoc
                }
            ]
        },
        {
            id: 'types-treemap-playground',
            label: 'Treemap Playground',
            description: 'Interactive playground for treemap charts to experiment with inputs and configuration live.',
            children: [
                {
                    id: 'types-treemap-playground-import',
                    label: 'Import',
                    component: TreemapPlaygroundImportDoc
                },
                {
                    id: 'types-treemap-playground-playground',
                    label: 'Playground',
                    component: TreemapPlaygroundPlaygroundDoc
                }
            ]
        },
        {
            id: 'types-treemap-treemap',
            label: 'Treemap Examples',
            description: 'Treemap examples using hierarchy drilldown, colorValueField gradient mapping, and custom renderContent cell rendering.',
            children: [
                {
                    id: 'types-treemap-treemap-import',
                    label: 'Import',
                    component: TreemapTreemapImportDoc
                },
                {
                    id: 'types-treemap-treemap-alphabet-inc-q3-2024-revenue-by-segment',
                    label: 'Alphabet Inc.: Q3 2024 Revenue by Segment',
                    component: TreemapTreemapAlphabetIncQ32024RevenueBySegmentDoc
                },
                {
                    id: 'types-treemap-treemap-world-s-largest-stock-exchanges-market-cap-vs-2025-ytd',
                    label: "World's Largest Stock Exchanges: Market Cap vs 2025 YTD",
                    component: TreemapTreemapWorldSLargestStockExchangesMarketCapVs2025YtdDoc
                },
                {
                    id: 'types-treemap-treemap-fortune-global-500-top-15-by-fy2023-revenue',
                    label: 'Fortune Global 500: Top 15 by FY2023 Revenue',
                    component: TreemapTreemapFortuneGlobal500Top15ByFy2023RevenueDoc
                },
                {
                    id: 'types-treemap-treemap-llms-integration',
                    label: 'LLMs Integration',
                    component: TreemapTreemapLlmsIntegrationDoc
                },
                {
                    id: 'types-treemap-treemap-llms-integration-2',
                    label: 'LLMs Integration',
                    component: TreemapTreemapLlmsIntegration2Doc
                },
                {
                    id: 'types-treemap-treemap-overview',
                    label: 'overview',
                    component: TreemapTreemapOverviewDoc
                },
                {
                    id: 'types-treemap-treemap-pricing',
                    label: 'Pricing',
                    component: TreemapTreemapPricingDoc
                },
                {
                    id: 'types-treemap-treemap-coming-soon',
                    label: 'Coming Soon',
                    component: TreemapTreemapComingSoonDoc
                }
            ]
        },
        {
            id: 'configuration-animation',
            label: 'Animation',
            description: 'Configure chart entrance, update, and looping animations via animation, animations, and transitions inputs on the chart root.',
            children: [
                {
                    id: 'configuration-animation-import',
                    label: 'Import',
                    component: AnimationImportDoc
                },
                {
                    id: 'configuration-animation-basic',
                    label: 'Basic',
                    component: AnimationBasicDoc
                },
                {
                    id: 'configuration-animation-duration',
                    label: 'Duration',
                    component: AnimationDurationDoc
                },
                {
                    id: 'configuration-animation-easing',
                    label: 'Easing',
                    component: AnimationEasingDoc
                },
                {
                    id: 'configuration-animation-disabling-animation',
                    label: 'Disabling Animation',
                    component: AnimationDisablingAnimationDoc
                },
                {
                    id: 'configuration-animation-custom-easing',
                    label: 'Custom Easing',
                    component: AnimationCustomEasingDoc
                },
                {
                    id: 'configuration-animation-looping-property-animations',
                    label: 'Looping Property Animations',
                    component: AnimationLoopingPropertyAnimationsDoc
                },
                {
                    id: 'configuration-animation-transitions',
                    label: 'Transitions',
                    component: AnimationTransitionsDoc
                }
            ]
        },
        {
            id: 'configuration-annotation',
            label: 'Annotation',
            description: 'Overlay fully custom content on any chart type using SVG nodes or direct Canvas drawing with access to scales, theme colors, and animation.',
            children: [
                {
                    id: 'configuration-annotation-import',
                    label: 'Import',
                    component: AnnotationImportDoc
                },
                {
                    id: 'configuration-annotation-basic',
                    label: 'Basic',
                    component: AnnotationBasicDoc
                },
                {
                    id: 'configuration-annotation-positioning-at-data-values',
                    label: 'Positioning at Data Values',
                    component: AnnotationPositioningAtDataValuesDoc
                },
                {
                    id: 'configuration-annotation-multi-axis-positioning',
                    label: 'Multi-Axis Positioning',
                    component: AnnotationMultiAxisPositioningDoc
                },
                {
                    id: 'configuration-annotation-radial-charts',
                    label: 'Radial Charts',
                    component: AnnotationRadialChartsDoc
                },
                {
                    id: 'configuration-annotation-dark-mode',
                    label: 'Dark Mode',
                    component: AnnotationDarkModeDoc
                },
                {
                    id: 'configuration-annotation-multiple-annotations',
                    label: 'Multiple Annotations',
                    component: AnnotationMultipleAnnotationsDoc
                }
            ]
        },
        {
            id: 'configuration-axes',
            label: 'Axes',
            description: 'Configure X and Y axes with full control over type, title, tick formatting, grid lines, domain, scale, grouping, and multi-axis layouts.',
            children: [
                {
                    id: 'configuration-axes-import',
                    label: 'Import',
                    component: AxesImportDoc
                },
                {
                    id: 'configuration-axes-basic',
                    label: 'Basic',
                    component: AxesBasicDoc
                },
                {
                    id: 'configuration-axes-time-axis',
                    label: 'Time Axis',
                    component: AxesTimeAxisDoc
                },
                {
                    id: 'configuration-axes-linear-axis',
                    label: 'Linear Axis',
                    component: AxesLinearAxisDoc
                },
                {
                    id: 'configuration-axes-logarithmic',
                    label: 'Logarithmic',
                    component: AxesLogarithmicDoc
                },
                {
                    id: 'configuration-axes-axis-title',
                    label: 'Axis Title',
                    component: AxesAxisTitleDoc
                },
                {
                    id: 'configuration-axes-tick-formatting',
                    label: 'Tick Formatting',
                    component: AxesTickFormattingDoc
                },
                {
                    id: 'configuration-axes-tick-styling',
                    label: 'Tick Styling',
                    component: AxesTickStylingDoc
                },
                {
                    id: 'configuration-axes-grid-lines',
                    label: 'Grid Lines',
                    component: AxesGridLinesDoc
                },
                {
                    id: 'configuration-axes-domain',
                    label: 'Domain',
                    component: AxesDomainDoc
                },
                {
                    id: 'configuration-axes-reversed',
                    label: 'Reversed',
                    component: AxesReversedDoc
                },
                {
                    id: 'configuration-axes-hidden-axis',
                    label: 'Hidden Axis',
                    component: AxesHiddenAxisDoc
                },
                {
                    id: 'configuration-axes-custom-tick-render',
                    label: 'Custom Tick Render',
                    component: AxesCustomTickRenderDoc
                },
                {
                    id: 'configuration-axes-axis-grouping',
                    label: 'Axis Grouping',
                    component: AxesAxisGroupingDoc
                },
                {
                    id: 'configuration-axes-multiple-axes',
                    label: 'Multiple Axes',
                    component: AxesMultipleAxesDoc
                },
                {
                    id: 'configuration-axes-time-zone',
                    label: 'Time Zone',
                    component: AxesTimeZoneDoc
                },
                {
                    id: 'configuration-axes-data-grouping',
                    label: 'Data Grouping',
                    component: AxesDataGroupingDoc
                }
            ]
        },
        {
            id: 'configuration-data-labels',
            label: 'Data Labels',
            description: 'Display values directly on chart elements with full control over content, formatting, leader lines, and custom rendering.',
            children: [
                {
                    id: 'configuration-data-labels-import',
                    label: 'Import',
                    component: DataLabelsImportDoc
                },
                {
                    id: 'configuration-data-labels-basic',
                    label: 'Basic',
                    component: DataLabelsBasicDoc
                },
                {
                    id: 'configuration-data-labels-display-mode',
                    label: 'Display Mode',
                    component: DataLabelsDisplayModeDoc
                },
                {
                    id: 'configuration-data-labels-formatter',
                    label: 'Formatter',
                    component: DataLabelsFormatterDoc
                },
                {
                    id: 'configuration-data-labels-min-percentage',
                    label: 'Min Percentage',
                    component: DataLabelsMinPercentageDoc
                },
                {
                    id: 'configuration-data-labels-leader-lines',
                    label: 'Leader Lines',
                    component: DataLabelsLeaderLinesDoc
                },
                {
                    id: 'configuration-data-labels-align-to',
                    label: 'Align To',
                    component: DataLabelsAlignToDoc
                },
                {
                    id: 'configuration-data-labels-styling',
                    label: 'Styling',
                    component: DataLabelsStylingDoc
                },
                {
                    id: 'configuration-data-labels-offsets',
                    label: 'Offsets',
                    component: DataLabelsOffsetsDoc
                },
                {
                    id: 'configuration-data-labels-custom-label',
                    label: 'Custom Label',
                    component: DataLabelsCustomLabelDoc
                }
            ]
        },
        {
            id: 'configuration-decimation',
            label: 'Decimation',
            description: 'Downsample large datasets before rendering by trading point-level detail for faster, readable charts.',
            children: [
                {
                    id: 'configuration-decimation-import',
                    label: 'Import',
                    component: DecimationImportDoc
                },
                {
                    id: 'configuration-decimation-basic',
                    label: 'Basic',
                    component: DecimationBasicDoc
                },
                {
                    id: 'configuration-decimation-algorithms',
                    label: 'Algorithms',
                    component: DecimationAlgorithmsDoc
                },
                {
                    id: 'configuration-decimation-threshold',
                    label: 'Threshold',
                    component: DecimationThresholdDoc
                },
                {
                    id: 'configuration-decimation-sample-count',
                    label: 'Sample Count',
                    component: DecimationSampleCountDoc
                },
                {
                    id: 'configuration-decimation-choosing-an-algorithm',
                    label: 'Choosing an Algorithm',
                    component: DecimationChoosingAnAlgorithmDoc
                },
                {
                    id: 'configuration-decimation-progressive-detail-on-zoom',
                    label: 'Progressive Detail on Zoom',
                    component: DecimationProgressiveDetailOnZoomDoc
                }
            ]
        },
        {
            id: 'configuration-export',
            label: 'Export',
            description: 'Add a built-in export menu to download charts as PNG, JPEG, SVG, PDF, or CSV, with control over filename, scale, background, and menu items.',
            children: [
                {
                    id: 'configuration-export-import',
                    label: 'Import',
                    component: ExportImportDoc
                },
                {
                    id: 'configuration-export-basic',
                    label: 'Basic',
                    component: ExportBasicDoc
                },
                {
                    id: 'configuration-export-menu-items',
                    label: 'Menu Items',
                    component: ExportMenuItemsDoc
                },
                {
                    id: 'configuration-export-filename',
                    label: 'Filename',
                    component: ExportFilenameDoc
                },
                {
                    id: 'configuration-export-scale',
                    label: 'Scale',
                    component: ExportScaleDoc
                },
                {
                    id: 'configuration-export-background-color',
                    label: 'Background Color',
                    component: ExportBackgroundColorDoc
                },
                {
                    id: 'configuration-export-button-position',
                    label: 'Button Position',
                    component: ExportButtonPositionDoc
                },
                {
                    id: 'configuration-export-export-notes',
                    label: 'Export Notes',
                    component: ExportExportNotesDoc
                }
            ]
        },
        {
            id: 'configuration-hover',
            label: 'Hover',
            description: 'Apply visual feedback on hover with brightness, optional opacity dimming, color overrides, border styling, pie slice pop-out, and line marker scaling.',
            children: [
                {
                    id: 'configuration-hover-import',
                    label: 'Import',
                    component: HoverImportDoc
                },
                {
                    id: 'configuration-hover-basic',
                    label: 'Basic',
                    component: HoverBasicDoc
                },
                {
                    id: 'configuration-hover-brightness-and-dim',
                    label: 'Brightness & Dim',
                    component: HoverBrightnessAndDimDoc
                },
                {
                    id: 'configuration-hover-pie-offset',
                    label: 'Pie Offset',
                    component: HoverPieOffsetDoc
                },
                {
                    id: 'configuration-hover-border-override',
                    label: 'Border Override',
                    component: HoverBorderOverrideDoc
                },
                {
                    id: 'configuration-hover-scale',
                    label: 'Scale',
                    component: HoverScaleDoc
                },
                {
                    id: 'configuration-hover-color-override',
                    label: 'Color Override',
                    component: HoverColorOverrideDoc
                },
                {
                    id: 'configuration-hover-click',
                    label: 'Click',
                    component: HoverClickDoc
                },
                {
                    id: 'configuration-hover-line-marker-scaling',
                    label: 'Line Marker Scaling',
                    component: HoverLineMarkerScalingDoc
                }
            ]
        },
        {
            id: 'configuration-legend',
            label: 'Legend',
            description: 'Display an interactive legend with control over position, alignment, layout, icon shape, overflow, and custom rendering.',
            children: [
                {
                    id: 'configuration-legend-import',
                    label: 'Import',
                    component: LegendImportDoc
                },
                {
                    id: 'configuration-legend-basic',
                    label: 'Basic',
                    component: LegendBasicDoc
                },
                {
                    id: 'configuration-legend-position',
                    label: 'Position',
                    component: LegendPositionDoc
                },
                {
                    id: 'configuration-legend-alignment',
                    label: 'Alignment',
                    component: LegendAlignmentDoc
                },
                {
                    id: 'configuration-legend-layout',
                    label: 'Layout',
                    component: LegendLayoutDoc
                },
                {
                    id: 'configuration-legend-overflow',
                    label: 'Overflow',
                    component: LegendOverflowDoc
                },
                {
                    id: 'configuration-legend-icon-shape',
                    label: 'Icon Shape',
                    component: LegendIconShapeDoc
                },
                {
                    id: 'configuration-legend-styling',
                    label: 'Styling',
                    component: LegendStylingDoc
                },
                {
                    id: 'configuration-legend-interactive',
                    label: 'Interactive',
                    component: LegendInteractiveDoc
                },
                {
                    id: 'configuration-legend-shared-mode',
                    label: 'Shared Mode',
                    component: LegendSharedModeDoc
                },
                {
                    id: 'configuration-legend-custom-legend',
                    label: 'Custom Legend',
                    component: LegendCustomLegendDoc
                },
                {
                    id: 'configuration-legend-color-legend',
                    label: 'Color Legend',
                    component: LegendColorLegendDoc
                }
            ]
        },
        {
            id: 'configuration-navigator',
            label: 'Navigator',
            description: 'Add a mini overview chart below the main chart with a draggable selection window for zooming and panning.',
            children: [
                {
                    id: 'configuration-navigator-import',
                    label: 'Import',
                    component: NavigatorImportDoc
                },
                {
                    id: 'configuration-navigator-basic',
                    label: 'Basic',
                    component: NavigatorBasicDoc
                },
                {
                    id: 'configuration-navigator-series',
                    label: 'Series',
                    component: NavigatorSeriesDoc
                },
                {
                    id: 'configuration-navigator-height-and-gap',
                    label: 'Height & Gap',
                    component: NavigatorHeightAndGapDoc
                },
                {
                    id: 'configuration-navigator-styling',
                    label: 'Styling',
                    component: NavigatorStylingDoc
                }
            ]
        },
        {
            id: 'configuration-plugins',
            label: 'Plugins',
            description: 'Extend charts from the outside with the plugins input: read chart state, subscribe to frames and hover, and paint overlays. Includes watermark, live stats, trendline, threshold bands, and event annotations.',
            children: [
                {
                    id: 'configuration-plugins-import',
                    label: 'Import',
                    component: PluginsImportDoc
                },
                {
                    id: 'configuration-plugins-defining-a-plugin',
                    label: 'Defining a plugin',
                    component: PluginsDefiningAPluginDoc
                },
                {
                    id: 'configuration-plugins-plugin-options',
                    label: 'Plugin options',
                    component: PluginsPluginOptionsDoc
                },
                {
                    id: 'configuration-plugins-watermark',
                    label: 'Watermark',
                    component: PluginsWatermarkDoc
                },
                {
                    id: 'configuration-plugins-live-stats',
                    label: 'Live Stats',
                    component: PluginsLiveStatsDoc
                },
                {
                    id: 'configuration-plugins-trendline',
                    label: 'Trendline',
                    component: PluginsTrendlineDoc
                },
                {
                    id: 'configuration-plugins-threshold-bands',
                    label: 'Threshold Bands',
                    component: PluginsThresholdBandsDoc
                },
                {
                    id: 'configuration-plugins-event-annotations',
                    label: 'Event Annotations',
                    component: PluginsEventAnnotationsDoc
                },
                {
                    id: 'configuration-plugins-security',
                    label: 'Security',
                    component: PluginsSecurityDoc
                }
            ]
        },
        {
            id: 'configuration-reference-lines-bands',
            label: 'Reference Lines & Bands',
            description: 'Overlay fixed value markers and shaded regions on cartesian charts to highlight thresholds, targets, and ranges.',
            children: [
                {
                    id: 'configuration-reference-lines-bands-import',
                    label: 'Import',
                    component: ReferenceLinesBandsImportDoc
                },
                {
                    id: 'configuration-reference-lines-bands-reference-line',
                    label: 'Reference Line',
                    component: ReferenceLinesBandsReferenceLineDoc
                },
                {
                    id: 'configuration-reference-lines-bands-reference-band',
                    label: 'Reference Band',
                    component: ReferenceLinesBandsReferenceBandDoc
                },
                {
                    id: 'configuration-reference-lines-bands-label',
                    label: 'Label',
                    component: ReferenceLinesBandsLabelDoc
                },
                {
                    id: 'configuration-reference-lines-bands-styling',
                    label: 'Styling',
                    component: ReferenceLinesBandsStylingDoc
                },
                {
                    id: 'configuration-reference-lines-bands-multiple-axes',
                    label: 'Multiple Axes',
                    component: ReferenceLinesBandsMultipleAxesDoc
                }
            ]
        },
        {
            id: 'configuration-title-caption',
            label: 'Title & Caption',
            description: 'Add a title and caption to any chart with control over position, alignment, font, and floating overlay mode.',
            children: [
                {
                    id: 'configuration-title-caption-import',
                    label: 'Import',
                    component: TitleCaptionImportDoc
                },
                {
                    id: 'configuration-title-caption-basic',
                    label: 'Basic',
                    component: TitleCaptionBasicDoc
                },
                {
                    id: 'configuration-title-caption-caption',
                    label: 'Caption',
                    component: TitleCaptionCaptionDoc
                },
                {
                    id: 'configuration-title-caption-alignment',
                    label: 'Alignment',
                    component: TitleCaptionAlignmentDoc
                },
                {
                    id: 'configuration-title-caption-position',
                    label: 'Position',
                    component: TitleCaptionPositionDoc
                },
                {
                    id: 'configuration-title-caption-styling',
                    label: 'Styling',
                    component: TitleCaptionStylingDoc
                },
                {
                    id: 'configuration-title-caption-floating',
                    label: 'Floating',
                    component: TitleCaptionFloatingDoc
                },
                {
                    id: 'configuration-title-caption-offsets',
                    label: 'Offsets',
                    component: TitleCaptionOffsetsDoc
                },
                {
                    id: 'configuration-title-caption-responsive-scaling',
                    label: 'Responsive Scaling',
                    component: TitleCaptionResponsiveScalingDoc
                }
            ]
        },
        {
            id: 'configuration-tooltip',
            label: 'Tooltip',
            description: 'Show data details on hover with mode, snap strategy, crosshair, custom content, OHLC layout, position control, and delays.',
            children: [
                {
                    id: 'configuration-tooltip-import',
                    label: 'Import',
                    component: TooltipImportDoc
                },
                {
                    id: 'configuration-tooltip-basic',
                    label: 'Basic',
                    component: TooltipBasicDoc
                },
                {
                    id: 'configuration-tooltip-shared-mode',
                    label: 'Shared Mode',
                    component: TooltipSharedModeDoc
                },
                {
                    id: 'configuration-tooltip-snap-strategy',
                    label: 'Snap Strategy',
                    component: TooltipSnapStrategyDoc
                },
                {
                    id: 'configuration-tooltip-crosshair',
                    label: 'Crosshair',
                    component: TooltipCrosshairDoc
                },
                {
                    id: 'configuration-tooltip-position',
                    label: 'Position',
                    component: TooltipPositionDoc
                },
                {
                    id: 'configuration-tooltip-custom-tooltip',
                    label: 'Custom Tooltip',
                    component: TooltipCustomTooltipDoc
                },
                {
                    id: 'configuration-tooltip-ohlc-layout',
                    label: 'OHLC Layout',
                    component: TooltipOhlcLayoutDoc
                }
            ]
        },
        {
            id: 'configuration-zoom-pan',
            label: 'Zoom & Pan',
            description: 'Add interactive zoom and pan to cartesian charts with mouse wheel, drag-to-select, shift-pan, touch pinch, and programmatic control.',
            children: [
                {
                    id: 'configuration-zoom-pan-import',
                    label: 'Import',
                    component: ZoomPanImportDoc
                },
                {
                    id: 'configuration-zoom-pan-basic',
                    label: 'Basic',
                    component: ZoomPanBasicDoc
                },
                {
                    id: 'configuration-zoom-pan-zoom-mode',
                    label: 'Zoom Mode',
                    component: ZoomPanZoomModeDoc
                },
                {
                    id: 'configuration-zoom-pan-wheel-zoom',
                    label: 'Wheel Zoom',
                    component: ZoomPanWheelZoomDoc
                },
                {
                    id: 'configuration-zoom-pan-drag-to-zoom',
                    label: 'Drag to Zoom',
                    component: ZoomPanDragToZoomDoc
                },
                {
                    id: 'configuration-zoom-pan-pan',
                    label: 'Pan',
                    component: ZoomPanPanDoc
                },
                {
                    id: 'configuration-zoom-pan-zoom-and-pan-buttons',
                    label: 'Zoom and Pan Buttons',
                    component: ZoomPanZoomAndPanButtonsDoc
                },
                {
                    id: 'configuration-zoom-pan-touch-pinch',
                    label: 'Touch Pinch',
                    component: ZoomPanTouchPinchDoc
                },
                {
                    id: 'configuration-zoom-pan-zoom-limits',
                    label: 'Zoom Limits',
                    component: ZoomPanZoomLimitsDoc
                },
                {
                    id: 'configuration-zoom-pan-zoom-change-event',
                    label: 'Zoom Change Event',
                    component: ZoomPanZoomChangeEventDoc
                },
                {
                    id: 'configuration-zoom-pan-programmatic-control',
                    label: 'Programmatic Control',
                    component: ZoomPanProgrammaticControlDoc
                },
                {
                    id: 'configuration-zoom-pan-navigator',
                    label: 'Navigator',
                    component: ZoomPanNavigatorDoc
                }
            ]
        },
        {
            id: 'internationalization-locale',
            label: 'Locale',
            description: 'Format axis labels, tooltips, and data values using locale-aware number and date formatting.',
            children: [
                {
                    id: 'internationalization-locale-import',
                    label: 'Import',
                    component: LocaleImportDoc
                },
                {
                    id: 'internationalization-locale-number-formatting',
                    label: 'Number Formatting',
                    component: LocaleNumberFormattingDoc
                },
                {
                    id: 'internationalization-locale-date-formatting',
                    label: 'Date Formatting',
                    component: LocaleDateFormattingDoc
                },
                {
                    id: 'internationalization-locale-locale-and-rtl-together',
                    label: 'Locale and RTL Together',
                    component: LocaleLocaleAndRtlTogetherDoc
                },
                {
                    id: 'internationalization-locale-custom-tick-format',
                    label: 'Custom Tick Format',
                    component: LocaleCustomTickFormatDoc
                },
                {
                    id: 'internationalization-locale-translating-chart-text',
                    label: 'Translating Chart Text',
                    component: LocaleTranslatingChartTextDoc
                }
            ]
        },
        {
            id: 'internationalization-rtl',
            label: 'RTL',
            description: 'Right-to-left layout for charts. Mirrors axes, legend, and overlay positioning for RTL locales.',
            children: [
                {
                    id: 'internationalization-rtl-import',
                    label: 'Import',
                    component: RtlImportDoc
                },
                {
                    id: 'internationalization-rtl-cartesian-charts',
                    label: 'Cartesian Charts',
                    component: RtlCartesianChartsDoc
                },
                {
                    id: 'internationalization-rtl-radial-charts',
                    label: 'Radial Charts',
                    component: RtlRadialChartsDoc
                },
                {
                    id: 'internationalization-rtl-localized-time-series',
                    label: 'Localized Time Series',
                    component: RtlLocalizedTimeSeriesDoc
                },
                {
                    id: 'internationalization-rtl-auto-direction',
                    label: 'Auto Direction',
                    component: RtlAutoDirectionDoc
                }
            ]
        },
        {
            id: 'reference-accessibility',
            label: 'Accessibility',
            description: 'Configure screen reader support, ARIA labels, keyboard navigation, and focus indicators for chart data.',
            children: [
                {
                    id: 'reference-accessibility-import',
                    label: 'Import',
                    component: AccessibilityImportDoc
                },
                {
                    id: 'reference-accessibility-basic',
                    label: 'Basic',
                    component: AccessibilityBasicDoc
                },
                {
                    id: 'reference-accessibility-color-vision',
                    label: 'Color Vision',
                    component: AccessibilityColorVisionDoc
                },
                {
                    id: 'reference-accessibility-custom-description',
                    label: 'Custom Description',
                    component: AccessibilityCustomDescriptionDoc
                },
                {
                    id: 'reference-accessibility-point-descriptions',
                    label: 'Point Descriptions',
                    component: AccessibilityPointDescriptionsDoc
                },
                {
                    id: 'reference-accessibility-screen-reader-data-table',
                    label: 'Screen Reader Data Table',
                    component: AccessibilityScreenReaderDataTableDoc
                },
                {
                    id: 'reference-accessibility-keyboard-navigation',
                    label: 'Keyboard Navigation',
                    component: AccessibilityKeyboardNavigationDoc
                },
                {
                    id: 'reference-accessibility-focus-indicator',
                    label: 'Focus Indicator',
                    component: AccessibilityFocusIndicatorDoc
                },
                {
                    id: 'reference-accessibility-landmark-verbosity',
                    label: 'Landmark Verbosity',
                    component: AccessibilityLandmarkVerbosityDoc
                },
                {
                    id: 'reference-accessibility-disabling-accessibility',
                    label: 'Disabling Accessibility',
                    component: AccessibilityDisablingAccessibilityDoc
                }
            ]
        },
        {
            id: 'reference-api',
            label: 'API',
            description: 'Generated reference for Chart inputs, events, methods, templates, types, and style classes.',
            children: [
                {
                    id: 'reference-api-import',
                    label: 'Import',
                    component: ApiImportDoc
                }
            ]
        },
        {
            id: 'reference-performance',
            label: 'Performance',
            description: 'Reference for renderer choice, decimation, animation limits, and windowing large or streaming datasets.',
            children: [
                {
                    id: 'reference-performance-import',
                    label: 'Import',
                    component: PerformanceImportDoc
                },
                {
                    id: 'reference-performance-performance',
                    label: 'Performance',
                    component: PerformancePerformanceDoc
                },
                {
                    id: 'reference-performance-runnable-large-data-evidence',
                    label: 'Runnable large-data evidence',
                    component: PerformanceRunnableLargeDataEvidenceDoc
                },
                {
                    id: 'reference-performance-practical-limits',
                    label: 'Practical Limits',
                    component: PerformancePracticalLimitsDoc
                },
                {
                    id: 'reference-performance-svg-vs-canvas',
                    label: 'SVG vs Canvas',
                    component: PerformanceSvgVsCanvasDoc
                },
                {
                    id: 'reference-performance-decimation',
                    label: 'Decimation',
                    component: PerformanceDecimationDoc
                },
                {
                    id: 'reference-performance-animation',
                    label: 'Animation',
                    component: PerformanceAnimationDoc
                },
                {
                    id: 'reference-performance-zoom-and-navigator',
                    label: 'Zoom & Navigator',
                    component: PerformanceZoomAndNavigatorDoc
                },
                {
                    id: 'reference-performance-live-updates',
                    label: 'Live Updates',
                    component: PerformanceLiveUpdatesDoc
                },
                {
                    id: 'reference-performance-custom-rendering',
                    label: 'Custom Rendering',
                    component: PerformanceCustomRenderingDoc
                }
            ]
        },
        {
            id: 'reference-responsive',
            label: 'Responsive',
            description: 'Adapt chart configuration to different container sizes with font and layout scaling and custom breakpoint rules.',
            children: [
                {
                    id: 'reference-responsive-import',
                    label: 'Import',
                    component: ResponsiveImportDoc
                },
                {
                    id: 'reference-responsive-basic',
                    label: 'Basic',
                    component: ResponsiveBasicDoc
                },
                {
                    id: 'reference-responsive-auto-adaptive-scaling',
                    label: 'Auto-Adaptive Scaling',
                    component: ResponsiveAutoAdaptiveScalingDoc
                },
                {
                    id: 'reference-responsive-custom-rules',
                    label: 'Custom Rules',
                    component: ResponsiveCustomRulesDoc
                },
                {
                    id: 'reference-responsive-custom-breakpoints',
                    label: 'Custom Breakpoints',
                    component: ResponsiveCustomBreakpointsDoc
                },
                {
                    id: 'reference-responsive-hiding-elements-at-small-sizes',
                    label: 'Hiding Elements at Small Sizes',
                    component: ResponsiveHidingElementsAtSmallSizesDoc
                },
                {
                    id: 'reference-responsive-mobile-dashboard',
                    label: 'Mobile Dashboard',
                    component: ResponsiveMobileDashboardDoc
                }
            ]
        },
        {
            id: 'reference-theming',
            label: 'Theming',
            description: 'Style charts with CSS custom properties for SVG, or a plain JS theme object for Canvas.',
            children: [
                {
                    id: 'reference-theming-import',
                    label: 'Import',
                    component: ThemingImportDoc
                },
                {
                    id: 'reference-theming-overview',
                    label: 'Overview',
                    component: ThemingOverviewDoc
                },
                {
                    id: 'reference-theming-default-palette',
                    label: 'Default Palette',
                    component: ThemingDefaultPaletteDoc
                },
                {
                    id: 'reference-theming-svg',
                    label: 'SVG',
                    component: ThemingSvgDoc
                },
                {
                    id: 'reference-theming-canvas',
                    label: 'Canvas',
                    component: ThemingCanvasDoc
                }
            ]
        },
        {
            id: 'reference-tree-shaking',
            label: 'Tree Shaking',
            description: 'Choose standalone imports or the ChartModule barrel based on bundle size and page ergonomics.',
            children: [
                {
                    id: 'reference-tree-shaking-import',
                    label: 'Import',
                    component: TreeShakingImportDoc
                },
                {
                    id: 'reference-tree-shaking-standalone-imports',
                    label: 'Standalone Imports',
                    component: TreeShakingStandaloneImportsDoc
                },
                {
                    id: 'reference-tree-shaking-chartmodule',
                    label: 'ChartModule',
                    component: TreeShakingChartmoduleDoc
                },
                {
                    id: 'reference-tree-shaking-svg-and-canvas',
                    label: 'SVG and Canvas',
                    component: TreeShakingSvgAndCanvasDoc
                },
                {
                    id: 'reference-tree-shaking-bundle-impact',
                    label: 'Bundle Impact',
                    component: TreeShakingBundleImpactDoc
                },
                {
                    id: 'reference-tree-shaking-choosing-an-import-style',
                    label: 'Choosing an Import Style',
                    component: TreeShakingChoosingAnImportStyleDoc
                }
            ]
        }
    ];
}
