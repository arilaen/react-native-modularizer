import fs from 'fs-extra';
import {CONFIG_FILE_NAME} from './config';

export default async function initialize() {

  const err = await fs.stat(CONFIG_FILE_NAME);
  if (err) {
    console.warn({err}); // File does not exist - TODO: Remove
    console.log('Initializing new project');
  } else {
    const existingFileResponse = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: `A configuration file already exists (at ${CONFIG_FILE_NAME}), would you like to overwrite it?`,
      default: false,
    }]);
    if (!existingFileResponse.overwrite) {
      return;
    }
  }
  const packageJsonProps = await fs.readJSON('package.json');
  const moduleNameFromPackageJson = packageJsonProps.name;
  const firstAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'moduleName',
      message: 'What will the name of your exported react native module be? (This can be different than the package.json value.)',
      default: moduleNameFromPackageJson
    },
    {
      type: 'list',
      name: 'enabledNativePlatforms',
      message: 'Which native modules should be created?',
      choices: ['android,ios', 'android', 'ios'],
      default: 'android,ios'
    },
    {
      type: 'list',
      name: 'navigationMode',
      message: 'What navigation mode should the app use?',
      choices: ['modal', 'navigatorBar'],
      default: 'modal'
    },
    {
      type: 'input',
      name: 'githubOrganization',
      message: 'What is the name of your github organization?',
      default: 'HomeTurf-LLC'
    },
    {
      type: 'confirm',
      name: 'customizePaths',
      message: 'Would you like to customize the local and remote paths for your configuration?',
      default: false
    }
  ])
  const {name,enabledNativeModules,navigationMode} = firstAnswers;

  if (enabledNativeModules.includes('android')) {
    const androidQuestions = await inquirer.prompt([
      {
        type: 'input',
        name: 'androidLocalPath',
        message: 'Where should the local android module be saved to?',
        default: '../android-rn-module'
      },
      {
        type: 'input',
        name: 'androidRemotePath',
        message: 'Where should the android module be published to?',
        default: ''
      }
    ]);
  }
  const data = {
    moduleName,
    launchMode,
    android: {
      customBuildDependencies: androidCustomDependencies
    }
  };
  const writeErr = await fs.writeFile(CONFIG_FILE_NAME, data);
  if (writeErr) throw writeErr;
  console.log('Initialized react-native modularizer configuration successfully (in .rnmrc)');
}
