import { AppNewsComponent } from '@/components/layout/news/app.news.component';
import { AppTopBarComponent } from '@/components/layout/topbar/app.topbar.component';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { AccessibilitySectionComponent } from './accessibilitysection.component';
import { CodeSectionComponent } from './codesection.component';
import { CommunitySectionComponent } from './communitysection.component';
import { ComposableSectionComponent } from './composablesection.component';
import { DxSectionComponent } from './dxsection.component';
import { FooterSectionComponent } from './footersection.component';
import { HeroSectionComponent } from './herosection.component';
import { ThemingSectionComponent } from './themingsection.component';
import { WhoUsesSectionComponent } from './whousessection.component';

@Component({
    selector: 'landing',
    standalone: true,
    templateUrl: './landing.component.html',
    imports: [
        CommonModule,
        AppNewsComponent,
        AppTopBarComponent,
        HeroSectionComponent,
        WhoUsesSectionComponent,
        CodeSectionComponent,
        ComposableSectionComponent,
        ThemingSectionComponent,
        AccessibilitySectionComponent,
        DxSectionComponent,
        CommunitySectionComponent,
        FooterSectionComponent
    ]
})
export class LandingComponent implements OnInit {
    private title = inject(Title);
    private meta = inject(Meta);

    ngOnInit() {
        this.title.setTitle('Optimus UI - Angular UI Component Library');
        this.meta.updateTag({
            name: 'description',
            content: 'Optimus UI is a community-maintained, MIT licensed suite of accessible Angular UI components.'
        });
    }
}
