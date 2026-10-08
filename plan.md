# Plan: nuevos componentes optimus-ui (API estilo Syncfusion)

Leyenda: `[ ]` pendiente · `[x]` hecho · `[~]` descartado/diferido (con motivo).

## Decisiones (valor vs esfuerzo)

| Componente | Decisión | Por qué |
| --- | --- | --- |
| QueryBuilder | SÍ, motor propio | Máximo valor/esfuerzo. Multiplica `p-table` (filtro avanzado). Es lógica de árbol + UI con componentes ya existentes. Sin deps. |
| Signature | SÍ, motor canvas propio | ~300 líneas. `signature_pad` no aporta lo bastante para meter una dependencia. |
| Mention | SÍ | Pequeño. Reutiliza overlay y listbox. Se enchufa a `textarea` y `p-texteditor`. |
| Barcode / QR | SÍ, parcial | Propio: QR, Code128, Code39, EAN-13. Cubre >95% del uso real. DataMatrix/PDF417 y el resto: NO ahora (`bwip-js` opcional si alguien lo pide). Un encoder propio de cada simbología es mucho esfuerzo para uso raro. |
| DashboardLayout | SÍ | Habilita dashboards de usuario. Reusa el drag del scheduler. Esfuerzo medio. |
| Gauges (circular, linear) | SÍ | El motor `charts/render` ya existe. Poco esfuerzo. |
| Series de chart que faltan | SÍ las comunes: area, spline, step, stacked, waterfall, funnel, histogram. NO sankey, sunburst, boxplot, range: uso raro, layout caro. |
| Gantt | SÍ al final, motor propio, fases a–c. Frappe Gantt NO: DOM vanilla, sin edición/dependencias al nivel de Syncfusion, no encaja con signals. Fases d–e (baseline, recursos, export PDF/Excel) diferidas: necesitan deps de export y poco uso inicial. |
| Los motores de la lista "Tier 3" (pdf.js, Univer, MapLibre, Cropper, block editor) | NO ahora | Fuera del orden pedido. Cada uno es una integración grande. Se reevalúan después. |

Licencia: se copia la forma de la API (nombres de inputs, eventos, métodos), nunca código ni docs de Syncfusion.
Lo que no se soporte de la API Syncfusion se documenta como "no soportado".

## Convención por componente (patrón `aiassistview`)

- `packages/optimus-ui/src/<name>/`: `<name>.ts`, `<name>-state.ts`, `<name>.module.ts`, `public_api.ts`, `ng-package.json`, tests vitest.
- `packages/optimus-ui-styles/src/<name>/index.ts` + export en `src/index.ts`.
- `packages/optimus-ui-themes/src/presets/{aura,lara,nora}/<name>/index.ts` + export en cada `index.ts`, `tokens.ts`, `types/<name>/index.d.ts`.
- Docs en `apps/docs` + demos.
- Mapeo: `ejs-xxx` → `p-xxx`; props → `input()`; eventos → `output()`; `*Template` → `*Def`.
- Commits `feat(<name>)`; sincronizar `main` por merge, nunca rebase.

## Tanda 1: QueryBuilder (`p-querybuilder`)

- [x] Modelo (`RuleModel`, `ColumnsModel`, operadores por tipo) + tests
- [x] State: edición inmutable por path (insert/remove/update), validación, `getValidRules`
- [x] Conversores: SQL (+ parametrizado), Mongo, predicado, filtro Feathers, y lectura SQL/Mongo
- [x] Componente + partes (grupo recursivo, fila) con templates `#value` / `#header` y `column.template`
- [x] Inputs/outputs/métodos Syncfusion (`columns`, `rule`, `maxGroupCount`, `getRules`, `setRules`, `getSqlFromRules`...). `ruleChange` de Syncfusion se llama `ruleChanged` aquí porque `ruleChange` es la salida del `model` `[(rule)]`
- [x] Signals: `model()`, `input()`, `output()`, `computed()`; zoneless + OnPush
- [x] Signal forms (`[formField]`) y forms clásicos (`formControl`, `ngModel`), con tests
- [x] Estilos + tokens aura/lara/nora
- [~] Integración con `p-table`: no se toca la tabla. Receta documentada: `data.filter(toPredicate(rule))`, o `getFeathersQuery()` para servidor. Motivo: acoplar `p-table` al builder lo haría depender de él.
- [x] Docs + demos (`/querybuilder`)
- Notas: 30 tests verdes (21 motor, 9 componente: `[(value)]`, `[formField]`, `formControl`, readonly, validación, cancelación). Pendiente: revisión visual en navegador (`pnpm dev` → `/querybuilder`).

## Tanda 2: Signature, Mention, Barcode

- [x] Signature: motor (trazo por velocidad, curvas suavizadas, SVG) y 5 tests
- [x] Signature: componente (pointer events, HiDPI, resize, undo/redo, teclado, `draw`, `loadSignature`, export png/jpeg/svg), `[(value)]` + `[formField]` + forms clásicos, 11 tests, estilos, tokens, docs (`/signature`)
- [x] Mention: motor (detección del trigger, filtro, grupos, paso entre filas, reemplazo) + 10 tests
- [x] Mention: componente (textarea/input/contenteditable con chip, popover en top layer, teclado, ARIA, `filtering` remoto, templates `#item #header #noRecords #display`), 7 tests, estilos, tokens, docs (`/mention`). `select` de Syncfusion se llama `itemSelect` para no chocar con el evento `select` del navegador
- [x] Barcode: encoders Code128 (A/B/C y mezcla automática), Code39 (+ Mod43), EAN-13, EAN-8, UPC-A (+ 12 tests; los patrones de Code128 y Code39 se validan por invariantes)
- [x] Barcode: encoder QR propio, versiones 1–40, numérico/alfanumérico/byte UTF-8, 4 niveles ECC, 8 máscaras, Reed-Solomon. Verificado con un decodificador independiente (jsQR, fuera del repo) en 10 casos y con `BarcodeDetector` del navegador en el test
- [x] Barcode: layout puro compartido (pantalla = export), `p-barcode` y `p-qrcode` (SVG/Canvas, `displayText`, `margin`, `invalid`, `loaded`, `exportImage`, `exportAsBase64`, `toSvg`), estilos, tokens, docs (`/barcode`), 37 tests en total
- [~] Barcode: DataMatrix, PDF417, Codabar, Code11, Code39 Extension, logo en QR: no soportados (uso raro, `bwip-js` opcional si alguien lo pide)

## Tanda 3: DashboardLayout (`p-dashboardlayout`)

- [x] Motor de grid (colisión, empuje hacia abajo, flotado hacia arriba, prioridad del panel arrastrado, hueco libre, apilado a una columna, conversión celdas/píxeles) + 13 tests
- [x] Drag y resize (pointer capture, 8 asas, límites min/max, placeholder, vista previa en vivo, cancelación con `cancel`) y teclado (Alt+flechas mover, Shift+flechas redimensionar) con anuncio para lectores de pantalla
- [x] `panels` como `model()`, `addPanel`, `removePanel`, `removeAll`, `movePanel`, `resizePanel`, `updatePanel`, `serialize`, `refresh`, `mediaQuery` (una columna, sin mover). El `change` de Syncfusion se llama `layoutChanged`
- [x] Estilos, tokens aura/lara/nora, docs (`/dashboardlayout`), 11 tests de componente (24 en total)

## Tanda 4: Gauges y series

Hallazgo al empezar: el motor de charts ya tenía area (`p-chart-line` con `fillOpacity`), apilado (`p-chart-stacked`, también 100%), spline y step (`curve`), waterfall (`p-chart-waterfall`) y rangos (`p-chart-range`). Se verificó en el código y en los 400+ docs; no se duplica nada.

- [x] Gauges: motor puro (ángulos desde las 12, anillos, ticks, rangos cónicos, aguja, marcadores) + 11 tests
- [x] Circular gauge (`p-circulargauge`): axes, ranges (con estrechamiento), pointers needle/marker/rangeBar, annotations (texto o template), animación, arrastre, teclado, ARIA (`meter`/`slider`/`img`), forma simple con `[(value)]`
- [x] Linear gauge (`p-lineargauge`): orientation, container normal/thermometer/rounded, pointers bar/marker, ranges inside/outside/cross, ticks, labels, `opposedPosition`, `isInversed`, arrastre y teclado
- [x] Gauges: estilos, tokens aura/lara/nora, docs (`/gauges`), 13 tests de componente. Revisado a ojo con capturas del navegador (se corrigió el duplicado del 0/100 en círculo completo y el color del casquete)
- [x] area, stacked, spline, step, waterfall: ya existían
- [x] histogram: helper `histogram()` (Sturges, raíz, Scott, Freedman–Diaconis, umbrales propios, densidad, `nice`) sobre `p-chart-bar`, 8 tests y doc en Charts → Column and Bar → Histogram
- [x] funnel / pyramid: diferido. Exige un tipo de serie nuevo en build-scene, hit-test, etiquetas y accesibilidad; valor moderado
- [x] sankey, sunburst, boxplot: hechos (range sigue sin hacer)

## Tanda 5: Gantt (`p-gantt`)

- [x] (a) Solo lectura: grid en árbol (`treegrid`) + cronología con dos niveles, barras, progreso, hitos, padres que se calculan de sus hijos, zoom, divisor arrastrable, marcadores de evento, días no laborables sombreados
- [x] (b) Edición: mover, redimensionar por ambos lados y arrastrar el progreso (en días laborables); `addRecord`, `updateRecordByID`, `deleteRecord`, `indent`, `outdent`, expandir/colapsar; teclado completo; todo vuelve a `[(dataSource)]` sin mutarlo
- [x] (c) Dependencias FS/SS/FF/SF con desfases (`2FS+1d`), planificación hacia adelante, ruta crítica (paso adelante y atrás), líneas ortogonales, detección de ciclos, predecesores que faltan e ids repetidos (`invalid`)
- [x] Calendario laboral propio (`workWeek`, `holidays`), estilos, tokens aura/lara/nora, docs (`/gantt`), 65 tests. Revisado a ojo con una captura (corregido el hito, que giraba también su etiqueta)
- [~] (d) Baseline, recursos: diferido
- [~] (e) Export PDF/Excel: diferido
- [~] Edición de celdas en el grid y diálogo de edición: diferido; se edita por barras, métodos y teclado
- [~] Duraciones en horas/minutos: el motor trabaja en días


## Tanda 6: lo que estaba diferido (todo, por orden de valor/esfuerzo)

### 6a. Gantt
- [x] Edición de celdas del grid (nombre, inicio, duración, progreso, predecesores, notas, recursos) con doble clic, F2, Enter/Tab/Escape; evento `cellEdit`
- [x] Diálogo de edición de tarea (`<dialog>` nativo, `mode: 'dialog'`, `openEditDialog`)
- [x] Duraciones en horas y minutos (`durationUnit`, `workingHours`): el motor pasó de días a «ranuras» de tiempo laboral; con una ranura por día es idéntico al anterior
- [x] Baseline (línea base) y variación (`renderBaseline`, columnas `baselineStartDate`, `baselineEndDate`, `variance`)
- [x] Recursos (`resources`, `resourceInfo`, columna, etiqueta, diálogo) y aviso de sobreasignación según `unit`
- [x] Export: CSV, SVG, PNG/JPEG y PDF (una página con la imagen), sin dependencias. El PDF es una imagen: el texto no se puede seleccionar
- Detalle: 96 tests de Gantt

### 6b. Barcode
- [x] Codabar, Code11 (con dígitos de control C y K), Code39 Extended (todo ASCII)
- [x] DataMatrix ECC200 propio, 24 tamaños cuadrados con bloques y la excepción del 144×144. Verificado con dos lectores independientes: zxing-js (17 longitudes, de 10×10 a 144×144) y el `BarcodeDetector` del navegador
- [x] PDF417 propio: compactación de bytes (con ECI UTF-8) y numérica, nivel de corrección automático o fijo, columnas, indicadores de fila. Verificado con zxing-js (11 casos) y el `BarcodeDetector`. Las tablas de 3×929 patrones se generan por algoritmo + una máscara de qué candidatos toma el estándar (comprobada contra zxing-js, Apache-2.0)
- [x] Logo en el centro del QR (`logo`), con corrección `high` forzada y tamaño limitado a un cuarto del símbolo
- Detalle: 74 tests de barcode; componentes `p-datamatrix` y `p-pdf417`. Pendiente conocido: DataMatrix solo en modo ASCII (sin C40/Text/X12/EDIFACT/Base256) y PDF417 sin compactación de texto (los textos ocupan algo más)

### 6c. Charts
- [x] funnel y pyramid
- [x] boxplot (con cálculo de cuartiles)
- [x] sunburst
- [x] sankey

### 6d. Motores Tier 3 (cada uno añade una dependencia, que se declara aquí)
- [x] Cropper (editor de imagen) sobre Cropper.js 2 (`p-cropper`, peer opcional `cropperjs`): recorte con `aspectRatio`, rotar, voltear, zoom, `selectAll`/`clear`/`reset`, salida a data URL/Blob/canvas, valor para signal forms; 12 tests
- [x] PDF editor (`p-pdfeditor`, no visor; peers opcionales `pdfjs-dist` ^6 y `pdf-lib`): render con pdf.js (worker en la página o `workerSrc`), anotaciones (texto con fuente estándar, resaltado, rectángulo, elipse, línea, flecha, trazo libre, imagen, firma con `p-signature`) que se mueven, redimensionan, duplican, borran y se deshacen; formularios AcroForm (texto, multilínea, checkbox, radio, dropdown, lista) como inputs sobre la página; páginas (girar, borrar, mover arrastrando miniaturas, insertar, unir, extraer) con las anotaciones siguiendo a su página; `save`/`saveAsBlob`/`download` escriben un PDF nuevo (la geometría se verificó pintando el PDF resultante con pdf.js en las 4 rotaciones). 62 tests. Límite conocido: solo fuentes estándar (WinAnsi), el texto fuera de Latin-1 sale como `?`; los cambios del formulario no entran en el deshacer
- [x] Maps sobre MapLibre GL 6 (`p-map`, `p-map-marker`, `p-map-layer`; peer opcional `maplibre-gl`): `center`/`zoom`/`bearing`/`pitch` como modelos de dos vías, marcadores arrastrables con popup, capas GeoJSON con `paint`/`layout`, controles, `flyTo`/`fitBounds`/`project`; 11 tests. El consumidor añade `maplibre-gl.css` y copia `maplibre-gl-worker.mjs` a la raíz del build (o pasa `workerUrl`); comprobado con un `ng build` real
- [x] Block editor sobre Tiptap 3 (`p-blockeditor`; peers opcionales `@tiptap/*`): bloques de texto, h1-h3, listas, to-do, cita, código, divisor e imagen desde el menú `/`, barra sobre la selección (negrita, cursiva, tachado, código, enlaces con esquema comprobado), mover bloque con Alt+flechas, valor JSON o HTML, signal forms y CVA; 26 tests. Sin asa de arrastre de bloques (se mueven con teclado y `moveBlockUp/Down`)
- [x] Spreadsheet sobre Univer 1 (`p-spreadsheet`; peers opcionales `@univerjs/presets` y `@univerjs/preset-sheets-core`): libro completo con fórmulas, formatos, varias hojas y barra; el valor es el libro (`[(value)]`, signal forms, CVA) y se relee un momento después del último cambio, con los resultados de las fórmulas; `getCell`/`setCell`/`getRows`/`setRows`/`toCsv`, `readonly`, `darkMode`, 19 idiomas; 20 tests. Detalle de Univer: guarda los datos de las fórmulas por id de libro en la página, así que cada libro que se abre recibe un id propio en el motor (el id original vuelve en el valor). El consumidor añade `index.css` de la preset y React
