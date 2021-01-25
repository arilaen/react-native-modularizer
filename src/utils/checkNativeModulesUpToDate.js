import fs from 'fs-extra';
import loadDependencyNamesAndVersionsFromPackageJSON from '../android/androidUtils/loadDependencyNamesAndVersionsFromPackageJSON';
import {logStep} from './logHelpers';

export default async function checkNativeModulesUpToDate({
  modulePath,
  allReactNativeProjectDependencies,
  nativeDependencyNames
}) {
  logStep('Checking if native modules from package.json need to be created or updated');
  const modulePackageJSONExists = await fs.pathExists(`./${modulePath}/package.json`);
  if (!modulePackageJSONExists) return false;
  const {dependencies: moduleDependencies} = await loadDependencyNamesAndVersionsFromPackageJSON({dir: modulePath});
  nativeDependencyNames.forEach(nativeDependencyName => {
    if (allReactNativeProjectDependencies[nativeDependencyName] !== moduleDependencies[nativeDependencyName]) {
      return false;
    }
  });
  return true;
}