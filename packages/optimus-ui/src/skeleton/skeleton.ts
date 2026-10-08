import { ChangeDetectionStrategy, Component, inject, InjectionToken, input, NgModule, ViewEncapsulation } from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { SkeletonPassThrough } from '@openng/optimus-ui/types/skeleton';
import { SkeletonStyle } from './style/skeletonstyle';

const SKELETON_INSTANCE = new InjectionToken<Skeleton>('SKELETON_INSTANCE');

/**
 * Skeleton is a placeholder to display instead of the actual content.
 * @group Components
 */
@Component({
    selector: 'p-skeleton',
    standalone: true,
    imports: [SharedModule],
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [SkeletonStyle, { provide: SKELETON_INSTANCE, useExisting: Skeleton }, { provide: PARENT_INSTANCE, useExisting: Skeleton }],
    host: {
        '[attr.aria-hidden]': 'true',
        '[class]': "cn(cx('root'), styleClass())",
        '[style]': 'containerStyle',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Skeleton extends BaseComponent<SkeletonPassThrough> {
    componentName = 'Skeleton';
    $pcSkeleton: Skeleton | undefined = inject(SKELETON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Shape of the element.
     * @group Props
     */
    readonly shape = input<string>('rectangle');
    /**
     * Type of the animation.
     * @gruop Props
     */
    readonly animation = input<string>('wave');
    /**
     * Border radius of the element, defaults to value from theme.
     * @group Props
     */
    readonly borderRadius = input<string | undefined>(undefined);
    /**
     * Size of the skeleton.
     * @group Props
     */
    readonly size = input<string | undefined>(undefined);
    /**
     * Width of the element.
     * @group Props
     */
    readonly width = input<string>('100%');
    /**
     * Height of the element.
     * @group Props
     */
    readonly height = input<string>('1rem');

    _componentStyle = inject(SkeletonStyle);

    get containerStyle() {
        const inlineStyles = this._componentStyle?.inlineStyles['root'];
        let style;
        if (!this.$unstyled()) {
            const size = this.size();
            if (size) style = { ...inlineStyles, width: size, height: size, borderRadius: this.borderRadius() };
            else style = { ...inlineStyles, width: this.width(), height: this.height(), borderRadius: this.borderRadius() };
        }

        return style;
    }

    get dataP() {
        return this.cn({
            [this.shape()]: this.shape()
        });
    }
}

@NgModule({
    imports: [Skeleton, SharedModule],
    exports: [Skeleton, SharedModule]
})
export class SkeletonModule {}
