import fs from 'fs-extra';
import shell from 'shelljs'
import { CONFIG_FILE_NAME } from '../../config';
import { logStep } from '../../utils/logHelpers';

const ANDROID_TEMPLATE_ROOT = `${__dirname}/../../../templates/android`;
const ANDROID_TEST_TEMPLATE_DIR = `${ANDROID_TEMPLATE_ROOT}/test`;
const ANDROID_DEMO_TEMPLATE_DIR = `${ANDROID_TEMPLATE_ROOT}/demo`;

export default async function copyTemplates({demoRepo, testRepo, moduleName}) {
  logStep(`Copying templates to ${demoRepo} and ${testRepo}`);
  await fs.copy(ANDROID_TEST_TEMPLATE_DIR, testRepo);
  await fs.copy(ANDROID_DEMO_TEMPLATE_DIR, demoRepo);
  // Rename module -> moduleName
  await fs.copy(`./${testRepo}/module`, `./${testRepo}/${moduleName}`);
  await fs.remove(`./${testRepo}/module`);
  // https://github.com/npm/npm/issues/1862 npm renames .gitignore to .npmignore causing the generated container to emit the .gitignore file. This solution below helps to bypass it.
  await shell.mv(`${process.cwd()}/${demoRepo}/gitignore`, `${process.cwd()}/${demoRepo}/.gitignore`);
  await shell.mv(`${process.cwd()}/${testRepo}/gitignore`, `${process.cwd()}/${testRepo}/.gitignore`);
  // await shell.mv(`${process.cwd()}/${testRepo}/${moduleName}/gitignore`, `${process.cwd()}/${testRepo}/${moduleName}/.gitignore`);
  
  // Copy over rnmrc for reference
  await fs.copy(`./${CONFIG_FILE_NAME}`, `${testRepo}/${moduleName}/used-android.rnmrc.json`);
}