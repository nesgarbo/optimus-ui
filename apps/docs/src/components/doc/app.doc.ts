import { default as IssueData } from '@/assets/data/issues.json';
import { Doc } from '@/domain/doc';
import { GITHUB_REPO_URL } from '@/utils/constants';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnChanges, OnInit, Renderer2, signal, SimpleChanges, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppDocService, DocResource } from './app.doc.service';
import { AppDocApiSection } from './app.docapisection';
import { AppDocFeaturesSection } from './app.docfeaturessection';
import { AppDocPtSection } from './app.docptsection';
import { AppDocIssuesSection } from './app.docissuessection';
import { AppDocThemingSection } from './app.docthemingsection';

const ISSUE_COUNTS = (IssueData as { counts: Record<string, number> }).counts;

/**
 * The demos spell their own name however they spell it — `themeDocs="button"` on one page
 * and `themeDocs="AutoComplete"` on the next — so the label a page belongs to is matched
 * on letters and digits alone, and the repository's own spelling is what gets used.
 */
function issueKey(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

const ISSUE_LABELS = new Map(Object.keys(ISSUE_COUNTS).map((label) => [issueKey(label), label]));

@Component({
    selector: 'app-doc',
    standalone: true,
    imports: [CommonModule, AppDocFeaturesSection, AppDocApiSection, AppDocThemingSection, AppDocPtSection, AppDocIssuesSection],
    providers: [AppDocService],
    template: ` <div class="doc-component">
        <div class="doc-tabpanels">
            @if (docs()) {
                <app-docfeaturessection
                    [header]="header() ?? _componentName()"
                    [description]="description()"
                    [docs]="docs()"
                    [componentName]="isComponentDoc() ? _componentName() : ''"
                    [docType]="docType()"
                    [ngStyle]="{ display: docService.activeTab() === 0 ? 'flex' : 'none' }"
                />
            }
            @if (apiDocs()) {
                @defer (when docService.activeTab() === 1) {
                    <app-docapisection [docs]="apiDocs()" [header]="header() ?? _componentName()" class="doc-tabpanel" [ngStyle]="{ display: docService.activeTab() === 1 ? 'flex' : 'none' }" />
                }
            }

            @if (themeDocs()) {
                @defer (when docService.activeTab() === 2) {
                    <app-docthemingsection [header]="header()" [docs]="themeDocs()" [componentName]="_componentName()" class="doc-tabpanel" [ngStyle]="{ display: docService.activeTab() === 2 ? 'flex' : 'none' }" />
                }
            }
            @if (isComponentDoc() && githubIssuesCount() > 0) {
                @defer (when docService.activeTab() === 4) {
                    <app-docissuessection [count]="githubIssuesCount()" [componentName]="_componentName()" [githubUrl]="githubIssuesUrl()" class="doc-tabpanel" [ngStyle]="{ display: docService.activeTab() === 4 ? 'flex' : 'none' }" />
                }
            }
            @if (ptDocs()) {
                @defer (when docService.activeTab() === 3) {
                    <app-docptsection [ptComponent]="ptDocs()" [componentName]="_componentName()" class="doc-tabpanel" [ngStyle]="{ display: docService.activeTab() === 3 ? 'flex' : 'none' }" />
                }
            }
        </div>
    </div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AppDoc implements OnInit, OnChanges, OnDestroy {
    docTitle = input<string>('');

    docs = input<Doc[]>();

    description = input<string>('');

    /**
     * What search engines and link previews get. The visible subtitle under the heading
     * stays short; this one has room to say what the page actually covers.
     */
    metaDescription = input<string>('');

    apiDocs = input<string[]>();

    themeDocs = input<string>('');

    header = input<string>('');

    componentName = input<string>('');

    docType = input<'component' | 'page'>('component');

    _componentName = computed(() => this.componentName() || this.themeDocs() || this.header());

    isComponentDoc = computed(() => !!(this.docs() && (this.apiDocs() || this.themeDocs() || this.ptDocs())));

    ptDocs = input<any>();

    docService = inject(AppDocService);

    activeTab = signal<number>(0);

    /** The label this page's component owns in the issue tracker, or none. */
    issueLabel = computed(() => ISSUE_LABELS.get(issueKey(this._componentName())) ?? null);

    githubIssuesUrl = computed(() => {
        const label = this.issueLabel();

        return label ? `${GITHUB_REPO_URL}/issues?q=${encodeURIComponent(`is:issue state:open label:"Component: ${label}"`)}` : null;
    });

    /**
     * How many open issues carry this component's label. Rendered as a badge in the rail,
     * and the panel only exists when there is at least one.
     *
     * The counts are read from `issues.json`, written by `scripts/build-issue-counts.mjs`
     * at build time. The page used to ask the GitHub search API itself, which meant a
     * request per visit against an endpoint that allows ten a minute, and a panel that
     * only existed once that request came back — so it was absent from the prerendered
     * HTML and from anything a crawler sees.
     */
    githubIssuesCount = computed(() => {
        const label = this.issueLabel();

        return label ? ISSUE_COUNTS[label] : 0;
    });

    router = inject(Router);

    titleService = inject(Title);

    metaService = inject(Meta);

    scrollListener!: any;

    renderer = inject(Renderer2);

    public document: Document = inject(DOCUMENT);

    constructor() {
        effect(() => this.publishResources());
    }

    ngOnInit() {
        this.navigate();

        const content = this.metaDescription() || this.description();

        if (content) {
            this.metaService.updateTag({ name: 'description', content });
        }
    }

    /**
     * The rail renders the panels this page has, so it has to be told what they are. This
     * runs as an effect so it follows the inputs, which arrive after construction.
     */
    private publishResources() {
        const resources: DocResource[] = [];
        const issues = this.githubIssuesCount();

        if (this.isComponentDoc()) {
            resources.push({ label: 'Features', tab: 0 });
        }

        if (this.apiDocs()) {
            resources.push({ label: 'API', tab: 1 });
        }

        if (this.themeDocs()) {
            resources.push({ label: 'Theming', tab: 2 });
        }

        if (this.ptDocs()) {
            resources.push({ label: 'Passthrough', tab: 3 });
        }

        if (this.isComponentDoc() && issues > 0) {
            resources.push({ label: 'Known Issues', tab: 4, badge: String(issues) });
        }

        this.docService.resources.set(resources);
        this.docService.componentName.set(this.isComponentDoc() ? this._componentName() : '');
        this.docService.docType.set(this.docType());
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.docTitle && changes.docTitle.currentValue) {
            this.titleService.setTitle(changes.docTitle.currentValue);
        }

        if (changes.description || changes.metaDescription) {
            const content = this.metaDescription() || this.description();

            if (content) {
                this.metaService.updateTag({ name: 'description', content });
            }
        }
    }

    activateTab(index) {
        this.docService.activeTab.set(index);
    }

    navigate() {
        if (this.router.url.includes('#issues')) {
            this.activateTab(4);
        }

        if (this.router.url.includes('#api')) {
            this.activateTab(1);
        }

        if (this.router.url.toLowerCase().includes('classes') || this.router.url.toLowerCase().includes('designtokens')) {
            this.activateTab(2);
        }

        if (this.router.url.includes('#pt')) {
            this.activateTab(3);
        }
    }

    ngOnDestroy() {
        this.activateTab(0);
    }
}
