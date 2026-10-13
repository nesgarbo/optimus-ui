import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';

@Component({
    selector: 'update-signals-api-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Version 3.0 moves the whole public API of the components to signals. The inputs are <i>input()</i>, the two way values are <i>model()</i>, the outputs are <i>output()</i>, and the queries are <i>viewChild()</i>,
                <i>contentChild()</i> and <i>contentChildren()</i>. No component uses &#64;Input, &#64;Output, &#64;ViewChild, &#64;ContentChild, &#64;HostListener or &#64;HostBinding. Bindings in a template do not change: <i>[value]</i>,
                <i>[(visible)]</i> and <i>(onClick)</i> work as they did.
            </p>
            <h3>Let ng update do the first pass</h3>
            <p>
                <i>ng update &#64;openng/optimus-ui</i> runs the <i>migrate-signals-v3</i> migration. It rewrites what it can prove: the read of a member that is a signal now (<i>table.rows</i> becomes <i>table.rows()</i>) and the assignment to a
                model (<i>table.first = 20</i> becomes <i>table.first.set(20)</i>), on a reference with a declared type, and the <i>instance.x</i> reads in <i>pt</i> functions. It does not guess the rest: an assignment to an input, a <i>pipe</i> on
                an output, a <i>QueryList</i> and the <i>pt</i> members that are a signal in some classes and a plain property in others get a <i>TODO(optimus-ui 3.0)</i> comment. It does not change the templates, because the bindings are the same.
                Run it on a clean git tree, review the diff and look for the TODO comments.
            </p>
            <h3>What changes in your code</h3>
            <ul>
                <li><b>Read a property as a function.</b> A component instance that you reach with a template reference or <i>viewChild</i> gives its inputs as signals: <i>table.rows()</i>, <i>select.options()</i>, <i>dialog.visible()</i>.</li>
                <li>
                    <b>Set an input with a binding or setInput.</b> <i>instance.value = x</i> does not compile any more. In a template use <i>[value]="x"</i>; in code use <i>componentRef.setInput('value', x)</i>, which is also what a test does with
                    <i>fixture.componentRef.setInput</i>.
                </li>
                <li><b>A two way value is a model.</b> Read it with <i>x()</i> and write it with <i>x.set(v)</i>. <i>[(x)]</i> and the <i>xChange</i> event keep working, and the model does not emit when the value does not change.</li>
                <li>
                    <b>The state that a component writes lives in an internal signal.</b> An input only gives back what you passed in. The value that the component keeps while the user works is in a signal with an underscore, such as
                    <i>table._value()</i>, <i>fieldset._collapsed()</i>, <i>select._id()</i> or <i>carousel._page()</i>.
                </li>
                <li>
                    <b>Outputs have subscribe and emit.</b> There is no <i>pipe</i>; use <i>outputToObservable</i> from <i>&#64;angular/core/rxjs-interop</i> when you need RxJS operators. An output that emits after its component was destroyed throws
                    <i>NG0953</i>.
                </li>
                <li>
                    <b>PassThrough functions receive signals.</b> In <i>pt</i>, <i>instance.disabled</i> is a signal now: write <i>instance.disabled()</i>. This is true of the host name too: <i>hostName</i> and <i>componentName</i> can be an input.
                </li>
                <li>
                    <b>Templates are a read only array.</b> <i>templates</i> is the result of <i>contentChildren(PrimeTemplate)</i>. Call <i>templates()</i> and read <i>tpl.name()</i> and <i>tpl.type()</i>; the <i>template</i> property is the same as
                    before.
                </li>
            </ul>
            <app-code [code]="code" [hideToggleCode]="true" [hideCodeSandbox]="true" [hideStackBlitz]="true"></app-code>
            <h3>Table and TreeTable</h3>
            <p>
                <i>first</i>, <i>rows</i>, <i>selection</i> and <i>contextMenuSelection</i> of Table are models, and so are <i>first</i>, <i>rows</i> and <i>contextMenuSelection</i> of TreeTable. <i>table.first = 20</i> becomes
                <i>table.first.set(20)</i>. <i>table.value</i> is the input, so the sorted data is in <i>table._value()</i>; the live <i>filters</i>, <i>sortField</i>, <i>sortOrder</i>, <i>multiSortMeta</i>, <i>expandedRowKeys</i> and
                <i>totalRecords</i> are in <i>_filters()</i>, <i>_sortField()</i>, <i>_sortOrder()</i>, <i>_multiSortMeta()</i>, <i>_expandedRowKeys()</i> and <i>_totalRecords()</i>, and that includes what <i>restoreState</i> brings back.
                <i>first</i> and <i>rows</i> are emitted before <i>onPage</i>. TreeTable keeps <i>selection</i> and <i>selectionKeys</i> as an input with their own change event, because the selection moves up and down the tree in a loop.
            </p>
            <h3>Forms</h3>
            <p>
                Select, MultiSelect, AutoComplete, ListBox and CascadeSelect give the generated id in <i>_id()</i>; <i>id()</i> is only what you passed. <i>filterValue</i> of Select is no longer applied with a timeout, and <i>options</i> of Select
                and MultiSelect are compared by content, so an equal array does not restart the state. MultiSelect <i>overlayVisible</i> is a model, and in AutoComplete <i>overlayVisible</i> and <i>loading</i> are read only signals. DatePicker gives
                its inputs (<i>minDate</i>, <i>maxDate</i>, <i>showTime</i>, <i>view</i>...) as signals. InputMask initializes the mask from <i>[mask]</i> or <i>setInput</i>, followed by a change detection, and no longer when you assign the property.
                Panel <i>collapsed</i> is a model and has no <i>booleanAttribute</i>, so write <i>[collapsed]="true"</i> and not the bare attribute. FileUpload keeps the validated list in <i>_files</i>, and <i>onClear</i> emits no value. SelectButton
                gives the effective state of <i>unselectable</i> in <i>$allowEmpty()</i>.
            </p>
            <h3>Data, menus and overlays</h3>
            <p>
                Paginator and DataView keep the live page in <i>_first()</i>, <i>_rows()</i> and <i>_totalRecords()</i>. OrderList <i>selection</i> is a model. The menus give <i>processedItems()</i> as a computed, and the speed dial <i>visible</i> is
                a model. Dialog, ConfirmDialog and Overlay <i>visible</i> are models; Overlay gives its effective values as <i>$mode()</i>, <i>$target()</i>, <i>$listener()</i>, and its <i>onHide</i> has no <i>pipe</i>. Drawer <i>visible</i> is an
                input with the <i>visibleChange</i> event. BlockUI tells whether it blocks in <i>_blocked()</i>. Carousel keeps the page in <i>_page()</i>, <i>_numVisible()</i> and <i>_numScroll()</i>. Galleria <i>activeIndex</i> and
                <i>visible</i> are models, and OrganizationChart <i>selection</i> is a model.
            </p>
            <h3>Buttons, chips and the others</h3>
            <p>
                <i>pButton</i> gives the effective <i>label</i>, <i>icon</i>, <i>loading</i> and <i>severity</i>, with <i>buttonProps</i> applied, in <i>_label()</i>, <i>_icon()</i>, <i>_loading()</i> and <i>_severity()</i>. Chip does the same with
                <i>chipProps</i> (<i>_label()</i>, <i>_icon()</i>...) and <i>visible</i> is a signal. Fieldset <i>collapsed</i> and Inplace <i>active</i> are inputs, and the live state is in <i>_collapsed()</i> and <i>_active()</i>. The
                <i>onActivate</i> and <i>onDeactivate</i> events of Inplace carry an <i>Event</i> or nothing. p-chart <i>data</i> and <i>options</i> are read only signals. p-chart also loads Chart.js with a dynamic <i>import()</i>, so it leaves the
                main bundle and the chart is created a moment after the view. <i>chart.chart</i> is <i>null</i> until the chunk loads and <i>getBase64Image()</i> returns <i>undefined</i> meanwhile: if you read the instance or export the image right
                after the render, wait until it exists. A change of <i>data</i> or <i>options</i> during the load joins the creation that is pending.
            </p>
            <h3>Behavior that is different from 2.x</h3>
            <p>
                <i>wheel</i> of <i>p-chart-zoom</i> asks for Ctrl by default, so a bare wheel no longer takes the scroll of the page; pass <i>[wheel]="true"</i> to get the old behavior. Table and TreeTable keep the default change detection, and
                changing a row or a node in place still repaints them. The menus (Menu, Menubar, MegaMenu, TieredMenu, ContextMenu and PanelMenu), DynamicDialog and OrganizationChart use OnPush, and they check the simple properties that their
                template reads (<i>label</i>, <i>disabled</i>, <i>visible</i>, <i>icon</i>, <i>badge</i>, <i>expanded</i>, <i>header</i>, <i>footer</i>...) on each cycle, so <i>item.disabled = true</i> still works. They do not see a change inside a
                nested object (<i>item.style.color</i>, <i>ddconfig.style.width</i>), and they do not see children added to <i>item.items</i>: assign a new object, or a new <i>model</i>, for those. The effective state in the signals above is the one
                to read; the input is what was bound.
            </p>
        </app-docsectiontext>
    `
})
export class SignalsApiDoc {
    code: Code = {
        typescript: `// 2.x
table.first = 20;
const rows = table.rows;
dialog.visible = true;
select.options = options;

// 3.0
table.first.set(20);
const rows = table.rows();
dialog.visible.set(true);
fixture.componentRef.setInput('options', options);`
    };
}
