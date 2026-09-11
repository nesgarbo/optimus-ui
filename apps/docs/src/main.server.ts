// Must come first: it declares the server mode the rest of Angular reads. See the file.
import '@/app/server-mode';

import '@angular/platform-server/init';

import { AppComponent } from '@/app/app.component';
import { config } from '@/app/app.config.server';
import { render } from '@analogjs/router/server';

export default render(AppComponent, config);
