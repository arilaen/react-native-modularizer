import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import shell from 'shelljs';

import { CONFIG_FILE_NAME, ANDROID_PACKAGE_SRC_PATH } from '../config';
import {DEFAULT_ANDROID_PROJECT_GRADLE_DATA, DEFAULT_ANDROID_LIB_GRADLE_DATA,
  DEFAULT_ANDROID_MANIFEST_DATA, DEFAULT_ACTIVITY_DATA,
  DEFAUlT_ANDROID_SETTINGS_GRADLE_DATA } from './defaults';
import exec from '../utils/exec';
import {mustacheRenderToOutputFileUsingTemplateFile} from '../utils/mustache';
import { mergeInputsAndDefaults } from '../utils/object';

const ANDROID_TEMPLATE_ROOT = `${__dirname}/../../templates/android`
const ANDROID_MODULE_TEMPLATE_DIR = `${ANDROID_TEMPLATE_ROOT}/module`;
const ANDROID_TEST_TEMPLATE_DIR = `${ANDROID_TEMPLATE_ROOT}/test`;
const ANDROID_DEMO_TEMPLATE_DIR = `${ANDROID_TEMPLATE_ROOT}/demo`;

export async function buildAndroid(options) {
  try {
    // Fetch config info
    const properties = await fs.readJSON(CONFIG_FILE_NAME);
    if (!properties.enabledNativePlatforms.some(p => p.toLowerCase() === 'android')) {
      throw new Error(`Android is not enabled in ${CONFIG_FILE_NAME}`)
    }
    // Create android project and copy over dependencies
    // Create local, demo and test directories if they do not exist
    const {moduleName, android: androidProps} = properties;
    const {
      androidGradlePlugin,
      buildToolsVersion,
      compileSdkVersion,
      customBuildDependencies,
      customManifestBlock,
      customPlugins,
      customRepos,
      extraAndroidOptions,
      multiDexEnabled,
      permissions,
      resSrcDirs,
      sourceCompatibility,
      targetCompatibility,
      targetSdkVersion,
      versionCode,
      versionName,
  } = androidProps;
    const {moduleRepo, testRepo, demoRepo} = androidProps.local;
    console.log(chalk.blue(`Copying test repo templates to directory at ${chalk.green(testRepo)}...`));
    await fs.remove(testRepo);
    await fs.copy(ANDROID_TEST_TEMPLATE_DIR, testRepo);
    console.log(chalk.blue(`Copying demo repo templates to directory at ${chalk.green(demoRepo)}...`));
    await fs.remove(demoRepo);
    await fs.copy(ANDROID_DEMO_TEMPLATE_DIR, demoRepo);
    
    console.log(chalk.blue(`Copying android templates from ${chalk.yellow(ANDROID_MODULE_TEMPLATE_DIR)} to ${chalk.green(moduleRepo)}...`));
    await fs.remove(moduleRepo);
    await fs.copy(ANDROID_MODULE_TEMPLATE_DIR, moduleRepo);
    // https://github.com/npm/npm/issues/1862 npm renames .gitignore to .npmignore causing the generated container to emit the .gitignore file. This solution below helps to bypass it.
    shell.mv(`${process.cwd()}/${moduleRepo}/gitignore`, `${process.cwd()}/${moduleRepo}/.gitignore`);
    
    console.log(chalk.blue(`Updating library project-level build.gradle...`));
    const projectGradle = `${process.cwd()}/${moduleRepo}/build.gradle`;
    const projectGradleData = mergeInputsAndDefaults({
      androidGradlePlugin,
      customBuildDependencies,
      customRepos,
    }, DEFAULT_ANDROID_PROJECT_GRADLE_DATA);
    await mustacheRenderToOutputFileUsingTemplateFile(projectGradle, projectGradleData);

    console.log(chalk.blue(`Loading dependency names and versions from package.json...`));

    const {dependencies} = await fs.readJSON('./package.json');
    const reactNativeVersion = dependencies['react-native'];
    if (!reactNativeVersion) throw new Error('react-native was not found in package.json !');
    // TODO: Check for minimum version (0.63)?
    // const codePushVersion = dependencies['react-native-code-push'];
    // if (codePushVersion) {
    //   const codePushEnabled = true;
    // }
    console.log(chalk.blue(`Updating library lib-level build.gradle...`));
    const {settings, libDependencies, imports, packageInstances} = await getDependencyConfig(moduleRepo);

    const settingsGradleData = mergeInputsAndDefaults({
      settings
    }, DEFAUlT_ANDROID_SETTINGS_GRADLE_DATA);
    const settingsGradle = `${moduleRepo}/settings.gradle`;
    await mustacheRenderToOutputFileUsingTemplateFile(settingsGradle, settingsGradleData);
    const relativePathToNodeModules = path.relative(`${moduleRepo}/lib`, `${process.cwd()}/node_modules`);
    const libGradleData = mergeInputsAndDefaults({
      buildToolsVersion,
      compileSdkVersion,
      customPlugins,
      extraAndroidOptions,
      libDependencies,
      multiDexEnabled,
      reactNativeVersion,
      relativePathToNodeModules,
      resSrcDirs,
      sourceCompatibility,
      targetCompatibility,
      targetSdkVersion,
      versionCode,
      versionName,
    }, DEFAULT_ANDROID_LIB_GRADLE_DATA);
    const libGradle = `${moduleRepo}/lib/build.gradle`;
    await mustacheRenderToOutputFileUsingTemplateFile(libGradle, libGradleData);
    
    console.log(chalk.blue(`Updating AndroidManifest.xml...`));
    const manifestData = mergeInputsAndDefaults({
      customManifestBlock,
      moduleName,
      permissions
    }, DEFAULT_ANDROID_MANIFEST_DATA);
    const manifest = `${moduleRepo}/lib/src/main/AndroidManifest.xml`;
    await mustacheRenderToOutputFileUsingTemplateFile(manifest, manifestData);

    console.log(chalk.blue(`Updating activity...`));
    const activityName = `${moduleName}ReactNativeActivity`;
    const activityPathPrefix = `${moduleRepo}/lib/src/main/java/${ANDROID_PACKAGE_SRC_PATH}`;
    shell.mv(`${activityPathPrefix}/HomeTurfActivity.java`,
    `${activityPathPrefix}/${activityName}.java`);
    const activityData = mergeInputsAndDefaults({
      moduleName,
      imports,
      packageInstances,
    }, DEFAULT_ACTIVITY_DATA);
    await mustacheRenderToOutputFileUsingTemplateFile(`${activityPathPrefix}/${activityName}.java`, activityData);
    // Create res files with prefixes for:
    // strings
    // possible firebase configs (google-services.json for each scheme)
    // colors/themes?
    // fonts???
    console.log(chalk.blue('Building JS bundle...'));
    await exec(`npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output ${moduleRepo}/lib/src/main/res/hometurf.jsbundle --assets-dest ${moduleRepo}/lib/src/main/res --sourcemap-output ${moduleRepo}/lib/src/main/res/raw/hometurfsourcemap.js`);

  } catch (error) {
    console.log(chalk.blue('Could not build android'));
    console.log(chalk.red(error));
    process.exit(1);
  }
}

const getDependencyConfig = async (moduleRepo) => {
  console.log(chalk.blue('Resolving dependency configurations'));
  const libDependencies = [];
  const imports = [];
  const packageInstances = [];
  const settings = [];
  const {stdout, stderr: error} = await exec(`npx react-native config`, {cwd: process.cwd()});
  if (error) throw new Error(error);
  const result = JSON.parse(stdout.toString());
  const {dependencies} = result;
  for (const [name, nativeConfig] of Object.entries(dependencies)) {
    if (!nativeConfig) {
      continue;
    }
    const androidConfig = nativeConfig.platforms.android;
    if (!androidConfig) {
      continue;
    };
    console.log(chalk.green(`> ${name}`));
    const {folder, packageImportPath, packageInstance, sourceDir} = androidConfig;
    const {version} = await fs.readJSON(`${folder}/package.json`);
    // const fullPackageName = packageImportPath.replace('import ', '').replace(';', '');
    const relativeSourceDir = path.relative(`${moduleRepo}/lib`, sourceDir);
    const gradleProjectName = name.replace('@', '').replace('/', '_');
    settings.push(`include '${gradleProjectName}'
    project(':${gradleProjectName}').projectDir = file('./${relativeSourceDir}')`);
    libDependencies.push(`api project('path: :${gradleProjectName}', configuration: 'default')`);
    if (name !== 'react-native-code-push') { //already set
      imports.push(packageImportPath);
      packageInstances.push(packageInstance);
    }

    if (Object.keys(nativeConfig.assets).length) {
      console.log(chalk.red({assets: nativeConfig.assets}));
    }
    if (nativeConfig.hooks.length) {
      console.log(chalk.red({hooks: nativeConfig.hooks}));
    }
    if (Object.keys(nativeConfig.params).length) {
      console.log(chalk.red({params: nativeConfig.params}));
    }
  }
  return {
    settings,
    libDependencies,
    imports,
    packageInstances
  };
}

// async function postBundle(
//   config,
//   bundle,
//   reactNativeVersion,
// ) {
//   if (this.getJavaScriptEngine(config) === JavaScriptEngine.HERMES) {
//     const hermesVersion =
//       config.androidConfig.hermesVersion ||
//       android.getDefaultHermesVersion(reactNativeVersion);
//     const hermesCli = await kax
//       .task(`Installing hermes-engine@${hermesVersion}`)
//       .run(HermesCli.fromVersion(hermesVersion));
//     await kax.task('Compiling JS bundle to Hermes bytecode').run(
//       hermesCli.compileReleaseBundle({
//         bundleSourceMapPath: bundle.sourceMapPath,
//         compositePath: config.composite.path,
//         jsBundlePath: bundle.bundlePath,
//       }),
//     );
//     bundle.isHermesBundle = true;
//   }
// }