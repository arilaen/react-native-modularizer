import fs from 'fs-extra';
import { logStep } from '../../utils/logHelpers';
import exec from '../../utils/exec';

export default async function buildJSBundle(modulePath) {
  logStep('Building JS bundle...');
  fs.ensureDir(`${modulePath}/src/main/assets`);
  await exec(`
  npx react-native bundle \
    --platform android \
    --dev false \
    --entry-file app/index.js \
    --bundle-output ${modulePath}/src/main/assets/index.jsbundle \
    --assets-dest ${modulePath}/src/main/assets \
    --sourcemap-output ${modulePath}/src/main/assets/sourcemap.js
  `);
}