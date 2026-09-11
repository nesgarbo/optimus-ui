import { appConfig } from '@/app/app.config';
import { DEMOS_JSON } from '@/service/demos-token';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The extracted demo sources, read once per build rather than requested per page.
 *
 * The prerender has the file on disk: `public/demos.json` while developing, and the copy
 * the client build emits once it has run. Reading it here is what puts the code of every
 * example into the prerendered HTML.
 */
function readDemos() {
    const candidates = ['public/demos.json', 'dist/client/demos.json', 'dist/analog/public/demos.json'].map((candidate) => path.resolve(process.cwd(), candidate));

    for (const candidate of candidates) {
        try {
            return JSON.parse(fs.readFileSync(candidate, 'utf-8'));
        } catch {
            /* try the next one */
        }
    }

    console.warn('! demos.json was not found, so the examples will render without their code');

    return null;
}

const demos = readDemos();

const serverConfig: ApplicationConfig = {
    providers: [provideServerRendering(), { provide: DEMOS_JSON, useValue: demos }]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
