import fs from 'fs-extra';
import path from 'path';
import { clearPackageJson, resolvePath } from '../../../scripts/build-helper.mjs';

const { __dirname, OUTPUT_DIR, INPUT_DIR } = resolvePath(import.meta.url);

fs.copySync(path.resolve(__dirname, `../${INPUT_DIR}/v4`), `${OUTPUT_DIR}/v4`);
fs.copySync(path.resolve(__dirname, '../package.json'), `${OUTPUT_DIR}/package.json`);
fs.copySync(path.resolve(__dirname, '../README.md'), `${OUTPUT_DIR}/README.md`);
fs.copySync(path.resolve(__dirname, '../LICENSE'), `${OUTPUT_DIR}/LICENSE`);

// pnpm applies the fields of publishConfig when it packs, so a tarball is right. Apply them here too, so that dist can be
// installed as it is (a link to it) and not only after it is packed.
clearPackageJson(path.resolve(__dirname, `../${OUTPUT_DIR}/package.json`), (pkg) => {
    for (const [key, value] of Object.entries(pkg.publishConfig ?? {})) {
        if (key !== 'access') pkg[key] = value;
    }
});
