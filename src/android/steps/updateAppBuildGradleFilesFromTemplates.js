import Mustache from 'mustache';

import { DEFAULT_ANDROID_APP_GRADLE_DATA } from '../defaults';
import { mustacheRenderToOutputFileUsingTemplateFile } from '../../utils/mustache';
import { logStep } from '../../utils/logHelpers';
import { mergeInputsAndDefaults } from '../../utils/object';

export default async function updateAppBuildGradleFilesFromTemplates({
  repos,
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
  groupId,
}) {
  logStep(`Updating app build gradle files for ${repos.toString()}`);
  for (const repo of repos) {
    const libGradleData = mergeInputsAndDefaults({
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
      groupId,
    }, {
      ...DEFAULT_ANDROID_APP_GRADLE_DATA,
      buildTypesBlock: Mustache.render(DEFAULT_ANDROID_APP_GRADLE_DATA.buildTypesBlock, {moduleName})
    });
    const libGradle = `${repo}/app/build.gradle`;
    await mustacheRenderToOutputFileUsingTemplateFile(libGradle, libGradleData);
  }
}