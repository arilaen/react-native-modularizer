import chalk from 'chalk';

export const log = message => console.log(chalk.white(message));
export const logStep = message => console.log(chalk.magenta(`~~~~~~ ${message} ~~~~~~`));
export const logError = message => console.log(chalk.red(message));
export const logWarning = message => console.log(chalk.yellow(message));
export const nameInMessage = message => chalk.green(message);
export const logName = message => console.log(nameInMessage(message));