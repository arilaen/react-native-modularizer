import fs from 'fs-extra';
import Steps from './steps';
import checkNativeModulesUpToDate from '../utils/checkNativeModulesUpToDate';
import ensureFoldersExist from '../utils/ensureFoldersExist';
import {log, logError} from '../utils/logHelpers';
import getDependencyConfig from './androidUtils/getDependencyConfig';
import loadDependencyNamesAndVersionsFromPackageJSON from './androidUtils/loadDependencyNamesAndVersionsFromPackageJSON';
import checkRNMConfigUpToDate from '../utils/checkRNMConfigUpToDate';
import { CONFIG_FILE_NAME } from '../config';

const FORCE_UPDATE_TEMPLATES = true;
const SKIP_JS_BUNDLE = true;

export async function buildAndroid(options) {
  try {
    // Fetch configuration information from .rnmrc.json at react native project level root
    const {android: androidProps, moduleVersion} = await fs.readJSON(`./${CONFIG_FILE_NAME}`);
    const {
      moduleName,
      groupId,
      additionalActivityImports,
      androidGradlePlugin,
      beforeOnCreate,
      buildToolsVersion,
      compileSdkVersion,
      customBuildDependencies,
      customManifestBlock,
      customApplicationManifestBlock,
      customPlugins,
      customMavenUrls,
      extraAndroidOptions,
      extraDefaultConfig,
      extraLibDependencies,
      jsBundleFilePathStaging,
      jsBundleFilePathRelease,
      manualPackages,
      minSdkVersion,
      multiDexEnabled,
      permissions,
      reactAppName,
      resSrcDirs,
      skippedNodeModules = [],
      sourceCompatibility,
      targetCompatibility,
      targetSdkVersion,
      versionCode,
      versionName,
    } = androidProps;
    // Set locations of test and demo projects to be created/updated
    const {testRepo, demoRepo} = androidProps.local;
    // Set path of module to be created/updated in test project
    const modulePath = `${testRepo}/${moduleName}`;
    
    // Find native dependencies for checking current installed deps and updating if needed,
    // and related data (package imports, etc.) for populating templates if not up to date
    const {
      nativeDependencyNames,
      settings,
      libDependencies,
      imports,
      packageInstances,
      manualImports,
      manualPackageInstances
    } = await getDependencyConfig({moduleName, skippedNodeModules, manualPackages});

    // Determine whether this is the first time the project has been set up
    // const notInitialRun = await checkPathsExist(
    //   `${modulePath}/used-android.${CONFIG_FILE_NAME}`,
    //   `${demoRepo}/${moduleName}/build.gradle`
    // );

    // Create local test, modulePath and demo repo folders if they don't already exist
    await ensureFoldersExist(testRepo, modulePath, demoRepo);

    // Find all RN deps (including ones that do not have native modules) and RN version (i.e. 0.63.4)
    const {
      dependencies: allReactNativeProjectDependencies,
      reactNativeVersion
    } = await loadDependencyNamesAndVersionsFromPackageJSON({dir: '.'});
    const needToInstallNativeNodeModulesWithFixes = await getNeedToInstallNativeNodeModulesWithFixes({
      options,
      modulePath,
      allReactNativeProjectDependencies,
      nativeDependencyNames
    });

    // Create/update package.json and node_modules in module if needed
    if (needToInstallNativeNodeModulesWithFixes) {
      await Steps.installNativeNodeModulesWithFixes({
        modulePath, moduleName, moduleVersion, nativeDependencyNames, reactNativeVersion, allReactNativeProjectDependencies
      });
    }

    const needToUpdateTemplates = await getNeedToUpdateTemplates({
      needToInstallNativeNodeModulesWithFixes,
      options,
      modulePath
    });
    
    // Copy and populate templates if needed (initial load, dependency update, rnmrc.js update or CLI flag)
    if (needToUpdateTemplates) {
      await Steps.copyTemplates({demoRepo, testRepo, moduleName});
      await Steps.updateModuleAndroidManifestFromTemplate({
        modulePath,
        moduleName,
        customManifestBlock,
        customApplicationManifestBlock,
        permissions,
        groupId
      });
      await Steps.updateReactNativeActivityFromTemplate({
        modulePath,
        moduleName,
        imports,
        manualImports,
        additionalActivityImports,
        packageInstances,
        manualPackageInstances,
        jsBundleFilePathStaging,
        jsBundleFilePathRelease,
        reactAppName,
        groupId,
        beforeOnCreate
      });
      await Steps.updateAppActivitiesFromTemplates({
        demoRepo,
        testRepo,
        moduleName,
        imports,
        manualImports,
        packageInstances,
        manualPackageInstances,
        jsBundleFilePathStaging,
        jsBundleFilePathRelease,
        reactAppName,
        groupId
      });
      await Steps.updateProjectSettingsFilesFromTemplates({
        repos: [testRepo, demoRepo],
        moduleName,
        settings
      });
      await Steps.updateProjectBuildGradleFilesFromTemplates({
        repos: [testRepo, demoRepo],
        moduleName,
        androidGradlePlugin,
        buildToolsVersion,
        compileSdkVersion,
        customBuildDependencies,
        customMavenUrls,
        minSdkVersion,
        targetSdkVersion,
      });
      await Steps.updateAppBuildGradleFilesFromTemplates({
        repos: [testRepo, demoRepo],
        moduleName,
        customPlugins,
        extraAndroidOptions,
        extraDefaultConfig,
        extraLibDependencies,
        libDependencies,
        multiDexEnabled,
        reactNativeVersion,
        resSrcDirs,
        sourceCompatibility,
        targetCompatibility,
        versionCode,
        versionName,
        groupId
      });
      await Steps.updateModuleBuildGradleFileFromTemplate({
        modulePath,
        moduleName,
        customPlugins,
        extraAndroidOptions,
        extraDefaultConfig,
        extraLibDependencies,
        libDependencies,
        multiDexEnabled,
        reactNativeVersion,
        resSrcDirs,
        sourceCompatibility,
        targetCompatibility,
        versionCode,
        versionName,
        groupId
      });
    } else {
      log('Skipping templating...');
    }
    await Steps.copySupplementalProjectFiles({demoRepo, testRepo});
    if (!SKIP_JS_BUNDLE && !options.skipJSBundle) {
      await Steps.buildJSBundle(modulePath);
    }
    await Steps.testBuild({moduleName, testRepo});
    // await Steps.copyModuleToDemo({moduleName, modulePath, demoRepo});
    // await Steps.publishModuleExportRepo(moduleExportRepo, androidProps.remote.moduleRepo);
  } catch (error) {
    logError('Could not build android');
    logError(error);
    process.exit(1);
  }
}

/**
 * 
 * Helper methods
 * 
 * */

const getNeedToInstallNativeNodeModulesWithFixes = async ({
  options,
  modulePath,
  allReactNativeProjectDependencies,
  nativeDependencyNames
}) => {
  if (options.forceUpdateNodeModules) return true;
  // Verify if any previously created module package.json is up to date
  // by checking that it contains all native dependency versions defined in react native package.json
  const upToDate = await checkNativeModulesUpToDate({
    modulePath,
    allReactNativeProjectDependencies,
    nativeDependencyNames
  });
  return !upToDate;
}

const getNeedToUpdateTemplates = async ({
  needToInstallNativeNodeModulesWithFixes,
  options,
  modulePath
}) => {
  if (needToInstallNativeNodeModulesWithFixes || options.forceUpdateTemplates || FORCE_UPDATE_TEMPLATES) return true;
  // Verify if the project was previously created with a different .rnmrc.json (only comparing android section)
  // Previously used android part of .rnmrc.json is stored at modulePath with name: used-android.rnmrc.json
  const rnmConfigUpToDate = await checkRNMConfigUpToDate({
    modulePath,
    platform: 'android'
  });
  return !rnmConfigUpToDate;
}