import { Directive, NgModule, computed, input } from '@angular/core';
import { cn } from '@openng/optimus-ui-utils';
/**
 * Represents the suitable value types of pClass directive.
 * @group Types
 */
export type PClassValue = string | number | boolean | undefined | null | { [key: string]: boolean | undefined | null } | any;

/**
 * PClass directive provides extends class binding functionality.
 * Supports strings, arrays, objects, and mixed combinations.
 * @group Components
 */
@Directive({
    selector: '[pClass]',
    standalone: true,
    host: {
        '[class]': 'classes()'
    }
})
export class ClassNames {
    /**
     * Class value(s) to be applied. Can be a string, array, object, or combination.
     * @group Props
     */
    readonly classNames = input<PClassValue>(undefined, { alias: 'pClass' });

    readonly classes = computed(() => cn(this.classNames()));
}

@NgModule({
    imports: [ClassNames],
    exports: [ClassNames]
})
export class ClassNamesModule {}
