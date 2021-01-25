import fs from 'fs-extra';
import { logStep } from '../../utils/logHelpers';

export default async function copyModuleExportsToGitRepo(moduleRepo, moduleExportRepo, relativePathFromProjectToPackageJsonRoot) {
  logStep('Copy AAR, package.json + node modules to export folder');
  await fs.ensureDir(moduleExportRepo);
    const copyToModuleExportRepo = async pathToFileOrDir => {
      const fileOrDir = pathToFileOrDir.split('/').slice(-1);
      await fs.copy(pathToFileOrDir, `${moduleExportRepo}/${fileOrDir}`);
    }
    const copyAARToModuleExportRepo = async buildType =>
      await copyToModuleExportRepo(`${moduleRepo}/lib/build/outputs/aar/${buildType}.aar`);
    await copyAARToModuleExportRepo('lib-debug');
    await copyAARToModuleExportRepo('lib-staging');
    await copyAARToModuleExportRepo('lib-release');
    await copyToModuleExportRepo(`${moduleRepo}/${relativePathFromProjectToPackageJsonRoot}/package.json`);
    await copyToModuleExportRepo(`${moduleRepo}/${relativePathFromProjectToPackageJsonRoot}/package-lock.json`);
    await copyToModuleExportRepo(`${moduleRepo}/${relativePathFromProjectToPackageJsonRoot}/node_modules`);
}