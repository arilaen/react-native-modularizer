import fs from 'fs-extra';
import { CONFIG_FILE_NAME } from '../config';
import {logStep, logError} from './logHelpers';

export default async function checkRNMConfigUpToDate({
  modulePath,
  platform
}) {
  logStep('Checking if .rnmconfig has been updated since last run (if so, templates all need updating)');
  const pathToUsedPlatformRNMConfig = `${modulePath}/used-${platform}${CONFIG_FILE_NAME}`;
  const usedConfigExists = await fs.pathExists(pathToUsedPlatformRNMConfig);
  if (!usedConfigExists) return false;
  try {
    const usedPlatformRNMConfig = require(pathToUsedPlatformRNMConfig);
    const currentPlatformRNMConfig = require(CONFIG_FILE_NAME).android;
    return JSON.stringify(usedPlatformRNMConfig) === JSON.stringify(currentPlatformRNMConfig);
  } catch (error) {
    logError(`Error checking if config is up to date, returning false`);
    logError(error);
    return false;
  }
}