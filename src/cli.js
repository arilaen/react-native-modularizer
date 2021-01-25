import arg from 'arg';
import chalk from 'chalk';
import inquirer from 'inquirer';
import {buildAndroid} from './android';
import initialize from './initialize';
import { nameInMessage } from './utils/logHelpers';

const BUILD_TASK = 'build';
const INIT_TASK = 'init';
const HELP_TASK = 'help';

const allTasks = [BUILD_TASK, INIT_TASK, HELP_TASK];

 function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--publish': Boolean,
      '-p': '--publish',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    publish: args['--publish'] || false,
    task: args._[0],
    template: args._[1],
  };
}
  
async function promptForMissingOptions(options) {
  if (!options.task) {
    throw new Error('No task specified; run `rnm help` to see all available tasks.')
  }
  const questions = [];
  if (options.task === BUILD_TASK) {
    if (!options.template) {
      questions.push({
        type: 'list',
        name: 'template',
        message: 'Please choose which native platform to use',
        choices: ['Android', 'iOS'],
      });
    }
    
    // if (!options.publish) {
    //   questions.push({
    //     type: 'confirm',
    //     name: 'publish',
    //     message: 'Do you want to publish your build files on completion?',
    //     default: false,
    //   });
    // }
  } else if (options.task === INIT_TASK) {
    // continue
  } else if (options.task === HELP_TASK) {
    console.log(chalk.blue('Available tasks:'));
    allTasks.forEach(task => {
      console.log(`   ${nameInMessage(task)}`);
    })
  } else {
    throw new Error("Invalid task specified; run `help` to see all available tasks.");
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    publish: options.publish || answers.publish,
  };
}
  
export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  if (options.task === INIT_TASK) {
    return await initialize();
  } else if (options.task === BUILD_TASK) {
    if (options.template.toLowerCase() === 'android') {
      await buildAndroid(options);
    }
  }
}