import { ChangeDetectionStrategy, Component, inject, InjectionToken, NgModule, input } from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind, BindModule } from '@openng/optimus-ui/bind';
import { InputGroupAddonPassThrough } from '@openng/optimus-ui/types/inputgroupaddon';
import { InputGroupAddonStyle } from './style/inputgroupaddonstyle';

const INPUTGROUPADDON_INSTANCE = new InjectionToken<InputGroupAddon>('INPUTGROUPADDON_INSTANCE');

/**
 * InputGroupAddon displays text, icon, buttons and other content can be grouped next to an input.
 * @group Components
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'p-inputgroup-addon, p-inputGroupAddon',
    template: ` <ng-content></ng-content> `,
    standalone: true,
    imports: [BindModule],
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[style]': 'style()'
    },
    providers: [InputGroupAddonStyle, { provide: INPUTGROUPADDON_INSTANCE, useExisting: InputGroupAddon }, { provide: PARENT_INSTANCE, useExisting: InputGroupAddon }],
    hostDirectives: [Bind]
})
export class InputGroupAddon extends BaseComponent<InputGroupAddonPassThrough> {
    componentName = 'InputGroupAddon';

    _componentStyle = inject(InputGroupAddonStyle);

    $pcInputGroupAddon: InputGroupAddon | undefined = inject(INPUTGROUPADDON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

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
     * Class of the element.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
}

@NgModule({
    imports: [InputGroupAddon, SharedModule],
    exports: [InputGroupAddon, SharedModule]
})
export class InputGroupAddonModule {}
