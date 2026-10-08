<div align="center">
  <img src="https://optimus.openng.org/large-icon.svg" alt="Optimus UI" width="140" />
</div>

## Optimus UI docs

The documentation site of [Optimus UI](https://optimus.openng.org/). It is an Angular 22 app, zoneless, with SSR and prerendering, that consumes the library from `packages/optimus-ui` through the workspace.

## Run it

From the repository root:

```bash
pnpm install
pnpm --filter docs start        # ng serve on http://localhost:4200 (dev, client side only)
pnpm --filter docs start:ssr    # ng serve with the SSR + prerender configuration
```

The docs import the library through `@openng/optimus-ui/*`, so build it first when you change it: `pnpm --filter @openng/optimus-ui build` (or `pnpm run build:lib` at the root).

## Build

```bash
pnpm --filter docs build
```

Always build with `pnpm build`, not with a bare `ng build`. The script first regenerates the files the Angular build reads (`doc/apidoc/index.json`, `.demos/` and `public/demos/`, the `llms` markdown, `router/routes.txt` and `public/sitemap.xml`). A bare `ng build` uses whatever is on disk, and a stale `router/routes.txt` silently leaves new pages out of the prerender.

The production build has size budgets in `angular.json` (initial bundle and component styles): a warning flags a regression, an error fails the build.

## Generated files

None of these are committed. Regenerate them when the thing they read changes.

| Script                          | Writes                                          | Run it when                                     |
| ------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `pnpm build:apidoc`             | `doc/apidoc/index.json`, `api-generator/`       | the public API of a component changes           |
| `pnpm build:democode`           | `.demos/demos.json`, `public/demos/*.json`      | a demo in `doc/<component>/` changes            |
| `pnpm build:llm-docs`           | `public/llms/`                                  | any doc page changes                            |
| `pnpm build:routes`             | `router/routes.txt` (the prerender manifest)    | a page or route is added, removed or renamed    |
| `pnpm build:sitemap`            | `public/sitemap.xml`                            | after `build:routes`                            |
| `pnpm test:democode`            | nothing, validates the generated demo code      | after `build:democode`                          |
| `pnpm test:stackblitz`          | nothing, opens demos in StackBlitz (needs net)  | before a release, not on every build            |

## Folders

| Folder               | What is in it                                                                          |
| -------------------- | -------------------------------------------------------------------------------------- |
| `app/`               | Bootstrap (`main.ts`) and the application config (`app.config.ts`).                   |
| `router/`            | `app.routes.ts`, one lazy route per page, and the generated `routes.txt`.              |
| `pages/<name>/`      | One page per component or guide: `index.ts` (the page) and `routes.ts`.                |
| `doc/<name>/`        | The sections of a page: one `*-doc.ts` component per section, each with its own demo.  |
| `components/`        | The docs shell: layout, menu, code viewer (`doc/app.code`), StackBlitz templates.      |
| `assets/data/`       | `menu.json`, the sidebar of the site.                                                  |
| `public/`            | Static files served as is: images (`demo/`), logos, generated `demos/` and `llms/`.    |
| `server/`            | SSR entry (`server.ts`, an Express app) and the server application config.             |
| `scripts/`           | The generators listed above.                                                           |
| `themes/`            | The theme preset the docs run with.                                                    |

## Add a component page

Take `pages/mention/` and `doc/mention/` as a model.

1. Create the sections in `doc/<name>/`. Each one is a standalone component with an `<app-docsectiontext>` and a demo, ending with `<app-code></app-code>`, which shows the code of the component itself (it is read by `build:democode`). Add an `import-doc.ts` that shows the import.
2. Create `pages/<name>/index.ts` with an `<app-doc>` that lists the sections in `docs`, names the classes to document in `[apiDocs]` (they must exist in `doc/apidoc/index.json`) and, if the component has styling tokens, `themeDocs`.
3. Create `pages/<name>/routes.ts` exporting `[{ path: '', component: <Name>Demo }]`.
4. Register the page in `router/app.routes.ts`, as a lazy `loadChildren` child of `AppMainComponent`.
5. Add the entry to `assets/data/menu.json` (use `"badge": "New"` for a new component).
6. If the demo needs a CSS file from a third-party library (maplibre, univer), load it with `usePageStyle` instead of adding it to the global styles. If it needs a heavy library on StackBlitz, add it to `componentDependencies` in `components/doc/codeeditor/templates.ts`.
7. Run `pnpm build:apidoc && pnpm build:democode && pnpm build:routes` and open the page.

Unknown URLs render the not-found page in place and answer with a 404 status when served by the SSR server.
