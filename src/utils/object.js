import {isNil, omitBy} from 'lodash';

export function mergeInputsAndDefaults(inputsObject, defaultsObject) {
  const inputObjectWithoutNilValues = omitBy(inputsObject, isNil);
  return {
    ...defaultsObject,
    ...inputObjectWithoutNilValues
  }
}