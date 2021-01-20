import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import shell from 'shelljs';
import Mustache from 'mustache';
import replace from 'replace-in-file';

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

const clog = arg => console.log(chalk.blue(arg));

export async function buildAndroid(_options) {
  try {
    // Fetch config info
    const properties = await fs.readJSON(CONFIG_FILE_NAME);
    if (!properties.enabledNativePlatforms.some(p => p.toLowerCase() === 'android')) {
      throw new Error(`Android is not enabled in ${CONFIG_FILE_NAME}`)
    }
    // Create android project and copy over dependencies
    // Create local, demo and test directories if they do not exist
    const {moduleName, moduleVersion, android: androidProps} = properties;
    const {
      androidGradlePlugin,
      buildToolsVersion,
      compileSdkVersion,
      customBuildDependencies,
      customManifestBlock,
      customPlugins,
      customMavenUrls,
      extraAndroidOptions,
      extraDefaultConfig,
      minSdkVersion,
      multiDexEnabled,
      permissions,
      resSrcDirs,
      skippedNodeModules = [],
      sourceCompatibility,
      targetCompatibility,
      targetSdkVersion,
      versionCode,
      versionName,
  } = androidProps;
    const {moduleRepo, testRepo, demoRepo} = androidProps.local;
    clog(`Copying test repo templates to directory at ${chalk.green(testRepo)}...`);
    // await fs.remove(testRepo);
    await fs.copy(ANDROID_TEST_TEMPLATE_DIR, testRepo);
    clog(`Copying demo repo templates to directory at ${chalk.green(demoRepo)}...`);
    // await fs.remove(demoRepo);
    await fs.copy(ANDROID_DEMO_TEMPLATE_DIR, demoRepo);
    
    clog(`Copying android templates from ${chalk.yellow(ANDROID_MODULE_TEMPLATE_DIR)} to ${chalk.green(moduleRepo)}...`);
    // await fs.remove(moduleRepo);
    await fs.copy(ANDROID_MODULE_TEMPLATE_DIR, moduleRepo);
    
    const relativePathFromProjectToNodeModules = `./${moduleName}/node_modules`;
    const {
      nativeDependencyNames,
      moduleSettings,
      demoSettings,
      testSettings,
      libDependencies,
      imports,
      packageInstances
    } = await getDependencyConfig(moduleName, moduleRepo, demoRepo, testRepo, skippedNodeModules);

    clog(`Loading dependency names and versions from package.json...`);
  
    const {dependencies} = await fs.readJSON('./package.json');
    const reactNativeVersion = dependencies['react-native'];
    if (!reactNativeVersion) throw new Error('react-native was not found in package.json !');
    // TODO: Check for minimum version (0.63)?
    const codePushVersion = dependencies['react-native-code-push'];
    let includesCodePush = false;
    if (codePushVersion) {
      includesCodePush = true;
    }
    clog(`Copying over package.json (native deps only)`);
    const moduleJSON = {
      name: moduleName,
      version: moduleVersion,
      private: true,
      dependencies: nativeDependencyNames.reduce((result, name) => {
        result[name] = dependencies[name];
        return result;
      }, {
        'react-native': reactNativeVersion
      })
    };
    await fs.writeJSON(`${moduleRepo}/package.json`, moduleJSON, {spaces: 2, EOL: '\n'});
    clog(`Installing native node modules to android module directory`);
    await exec('npm i', {cwd: moduleRepo, shell: true});
    clog('Fixing react.gradle paths to react project + node_modules');
    await replace({
      files: `${moduleRepo}/node_modules/react-native/react.gradle`,
      from: /..\/../g,
      to: '..'
    });

    clog(`Updating AndroidManifest.xml...`);
    const manifestData = mergeInputsAndDefaults({
      customManifestBlock,
      moduleName,
      permissions
    }, DEFAULT_ANDROID_MANIFEST_DATA);
    const manifest = `${moduleRepo}/lib/src/main/AndroidManifest.xml`;
    await mustacheRenderToOutputFileUsingTemplateFile(manifest, manifestData);

    clog(`Updating activity...`);
    const activityName = `${moduleName}ReactNativeActivity`;
    const activityPathPrefix = `${moduleRepo}/lib/src/main/java/${ANDROID_PACKAGE_SRC_PATH}`;
    shell.mv(`${activityPathPrefix}/HomeTurfActivity.java`,
    `${activityPathPrefix}/${activityName}.java`);
    const activityData = mergeInputsAndDefaults({
      includesCodePush,
      moduleName,
      imports,
      packageInstances,
    }, DEFAULT_ACTIVITY_DATA);
    await mustacheRenderToOutputFileUsingTemplateFile(`${activityPathPrefix}/${activityName}.java`, activityData);

    for (const repo of [moduleRepo, testRepo, demoRepo]) {
      // https://github.com/npm/npm/issues/1862 npm renames .gitignore to .npmignore causing the generated container to emit the .gitignore file. This solution below helps to bypass it.
      shell.mv(`${process.cwd()}/${repo}/gitignore`, `${process.cwd()}/${repo}/.gitignore`);

      const repoProjectPath = repo === moduleRepo ? `${repo}/lib` : `${repo}/app`;

      clog(`Updating library project-level build.gradle...`);
      const projectGradle = `${process.cwd()}/${repo}/build.gradle`;
      const projectGradleData = mergeInputsAndDefaults({
        androidGradlePlugin,
        buildToolsVersion,
        compileSdkVersion,
        customBuildDependencies,
        customMavenUrls,
        minSdkVersion,
        relativePathFromProjectToNodeModules,
        targetSdkVersion,
      }, DEFAULT_ANDROID_PROJECT_GRADLE_DATA);
      await mustacheRenderToOutputFileUsingTemplateFile(projectGradle, projectGradleData);
  
      clog(`Updating library lib-level build.gradle...`);
      const relativePathFromLibToNodeModules = '../${moduleName}/node_modules';
      const settings = repo === moduleRepo ? moduleSettings :
                        repo === demoRepo ? demoSettings :
                        testSettings;
      const settingsGradleData = mergeInputsAndDefaults({
        settings
      }, DEFAUlT_ANDROID_SETTINGS_GRADLE_DATA);
      const settingsGradle = `${repo}/settings.gradle`;
      await mustacheRenderToOutputFileUsingTemplateFile(settingsGradle, settingsGradleData);
      const libGradleData = mergeInputsAndDefaults({
        customPlugins,
        extraAndroidOptions,
        extraDefaultConfig,
        libDependencies,
        multiDexEnabled,
        reactNativeVersion,
        relativePathFromLibToNodeModules,
        resSrcDirs,
        sourceCompatibility,
        targetCompatibility,
        versionCode,
        versionName,
      }, {
        ...DEFAULT_ANDROID_LIB_GRADLE_DATA,
        buildTypesBlock: Mustache.render(DEFAULT_ANDROID_LIB_GRADLE_DATA.buildTypesBlock, {moduleName})
      });
      const libGradle = `${repoProjectPath}/build.gradle`;
      await mustacheRenderToOutputFileUsingTemplateFile(libGradle, libGradleData);
    }
  
    // Create res files with prefixes for:
    // strings
    // possible firebase configs (google-services.json for each scheme)
    // colors/themes?
    clog('Building JS bundle...');
    fs.ensureDir(`${moduleRepo}/lib/src/main/assets`);
    await exec(`npx react-native bundle --platform android --dev false --entry-file app/index.js --bundle-output ${moduleRepo}/lib/src/main/assets/hometurf.jsbundle --assets-dest ${moduleRepo}/lib/src/main/assets --sourcemap-output ${moduleRepo}/lib/src/main/assets/hometurfsourcemap.js`);

    clog('Copying google-services.json files...');
    await fs.copy('./rnmconfig/test/google-services-debug.json', `${testRepo}/app/src/debug/google-services.json`);
    await fs.copy('./rnmconfig/test/google-services-release.json', `${testRepo}/app/src/release/google-services.json`);
    await fs.copy('./rnmconfig/demo/google-services-debug.json', `${demoRepo}/app/src/debug/google-services.json`);
    await fs.copy('./rnmconfig/demo/google-services-release.json', `${demoRepo}/app/src/release/google-services.json`);


    clog('Copying fonts...');
    await fs.copy('./app/assets/fonts', `${moduleRepo}/app/src/main/res/`);
    await fs.copy('./app/assets/fonts', `${moduleRepo}/app/src/debug/res/`);
    await fs.copy('./app/assets/fonts', `${moduleRepo}/app/src/release/res/`);

  } catch (error) {
    clog('Could not build android');
    console.log(chalk.red(error));
    process.exit(1);
  }
}

const getDependencyConfig = async (moduleName, moduleRepo, demoRepo, testRepo, skippedNodeModules) => {
  clog('Resolving dependency configurations');
  const libDependencies = [];
  const imports = [];
  const packageInstances = [];
  const moduleSettings = [];
  const demoSettings = [];
  const testSettings = [];
  const nativeDependencyNames = [];
  const appSuffixIfCodePush = (name) => {
    if (name === 'react-native-code-push') return '/app';
    return '';
  }
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
    nativeDependencyNames.push(name);
    clog(chalk.green(`> ${name}`));
    const {folder, packageImportPath, packageInstance} = androidConfig;
    const moduleSourceDirFromReactNativeSourceDir = `./${moduleName}/node_modules/${folder}`;
    const relativeToModuleSettingsSourceDir = path.relative(moduleRepo, moduleSourceDirFromReactNativeSourceDir);
    const relativeToDemoSettingsSourceDir = path.relative(demoRepo, moduleSourceDirFromReactNativeSourceDir);
    const relativeToTestSettingsSourceDir = path.relative(testRepo, moduleSourceDirFromReactNativeSourceDir);
    const gradleProjectName = name.replace('/', '_');
    if (skippedNodeModules.some(m => m === name)) {
      clog(chalk.red(`Skipping ${name}...`));
      continue;
    } else {
      libDependencies.push(`project(':${gradleProjectName}')`);
      moduleSettings.push(
        `project(':${gradleProjectName}').projectDir = new File(rootProject.projectDir, '${relativeToModuleSettingsSourceDir}${appSuffixIfCodePush(name)}')`);
      demoSettings.push(
        `project(':${gradleProjectName}').projectDir = new File(rootProject.projectDir, '${relativeToDemoSettingsSourceDir}${appSuffixIfCodePush(name)}')`);
      testSettings.push(
        `project(':${gradleProjectName}').projectDir = new File(rootProject.projectDir, '${relativeToTestSettingsSourceDir}${appSuffixIfCodePush(name)}')`);
    }
    imports.push(packageImportPath);
    packageInstances.push(packageInstance);
  }
  return {
    nativeDependencyNames,
    moduleSettings,
    demoSettings,
    testSettings,
    libDependencies,
    imports,
    packageInstances
  };
}