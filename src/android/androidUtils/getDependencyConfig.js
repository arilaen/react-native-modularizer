import exec from '../../utils/exec';
import {log, logWarning, logName} from '../../utils/logHelpers';

const getSourceDirForSettings = (relativeSourceDir, name) => {
  switch(name) {
    case 'react-native-code-push':
      return relativeSourceDir + '/app';
    default:
      return relativeSourceDir;
  }
}

const getFolderName = (fullFolderPath) => {
  const parts = fullFolderPath.split('/');
  const indexOfNodeModules = parts.indexOf('node_modules');
  return parts.slice(indexOfNodeModules + 1).join('/');
}

const getDependencyConfig = async ({moduleName, skippedNodeModules, manualPackages}) => {
  log('Resolving dependency configurations...');
  const {stdout, stderr: error} = await exec(`npx react-native config`, {cwd: process.cwd()});
  if (error) throw new Error(error);

  const cliResult = JSON.parse(stdout.toString());
  const {dependencies} = cliResult;
  const config = Object.entries(dependencies).reduce((acc, entry) => {
    const [name, nativeConfig] = entry;
    if (!nativeConfig) {
      return acc;
    }
    const androidConfig = nativeConfig.platforms.android;
    if (!androidConfig) {
      return acc;
    };
    acc.nativeDependencyNames.push(name);
    logName(`> ${name}`);
    const {packageImportPath, packageInstance, sourceDir} = androidConfig;
    const folderName = getFolderName(sourceDir);
     // These assume node_modules will be brought in directly, i.e. via this script (test) or submodule (demo)
    const relativeToSettingsSourceDir = `./${moduleName}/node_modules/${folderName}`;
    const gradleProjectName = name.replace('/', '_');
    if (skippedNodeModules.some(m => m === name)) {
      logWarning(`Skipping ${name}...`);
      return acc;
    } else {
      const manualPackage = manualPackages.find(pkg => pkg.name === name)
      if (manualPackage) {
        acc.manualImports.push(manualPackage.import);
        manualPackage.packageInstanceStringArray.forEach(str => {
          acc.manualPackageInstances.push(str);
        });
      } else {
        acc.imports.push(packageImportPath);
        acc.packageInstances.push(packageInstance);
      }
      // Add settings for all packages, including ones with manually set package instances and imports
      // (that only affects the activity file)
      acc.libDependencies.push(`project(':${gradleProjectName}')`);
      acc.settings.push(
        `
include ':${gradleProjectName}'
project(':${gradleProjectName}').projectDir = new File(rootProject.projectDir, '${getSourceDirForSettings(relativeToSettingsSourceDir, name)}')`);
    }
    return acc;
  }, {
    nativeDependencyNames: [],
    settings: [],
    libDependencies: [],
    imports: [],
    packageInstances: [],
    manualImports: [],
    manualPackageInstances: []
  });
    
  return config;
}

export default getDependencyConfig;
