import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <h3>Screen Reader</h3>
            <p>
                A gauge with one pointer has the <i>meter</i> role, with <i>aria-valuemin</i>, <i>aria-valuemax</i>, <i>aria-valuenow</i> and an <i>aria-valuetext</i> written through the label format, so it reads "132 km/h". With several pointers it
                is an <i>img</i> and each pointer carries a <i>title</i> with its value or its <i>description</i>. With <i>enablePointerDrag</i> it is a <i>slider</i> and takes focus. Name it with <i>title</i> or <i>aria-label</i>, and give a range a
                <i>legendText</i> to say what it means beyond its color.
            </p>
            <p>
                The texts that a gauge writes itself are inputs: <i>defaultLabel</i> names the gauge when there is no <i>title</i> or <i>aria-label</i> (<i>Gauge</i>), and <i>rangeText</i> is the legend of a range without a <i>legendText</i> (<i
                    >&#123;start&#125; to &#123;end&#125;</i
                >). Set them to translate what a screen reader says.
            </p>
            <h3>Keyboard Support</h3>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Function</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i>right arrow</i>, <i>up arrow</i></td>
                            <td>Raises the value by 1% of the scale. Only with <i>enablePointerDrag</i>.</td>
                        </tr>
                        <tr>
                            <td><i>left arrow</i>, <i>down arrow</i></td>
                            <td>Lowers the value by 1% of the scale.</td>
                        </tr>
                        <tr>
                            <td><i>page up</i>, <i>page down</i></td>
                            <td>Changes the value by 10% of the scale.</td>
                        </tr>
                        <tr>
                            <td><i>home</i>, <i>end</i></td>
                            <td>Goes to the least or the greatest value.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
    `
})
export class AccessibilityDoc {}
