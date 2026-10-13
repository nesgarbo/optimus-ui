import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, inject, input, NgModule, TemplateRef } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'p-header',
    template: '<ng-content></ng-content>',
    standalone: false
})
export class Header {}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'p-footer',
    template: '<ng-content></ng-content>',
    standalone: false
})
export class Footer {}

/**
 * Template marker. Final 3.0 shape (stable, consumers use `contentChildren(PrimeTemplate)`):
 * `tpl.type()` (input `type`), `tpl.name()` (input aliased `pTemplate`), `tpl.template` (TemplateRef), `tpl.getType()` (= `name()`).
 */
@Directive({
    selector: '[pTemplate]',
    standalone: true
})
export class PrimeTemplate {
    readonly type = input<string | undefined>(undefined);

    readonly name = input<string | undefined>(undefined, { alias: 'pTemplate' });

    readonly template: TemplateRef<any> = inject(TemplateRef);

    getType(): string {
        return this.name()!;
    }
}

@NgModule({
    imports: [CommonModule, PrimeTemplate],
    exports: [Header, Footer, PrimeTemplate],
    declarations: [Header, Footer]
})
export class SharedModule {}
