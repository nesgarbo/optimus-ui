import { CommonModule, isPlatformBrowser, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, contentChildren, inject, InjectionToken, input, NgModule, NgZone, numberAttribute, signal, TemplateRef, ViewEncapsulation } from '@angular/core';
import { MotionEvent, MotionOptions } from '@openng/optimus-ui-motion';
import { getWindowScrollTop } from '@openng/optimus-ui-utils';
import { PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { Button, ButtonProps } from '@openng/optimus-ui/button';
import { ChevronUpIcon } from '@openng/optimus-ui/icons';
import { MotionDirective } from '@openng/optimus-ui/motion';
import { ScrollTopIconTemplateContext, ScrollTopPassThrough } from '@openng/optimus-ui/types/scrolltop';
import { ZIndexUtils } from '@openng/optimus-ui/utils';
import { ScrollTopStyle } from './style/scrolltopstyle';

const SCROLLTOP_INSTANCE = new InjectionToken<ScrollTop>('SCROLLTOP_INSTANCE');

/**
 * ScrollTop gets displayed after a certain scroll position and used to navigates to the top of the page quickly.
 * @group Components
 */
@Component({
    selector: 'p-scrollTop, p-scrolltop, p-scroll-top',
    standalone: true,
    imports: [CommonModule, NgStyle, ChevronUpIcon, Button, SharedModule, MotionDirective],
    template: `
        @if (render()) {
            <p-button
                [pMotion]="visible()"
                [pMotionAppear]="true"
                [pMotionName]="'p-scrolltop'"
                [pMotionOptions]="computedMotionOptions()"
                (pMotionOnBeforeEnter)="onBeforeEnter($event)"
                (pMotionOnBeforeLeave)="onBeforeLeave()"
                (pMotionOnAfterLeave)="onAfterLeave()"
                [attr.aria-label]="buttonAriaLabel()"
                (click)="onClick()"
                [pt]="ptm('pcButton')"
                [styleClass]="cn(cx('root'), styleClass())"
                [ngStyle]="style()"
                type="button"
                [buttonProps]="buttonProps()"
                [unstyled]="unstyled()"
            >
                <ng-template #icon>
                    @if (!iconTemplate() && !_iconTemplate) {
                        @if (this.icon()) {
                            <span [class]="cn(cx('icon'), this.icon())"></span>
                        }
                        @if (!this.icon()) {
                            <svg data-p-icon="chevron-up" [class]="cx('icon')" />
                        }
                    } @else {
                        <ng-template *ngTemplateOutlet="iconTemplate() || _iconTemplate; context: { styleClass: cx('icon') }"></ng-template>
                    }
                </ng-template>
            </p-button>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ScrollTopStyle, { provide: SCROLLTOP_INSTANCE, useExisting: ScrollTop }, { provide: PARENT_INSTANCE, useExisting: ScrollTop }],
    hostDirectives: [Bind]
})
export class ScrollTop extends BaseComponent<ScrollTopPassThrough> {
    componentName = 'ScrollTop';

    $pcScrollTop: ScrollTop | undefined = inject(SCROLLTOP_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Class of the element.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Inline style of the element.
     * @group Props
     */
    readonly style = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);
    /**
     * Target of the ScrollTop.
     * @group Props
     */
    readonly target = input<'window' | 'parent' | undefined>('window');
    /**
     * Defines the threshold value of the vertical scroll position of the target to toggle the visibility.
     * @group Props
     */
    readonly threshold = input<number, unknown>(400, { transform: numberAttribute });
    /**
     * Name of the icon or JSX.Element for icon.
     * @group Props
     */
    readonly icon = input<string | undefined>(undefined);
    /**
     * Defines the scrolling behavior, "smooth" adds an animation and "auto" scrolls with a jump.
     * @group Props
     */
    readonly behavior = input<'auto' | 'smooth' | undefined>('smooth');
    /**
     * A string value used to determine the display transition options.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    readonly showTransitionOptions = input<string>('.15s');
    /**
     * A string value used to determine the hiding transition options.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    readonly hideTransitionOptions = input<string>('.15s');
    /**
     * The motion options.
     * @group Props
     */
    motionOptions = input<MotionOptions | undefined>(undefined);

    computedMotionOptions = computed<MotionOptions>(() => {
        return {
            ...this.ptm('motion'),
            ...this.motionOptions()
        };
    });
    /**
     * Establishes a string value that labels the scroll-top button.
     * @group Props
     */
    readonly buttonAriaLabel = input<string | undefined>(undefined);
    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    readonly buttonProps = input<ButtonProps>({ rounded: true });
    /**
     * Custom icon template.
     * @param {ScrollTopIconTemplateContext} context - icon context.
     * @see {@link ScrollTopIconTemplateContext}
     * @group Templates
     */
    readonly iconTemplate = contentChild<TemplateRef<ScrollTopIconTemplateContext>>('icon', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    _iconTemplate: TemplateRef<ScrollTopIconTemplateContext> | undefined;

    documentScrollListener: VoidFunction | null | undefined;

    parentScrollListener: VoidFunction | null | undefined;

    visible = signal<boolean>(false);

    render = signal<boolean>(false);

    overlay: any;

    _componentStyle = inject(ScrollTopStyle);

    private zone: NgZone = inject(NgZone);

    onInit() {
        const target = this.target();
        if (target === 'window') this.bindDocumentScrollListener();
        else if (target === 'parent') this.bindParentScrollListener();
    }

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'icon':
                    this._iconTemplate = item.template;
                    break;
            }
        });
    }

    onClick() {
        let scrollElement = this.target() === 'window' ? this.document.defaultView : this.el.nativeElement.parentElement;
        scrollElement.scroll({
            top: 0,
            behavior: this.behavior()
        });
    }

    onBeforeEnter(event: MotionEvent) {
        this.overlay = event.element as HTMLElement;
        this.overlay.style.position = this.target() === 'parent' ? 'sticky' : 'fixed';
        ZIndexUtils.set('overlay', this.overlay, this.config.zIndex.overlay);
    }

    onBeforeLeave() {
        ZIndexUtils.clear(this.overlay);
        this.overlay = null;
    }

    onAfterLeave() {
        this.render.set(false);
    }

    checkVisibility(scrollY: number) {
        if (scrollY > this.threshold()) {
            this.visible.set(true);
            if (!this.render()) {
                this.render.set(true);
            }
        } else {
            this.visible.set(false);
        }
    }

    bindParentScrollListener() {
        if (isPlatformBrowser(this.platformId)) {
            this.zone.runOutsideAngular(() => {
                this.parentScrollListener = this.renderer.listen(this.el.nativeElement.parentElement, 'scroll', () => {
                    this.checkVisibility(this.el.nativeElement.parentElement.scrollTop);
                });
            });
        }
    }

    bindDocumentScrollListener() {
        if (isPlatformBrowser(this.platformId)) {
            // Visibility lives in signals, so scrolling does not need to run change detection by itself.
            this.zone.runOutsideAngular(() => {
                this.documentScrollListener = this.renderer.listen(this.document.defaultView, 'scroll', () => {
                    this.checkVisibility(getWindowScrollTop());
                });
            });
        }
    }

    unbindParentScrollListener() {
        if (this.parentScrollListener) {
            this.parentScrollListener();
            this.parentScrollListener = null;
        }
    }

    unbindDocumentScrollListener() {
        if (this.documentScrollListener) {
            this.documentScrollListener();
            this.documentScrollListener = null;
        }
    }

    onDestroy() {
        const target = this.target();
        if (target === 'window') this.unbindDocumentScrollListener();
        else if (target === 'parent') this.unbindParentScrollListener();

        if (this.overlay) {
            ZIndexUtils.clear(this.overlay);
            this.overlay = null;
        }
    }
}

@NgModule({
    imports: [ScrollTop, SharedModule],
    exports: [ScrollTop, SharedModule]
})
export class ScrollTopModule {}
