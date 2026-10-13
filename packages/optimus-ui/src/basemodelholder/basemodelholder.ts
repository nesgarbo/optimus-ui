import { computed, Directive, signal } from '@angular/core';
import { isNotEmpty } from '@openng/optimus-ui-utils';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';

@Directive({ standalone: true })
export class BaseModelHolder<PT = any> extends BaseComponent<PT> {
    readonly modelValue = signal<string | string[] | any | undefined>(undefined);

    readonly $filled = computed(() => isNotEmpty(this.modelValue()));

    writeModelValue(value: any) {
        this.modelValue.set(value);
    }
}
