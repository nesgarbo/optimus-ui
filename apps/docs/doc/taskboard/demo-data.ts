import type { TaskBoardColumnGroup, TaskBoardColumnModel, TaskBoardItem, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';

/**
 * The data the TaskBoard demos share.
 *
 * Every list is handed out through a function, not exported as a constant: the demos are writable
 * boards and two of them sharing one array would move each other's cards.
 */

/** The workflow columns of the delivery board. */
export function demoColumns(): TaskBoardColumnModel[] {
    return [
        { id: 'todo', label: 'To Do', statusType: 'todo', order: 0 },
        { id: 'in-progress', label: 'In Progress', statusType: 'in-progress', wipLimit: 4, order: 1 },
        { id: 'review', label: 'Review', statusType: 'in-progress', order: 2 },
        { id: 'done', label: 'Done', statusType: 'done', order: 3 }
    ];
}

/** The cards of the delivery board. */
export function demoTasks(prefix = 't'): TaskBoardItem[] {
    return [
        { id: `${prefix}1`, title: 'Design system audit', description: 'Review and document every existing design token.', columnId: 'todo', priority: 'high', tags: ['design'], assignee: 'Alice Chen', order: 0 },
        { id: `${prefix}2`, title: 'API rate limiting', description: 'Add rate limiting middleware to the public endpoints.', columnId: 'todo', priority: 'critical', tags: ['backend', 'security'], assignee: 'Carlos Ruiz', order: 1 },
        { id: `${prefix}3`, title: 'Onboarding flow redesign', description: 'Rework the first-run experience.', columnId: 'todo', priority: 'medium', tags: ['ux'], order: 2 },
        { id: `${prefix}4`, title: 'Dashboard performance', description: 'Trim the dashboard queries and virtualise the long lists.', columnId: 'in-progress', priority: 'high', tags: ['performance'], assignee: 'Diana Park', progress: 60, order: 0 },
        {
            id: `${prefix}5`,
            title: 'Auth refactor',
            description: 'Move from session cookies to JWT with refresh tokens.',
            columnId: 'in-progress',
            priority: 'critical',
            tags: ['backend', 'auth'],
            assignees: ['Eve Foster', 'Frank Lee'],
            progress: 35,
            order: 1
        },
        { id: `${prefix}6`, title: 'End-to-end suite', description: 'Cover the critical journeys.', columnId: 'review', priority: 'medium', tags: ['testing'], assignee: 'Grace Kim', progress: 90, order: 0 },
        { id: `${prefix}7`, title: 'CI pipeline', description: 'Bring the build under five minutes.', columnId: 'review', priority: 'low', tags: ['devops'], assignee: 'Hank Wang', order: 1 },
        { id: `${prefix}8`, title: 'Dark mode', description: 'System-aware dark mode across the product.', columnId: 'done', priority: 'medium', tags: ['ui'], assignee: 'Alice Chen', progress: 100, order: 0 },
        { id: `${prefix}9`, title: 'Error tracking', description: 'Wire up production error monitoring.', columnId: 'done', priority: 'high', tags: ['devops'], assignee: 'Carlos Ruiz', progress: 100, order: 1 }
    ];
}

/** The phase headers of the grouped board. */
export function demoGroups(): TaskBoardColumnGroup[] {
    return [
        { label: 'Planning', columns: ['todo'], color: '#3b82f6' },
        { label: 'Delivery', columns: ['in-progress', 'review'], color: '#f59e0b' },
        { label: 'Closed', columns: ['done'], color: '#10b981' }
    ];
}

/** The rows of the grouped board. */
export function demoSwimlanes(): TaskBoardSwimlane[] {
    return [
        { id: 'frontend', label: 'Frontend', order: 0 },
        { id: 'platform', label: 'Platform', order: 1 }
    ];
}

/** Cards for the grouped board, which carry a row as well as a column. */
export function demoSwimlaneTasks(): TaskBoardItem[] {
    return [
        { id: 's1', title: 'Login page redesign', columnId: 'todo', swimlaneId: 'frontend', priority: 'high', tags: ['ui'], assignee: 'Alice Chen', order: 0 },
        { id: 's2', title: 'Component library bump', columnId: 'todo', swimlaneId: 'frontend', priority: 'low', tags: ['chore'], order: 1 },
        { id: 's3', title: 'Queue back-pressure', columnId: 'todo', swimlaneId: 'platform', priority: 'critical', tags: ['infra'], assignee: 'Diana Park', order: 0 },
        { id: 's4', title: 'Route-level code split', columnId: 'in-progress', swimlaneId: 'frontend', priority: 'medium', progress: 45, order: 0 },
        { id: 's5', title: 'Blue-green deploys', columnId: 'in-progress', swimlaneId: 'platform', priority: 'high', progress: 70, assignee: 'Hank Wang', order: 0 },
        { id: 's6', title: 'Accessibility sweep', columnId: 'review', swimlaneId: 'frontend', priority: 'medium', tags: ['a11y'], order: 0 },
        { id: 's7', title: 'Backup restore drill', columnId: 'done', swimlaneId: 'platform', priority: 'high', progress: 100, order: 0 }
    ];
}
