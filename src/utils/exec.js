import { promisify } from 'util';
import { exec as childProcessExec } from 'child_process';

export default async function exec(script, args) {
  return promisify(childProcessExec)(script, args);
};
