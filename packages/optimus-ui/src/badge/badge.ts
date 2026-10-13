import { isPlatformServer } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, Directive, effect, inject, InjectionToken, input, NgModule, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { addClass, createElement, hasClass, isNotEmpty, removeClass, uuid } from '@openng/optimus-ui-utils';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind, BindModule } from '@openng/optimus-ui/bind';
import type { BadgePassThrough, BadgeSeverity } from '@openng/optimus-ui/types/badge';
import { BadgeStyle } from './style/badgestyle';

const BADGE_INSTANCE = new InjectionToken<Badge>('BADGE_INSTANCE');

const BADGE_DIRECTIVE_INSTANCE = new InjectionToken<BadgeDirective>('BADGE_DIRECTIVE_INSTANCE');

/**
 * Badge Directive is directive usage of badge component.
 * @group Components
 */
@Directive({
    selector: '[pBadge]',
    providers: [BadgeStyle, { provide: BADGE_DIRECTIVE_INSTANCE, useExisting: BadgeDirective }, { provide: PARENT_INSTANCE, useExisting: BadgeDirective }],
    standalone: true
})
export class BadgeDirective extends BaseComponent {
    $pcBadgeDirective: BadgeDirective | undefined = inject(BADGE_DIRECTIVE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    /**
     * Used to pass attributes to DOM elements inside the Badge component.
     * @defaultValue undefined
     * @deprecated use pBadgePT instead.
     * @group Props
     */
    ptBadgeDirective = input<BadgePassThrough | undefined>();
    /**
     * Used to pass attributes to DOM elements inside the Badge component.
     * @defaultValue undefined
     * @group Props
     */
    pBadgePT = input<BadgePassThrough | undefined>();
    /**
     * Indicates whether the component should be rendered without styles.
     * @defaultValue undefined
     * @group Props
     */
    pBadgeUnstyled = input<boolean | undefined>();
    /**
     * When specified, disables the component.
     * @group Props
     */
    public readonly disabled = input<boolean | undefined>(undefined, { alias: 'badgeDisabled' });
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     */
    public readonly badgeSize = input<'large' | 'xlarge' | 'small' | null | undefined>(undefined);
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     * @deprecated use badgeSize instead.
     */
    readonly size = input<'large' | 'xlarge' | 'small' | null | undefined>(undefined);
    /**
     * Severity type of the badge.
     * @group Props
     */
    readonly severity = input<BadgeSeverity | null | undefined>(undefined);
    /**
     * Value to display inside the badge.
     * @group Props
     */
    public readonly value = input<string | number | undefined>(undefined);
    /**
     * Inline style of the element.
     * @group Props
     */
    readonly badgeStyle = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);
    /**
     * Class of the element.
     * @group Props
     */
    readonly badgeStyleClass = input<string | undefined>(undefined);

    private id!: string;

    badgeEl: HTMLElement;

    _componentStyle = inject(BadgeStyle);

    private get activeElement(): HTMLElement {
        const host: HTMLElement = this.el.nativeElement;
        if (host.nodeName.indexOf('-') === -1) {
            return host;
        }

        // The first child can be a comment (control flow anchor) or text, and a void element (img, input) cannot contain the badge.
        let child = host.firstChild;
        while (child && child.nodeType !== Node.ELEMENT_NODE) {
            child = child.nextSibling;
        }

        const voidElements = ['IMG', 'INPUT', 'BR', 'HR', 'AREA', 'BASE', 'COL', 'EMBED', 'LINK', 'META', 'SOURCE', 'TRACK', 'WBR'];
        return child && !voidElements.includes((child as HTMLElement).nodeName) ? (child as HTMLElement) : host;
    }

    private get canUpdateBadge(): boolean {
        return isNotEmpty(this.id) && !this.disabled();
    }

    constructor() {
        super();
        effect(() => {
            const pt = this.ptBadgeDirective() || this.pBadgePT();
            pt && this.directivePT.set(pt);
        });

        effect(() => {
            this.pBadgeUnstyled() && this.directiveUnstyled.set(this.pBadgeUnstyled());
        });
    }

    onChanges(changes: SimpleChanges): void {
        const { value, size, severity, disabled, badgeStyle, badgeStyleClass } = changes;

        if (size) {
            console.log('size property is deprecated and will removed in v18, use badgeSize instead.');
        }

        if (disabled) {
            this.toggleDisableState();
        }

        if (!this.canUpdateBadge) {
            return;
        }

        if (severity) {
            this.setSeverity(severity.previousValue);
        }

        if (size) {
            this.setSizeClasses();
        }

        if (value) {
            this.setValue();
        }

        if (badgeStyle || badgeStyleClass) {
            this.applyStyles();
        }
    }

    onAfterViewInit(): void {
        this.id = uuid('pn_id_') + '_badge';
        this.renderBadgeContent();
    }

    private setValue(element?: HTMLElement): void {
        const badge = element ?? this.document.getElementById(this.id);

        if (!badge) {
            return;
        }

        const value = this.value();
        if (value != null) {
            if (hasClass(badge, 'p-badge-dot')) {
                removeClass(badge, 'p-badge-dot');
            }

            if (value && String(value).length === 1) {
                addClass(badge, 'p-badge-circle');
            } else {
                removeClass(badge, 'p-badge-circle');
            }
        } else {
            if (!hasClass(badge, 'p-badge-dot')) {
                addClass(badge, 'p-badge-dot');
            }

            removeClass(badge, 'p-badge-circle');
        }

        badge.textContent = '';
        const badgeValue = value != null ? String(value) : '';
        this.renderer.appendChild(badge, this.document.createTextNode(badgeValue));
    }

    private setSizeClasses(element?: HTMLElement): void {
        const badge = element ?? this.document.getElementById(this.id);

        if (!badge) {
            return;
        }

        const badgeSize = this.badgeSize();
        const size = this.size();
        if (badgeSize) {
            if (badgeSize === 'large') {
                addClass(badge, 'p-badge-lg');
                removeClass(badge, 'p-badge-xl');
            }

            if (badgeSize === 'xlarge') {
                addClass(badge, 'p-badge-xl');
                removeClass(badge, 'p-badge-lg');
            }
        } else if (size && !badgeSize) {
            if (size === 'large') {
                addClass(badge, 'p-badge-lg');
                removeClass(badge, 'p-badge-xl');
            }

            if (size === 'xlarge') {
                addClass(badge, 'p-badge-xl');
                removeClass(badge, 'p-badge-lg');
            }
        } else {
            removeClass(badge, 'p-badge-lg');
            removeClass(badge, 'p-badge-xl');
        }
    }

    private renderBadgeContent(): void {
        // The badge is built with the DOM, which the server does not have.
        if (this.disabled() || isPlatformServer(this.platformId)) {
            return;
        }

        const el = this.activeElement;
        const badge = <HTMLElement>createElement('span', { class: this.cx('root'), id: this.id, 'p-bind': this.ptm('root') });
        this.setSeverity(null, badge);
        this.setSizeClasses(badge);
        this.setValue(badge);
        addClass(el, 'p-overlay-badge');
        this.renderer.appendChild(el, badge);
        this.badgeEl = badge;
        this.applyStyles();
    }

    private applyStyles(): void {
        const badgeStyle = this.badgeStyle();
        if (this.badgeEl && badgeStyle && typeof badgeStyle === 'object') {
            for (const [key, value] of Object.entries(badgeStyle)) {
                this.renderer.setStyle(this.badgeEl, key, value);
            }
        }
        const badgeStyleClass = this.badgeStyleClass();
        if (this.badgeEl && badgeStyleClass) {
            this.badgeEl.classList.add(...badgeStyleClass.split(' '));
        }
    }

    private setSeverity(oldSeverity?: BadgeSeverity | null, element?: HTMLElement): void {
        const badge = element ?? this.document.getElementById(this.id);

        if (!badge) {
            return;
        }

        const severity = this.severity();
        if (severity) {
            addClass(badge, `p-badge-${severity}`);
        }

        if (oldSeverity) {
            removeClass(badge, `p-badge-${oldSeverity}`);
        }
    }

    private toggleDisableState(): void {
        if (!this.id) {
            return;
        }

        if (this.disabled()) {
            const badge = this.activeElement?.querySelector(`#${this.id}`);

            if (badge) {
                this.renderer.removeChild(this.activeElement, badge);
            }
        } else {
            this.renderBadgeContent();
        }
    }
}
/**
 * Badge is a small status indicator for another element.
 * @group Components
 */
@Component({
    selector: 'p-badge',
    template: `{{ value() }}`,
    standalone: true,
    imports: [SharedModule, BindModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BadgeStyle, { provide: BADGE_INSTANCE, useExisting: Badge }, { provide: PARENT_INSTANCE, useExisting: Badge }],
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[style.display]': 'badgeDisabled() ? "none" : null',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Badge extends BaseComponent<BadgePassThrough> {
    componentName = 'Badge';

    $pcBadge: Badge | undefined = inject(BADGE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     */
    badgeSize = input<'small' | 'large' | 'xlarge' | null>();
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     */
    size = input<'small' | 'large' | 'xlarge' | null>();
    /**
     * Severity type of the badge.
     * @group Props
     */
    severity = input<BadgeSeverity | null>();
    /**
     * Value to display inside the badge.
     * @group Props
     */
    value = input<string | number | null>();
    /**
     * When specified, disables the component.
     * @group Props
     */
    badgeDisabled = input<boolean, boolean>(false, { transform: booleanAttribute });

    _componentStyle = inject(BadgeStyle);

    get dataP() {
        return this.cn({
            circle: this.value() != null && String(this.value()).length === 1,
            empty: this.value() == null,
            disabled: this.badgeDisabled(),
            [this.severity() as string]: this.severity(),
            [this.size() as string]: this.size()
        });
    }
}

@NgModule({
    imports: [Badge, BadgeDirective, SharedModule],
    exports: [Badge, BadgeDirective, SharedModule]
})
export class BadgeModule {}
