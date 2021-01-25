import { DEFAULT_ANDROID_PROJECT_GRADLE_DATA } from '../defaults';
import { mustacheRenderToOutputFileUsingTemplateFile } from '../../utils/mustache';
import { logStep } from '../../utils/logHelpers';
import { mergeInputsAndDefaults } from '../../utils/object';

export default async function updateProjectBuildGradleFilesFromTemplates({
  repos,
  moduleName,
  androidGradlePlugin,
  buildToolsVersion,
  compileSdkVersion,
  customBuildDependencies,
  customMavenUrls,
  minSdkVersion,
  targetSdkVersion,
}) {
  logStep(`Updating project build.gradle files for ${repos.toString()}`);
  for (const repo of repos) {
    const projectGradle = `${repo}/build.gradle`;
    const projectGradleData = mergeInputsAndDefaults({
      moduleName,
      androidGradlePlugin,
      buildToolsVersion,
      compileSdkVersion,
      customBuildDependencies,
      customMavenUrls,
      minSdkVersion,
      targetSdkVersion,
    }, DEFAULT_ANDROID_PROJECT_GRADLE_DATA);
    await mustacheRenderToOutputFileUsingTemplateFile(projectGradle, projectGradleData);
  }
}