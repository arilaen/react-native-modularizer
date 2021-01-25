import { DEFAUlT_ANDROID_SETTINGS_GRADLE_DATA } from '../defaults';
import { mustacheRenderToOutputFileUsingTemplateFile } from '../../utils/mustache';
import { logStep } from '../../utils/logHelpers';
import { mergeInputsAndDefaults } from '../../utils/object';

export default async function updateProjectSettingsFilesFromTemplates({
  repos,
  moduleName,
  settings,
}) {
  logStep(`Updating project settings files for ${repos.toString()}...`);
  for (const repo of repos) {
    const settingsGradleData = mergeInputsAndDefaults({
      settings,
      moduleName
    }, DEFAUlT_ANDROID_SETTINGS_GRADLE_DATA);
    const settingsGradle = `${repo}/settings.gradle`;
    await mustacheRenderToOutputFileUsingTemplateFile(settingsGradle, settingsGradleData);
  }
}