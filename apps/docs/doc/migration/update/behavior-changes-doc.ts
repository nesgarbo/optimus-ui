import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'update-behavior-changes-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>The 2.x line modernizes many components without changing how they are used, but a few behaviors are different and can show in an app that relied on the old one.</p>
            <h3>Sanitized HTML</h3>
            <p>
                The <i>SafeHtmlPipe</i> of Menu now runs the label through Angular's sanitizer instead of trusting it. For an item with <i>escape: false</i> the <i>style</i> attributes, the <i>&lt;script&gt;</i> tags and the <i>on*</i> handlers are
                removed. A Tooltip with <i>escape</i> set to <i>false</i> is sanitized the same way. Move that markup to the <i>item</i> template if it needs them.
            </p>
            <h3>output() instead of EventEmitter</h3>
            <p>
                Many outputs are now created with <i>output()</i>. They have <i>emit</i> and <i>subscribe</i>, and nothing else: <i>pipe</i> and the rest of the RxJS operators are gone. An output that emits after the component is destroyed throws
                <i>NG0953</i>, so cancel the timers and the subscriptions that end in an emit. The outputs that need an emit without a value (<i>onShow</i> of ContextMenu, <i>onClear</i> of FileUpload and a few more) are still
                <i>EventEmitter</i> until the next major version.
            </p>
            <h3>Styles as objects</h3>
            <p>
                <i>[ngStyle]</i> and <i>[ngClass]</i> were replaced by <i>[style]</i> and <i>[class]</i> in the templates. The style objects that inputs such as <i>inputStyle</i> and <i>panelStyle</i> (MultiSelect, AutoComplete) take must use plain
                CSS properties (<i>'width': '10rem'</i>); a key with a unit, such as <i>'width.px'</i>, no longer works. In Password and InputMask the icons are now a <i>button</i>, so the DOM, the focus order and the CSS selectors that pointed at
                the icon change. In ScrollTop, <i>style</i> goes to the inner button and not to the host.
            </p>
            <h3>Charts</h3>
            <p>
                <i>wheel</i> of <i>p-chart-zoom</i> is still <i>true</i>, so a bare wheel zooms and takes the scroll from the page. Use <i>[wheel]="&#123; modifierKey: 'ctrl' &#125;"</i> to ask for Ctrl; that will be the default in the next major
                version. A null value is not shown as 0 in the tooltip any more, the legend has the <i>group</i> role, a numeric string is read as a number, and the CSV export writes a cell that starts with <i>=</i>, <i>+</i>, <i>-</i> or
                <i>@</i> with a leading quote. <i>ariaLabel</i> names the chart, and <i>ChartAccessibility</i> moves the hover with the arrow keys, <i>home</i>, <i>end</i> and <i>escape</i>.
            </p>
            <h3>QueryBuilder</h3>
            <p>
                <i>toSql</i>, <i>toParameterizedSql</i> and the SQL methods of the component check the field against the columns, or against <i>ToSqlOptions.columns</i>. A field that is neither a column nor a valid identifier throws a
                <i>QueryBuilderParseError</i>. <i>LIKE</i> comes with <i>ESCAPE '!'</i> when the value has a wildcard, and <i>isempty</i> includes <i>NULL</i>.
            </p>
            <h3>Other components</h3>
            <p>
                Spreadsheet writes CSV with the defused formulas and a byte order mark, and a new <i>locale</i> restarts the engine. Cropper with <i>autoValue</i> delivers the value about 100 ms after the last gesture. Gantt draws only the rows in
                view from 150 rows on. Marker of Map is a focusable button, and changing the <i>anchor</i>, the <i>type</i>, the <i>cluster</i> or the <i>id</i> of a layer or a marker makes the element again. Many components got inputs for the texts
                that they wrote in English: see the accessibility or the labels section of Gantt, Signature, DashboardLayout, Mention, Gauges and Spreadsheet.
            </p>
        </app-docsectiontext>
    `
})
export class BehaviorChangesDoc {}
