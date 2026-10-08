import { Routes } from '@angular/router';
import { ThemingStyledDemo } from './styled';
import { ThemingUnstyledDemo } from './unstyled';

const routes: Routes = [
    { path: '', redirectTo: 'styled', pathMatch: 'full' },
    {
        path: 'styled',
        component: ThemingStyledDemo
    },
    {
        path: 'unstyled',
        component: ThemingUnstyledDemo
    }
];

export default routes;
