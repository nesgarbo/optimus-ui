import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'controls-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>The value type each component reads and writes through <i>[formField]</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <table class="w-full text-left">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Field type</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>input pInputText, textarea pTextarea, p-password, p-inputmask, p-inputotp</td>
                        <td>string</td>
                    </tr>
                    <tr>
                        <td>p-inputnumber, p-slider, p-knob, p-rating</td>
                        <td>number | null</td>
                    </tr>
                    <tr>
                        <td>p-slider with range</td>
                        <td>number[]</td>
                    </tr>
                    <tr>
                        <td>p-checkbox with binary, p-toggleswitch, p-togglebutton</td>
                        <td>boolean</td>
                    </tr>
                    <tr>
                        <td>p-checkbox group</td>
                        <td>an array of the checkbox values</td>
                    </tr>
                    <tr>
                        <td>p-select, p-listbox, p-selectbutton, p-radiobutton, p-cascadeselect</td>
                        <td>the option value, or the option when there is no optionValue</td>
                    </tr>
                    <tr>
                        <td>p-multiselect, p-listbox with multiple</td>
                        <td>an array of option values</td>
                    </tr>
                    <tr>
                        <td>p-autocomplete</td>
                        <td>the selected option, or an array with multiple</td>
                    </tr>
                    <tr>
                        <td>p-datepicker</td>
                        <td>Date | null, Date[] with multiple, (Date | null)[] with range</td>
                    </tr>
                    <tr>
                        <td>p-colorpicker</td>
                        <td>string</td>
                    </tr>
                    <tr>
                        <td>p-text-editor-root</td>
                        <td>string</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <app-docsectiontext class="mt-4">
            <p>A field that is <i>disabled</i>, <i>readonly</i> or <i>required</i> in the form schema reaches the component with the same state. A component does not edit the array of the form in place: each change writes a new array.</p>
        </app-docsectiontext>
    `
})
export class ControlsDoc {}
