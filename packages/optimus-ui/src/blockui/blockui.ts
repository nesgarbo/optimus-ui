import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, inject, effect, InjectionToken, NgModule, numberAttribute, signal, TemplateRef, untracked, ViewEncapsulation, input, contentChild, contentChildren } from '@angular/core';
import { blockBodyScroll, unblockBodyScroll } from '@openng/optimus-ui-utils';
import { PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { BlockUIPassThrough } from '@openng/optimus-ui/types/blockui';
import { ZIndexUtils } from '@openng/optimus-ui/utils';
import { BlockUiStyle } from './style/blockuistyle';

const BLOCKUI_INSTANCE = new InjectionToken<BlockUI>('BLOCKUI_INSTANCE');

/**
 * BlockUI can either block other components or the whole page.
 * @group Components
 */
@Component({
    selector: 'p-blockUI, p-blockui, p-block-ui',
    standalone: true,
    imports: [NgTemplateOutlet, SharedModule],
    template: `
        <ng-content></ng-content>
        <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate"></ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BlockUiStyle, { provide: BLOCKUI_INSTANCE, useExisting: BlockUI }, { provide: PARENT_INSTANCE, useExisting: BlockUI }],
    host: {
        '[attr.aria-busy]': '_blocked()',
        '[class]': "cn(cx('root'), styleClass())"
    },
    hostDirectives: [Bind]
})
export class BlockUI extends BaseComponent<BlockUIPassThrough> {
    componentName = 'BlockUI';

    $pcBlockUI: BlockUI | undefined = inject(BLOCKUI_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * Name of the local ng-template variable referring to another component.
     * @group Props
     */
    readonly target = input<any>(undefined);
    /**
     * Whether to automatically manage layering.
     * @group Props
     */
    readonly autoZIndex = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Base zIndex value to use in layering.
     * @group Props
     */
    readonly baseZIndex = input<number, unknown>(0, { transform: numberAttribute });
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Current blocked state as a boolean.
     * @group Props
     */
    readonly blocked = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * template of the content
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<any>>('content', { descendants: false });

    _blocked = signal<boolean>(false);

    constructor() {
        super();
        effect(() => {
            const blocked = this.blocked();
            untracked(() => {
                if (blocked) {
                    this.block();
                } else if (this._blocked()) {
                    // Only unblock if currently blocked
                    this.unblock();
                }
            });
        });
    }

    animationEndListener: VoidFunction | null | undefined;

    _componentStyle = inject(BlockUiStyle);

    onAfterViewInit() {
        if (this._blocked()) this.block();

        const target = this.target();
        if (target && !target.getBlockableElement) {
            throw 'Target of BlockUI must implement BlockableUI interface';
        }
    }

    _contentTemplate: TemplateRef<any> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    block() {
        if (isPlatformBrowser(this.platformId)) {
            this._blocked.set(true);
            (this.el as ElementRef).nativeElement.style.display = 'flex';

            const target = this.target();
            if (target) {
                target.getBlockableElement().appendChild((this.el as ElementRef).nativeElement);
                target.getBlockableElement().style.position = 'relative';
            } else {
                this.renderer.appendChild(this.document.body, (this.el as ElementRef).nativeElement);
                //@ts-ignore
                blockBodyScroll();
            }

            if (this.autoZIndex()) {
                ZIndexUtils.set('modal', (this.el as ElementRef).nativeElement, this.baseZIndex() + this.config.zIndex.modal);
            }

            this.renderer.addClass(this.el.nativeElement, 'p-overlay-mask');
            this.renderer.addClass(this.el.nativeElement, 'p-overlay-mask-enter-active');
            this.cd.markForCheck();
        }
    }

    unblock() {
        if (isPlatformBrowser(this.platformId) && this.el && this._blocked()) {
            this._blocked.set(false);
            if (!this.animationEndListener) {
                this.animationEndListener = this.renderer.listen(this.el.nativeElement, 'animationend', this.destroyModal.bind(this));
            }
            this.renderer.removeClass(this.el.nativeElement, 'p-overlay-mask-enter-active');
            this.renderer.addClass(this.el.nativeElement, 'p-overlay-mask-leave-active');
            this.cd.markForCheck();
        }
    }

    destroyModal() {
        this._blocked.set(false);
        if (this.el && isPlatformBrowser(this.platformId)) {
            this.el.nativeElement.style.display = 'none';
            this.renderer.removeClass(this.el.nativeElement, 'p-overlay-mask');
            this.renderer.removeClass(this.el.nativeElement, 'p-overlay-mask-leave-active');
            ZIndexUtils.clear(this.el.nativeElement);

            if (!this.target()) {
                this.document.body.removeChild(this.el.nativeElement);
                //@ts-ignore
                unblockBodyScroll();
            }
        }
        this.unbindAnimationEndListener();
        this.cd.markForCheck();
    }

    unbindAnimationEndListener() {
        if (this.animationEndListener && this.el) {
            this.animationEndListener();
            this.animationEndListener = null;
        }
    }

    onDestroy() {
        // Also clean up when destroyed in the middle of the leave animation, which would otherwise never finish.
        if (this._blocked() || this.animationEndListener) {
            // Skip animation on destroy, just cleanup
            this._blocked.set(false);
            if (this.el && isPlatformBrowser(this.platformId)) {
                ZIndexUtils.clear(this.el.nativeElement);
                if (!this.target()) {
                    //@ts-ignore
                    unblockBodyScroll();
                }
            }
            this.unbindAnimationEndListener();
        }
    }
}

@NgModule({
    imports: [BlockUI, SharedModule],
    exports: [BlockUI, SharedModule]
})
export class BlockUIModule {}
