import testBuild from './testBuild';
import buildJSBundle from './buildJSBundle';
import copyModuleToDemo from './copyModuleToDemo';
import copySupplementalProjectFiles from './copySupplementalProjectFiles';
import copyTemplates from './copyTemplates';
import installNativeNodeModulesWithFixes from './installNativeNodeModulesWithFixes';
import publishModuleExportRepo from './publishModuleExportRepo';
import updateModuleAndroidManifestFromTemplate from './updateModuleAndroidManifestFromTemplate';
import updateAppActivitiesFromTemplates from './updateAppActivitiesFromTemplates';
import updateAppBuildGradleFilesFromTemplates from './updateAppBuildGradleFilesFromTemplates';
import updateModuleBuildGradleFileFromTemplate from './updateModuleBuildGradleFileFromTemplate';
import updateProjectBuildGradleFilesFromTemplates from './updateProjectBuildGradleFilesFromTemplates';
import updateProjectSettingsFilesFromTemplates from './updateProjectSettingsFilesFromTemplates';
import updateReactNativeActivityFromTemplate from './updateReactNativeActivityFromTemplate';

// Listed in normal execute order, for reference
const stepsInExecuteOrder = {
  copyTemplates,
  installNativeNodeModulesWithFixes,

  // Template update steps
  updateModuleAndroidManifestFromTemplate,
  updateReactNativeActivityFromTemplate,
  updateAppActivitiesFromTemplates,
  updateProjectSettingsFilesFromTemplates,
  updateProjectBuildGradleFilesFromTemplates,
  updateAppBuildGradleFilesFromTemplates,
  updateModuleBuildGradleFileFromTemplate,

  copySupplementalProjectFiles,
  buildJSBundle,
  testBuild,
  copyModuleToDemo,
  publishModuleExportRepo
}

export default stepsInExecuteOrder;