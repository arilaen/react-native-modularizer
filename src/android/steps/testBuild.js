import { logStep } from '../../utils/logHelpers';
import exec from '../../utils/exec';

export default async function testBuild({moduleName, testRepo}) {
  logStep('Testing gradle sync and build...');
  await exec('gradle wrapper', {cwd: testRepo});
  await exec(`./gradlew ${moduleName}:build -x lint`, {cwd: testRepo});
}