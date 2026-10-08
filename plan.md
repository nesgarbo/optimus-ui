# Plan: auditoría del repo (2026-10-08)

Leyenda: `[ ]` pendiente · `[~]` en curso · `[x]` hecho · `[-]` descartado (con motivo).

Los hallazgos salen de una auditoría de solo lectura hecha por 4 agentes. Nadie los ha reverificado a mano, así que comprueba cada uno antes de tocarlo. Las líneas son aproximadas.

El plan anterior (nuevos componentes) está en `plan-old.md`. Sigue en el historial de git como `plan.md`.

## Registro de trabajo

Anota aquí lo que se está haciendo (fecha, qué, commit).

- 2026-10-08. P0 terminado, sin commit:
  - `plan-old.md` borrado (sin pendientes).
  - `eslint.config.js` migrado a flat config. 0 errores y ~17k warnings.
  - Scripts `lint` y `lint:fix` sin `--ext` ni `--ignore-path`.
  - `nightly.yml` corregido.
  - Catalog `angular22`: core, router, etc. a ^22.2.1 y cdk a ^22.2.2. `pnpm install` hecho y build de la lib OK.
  - Overrides de `source-map-js` y `postcss-selector-parser`.
- 2026-10-08. Cuarto tramo, P5 a P8 (sin commit al escribir esto): ver "Resultado de P5 a P8" al final de P8. Verificado: formato, 0 errores de lint, 0 vulnerabilidades, builds de la lib, themes y docs (incluido producción con prerender), y 8761 tests (8760 pasan, 1 skip).
- 2026-10-08. Tercer tramo (sin commit). Estado: prettier limpio, 0 errores de lint, build de la lib y de la docs OK, 8483 de 8484 tests pasan antes de arreglar el test del zoom (ya arreglado).
  - Decisiones: `Eager` devuelto a los componentes que mutan en sitio (submenús, `TreeTable`, `TTBody`, `TTScrollableView`, `DynamicDialog`, `organizationchart`, `Table`, `TableBody`); default de `wheel` en charts vuelve a `true` (Fase B: Ctrl); `SafeHtmlPipe` de `menu` sanitiza (se avisa en las notas de migración).
  - Revisión en Chromium real de `datepicker`, `password`, `inputmask`, `scrolltop`, `multiselect` y `autocomplete`: botones de limpiar y mostrar de `password` e `inputmask` medían 0x0 (arreglado con CSS), `password` perdía el foco al alternar (un solo botón), y `scrolltop`, `autocomplete`, `multiselect`, `datepicker` y `password` vuelven a `[ngStyle]` en los inputs de estilo del usuario para conservar claves con unidad.
  - Bugs arreglados: `listbox` (`filterViewChild`, doble `onChange`), `select` (`optionsChanged`), `confirmpopup` (foco de botones), `table` (timer de `onColReorder`, `localStorage` sin `try/catch`, sort que mutaba el input), `signature` (NG0953 al destruir con valor pendiente), `password` (timers sin cancelar).
  - Rendimiento: `scroller` ya no dispara CD por cada `scroll` (listener nativo fuera de zona); charts SVG reutiliza nodos entre frames (`svg-node.ts`); scroll handler fuera de zona en `password`, `datepicker`, `menu`, `tieredmenu` y `table`.
  - Accesibilidad e i18n: botón accesible en los iconos de limpiar de `treeselect`, `datepicker` y `autocomplete`; inputs `messages` en `cropper`, `map`, `pdfeditor` y `blockeditor`; `aria-label` de charts traducible (es, de, fr, pt, it sin revisar por nativos).
  - Docs: páginas nuevas de etiquetas e i18n, sección "Behavior Changes in 2.x" en migración; CSS de maplibre y univer cargados solo en `/map` y `/spreadsheet`; `viewport` sin `user-scalable=no`.
  - Botones de limpiar de `treeselect`, `datepicker` y `autocomplete` revisados en Chromium real: miden 14x14, sin solape, foco y teclado OK. Arreglado en `treeselect`: pulsar el botón también abría el overlay (el host escucha `mousedown`). Sin verificar: tamaños small y large (sus demos no tienen `showClear`) y devolver el foco al input tras limpiar con teclado.
  - Test flaky arreglado: `chart-root.test.ts` ("chart zoom wheel") esperaba al listener con un `waitFor` en vez de asumir que estaba enlazado.
- 2026-10-08. Fase A, segundo tramo (14 agentes en paralelo, sin commit). Verificación final: prettier limpio, lint 0 errores, build de la lib OK, tests 8440 de 8442 pasan (los 2 fallos son de `charts/chart-root.test.ts` "chart zoom wheel" y pasan 3 de 3 al correrlos solos, así que son flaky bajo carga).
  - Hecho en todos los componentes clásicos y nuevos: control flow (`@if`, `@for`, `@switch`), `[ngClass]`/`[ngStyle]` a `[class]`/`[style]`, `inject()` en lugar de constructor, `output()` donde era seguro, limpieza de timers y listeners al destruir, listeners fuera de zona con `markForCheck` o signal al cambiar algo visible.
  - Bugs corregidos por el camino: fugas de listeners en `tieredmenu`, `contextmenu`, `dock`, `knob`, `scrollpanel` y `splitter`; `carousel.numScroll` devolvía `_numVisible`; typos y variables inexistentes en `cascadeselect`, `picklist`, `multiselect`, `metergroup` y `tooltip`; `rating.stars` no reaccionaba; `map` perdía capas al cambiar de estilo; `pdfeditor` con races y worker en el hilo principal; SQL injection en `querybuilder`; CSV injection en `spreadsheet` y `charts`; PDF de charts con tamaño de imagen incorrecto; `inputnumber` sin `onDestroy`.
  - Charts: decimación, hit-test con caché y búsqueda binaria, teclado (flechas, Home, End, Escape), zoom con pointer capture, 12 archivos de test nuevos (186 tests).
  - Tests nuevos en total: unas 230 pruebas.
  - `organizationchart` vuelve a `Eager` con un comentario: con OnPush un `TreeNode` mutado desde fuera deja de repintar, y un agente había cambiado el test para ocultarlo. Se restauró el test original.
- 2026-10-08. Fase A, primer tramo (sin commit):
  - Capa base revisada (`basecomponent`, `baseinput`): ya usa `input()` y no depende de zone.js. No hay nada que migrar.
  - OnPush: 62 componentes pasan de `Eager` a `OnPush` (54 iconos, `inputgroup`, `inputgroupaddon`, `metergroup`, `api/shared`, `motion`, `inplace`). Avisos de `prefer-on-push`: 84 a 22. Tests: 8266 de 8267 pasan.
  - `organizationchart` se queda en `Eager`: con OnPush falla el test "should render correct icon based on expansion state" (el icono no se actualiza al expandir). Hay que arreglar el cambio de estado antes de pasarlo.
  - Control flow: el schematic `@angular/core:control-flow` no sirve tal cual. Se probó y se revirtió: quitó `CommonModule` de `accordion`, `inplace` y `stepper`, pero sus templates aún usan directivas de `CommonModule`, y rompió 167 tests. Además falla con "duplicate ng-template name" (table, tieredmenu) y "more than one alias" (treeselect). La migración queda manual, por componente.
  - `pdfeditor.test.ts` ("opens a document, draws its page...") falla a veces bajo carga con `expected 0 to be greater than 50` (comprueba píxeles) y pasa solo. Test flaky; ver P8.
- 2026-10-08. Dependencias actualizadas (sin commit):
  - Patch y minor en todo el workspace con `ncu` (incluye `tsdown` 0.23, prosemirror, postcss, `@angular-eslint` 22.5 y demás).
  - `ng-packagr` 22.2.4: `ButtonIconPosition` se exportaba dos veces. Ahora vive solo en `types/button/button.types.ts` y `button.ts` la importa.
  - docs: Tailwind 4 con `@tailwindcss/postcss` y `.postcssrc.json`. `main.css` usa `@import 'tailwindcss'` y `@config`. `autoprefixer` eliminado. `@docsearch/js` 5 (import desde `@docsearch/js/docsearch`, opción `indices`).
  - ESLint 10 y `@eslint/js` 10. Se quitaron `eslint-plugin-import`, `-jsdoc`, `-prefer-arrow` y `-prettier` (sin uso).
  - vitest 5: 8267 tests pasan.
  - pnpm 12.10.1 (`packageManager`). `pnpm audit --prod` da 0 vulnerabilidades.
  - Sin actualizar: TypeScript 7 (Angular compiler-cli y ng-packagr exigen `>=6.0 <6.1`). Tailwind 3 en `optimus-ui-tailwindcss` y en el playground v3 (es el plugin v3 y su prueba).

## P0 - Desbloquear build y CI

- [x] **Lint roto.** 0 errores, ~17k warnings. `eslint.config.js` es formato eslintrc dentro de un flat config de ESLint 9. Migra a flat config (typescript-eslint + angular-eslint) o a oxlint. Quita `--ext` e `--ignore-path` de los scripts `lint` y `lint:fix`.
- [x] **Audit HIGH.** Resuelto: router 22.2.1 y Tailwind 4 en docs. `pnpm audit --prod` da 0 vulnerabilidades. `@angular/router` 22.1.4 (`>=22.0.0 <22.2.0`). Sube el catalog `angular22` de `pnpm-workspace.yaml` a `^22.2.0` y regenera el lock. `security:check` rompe `build` y CI.
- [x] **protobufjs.** Ya estaba en `false` en HEAD. `allowBuilds.protobufjs` en `pnpm-workspace.yaml` tiene el placeholder "set this to true or false". Fija `true` o `false`. Bloquea `pnpm run/exec`.
- [x] **nightly.yml.** El `if` usa `openng-fundation/open-prime`. El repo es `openng-org/optimus-ui`.

### Seguimiento del lint

- [x] Los 22 errores están corregidos. El único cambio de comportamiento está en `docs/doc/icons/list-doc.ts` (el sort comparaba `<` dos veces). `getCSSVariableByRegex`, `scroller.scrollToIndex` y los `typeof ... !== undefined` de docs son arreglos de seguridad.
- [x] `datepicker.ts` (`constrainTime`): los `case` duplicados se dejaron con `eslint-disable no-duplicate-case`. Son ramas inalcanzables heredadas; revisa la lógica de min/max hora en P1.
- [x] Reglas de estilo puro (`padding-line-between-statements`, `member-ordering`) apagadas: prettier no las cubre y daban 12k warnings sin valor. `no-unused-vars` base apagada en TS (duplicaba a la de typescript-eslint).
- [x] Reglas de modernización en `warn` como métrica de avance (ver P2): `prefer-signals`, `prefer-signal-model`, `prefer-output-emitter-ref`, `prefer-standalone`, `prefer-on-push-component-change-detection`, `prefer-inject` y `template/prefer-control-flow`. Súbelas a `error` por directorio cuando llegue a 0 (ver P2).
- [x] `lint` añadido a CI (job `checks`). 0 errores, ~8k warnings.
- [-] oxlint: descartado por ahora. No cubre `angular-eslint` ni el lint de templates. Se puede añadir como complemento en pre-commit más adelante.
- [x] `eslint.config.js` renombrado a `eslint.config.mjs` (evita el aviso de módulo sin tipo).

## P1 - Bugs funcionales y seguridad

- [x] **querybuilder SQL** (`querybuilder/querybuilder-engine.ts:377-399`). `rule.field` va crudo al SQL (`quote` por defecto es identidad). (verificado en `querybuilder-engine.ts`: IDENTIFIER, ESCAPE, `1=0`, MAX_DEPTH, `track key`)
  - Valida el field contra `columns` o con un regex de identificador.
  - Escapa `%` y `_` con `ESCAPE`.
  - `in` vacío debe dar `1=0`.
  - `isempty` en SQL no coincide con `evaluate`.
  - `evaluate` rompe si el valor de `in` no es array.
  - El tokenizador solo acepta ASCII.
  - El parser recursivo no limita la profundidad.
  - `track $index` en reglas hijas reutiliza el estado del editor equivocado.
- [x] **map pierde capas al cambiar de estilo** (`map/map-layer.ts:93-140`, `map.ts:251-253,371-374`). Añade una señal `styleVersion` que `style.load` incrementa y que leen los effects de capa y marcador. (verificado: `styleVersion` en `map.ts:226,390` y `map-layer.ts`)
- [x] **charts decimación** (`charts/charts-state.ts:301,712-736`). `decimated(points, continuousX)` ignora el parámetro, aplica LTTB a barras y heatmap y descarta los `null`. (verificado en `charts/core/decimate.ts:282`)
- [x] **charts teclado** (`features/chart-accessibility.ts:96`, `chart-a11y-view.ts:87`, `locales.ts`). Implementa flechas, Home y End sobre `setHover`, o quita el hint. (verificado: `charts/render/keyboard-nav.ts` y su test)
- [x] **pdfeditor race en `open()`** (~815-845). Comprueba el token tras cada `await` dentro de `open()`. (verificado: `stale()` y `openToken` en `pdfeditor.ts:847`)
- [x] **pdfeditor `renderPage`** (`pdf-render.ts:85`). `loadPdfJs()` sin opciones ignora `workerSrc` y carga el worker en el hilo principal. (verificado: `renderPage` reutiliza la lib ya cargada, `pdf-render.ts:93`)
- [x] **`import()` async tras destroy.** Añade un flag `destroyed` o un token y destruye lo creado. Afecta a `blockeditor.ts:288-331`, `cropper.ts:297-349`, `map.ts:313-379` y `pdfeditor.ts` (`open()`). (verificado: flag `destroyed` en blockeditor, cropper, map y token en pdfeditor)
- [x] **XSS opt-in.** Pasa por `DomSanitizer.sanitize(SecurityContext.HTML, v)` en tooltip (`escape:false`, `tooltip.ts:606-609`) y en `SafeHtmlPipe` (`menu/menu.ts:56-65`). En SSR la pipe devuelve el string sin sanear. (verificado: `tooltip.ts:639` y `menu.ts:62`)
- [x] **blockeditor `normalizeUrl`** (`block-commands.ts:59`). Acepta `//evil.com`. (verificado: `block-commands.ts:60` rechaza `//` y `/\`)
- [~] **CSV injection.** Neutraliza celdas que empiezan por `= + - @` en `charts/core/export.ts:279-286`, `charts-state.ts:865-875`, `chart-export-menu.ts:244-255` y `spreadsheet-data.ts:130-141`. Reusa el defuse de `gantt-export.ts:11-20`. Añade BOM UTF-8. No revoques el objectURL de forma síncrona. (hecho con `csvCell`, `gantt` y `spreadsheet` con BOM; falta el BOM UTF-8 en el CSV de charts (`chart-export-menu.ts:336`, `charts/core/export.ts`))
- [x] **charts PDF export** (`export.ts:229`). `/Width` y `/Height` usan el tamaño CSS y no los píxeles del JPEG. (verificado: `export.ts:288` usa los píxeles del JPEG)
- [x] **spreadsheet `parseCsv`** (`spreadsheet-data.ts:153-157`). Pierde los ceros a la izquierda ("00123" pasa a 123). (verificado: `spreadsheet-data.ts:147` conserva los ceros a la izquierda)
- [x] **cropper** (`cropper.ts:304`). Con `src` vacío marca el control como dirty en el primer effect. `role="img"` envuelve controles interactivos. (verificado: `cropper.ts:312`, el stage es `role="group"`)
- [x] **barcode** (`barcode.ts:146-148,220-224`). El `computed` relanza errores que no son `BarcodeError`. El logo sin `crossOrigin` rompe `exportAsBase64`. (verificado: `barcode.ts:151` y `crossOrigin` condicional en `:232`)
- [x] **galleria** (`galleria.ts:690-706`). Añade `onDestroy` con `stopSlideShow()` y `clearInterval` al inicio de `startSlideShow`. (verificado: `clearSlideShowInterval` y `onDestroy` en `galleria.ts:711-731`)
- [x] **fileupload** (`fileupload.ts:965-1011,1055-1059,670,847,940`). Guarda y cancela la `Subscription`. En el error, `markForCheck` y resetea `progress`. Revoca los objectURL en `remove`, `clear` y `onDestroy`. `remove()` no llama a `markForCheck`. (verificado: `uploadSubscription`, `revokeUnusedObjectURLs` y `markForCheck` en `fileupload.ts`)
- [~] **table** (`table.ts`). (hecho: `filterTimeout`, `colReorderTimeout` y listener touch; falta `try/catch` en `JSON.parse` y `setItem` (`table.ts:3013,3038,3158`) y `this.value.sort` sigue mutando el input (`table.ts:1680`))
  - `JSON.parse` y `setItem` de localStorage sin `try/catch` (~2993, 3018, 3138).
  - `onDestroy` no limpia `filterTimeout` ni el listener touch de `ResizableColumn`.
  - `value.sort` muta el input (~1670).
- [x] **tooltip** (`tooltip.ts:237-270,321`). Cambiar `tooltipEvent` en caliente no vuelve a enganchar los listeners. En modo `focus`, `target` puede ser null. (verificado: re-bind al cambiar `tooltipEvent` en `tooltip.ts:392`)
- [x] **listbox** (`listbox.ts:255`). `[attr.ariaPosInset]` debe ser `[attr.aria-posinset]`. (verificado: `listbox.ts:262` usa `aria-posinset`)

### Resto pendiente (auditoría)

Auditado el 2026-10-08 contra el código actual: 17 de 19 ítems hechos, 2 parciales. Queda, por prioridad:

1. [x] **table, estado en localStorage** (`table/table.ts:3013,3038,3158`). `JSON.parse` y `setItem` sin `try/catch`. Esfuerzo S.
2. [x] **table, sort muta el input** (hecho: ordena una copia) (`table/table.ts:1680`). Ordena `this.value` en sitio antes de copiar. Ordena una copia. Esfuerzo S.
3. [x] **charts, BOM UTF-8 en el CSV** (`charts/features/chart-export-menu.ts:336`, `charts/core/export.ts`). Gantt y spreadsheet ya lo llevan. Esfuerzo S.

## P2 - Fase A: modernización compatible (zoneless, OnPush y signals internos)

Dirección técnica. La librería debe funcionar igual con zone.js y sin él (la docs ya es zoneless), y el código nuevo o tocado sigue estas reglas:

- **Zoneless-first.** Ningún componente depende de zone.js para repintar. Todo cambio visible pasa por un signal o por `markForCheck`. Nada de `ngDoCheck` ni de `NgZone.onStable` para sincronizar estado. `runOutsideAngular` se puede usar, pero un listener externo que cambie estado debe escribir en un signal.
- **OnPush en todos los componentes.** Sin `ChangeDetectionStrategy.Eager` salvo justificación escrita.
- **Signals en el interior.** (La API pública sigue igual en Fase A; ver abajo.) `input()`, `input.required()`, `output()`, `model()`, `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`, `computed`, `effect`, `linkedSignal` y `inject()`. En Fase A: `viewChild`, `contentChild`, `inject()` y `host: {}` en lugar de `@ViewChild`, `@ContentChild`, constructor, `@HostListener` y `@HostBinding`. `@Input` y `@Output` se mantienen salvo lo permitido arriba.
- **Control flow nativo.** `@if`, `@else`, `@for (... ; track ...)`, `@switch`, `@let` y `@defer`. Sin `*ngIf`, `*ngFor`, `*ngSwitch`, `NgClass` ni `NgStyle` (usa `[class]` y `[style]`).
- **Estado fuera de zona = signal.** Timers, observers y listeners crean o actualizan signals, y se limpian con `DestroyRef`.
- **Observables.** `subscribe` solo con `takeUntilDestroyed`. Prefiere `toSignal` y `rxResource`.
- **Tests zoneless.** Los tests de cada componente migrado corren sin zone.js (`provideZonelessChangeDetection`) y con `await fixture.whenStable()`.

### Fase A: sin romper la API pública (decidido 2026-10-08)

Todo esto sale en 2.x y no cambia cómo se usa ningún componente:

- Los inputs mantienen `@Input()` y su forma. Si el componente necesita reaccionar al valor, guarda el valor en un signal privado con un setter y un getter (`private _x = signal(...)`; `@Input() set x(v) { this._x.set(v) }`; `get x() { return this._x() }`). Los consumidores siguen leyendo y escribiendo `instance.x`.
- Los outputs pasan de `EventEmitter` a `output()` solo donde nadie usa operadores rxjs sobre ellos. Si no hay seguridad, se queda como está.
- `viewChild`, `contentChild`, `inject()`, `host: {}`, control flow, OnPush y limpieza con `DestroyRef` son cambios internos y se hacen sin restricción.
- Los métodos y propiedades públicas mantienen firma y tipo. Si algo público tiene que cambiar, no se hace aquí y se apunta en Fase B.
- Cada componente tocado conserva sus tests y gana uno zoneless.
- Se hace por componente y con commit propio, para que el merge con upstream de PrimeNG siga siendo posible.

### Orden de trabajo

- [x] Decisión: Fase A (compatible) ahora; Fase B (3.0) al final.
- [x] Capa base: `basecomponent` y `baseinput` ya usan `input()` y son zoneless-safe. Falta revisar `baseeditableholder`, `basemodelholder` y `bind` (no se ha hecho).
- [ ] Después por familias, de menos a más acoplada: iconos y botones, formularios simples, overlays, listas y árboles, `table` y `treetable`, `scheduler`.
- [ ] Componentes nuevos (charts, gantt, map...) ya nacen en signals. Revisa que cumplan las reglas de arriba y corrige las desviaciones.
- [~] `ChangeDetectionStrategy.Eager`: quedan `Table`, `TableBody` (mutan filas, `selection` y `expandedRowKeys` en sitio) y `organizationchart` (2), todos con comentario. Antes eran 22 usos. Pasa cada uno a OnPush y arregla lo que falle, o justifícalo con un comentario. Faltan `contextmenu`, `dynamicdialog`, `megamenu`, `menu`, `menubar`, `multiselect`, `panelmenu`, `scroller`, `select`, `table` (5), `tieredmenu`, `treetable` (5) y `organizationchart` (2, ya probado: falla un test).
- [ ] Quita `ngDoCheck`, `ngAfterContentChecked` y `ngAfterViewChecked` que mutan estado.
- [~] Revisa los componentes que mutan inputs y los que cambian estado desde listeners nativos sin signal ni `markForCheck`.
- [ ] Pasa `subscribe(next, error)` a observer object (fileupload) y usa `takeUntilDestroyed`.
- [ ] Añade `track` donde falta (datepicker 174, 262, 268, 298 y 306; carousel 70, 83, 97 y 132; autocomplete 145; table 5540 y 5569; multiselect 240) al migrar a `@for`.
- [x] Migra `*ngIf`, `*ngFor` y `*ngSwitch` a control flow, a mano y por componente. Hecho; ya no queda ninguno en `packages/optimus-ui/src`. (Texto original:) Quedan unos 330 usos en 15 componentes: datepicker (54), multiselect (39), picklist (36), select (29), fileupload (25), autocomplete (24), listbox (21), contextmenu, carousel, dialog y tieredmenu (17 cada uno), table (15), confirmpopup (7), confirmdialog (5) y treeselect (1). Después de cada componente: quita de `imports` solo lo que ya no se use y corre sus tests.
- [x] Migra `[ngClass]` y `[ngStyle]` a `[class]` y `[style]`. Hecho. (Texto original:) Hay unos 220 usos (panelmenu 22, contextmenu 9, autocomplete 7, menubar 8, datepicker 8, slider 7, inputnumber 5 y el resto con menos).
- [ ] Docs y demos: migra sus snippets a signals y a control flow (`doc/**` y `pages/**`) cuando cambie cada componente.
- [ ] Prueba la lib en una app con zone.js y en otra zoneless (smoke test en CI).

### Pendiente tras el segundo tramo de Fase A

Cosas que los agentes no hicieron o que conviene revisar. Nada de esto está verificado en un navegador real, solo con la suite de tests.

- [ ] **Revisar a mano en un navegador:** `datepicker` (`[class]="dayClass(date)"` recibe una clave vacía sin rango), `multiselect` y `autocomplete` (`inputStyle` y `panelStyle` con claves con unidad como `'width.px'` ya no funcionan con `[style]`), `password` e `inputmask` (ahora hay un `<button>` envolvente en los iconos: cambia el DOM, el foco y los selectores CSS) y `scrolltop` (`style` va al `<button>` interno, no al host).
- [x] **Mutaciones en sitio con OnPush.** Devueltos a `Eager`, con comentario: `MenuItemContent`, `MenubarSub`, `MegaMenuSub`, `TieredMenuSub`, `ContextMenuSub`, `PanelMenuSub`, `TreeTable`, `TTBody`, `TTScrollableView` y `DynamicDialog`. Mutar un item o un nodo en sitio (`item.disabled = true`) es habitual y OnPush no lo ve. Fase B: pasarlos a signals y entonces a OnPush.
- [ ] **`output()` frente a `EventEmitter`.** Emitir tras destruir lanza NG0953. Los agentes cancelaron los timers, pero `Table.onColReorder` (`setTimeout(saveState)`) sigue sin cancelarse.
- [ ] **`EventEmitter` que se quedaron** porque el código emite sin argumento y `output<T>()` no compila sin cambiar el tipo: `Menu.onFocus`, `ContextMenu.onShow` y `onHide`, `SpeedDial.onShow` y `onHide`, `SplitButton.onMenuShow`, `onMenuHide` y `onDropdownClick`, `Inplace.onActivate` y `onDeactivate`, `FileUpload.onClear`, `Galleria` (`startSlideShow` y `stopSlideShow` de dos clases), `Overlay.onHide` (`treeselect` usa `.pipe`), `UIChart.onDataSelect` (tipo público). Se resuelven en Fase B.
- [x] **`SafeHtmlPipe` de `menu`** (decidido: se queda así, es seguridad; avisar en el changelog) ahora sanitiza de verdad: quita `style` y similares de las etiquetas HTML. Es intencionado, pero cambia lo que se ve si alguien lo usaba.
- [ ] **`charts`:** el default de `wheel` vuelve a `true` (zoom con rueda sin modificador) para no cambiar el comportamiento en 2.x. Fase B: pasarlo a `{ modifierKey: 'ctrl' }` porque secuestra el scroll de la página. Un valor nulo en el tooltip ya no se muestra como 0. La leyenda es `role="group"`. Los strings numéricos se leen como número. Sigue pendiente separar la capa hover del SVG y cachear los nodos entre frames. `chart.js/auto` sigue sin tree-shaking.
- [ ] **`querybuilder`:** `toSql` ahora lanza si el campo no es una columna declarada ni un identificador válido. `isempty` incluye `IS NULL`.
- [ ] **`gantt`:** con más de 150 filas se virtualiza. Revisa visualmente con muchas filas y con enlaces a filas fuera de ventana.
- [ ] **Fallos y flakies de tests:**
  - `pdfeditor.test.ts`: 3 tests de "text the standard fonts cannot show" fallaron en un grupo bajo carga (`LiberationSans-Regular.ttf`); en la suite completa pasan.
  - `charts/chart-root.test.ts` ("chart zoom wheel") falla a veces bajo carga y pasa solo.
  - `spreadsheet.test.ts` agota el tiempo bajo carga (Univer).
- [ ] **Faltan traducciones:** `aria.showPassword` y `aria.hidePassword` en `api/translation.ts` y `config/optimus.ts` (password usa un fallback en inglés).
- [ ] **Docs:** documenta los inputs nuevos (`messages` de gantt, `valueDebounce`, `padLabel`, `ariaLabel` de charts, `startErrorMessage`, `defaultLabel`...), el nuevo default de `wheel` y el teclado de `ChartAccessibility`.
- [ ] **Bugs encontrados y no tocados:** `listbox` (`@ViewChild('filter')` no coincide con `#filterInput`; `onToggleAll` emite `onChange` dos veces), `select` (`optionsChanged` nunca es `true`), `confirmpopup` (`viewChild('acceptButton')` y `viewChild('rejectButton')` no existen en la plantilla), `datepicker` y `scheduler` (`ngAfterViewChecked` deliberados).
- [ ] **Zona:** `select`, `datepicker`, `password`, `table`, `menu` y `tieredmenu` construyen `ConnectedOverlayScrollHandler` sin zona. Pasa `this.zone` (el callback debe escribir un signal o llamar a `markForCheck`).
- [ ] **No hecho:** `onAfterViewChecked` de `BaseComponent` (`setAttrs` en cada CD; podría pasar a un `effect`), `@ViewChild`, `@ContentChild`, `@HostListener` y `@HostBinding` a signals y `host: {}` (la mayoría es Fase B por ser públicos), tests zoneless nuevos, `Scheduler` con `afterRenderEffect`, textos hardcodeados sin i18n en parte de gantt (`DEFAULT_COLUMNS` y mensajes del modelo).

### Métricas (avisos de lint, solo `packages/optimus-ui/src` sin tests; actualizado tras el segundo tramo)

| Regla | Avisos |
|---|---|
| `prefer-signals` | 2924 |
| `prefer-output-emitter-ref` | 16 |
| `template/prefer-control-flow` | 0 |
| `prefer-inject` | 3 |
| `prefer-on-push-component-change-detection` | 4 |
| `prefer-standalone` | 48 |

- [ ] Cuando una carpeta llegue a 0 en una regla, súbela a `error` solo para esa carpeta (bloque `files` en `eslint.config.mjs`) para que no retroceda.

### Hallazgos nuevos de la auditoría

Revisados `table`, `treetable`, `select`, `multiselect`, `autocomplete`, `datepicker`, `fileupload`, `carousel`, `galleria`, menús, `dialog`, `overlay`, `popover`, `tooltip`, charts, `map`, `pdfeditor` y `gantt`. No hay bugs graves nuevos: los archivos tocados tienen sus `addEventListener` compensados, los listeners fuera de zona vuelven con `zone.run` o `markForCheck`, los timers se cancelan al destruir y no hay `@for` sin `track`. Queda esto, de más a menos importante:

- [ ] **overlay re-entra en la zona en cada evento** (`overlay/overlay.ts:650-655,677-690,704-712,730-745`). Los listeners de click, scroll, resize y teclado se registran fuera de zona, pero llaman a `this.zone.run(() => this.listener(...))` en cada evento, y `select`, `multiselect` y los demás siempre pasan `listener`. Con zone.js eso lanza CD en cada click y scroll de la página mientras hay un overlay abierto, y anula la mejora. Llama al `listener` fuera de zona y entra solo con `valid`. Esfuerzo S.
- [ ] **Scroll handlers sin zona** (`password/password.ts:357`, `datepicker/datepicker.ts:3874`). Construyen `ConnectedOverlayScrollHandler` sin `this.zone`: con zone.js cada scroll lanza CD mientras el panel está abierto. Pasa `this.zone`; los callbacks llaman a `hideOverlay`, que ya marca para CD. Esfuerzo S.
- [ ] **Texto del plan desactualizado** (P2, "Orden de trabajo", `ChangeDetectionStrategy.Eager`). Hoy hay 14 usos en 10 archivos (`table`, `treetable`, `menu`, `menubar`, `megamenu`, `tieredmenu`, `contextmenu`, `panelmenu`, `dynamicdialog`, `organizationchart`). Revisa que cada uno tenga su comentario. Esfuerzo S.

## P3 - Rendimiento

### Zona de Angular (zoneless-first, ver P2)

La docs es zoneless, pero la lib debe valer con y sin zone.js. Cada arreglo de abajo tiene dos reglas: el listener no dispara CD si no cambia nada visible, y si cambia algo visible escribe en un signal (o llama a `markForCheck`) en lugar de depender de la zona.

- Con zone.js: listeners de alta frecuencia en `runOutsideAngular`, y vuelve a la zona solo si hace falta emitir.
- Sin zone.js: `runOutsideAngular` no hace nada, así que el coste lo evita el propio código (rAF, comprobar si cambia el valor antes de escribir el signal).
- Prueba cada componente tocado en los dos modos.

- [x] chart-zoom (`382-392,556-563`) y chart-navigator (`372-375`): el `pointermove` es de toda la ventana. (verificado: listeners en `runOutsideAngular` en `chart-zoom.ts:603`, navigator solo durante el arrastre)
- [x] map: crear `new lib.Map` fuera de zona. (verificado en `map.ts:338`)
- [x] texteditor: `scroll` capture (`texteditor.ts:1894-1895,2319`), `texteditor-popover.ts:164-171`, `texteditor-navigator.ts:87-88`. (verificado en `texteditor.ts:1898`, `-popover.ts:181` y `-navigator.ts:102`)
- [x] megamenu (`1266-1275`), menubar:1237, contextmenu:730 y 1329, tieredmenu:1309, overlay:698. (verificado: `runOutsideAngular` en los cinco y en `overlay.ts`)
- [~] `dom/connectedoverlayscrollhandler.ts:16-19`. Añade `passive:true` y `runOutsideAngular`. (el handler ya admite `zone` y `passive`; `password.ts:357` y `datepicker.ts:3874` no le pasan `this.zone`)
- [~] scroller (`scroller.ts:53`). El `(scroll)` con CD Eager: actualiza el signal solo si cambia el rango (`isRangeChanged`). (`scrollTimeout` y `resizeTimeout` limpios; el `(scroll)` sigue en la plantilla (`scroller.ts:34`) y dispara CD por evento)
- [x] mention (`selectionchange` de `document`), signature, dashboardlayout, gantt, gauges (rAF por frame). (verificado: mention, signature, gauges, dashboardlayout y gantt usan `runOutsideAngular`/rAF cancelado)
- [x] carousel (`893-905`). `clearInterval` previo, correr fuera de zona y pausar con la pestaña oculta. (verificado: `carousel.ts:913-935`)
- [x] fileupload: el error sin `markForCheck` deja el spinner colgado en zoneless. (verificado: `markForCheck` en `fileupload.ts:1101`)

### Charts

- [x] hit-test (`render/hit-test.ts`). Memoiza la proyección por (series, size, scales). Limita a rAF. Busca por x con búsqueda binaria. Cachea el layout de Sankey. (verificado: proyección en `WeakMap` y búsqueda binaria en `render/hit-test.ts`)
- [ ] `chart-svg.ts:186-216` y `chart-canvas.ts`. No reconstruyas la escena en cada hover. Separa la capa de hover. No escribas `$stamps` si está vacío.
- [x] O(n²) con `findIndex` o `find` por punto en `series-line.ts:100`, `build-scene.ts:648` y `label-targets.ts:221`. Usa un `Map`. (verificado: ya no hay `findIndex` por punto)
- [x] `charts-state.ts`. `rawSeries` re-decima todas las series ante cualquier cambio. `sumAt` dentro del comparador de `sortCategories`. `toCsv` O(C·S·P). `readNumeric` descarta strings numéricos. (verificado: `table` computed con `Map` por serie y decimación por entrada)
- [x] `chart-tooltip.ts:176-196`. No soporta accessors función. `findIndex` por serie en cada hover. (verificado: `indexOfCategory` con caché en `core/tooltip-read.ts`)
- [x] `chart-a11y-view.ts`. La tabla sale de `toCsv()` completo en cada render. (verificado: usa `context.table()`, `chart-a11y-view.ts:104`)
- [x] `chart-root-base.ts:580-585`. Guarda y cancela el rAF. El tema (dark, `prefers-color-scheme`) solo se lee en init. (verificado: `renderHandle` cancelado y `matchMedia` observado)
- [~] `chart-zoom.ts`. `wheel` por defecto secuestra el scroll de la página. Falta pointer capture. (pointer capture hecho (`chart-zoom.ts:492`); `wheel` sigue en `true` por compatibilidad (Fase B))
- [x] export: `inlineComputedStyles` sobre todos los nodos, `rasterizeSvg` sin timeout, `Math.min/max(...spread)` sobre arrays grandes. (verificado: `RASTERIZE_TIMEOUT_MS` y `needsInlining` en `core/export.ts`)

### Listas y componentes

- [x] select, multiselect, autocomplete y listbox. `ariaSetSize` y `getAriaPosInset` son O(n²) por CD. Usa `computed` y un array de posiciones. (verificado: `getAriaInfo`/`getAriaMemo` memoizados en los cuatro)
- [x] multiselect `isSelected` (`1525-1535`). Usa un `Set` de claves. (verificado: `getSelectedLookup` con `Set`, `multiselect.ts:1614`)
- [x] table y treetable. Usa `Intl.Collator` en vez de `localeCompare` en el sort (`table.ts:1674`, `treetable.ts:1305,1372`). (verificado: `Intl.Collator` en `table.ts:1679` y `treetable.ts:973`)
- [x] scroller. Limpia `scrollTimeout`, `resizeTimeout` y el timeout de `init()` en `onDestroy`. (verificado: `scroller.ts:657-659`)
- [x] dashboardlayout `resolve` (`dashboardlayout-engine.ts:56-76`) es O(n²). (verificado: carriles por columna en `dashboardlayout-engine.ts:74`)
- [~] spreadsheet `publish` serializa el workbook entero tras cada comando (`358-367`). (`publish` va con debounce (`SETTLE_MS`), pero sigue serializando el workbook entero (`spreadsheet.ts:405`))
- [x] pdfeditor. (verificado: miniaturas con IntersectionObserver, `HISTORY_BYTES`, `MAX_CANVAS_PIXELS` y `placePictureSafely`)
  - Carga de miniaturas lazy (`drawThumbnails`).
  - Historial de 50 snapshots completos de bytes.
  - Tope de tamaño de canvas.
  - `placePicture` con `void` genera una unhandled rejection.
- [x] gantt. Sin virtualización. `settle` calcula dos schedules por edición. (verificado: virtualiza con más de 150 filas y `settle` cacheado en `gantt.ts:1899`)
- [x] mention. Hasta 3 `evaluate()` por tecla. Crea un mirror DOM en cada `place()`. (verificado: `evaluate` deduplicado y mirror cacheado en `mention-caret.ts:75`)
- [~] signature. PNG completo en cada trazo. Repinta todo por frame. (`valueDebounce` existe pero por defecto es 0 (`signature.ts:201`): sin él se codifica el PNG en cada trazo)

### Bundle

- [ ] `chart/chart.ts:3` importa `chart.js/auto`. Registra solo lo necesario o acepta un registro inyectado.
- [ ] Presets aura, lara y nora. Factoriza lo común en `base` (123 de 197 archivos idénticos entre aura y lara).
- [ ] apps/docs. Saca los CSS de maplibre y univer de `styles` global y cárgalos solo en sus páginas.

### Resto pendiente (auditoría)

Auditado el 2026-10-08: 22 hechos, 5 parciales y 4 sin hacer de 31 ítems. Queda, por prioridad:

1. [ ] **Bundle: `chart.js/auto`** (`chart/chart.ts:3`). Registrar solo lo necesario o aceptar un registro inyectado. Esfuerzo M.
2. [x] **scroller `(scroll)` en la plantilla** (`scroller/scroller.ts:34`). Pasarlo a un listener fuera de zona que solo actualice el signal cuando cambie el rango. Esfuerzo M.
3. [~] **Hover de charts** (hecho en SVG con reutilización de nodos; falta canvas) (`charts/chart-svg.ts:186`, `chart-canvas.ts`). Separar la capa de hover y no reconstruir la escena. Esfuerzo M.
4. [x] **Zona en password y datepicker** (`password.ts:357`, `datepicker.ts:3874`). Pasar `this.zone`. Esfuerzo S.
5. [ ] **Bundle: presets** (`packages/optimus-ui-themes/src/presets`). Factorizar lo común de aura y lara en `base`. Esfuerzo L.
6. [x] **Bundle: docs** (`apps/docs/angular.json:62-63`). Cargar los CSS de maplibre y univer solo en sus páginas. Esfuerzo S.
7. [ ] **spreadsheet `publish`** (`spreadsheet/spreadsheet.ts:405`). Evitar serializar el workbook entero. Esfuerzo M.
8. [x] **signature** (se mantiene el default 0; `valueDebounce` opt-in con test; bug de NG0953 al destruir arreglado) (`signature/signature.ts:201`). `valueDebounce` en 0 codifica el PNG en cada trazo; valora un debounce por defecto. Esfuerzo S.
9. [ ] **charts `wheel`**. Pasar el default a `{ modifierKey: 'ctrl' }` en Fase B. Esfuerzo S.

## P4 - Accesibilidad

- [~] Iconos de mostrar contraseña y de limpiar con `<button type="button" aria-label>`. Afecta a password:478-496, treeselect:111, inputmask:734, inputnumber:101, datepicker:118 y autocomplete:123. (hecho en password e inputmask; el icono de limpiar sigue siendo `<svg (click)>` en `treeselect.ts:110`, `inputnumber.ts:100`, `datepicker.ts:118` y `autocomplete.ts:123`)
- [x] `chart-legend.ts:44-51`. `role="listitem"` en un button con `aria-pressed`. (verificado: `chart-legend.ts:44-51` es un button con `aria-pressed` dentro de `role="group"`)
- [x] `chart-export-menu.ts:57-64`. `role="menu"` sin navegación por flechas ni foco. (verificado: `onMenuKey`, `focusItem` y `aria-orientation`)
- [~] charts no tiene input `ariaLabel`. El aria-label autogenerado está en inglés fijo. (input `ariaLabel` hecho (`chart-root-base.ts:179`); el nombre autogenerado sigue en inglés fijo (`chart-root-base.ts:402`))
- [x] blockeditor. `role="textbox"` en el wrapper. El slash menu sin combobox ni `aria-activedescendant`. (verificado: `role="textbox"` en el editable y `aria-activedescendant` en `blockeditor.ts:397,445`)
- [x] `map-marker.ts:93`. `role="img"` en un marcador interactivo, sin foco por teclado. (verificado: `role="button"`, `tabindex` y teclado en `map-marker.ts:99-108`)
- [ ] `apps/docs/index.html`. Quita `user-scalable=no` y `maximum-scale`.
- [~] Textos en inglés hardcodeados sin i18n en blockeditor, mention, signature, cropper, dashboardlayout, gantt, pdfeditor, map, barcode y spreadsheet. (solo `gantt` tiene `messages` y mention/signature/dashboardlayout/barcode/spreadsheet tienen algún input; faltan cropper, pdfeditor, map y textos fijos de blockeditor (`aria-label="Format"`, `"Blocks"`))
- [ ] Naming de eventos inconsistente: `ready`, `created`, `loaded`, `failed` y `failedToLoad`. Decide una convención.

### Resto pendiente (auditoría)

Auditado el 2026-10-08: 4 hechos, 3 parciales y 2 sin hacer de 9 ítems. Queda, por prioridad:

1. [x] **Iconos de limpiar sin botón** (hechos y verificados en Chromium: 14x14, foco, Enter/Espacio, RTL y modo oscuro; `inputnumber` ya cumplía) (`treeselect.ts:110`, `inputnumber.ts:100`, `datepicker.ts:118`, `autocomplete.ts:123`). Envolver en `<button type="button" aria-label>` como en `password`. Hay que revisar el DOM y el CSS de cada uno. Esfuerzo M.
2. [x] **`apps/docs/index.html:7`**. Quitar `user-scalable=no` y `maximum-scale=1`. Esfuerzo S.
3. [x] **i18n de textos fijos** (cropper, pdfeditor, map, blockeditor `aria-label="Format"` y `"Blocks"`). Esfuerzo M.
4. [x] **Nombre autogenerado de charts** (`charts/chart-root-base.ts:402`). Sale de `chartText()` para el caso de varias series y de `"chart with N data points"`. Esfuerzo S.
5. [ ] **Naming de eventos** (`ready`, `created`, `loaded`, `failed`, `failedToLoad`). Decidir una convención. Esfuerzo S.

## P5 - Config, dependencias y repo

- [~] `tsconfig.json` raíz. Quita los paths `@primeng/themes` (apuntan a `packages/themes`, que no existe) y `include **/dist/**`. Sube `strict` poco a poco (`noImplicitAny`, `strictTemplates`). (Paths e `include` quitados y `fullTemplateTypeCheck` activado. `noImplicitAny` (~1.100 errores) y `strictTemplates` (237 errores) no se activaron.)
- [x] Scripts raíz. `clean` borra `pnpm-lock.yaml` y usa `npx rimraf` sin declararlo. Quita `--no-git-checks` de `release*`.
- [x] Dependencias fantasma (`glob`, `fs-extra`, `tsdown`, `cross-env`). Decláralas por paquete y evalúa quitar `shamefullyHoist`.
- [x] Mueve a `catalog:` las versiones duplicadas entre docs y la lib (tiptap, prosemirror, univer, pdf-lib, maplibre, pdfjs, cropperjs).
- [x] Peers de `packages/optimus-ui`. `rxjs` a `^7.8.1` y añade `quill` como peer opcional.
- [x] `engines.node >=12.11.0` en motion, styled y utils. Pon `>=20` o el mínimo de Angular 22.
- [x] `optimus-ui-themes/package.json`. Exports `./*` apuntan a `.d.ts` y tsdown genera `.d.mts`. Revisa con `attw`.
- [x] `optimus-ui-tailwindcss/package.json`. `main`, `module` y `types` apuntan a `src/*.ts`.
- [x] Overrides en `pnpm-workspace.yaml` para `braces`, `source-map-js` y `postcss-selector-parser` (vienen de tailwind 3 en docs).
- [x] `apps/docs/package.json`. `autoprefixer` y `postcss` sin uso. Pasa `tailwindcss` a devDependencies. Quita `typedoc` duplicado.
- [x] `commitlint.config.ts`. Añade `perf`, `build`, `ci` y `revert`. Quita `references-empty`.
- [x] `lefthook.yml`. Añade lint o typecheck a pre-commit cuando el lint funcione.
- [x] `.prettierignore` y `format:check`. Cubre `scripts/` y los `.mjs`.
- [x] `dependabot.yml`. Agrupa tiptap, prosemirror y univer.
- [x] `plan.md` raíz. Decide si vive en el repo o en `docs/`. (Decidido: se queda en el repo.)
- [x] Metadatos de `package.json` inconsistentes (`author`, `homepage`, `repository.url`).
- [x] `forms-interop/forms-types.probe.ts`. Verifica que no se publica, o bórralo.

### Limpieza de archivos

- [x] Borra `optimus-ui-themes/` de la raíz y revisa qué script lo generó.
- [x] `git rm pnpm-publish-summary.json` y añádelo a `.gitignore` (también `*.tsbuildinfo` y `.env`).
- [x] Borra `apps/docs/public/demos.json` (1.9 MB, obsoleto). Ahora los demos van a `.demos/` y `public/demos/`.
- [x] Quita de `.gitignore` los restos de PrimeNG (`/components`, `/resources`, `.nx`).

## P6 - Docs app

- [x] `app.config.ts`. Añade `provideClientHydration(withEventReplay())`.
- [x] `angular.json`. Budgets `initial` (warning 1MB, error 2MB) y `anyComponentStyle`. Quita `allowedCommonJsDependencies` muertos.
- [x] `package.json` de docs. Los scripts `lint` y `e2e` apuntan a targets que no existen.
- [x] `components/doc/codeeditor/templates.ts`. Añade las deps de maplibre, univer, tiptap, cropperjs, pdf-lib y pdfjs. Cambia `zone.js` (la app es zoneless). Amplía `TEST_SELECTORS` en `scripts/test-demo-code.mjs`.
- [x] `doc/configuration/zindex-doc.ts` y `filtermode-doc.ts`. `OptimusConfig` no existe; reescribe con `provideOptimus({...})` y verifica las claves.
- [x] `routes.txt` obsoleto. Faltan 12 rutas nuevas y `/guides/signalforms`. Haz que `ng build` falle si está obsoleto, o documenta `pnpm build`.
- [~] `router/app.routes.ts`. Quita el `theming` duplicado. `virtualscroller` carga `pages/scroller`. El wildcard da soft-404. (`theming` duplicado y soft-404 resueltos; el nombre `virtualscroller` se dejó con un comentario.)
- [x] `index.html`. Comilla suelta en la URL de Roboto, `preconnect`, y el script de kapa fuera del `<body>`.
- [x] Quita las referencias a "Syncfusion" en `doc/querybuilder/basic-doc.ts`, `doc/gauges/axes-doc.ts` y los comentarios de `packages/optimus-ui/src`.
- [x] Sustituye las URLs de avatares de `primefaces.org` (`doc/texteditor/demo-data.ts`) por assets propios.
- [ ] Saca `test:stackblitz --all` de `build:docs` a un workflow nocturno. (Pendiente: hay que quitar `&& npm run test:stackblitz` de `build:docs` en `apps/docs/package.json` y crear un workflow nocturno.)
- [~] Verifica que `build:apidoc` genera las claves de los componentes nuevos. Excluye `*.test.ts`. `name: 'PrimeNG'` en `scripts/build-apidoc.mjs`. (Hecho; quedan dos páginas que piden un nombre inexistente: `TextEditor` es `TextEditorRoot` y `Chart` es `UIChart`.)
- [x] `apps/docs/README.md` es un resto genérico de PrimeNG.

## P7 - Themes

- [x] `material` no tiene 17 directorios de aura: aiassistview, barcode, blockeditor, charts, cropper, dashboardlayout, gantt, gauge, map, mention, pdfeditor, querybuilder, scheduler, signature, spreadsheet, taskboard y texteditor. Añádelos o documenta que no se cubren.

## P8 - Tests

- [x] Charts. Tests de `hit-test`, `build-scene`, `charts-state`, legend, tooltip, scale, ticks, stack, decimate, curve, color y export. Son los archivos modificados ahora.
- [x] Regresión para P1: map (style.load), decimate, pdf-render, CSV defuse, parseCsv, querybuilder SQL.
- [x] `splitter.test.ts`. 66 tests con `skip`. También card (8), treetable (8), drawer (4), speeddial (2) y panel (1).
- [x] Sustituye los 55 `expect(true).toBe(true)` (listbox 18, drawer 10, password 5, ...).
- [x] `pdfeditor.test.ts` ('opens a document, draws its page and lists its pages') es flaky bajo carga: comprueba píxeles negros del canvas antes de que termine el render. Espera al render real en vez de un tiempo.
- [~] Reduce los `setTimeout` reales (~1256 líneas). Usa `vi.useFakeTimers()` o `whenStable()`. (Reducidos en unos 30 archivos y la suite pasa de ~32 s a ~18 s; el resto de las ~1256 esperas sigue.)
- [x] `texteditor-engine.test.ts` no tiene ningún `expect(`.
- [~] Specs que faltan: avatargroup, buttongroup, overlaybadge, steps, chart, motion, dragdrop, dom, config y api. Paquetes `utils`, `motion`, `locale`, `styles`, `tailwindcss` y `themes` con 0 tests. (Hechos api, dom, dragdrop, motion, steps, avatargroup, buttongroup, overlaybadge; faltan `usestyle`, `ts-helpers` y los tests de los paquetes `utils`, `motion`, `locale`, `styles`, `tailwindcss` y `themes`.)
- [~] Cobertura. Añade `coverage.thresholds` y corre `test:unit:coverage` en CI. Con `aot:false` y `strictTemplates:false`, los templates no se type-checkean en test. (Umbrales 65/51/65/66 y cobertura en CI. `strictTemplates` de test sigue en `false`: ~7.100 errores.)


### Resultado de P5 a P8 (2026-10-08)

- Cobertura medida: statements 67,6 %, branches 53,7 %, functions 68,0 %, lines 68,8 %.
- Tests: 8761 (8760 pasan, 1 skip) frente a 8575 antes; suite de ~32 s a ~18 s.
- Material tiene ya los 17 directorios que le faltaban (sin verificar en navegador). Los 108 archivos idénticos en aura, lara y nora se pueden mover a un módulo compartido (ahorra ~210 KB de fuente, 1 a 2 días, fácil de comprobar comparando el JSON resultante). Pendiente de decisión.
- Build de producción de la docs: 136 rutas prerenderizadas. Había dos fallos de SSR: `ConfirmPopup.onDestroy` llamaba a `cancelAnimationFrame` sin guarda y `pBadge` usaba `document` (este ya existía).
- Hidratación en la docs: Prism se ejecutaba antes de hidratar (NG0500) y el widget de kapa pisaba `window.Prism`; se arregló con dos scripts (`prism-before.js` y `prism-after.js`).

### Bugs de componentes encontrados y no arreglados

- [ ] `steps`: la plantilla enlaza `[routerLinkActiveOptions]` sin la directiva `routerLinkActive`. Un step con `routerLink` en modo no readonly lanza NG0303 (su test sigue en `it.skip`).
- [ ] `DomHandler.addMultipleClasses` lanza `DOMTokenList.add` con un token vacío si el texto lleva dos espacios seguidos.
- [ ] Los hooks de passthrough (`hooks.*`) se resuelven llamando a la función y luego llamando a lo que devolvió: un hook que devuelve un valor truthy lanza "selfHook is not a function".
- [ ] Los tests de `map` imprimen un NG0953 en dos casos (pasan).
- [x] `TTScrollableView` no recibía el `pt` del TreeTable (arreglado con `[pt]="pt()"` en las dos vistas).

## Fase B - API con signals (3.0, el último paso)

Rompe la API pública. No se empieza hasta terminar P0 a P8 y Fase A, y se publica como major 3.0.

- [ ] `@Input()` a `input()` y `input.required()`, con `transform` donde haga falta. Los pares `x` y `xChange` pasan a `model()`.
- [ ] Propiedades públicas leídas por los consumidores (`table.value`, `table.first`, `table.selection`...) pasan a signals de solo lectura.
- [ ] `@Output()` y `EventEmitter` restantes pasan a `output()`.
- [ ] Setters y getters de inputs pasan a `computed` o `linkedSignal`.
- [ ] Las clases base (`BaseComponent`, `BaseInput`...) y sus subclases se migran juntas.
- [ ] Codemod de migración (`ng update` o un script) para quien consuma la lib: inputs asignados por código, referencias de template y herencia.
- [ ] Guía de migración 2.x a 3.0 y changelog de breaking changes.
- [ ] Docs y demos migrados a la API nueva.
- [ ] Sube a `error` las reglas `prefer-signals` y `prefer-signal-model` en todo `packages/optimus-ui/src`.

## Notas

- Las mejoras de zona (P3) suelen resolverse con un helper común. Crea uno antes de tocar cada componente.
- Antes de refactorizar charts, escribe los tests de P8 sobre `hit-test`, `build-scene` y `charts-state`.
- Sin verificar: el bundle real de un consumidor, CSS muerto en `optimus-ui-styles` y los tokens que difieren entre presets.
