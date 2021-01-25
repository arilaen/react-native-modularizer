import { DEFAULT_APP_ACTIVITY_DATA } from '../defaults';
import { mustacheRenderToOutputFileUsingTemplateFile } from '../../utils/mustache';
import { logStep } from '../../utils/logHelpers';
import { mergeInputsAndDefaults } from '../../utils/object';

export default async function updateAppActivitiesFromTemplates({
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
}) {
  logStep(`Updating app activities...`);
  const packagePathPrefix = groupId.split('.').slice(0, -1).join('/');
  for (const repo of [demoRepo, testRepo]) {
    const partialPackagePath = `${packagePathPrefix}/${repo === demoRepo ? 'demo' : 'test'}consumerapp`;
    const activityPathPrefix = `${repo}/app/src/main/java/${partialPackagePath}`;
    const activityData = mergeInputsAndDefaults({
      moduleName,
      imports,
      manualImports,
      packageInstances,
      manualPackageInstances,
      jsBundleFilePathStaging,
      jsBundleFilePathRelease,
      reactAppName,
      groupId
    }, DEFAULT_APP_ACTIVITY_DATA);
    await mustacheRenderToOutputFileUsingTemplateFile(`${activityPathPrefix}/MainActivity.java`, activityData);
  }
}