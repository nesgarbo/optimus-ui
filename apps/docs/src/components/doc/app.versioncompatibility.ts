import { Component } from '@angular/core';

interface VersionCompatibilityEntry {
    optimusUi: string;
    angular: string;
}

@Component({
    selector: 'app-version-compatibility',
    standalone: true,
    template: `
        <!-- The table has a 960px floor, so on a phone it has to be the scroller. -->
        <div class="doc-tablewrapper">
            <table class="doc-table">
                <thead>
                    <tr>
                        <th>Optimus UI</th>
                        <th>Angular</th>
                    </tr>
                </thead>
                <tbody>
                    @for (entry of entries; track entry.optimusUi) {
                        <tr>
                            <td>{{ entry.optimusUi }}</td>
                            <td>{{ entry.angular }}</td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    `
})
export class AppVersionCompatibility {
    entries: VersionCompatibilityEntry[] = [
        { optimusUi: 'v2', angular: 'v22' },
        { optimusUi: 'v1', angular: 'v21' }
    ];
}
