import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ElementRef, inject, InjectionToken, input, linkedSignal, NgModule, output, TemplateRef, ViewEncapsulation, viewChild, contentChild, contentChildren } from '@angular/core';
import { MotionEvent, MotionOptions } from '@openng/optimus-ui-motion';
import { uuid } from '@openng/optimus-ui-utils';
import { BlockableUI, PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind, BindModule } from '@openng/optimus-ui/bind';
import { MinusIcon, PlusIcon } from '@openng/optimus-ui/icons';
import { MotionModule } from '@openng/optimus-ui/motion';
import type { FieldsetAfterToggleEvent, FieldsetBeforeToggleEvent, FieldsetPassThrough } from '@openng/optimus-ui/types/fieldset';
import { FieldsetStyle } from './style/fieldsetstyle';

const FIELDSET_INSTANCE = new InjectionToken<Fieldset>('FIELDSET_INSTANCE');

/**
 * Fieldset is a grouping component with the optional content toggle feature.
 * @group Components
 */
@Component({
    selector: 'p-fieldset',
    standalone: true,
    imports: [NgTemplateOutlet, MinusIcon, PlusIcon, SharedModule, BindModule, MotionModule],
    template: `
        <fieldset [attr.id]="id" [style]="style()" [class]="cn(cx('root'), styleClass())" [pBind]="ptm('root')" [attr.data-p]="dataP">
            <legend [class]="cx('legend')" [pBind]="ptm('legend')" [attr.data-p]="dataP">
                @if (toggleable()) {
                    <button
                        [attr.id]="id + '_header'"
                        tabindex="0"
                        role="button"
                        [attr.aria-controls]="id + '_content'"
                        [attr.aria-expanded]="!_collapsed()"
                        [attr.aria-label]="buttonAriaLabel"
                        (click)="toggle($event)"
                        (keydown)="onKeyDown($event)"
                        [class]="cx('toggleButton')"
                        [pBind]="ptm('toggleButton')"
                    >
                        @if (_collapsed()) {
                            @if (!expandIconTemplate() && !_expandIconTemplate) {
                                <svg data-p-icon="plus" [class]="cx('toggleIcon')" [pBind]="ptm('toggleIcon')" />
                            }
                            @if (expandIconTemplate() || _expandIconTemplate) {
                                <span [class]="cx('toggleIcon')" [pBind]="ptm('toggleIcon')">
                                    <ng-container *ngTemplateOutlet="expandIconTemplate() || _expandIconTemplate"></ng-container>
                                </span>
                            }
                        }
                        @if (!_collapsed()) {
                            @if (!collapseIconTemplate() && !_collapseIconTemplate) {
                                <svg data-p-icon="minus" [class]="cx('toggleIcon')" [attr.aria-hidden]="true" [pBind]="ptm('toggleIcon')" />
                            }
                            @if (collapseIconTemplate() || _collapseIconTemplate) {
                                <span [class]="cx('toggleIcon')" [pBind]="ptm('toggleIcon')">
                                    <ng-container *ngTemplateOutlet="collapseIconTemplate() || _collapseIconTemplate"></ng-container>
                                </span>
                            }
                        }
                        <ng-container *ngTemplateOutlet="legendContent"></ng-container>
                    </button>
                } @else {
                    <span [class]="cx('legendLabel')" [pBind]="ptm('legendLabel')">{{ legend() }}</span>
                    <ng-content select="p-header"></ng-content>
                    <ng-container *ngTemplateOutlet="headerTemplate() || _headerTemplate"></ng-container>
                }
                <ng-template #legendContent>
                    <span [class]="cx('legendLabel')" [pBind]="ptm('legendLabel')">{{ legend() }}</span>
                    <ng-content select="p-header"></ng-content>
                    <ng-container *ngTemplateOutlet="headerTemplate() || _headerTemplate"></ng-container>
                </ng-template>
            </legend>
            <div
                [pBind]="ptm('contentContainer')"
                [pMotion]="!toggleable() || (toggleable() && !_collapsed())"
                pMotionName="p-collapsible"
                [pMotionOptions]="computedMotionOptions()"
                [class]="cx('contentContainer')"
                [id]="id + '_content'"
                role="region"
                [attr.aria-labelledby]="id + '_header'"
                [attr.aria-hidden]="_collapsed()"
                [attr.tabindex]="_collapsed() ? '-1' : undefined"
                (pMotionOnAfterEnter)="onToggleDone($event)"
                (pMotionOnAfterLeave)="onToggleDone($event)"
            >
                <div [pBind]="ptm('contentWrapper')" [class]="cx('contentWrapper')">
                    <div [class]="cx('content')" [pBind]="ptm('content')" #contentWrapper>
                        <ng-content></ng-content>
                        <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate"></ng-container>
                    </div>
                </div>
            </div>
        </fieldset>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [FieldsetStyle, { provide: FIELDSET_INSTANCE, useExisting: Fieldset }, { provide: PARENT_INSTANCE, useExisting: Fieldset }],
    hostDirectives: [Bind]
})
export class Fieldset extends BaseComponent<FieldsetPassThrough> implements BlockableUI {
    componentName = 'Fieldset';

    $pcFieldset: Fieldset | undefined = inject(FIELDSET_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    _componentStyle = inject(FieldsetStyle);

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    get dataP() {
        return this.cn({
            toggleable: this.toggleable()
        });
    }

    /**
     * Header text of the fieldset.
     * @group Props
     */
    readonly legend = input<string | undefined>(undefined);
    /**
     * When specified, content can toggled by clicking the legend.
     * @group Props
     * @defaultValue false
     */
    readonly toggleable = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Inline style of the component.
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
     * Style class of the component.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Transition options of the panel animation.
     * @group Props
     * @deprecated since v21.0.0, use `motionOptions` instead.
     */
    readonly transitionOptions = input<string>('400ms cubic-bezier(0.86, 0, 0.07, 1)');
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
     * Emits when the collapsed state changes.
     * @param {boolean} value - New value.
     * @group Emits
     */
    collapsedChange = output<boolean>();
    /**
     * Callback to invoke before panel toggle.
     * @param {PanelBeforeToggleEvent} event - Custom toggle event
     * @group Emits
     */
    onBeforeToggle = output<FieldsetBeforeToggleEvent>();
    /**
     * Callback to invoke after panel toggle.
     * @param {PanelAfterToggleEvent} event - Custom toggle event
     * @group Emits
     */
    onAfterToggle = output<FieldsetAfterToggleEvent>();

    readonly contentWrapperViewChild = viewChild<ElementRef>('contentWrapper');

    private _id: string = uuid('pn_id_');

    get id() {
        return this._id;
    }

    get buttonAriaLabel() {
        return this.legend();
    }

    /**
     * Defines the initial state of content, supports one or two-way binding as well.
     * @group Props
     */
    readonly collapsed = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });

    /**
     * Internal collapsed state: follows the `collapsed` input and is written when the fieldset is toggled.
     */
    readonly _collapsed = linkedSignal<boolean | undefined>(() => this.collapsed());

    /**
     * Custom header template.
     * @group Templates
     */
    readonly headerTemplate = contentChild<TemplateRef<void>>('header', { descendants: false });

    /**
     * Custom expand icon template.
     * @group Templates
     */
    readonly expandIconTemplate = contentChild<TemplateRef<void>>('expandicon', { descendants: false });

    /**
     * Custom collapse icon template.
     * @group Templates
     */
    readonly collapseIconTemplate = contentChild<TemplateRef<void>>('collapseicon', { descendants: false });

    /**
     * Custom content template.
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<void>>('content', { descendants: false });

    toggle(event: MouseEvent) {
        this.onBeforeToggle.emit({ originalEvent: event, collapsed: this._collapsed() });

        if (this._collapsed()) this.expand();
        else this.collapse();

        event.preventDefault();
    }

    onKeyDown(event) {
        if (event.code === 'Enter' || event.code === 'Space') {
            this.toggle(event);
            event.preventDefault();
        }
    }

    expand() {
        this._collapsed.set(false);
        this.collapsedChange.emit(false);
        this.updateTabIndex();
    }

    collapse() {
        this._collapsed.set(true);
        this.collapsedChange.emit(true);
        this.updateTabIndex();
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    updateTabIndex() {
        const contentWrapperViewChild = this.contentWrapperViewChild();
        if (contentWrapperViewChild) {
            const focusableElements = contentWrapperViewChild.nativeElement.querySelectorAll('input, button, select, a, textarea, [tabindex]');
            focusableElements.forEach((element: HTMLElement) => {
                if (this._collapsed()) {
                    element.setAttribute('tabindex', '-1');
                } else {
                    element.removeAttribute('tabindex');
                }
            });
        }
    }

    onToggleDone(event: MotionEvent) {
        this.onAfterToggle.emit({ originalEvent: event as any, collapsed: this._collapsed() });
    }

    _headerTemplate: TemplateRef<void> | undefined;

    _expandIconTemplate: TemplateRef<void> | undefined;

    _collapseIconTemplate: TemplateRef<void> | undefined;

    _contentTemplate: TemplateRef<void> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'expandicon':
                    this._expandIconTemplate = item.template;
                    break;

                case 'collapseicon':
                    this._collapseIconTemplate = item.template;
                    break;

                case 'content':
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }
}

@NgModule({
    imports: [Fieldset, SharedModule, BindModule],
    exports: [Fieldset, SharedModule, BindModule]
})
export class FieldsetModule {}
