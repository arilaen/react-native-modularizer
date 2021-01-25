import fs from 'fs-extra';
import log from '../../utils/logHelpers';

import { CONFIG_FILE_NAME } from '../../config';

export default async function getAndroidRNMProperties() {
  log(`Fetching Android RNM properties from ${CONFIG_FILE_NAME}...`)
  const properties = await fs.readJSON(CONFIG_FILE_NAME);
  if (!properties.enabledNativePlatforms.some(p => p.toLowerCase() === 'android')) {
    throw new Error(`Android is not enabled in ${CONFIG_FILE_NAME}`)
  }
  return properties;
}