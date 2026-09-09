import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardCardMovePayload, TaskBoardCardReorderPayload, TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'external-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Bind <i>items</i> instead of <i>tasks</i> when a store owns every mutation. The board reads the array, emits its outputs as REQUESTS and never writes: <i>tasksChange</i> is not emitted at all, and the local history stays empty because
                undo belongs to whoever owns the data.
            </p>
            <p>
                A same-lane move emits <i>cardMove</i> and then <i>cardReorder</i>. The usual store strategy is the one below: let <i>cardMove</i> handle a change of column and return early otherwise, then let <i>cardReorder</i> apply the new order.
                Applying both would move the card twice.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [items]="store()" dataKey="id" columnField="columnId" [columns]="columns" (cardMove)="onCardMove($event)" (cardReorder)="onCardReorder($event)">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id) {
                                            <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                        } @empty {
                                            <p-taskboard-column-empty />
                                        }
                                    </p-taskboard-column-content>
                                </ng-template>
                            </p-taskboard-column>
                        }
                    </p-taskboard-content>
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
            <p class="mt-4 text-sm text-muted-color">Applied by the store: {{ applied() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class ExternalDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    private readonly source = signal<TaskBoardItem[]>(demoTasks('x'));

    readonly store = computed(() => this.source());

    readonly applied = signal(0);

    onCardMove(payload: TaskBoardCardMovePayload): void {
        // Un movimiento dentro de la misma columna llega también aquí; lo aplica `cardReorder`.
        if (payload.oldColumnId === payload.newColumnId) return;

        this.source.update((items) => items.map((item) => (item['id'] === payload.card['id'] ? { ...item, columnId: payload.newColumnId, order: payload.newIndex } : item)));
        this.applied.update((count) => count + 1);
    }

    onCardReorder(payload: TaskBoardCardReorderPayload): void {
        this.source.update((items) => {
            const cell = items.filter((item) => item['columnId'] === payload.columnValue).sort((left, right) => (left['order'] ?? 0) - (right['order'] ?? 0));
            const moving = cell.find((item) => item['id'] === payload.card['id']);
            if (!moving) return items;

            const rest = cell.filter((item) => item !== moving);
            const next = [...rest.slice(0, payload.newIndex), moving, ...rest.slice(payload.newIndex)];
            const orders = new Map(next.map((item, index) => [item['id'], index]));

            return items.map((item) => (orders.has(item['id']) ? { ...item, order: orders.get(item['id'])! } : item));
        });

        this.applied.update((count) => count + 1);
    }
}
