import fs from 'fs-extra';
import {log} from '../utils/logHelpers';

export default async function ensureFoldersExist(...paths) {
  log(`Ensuring directories ${paths.toString()} exist...`);
  await Promise.all(paths.map(path => fs.ensureDir(path)));
}