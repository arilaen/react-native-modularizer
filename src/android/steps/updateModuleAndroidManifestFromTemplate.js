import { DEFAULT_ANDROID_MANIFEST_DATA } from '../defaults';
import {mustacheRenderToOutputFileUsingTemplateFile} from '../../utils/mustache';
import {logStep} from '../../utils/logHelpers';
import { mergeInputsAndDefaults } from '../../utils/object';

export default async function updateModuleAndroidManifestFromTemplate({
  modulePath,
  customManifestBlock,
  customApplicationManifestBlock,
  moduleName,
  permissions,
  groupId
}) {
  logStep(`Updating module's AndroidManifest.xml...`);
  const manifestData = mergeInputsAndDefaults({
    customManifestBlock,
    customApplicationManifestBlock,
    moduleName,
    permissions,
    groupId
  }, DEFAULT_ANDROID_MANIFEST_DATA);
  const manifest = `${modulePath}/src/main/AndroidManifest.xml`;
  await mustacheRenderToOutputFileUsingTemplateFile(manifest, manifestData);
}