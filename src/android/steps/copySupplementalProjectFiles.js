import fs from 'fs-extra';
import { logStep } from '../../utils/logHelpers';

export default async function copySupplementalProjectFiles({demoRepo, testRepo}) {
  logStep(`Copying supplemental project files to ${demoRepo} and ${testRepo}`);
  // TODO: Make the following generic
  const supplementalFiles = [
    {source: './rnmconfig/test/google-services-local.json', dest: `${testRepo}/app/src/debug/google-services.json`},
    {source: './rnmconfig/test/google-services-release.json', dest: `${testRepo}/app/src/release/google-services.json`},
    {source: './rnmconfig/demo/google-services-staging.json', dest: `${demoRepo}/app/src/debug/google-services.json`},
    {source: './rnmconfig/demo/google-services-release.json', dest: `${demoRepo}/app/src/release/google-services.json`},
    {source: './rnmconfig/test/README.md', dest: `${testRepo}/README.md`},
    {source: './rnmconfig/demo/README.md', dest: `${demoRepo}/README.md`},
  ];
  // Add log for below for each copied file
  return await Promise.all(supplementalFiles.map(({source, dest}) => fs.copy(source, dest)));
}