import fs from 'fs-extra';
import {log} from './logHelpers';

export default async function checkPathsExist(...paths) {
  log(`Checking that paths ${paths.toString()} exist...`);
  const results = await Promise.all(paths.map(path => fs.pathExists(path)));
  return results.every(result => result);
}