import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { RadarImport2Doc } from '@/doc/charts/types/radar/radar/import-2-doc';
import { RadarUsEquityFactorTiltsVtvVugMtumDoc } from '@/doc/charts/types/radar/radar/us-equity-factor-tilts-vtv-vug-mtum-doc';
import { RadarFifa24AttributeProfilesOfThreeSuperstarsDoc } from '@/doc/charts/types/radar/radar/fifa-24-attribute-profiles-of-three-superstars-doc';
import { RadarNistCsf20CybersecurityPostureAuditDoc } from '@/doc/charts/types/radar/radar/nist-csf-2-0-cybersecurity-posture-audit-doc';
import { RadarStartupKpiScorecardAnimatedQuarterlyProgressDoc } from '@/doc/charts/types/radar/radar/startup-kpi-scorecard-animated-quarterly-progress-doc';
import { RadarEngineeringTeamAssessmentReferenceBandsAndLinesDoc } from '@/doc/charts/types/radar/radar/engineering-team-assessment-reference-bands-and-lines-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Radar Examples - Optimus UI"
        header="Radar Examples"
        description="Radar chart demos built on real datasets. Covers gradient fills, curve styles, reference zones, and animated data transitions."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesRadarRadarDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: RadarImport2Doc
        },
        {
            id: 'us-equity-factor-tilts-vtv-vug-mtum',
            label: 'US Equity Factor Tilts: VTV · VUG · MTUM',
            component: RadarUsEquityFactorTiltsVtvVugMtumDoc
        },
        {
            id: 'fifa-24-attribute-profiles-of-three-superstars',
            label: 'FIFA 24: Attribute Profiles of Three Superstars',
            component: RadarFifa24AttributeProfilesOfThreeSuperstarsDoc
        },
        {
            id: 'nist-csf-2-0-cybersecurity-posture-audit',
            label: 'NIST CSF 2.0: Cybersecurity Posture Audit',
            component: RadarNistCsf20CybersecurityPostureAuditDoc
        },
        {
            id: 'startup-kpi-scorecard-animated-quarterly-progress',
            label: 'Startup KPI Scorecard: Animated Quarterly Progress',
            component: RadarStartupKpiScorecardAnimatedQuarterlyProgressDoc
        },
        {
            id: 'engineering-team-assessment-reference-bands-and-lines',
            label: 'Engineering Team Assessment: Reference Bands & Lines',
            component: RadarEngineeringTeamAssessmentReferenceBandsAndLinesDoc
        }
    ];
}
