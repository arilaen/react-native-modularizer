import Mustache from 'mustache';

import { DEFAULT_ANDROID_LIB_GRADLE_DATA } from '../defaults';
import {mustacheRenderToOutputFileUsingTemplateFile} from '../../utils/mustache';
import {logStep} from '../../utils/logHelpers';
import { mergeInputsAndDefaults } from '../../utils/object';

export default async function updateModuleBuildGradleFileFromTemplate({
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
  groupId,
}) {
  logStep(`Updating module's build.gradle (in test repo)...`);
  const moduleGradleData = mergeInputsAndDefaults({
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
    ...DEFAULT_ANDROID_LIB_GRADLE_DATA,
    buildTypesBlock: Mustache.render(DEFAULT_ANDROID_LIB_GRADLE_DATA.buildTypesBlock, {moduleName})
  });
  const moduleGradle = `${modulePath}/build.gradle`;
  await mustacheRenderToOutputFileUsingTemplateFile(moduleGradle, moduleGradleData);
}