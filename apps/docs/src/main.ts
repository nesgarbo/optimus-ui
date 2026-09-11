// Tailwind is its own entry so the Vite plugin owns it; Sass must not inline it.
import '@/assets/styles/tailwind/main.css';
import '@/assets/styles/global.scss';

import { AppComponent } from '@/app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
