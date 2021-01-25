import fs from 'fs-extra';
import {log} from '../../utils/logHelpers';

export default async function loadDependencyNamesAndVersionsFromPackageJSON({dir}) {
  log(`Loading dependency names and versions from package.json...`);
  const {dependencies} = await fs.readJSON(`${dir}/package.json`);
  const reactNativeVersion = dependencies['react-native'];
  if (!reactNativeVersion) throw new Error('react-native was not found in package.json !');
  // TODO: Check for minimum version (0.63)?
  return {dependencies, reactNativeVersion};
}