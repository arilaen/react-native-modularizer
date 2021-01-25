import fs from 'fs-extra';
import shell from 'shelljs';
import { DEFAULT_LIB_ACTIVITY_DATA } from '../defaults';
import { mustacheRenderToOutputFileUsingTemplateFile } from '../../utils/mustache';
import { logStep } from '../../utils/logHelpers';
import { mergeInputsAndDefaults } from '../../utils/object';

export default async function updateReactNativeActivityFromTemplate({
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
}) {
  logStep(`Updating React Native launcher activity...`);
  const activityName = `${moduleName}ReactNativeActivity`;
  const activityPathPrefix = `${modulePath}/src/main/java/${groupId.replace(/\./g, '/')}`;
  await fs.remove(`${activityPathPrefix}/${activityName}.java`);
  await shell.mv(`${activityPathPrefix}/ReactNativeActivity.java`, `${activityPathPrefix}/${activityName}.java`);
  const activityData = mergeInputsAndDefaults({
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
  }, DEFAULT_LIB_ACTIVITY_DATA);
  await mustacheRenderToOutputFileUsingTemplateFile(`${activityPathPrefix}/${activityName}.java`, activityData);
}