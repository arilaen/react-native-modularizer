import { log } from '../../utils/logHelpers';
import exec from '../../utils/exec';

export default async function publishModuleExportRepo (moduleExportRepo, remoteModuleExportRepo) {
  // log('Publishing module exports...');
  // const execLib = async command => await exec(command, {cwd: moduleExportRepo});
  //   if (true) { // Initializing - new repo
  //     await execLib('git init');
  //     await execLib(`git remote add origin ${remoteModuleExportRepo}`);
  //     await execLib('git add .');
  //     await execLib('git commit -m "initialized repo, AAR + node_modules"');
  //     await execLib('git branch -M main');
  //     await execLib('git push -u origin main -f');
  //   } else {
  //     await execLib('git add .');
  //     await execLib('git commit -m "updated AAR + node_modules"');
  //     await execLib('git push -u origin main -f');
  //   }
}