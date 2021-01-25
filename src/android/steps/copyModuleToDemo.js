import fs from 'fs-extra';
import { logStep } from '../../utils/logHelpers';

export default async function copyModuleToDemo({moduleName, modulePath, demoRepo}) {
  logStep('Copy AAR, package.json + node modules to export folder');
  const demoModulePath = `${demoRepo}/${moduleName}`;
  await fs.ensureDir(demoModulePath);
  const copyToModuleExportRepo = async path => fs.copy(path, `${demoRepo}/`);
  const copyAARToModuleExportRepo = async buildType =>
    await copyToModuleExportRepo(`${modulePath}/build/outputs/aar/${buildType}.aar`);
  await copyAARToModuleExportRepo('lib-debug');
  await copyAARToModuleExportRepo('lib-staging');
  await copyAARToModuleExportRepo('lib-release');
  await copyToModuleExportRepo(`${modulePath}/package.json`);
  await copyToModuleExportRepo(`${modulePath}/package-lock.json`);
  await copyToModuleExportRepo(`${modulePath}/node_modules`);
}