import fs from 'fs-extra';
import replace from 'replace-in-file';
import { log, logStep } from '../../utils/logHelpers';
import exec from '../../utils/exec';
import applyReactNativeDependencyReplacement from '../snippets/applyReactNativeDependencyReplacement';

export default async function installNativeNodeModulesWithFixes({
  modulePath, moduleName, moduleVersion, nativeDependencyNames, reactNativeVersion, allReactNativeProjectDependencies,
}) {
  logStep(`Copying over package.json (native deps only)`);
  const moduleJSON = {
    name: moduleName,
    version: moduleVersion,
    private: true,
    dependencies: nativeDependencyNames.reduce((result, name) => {
      result[name] = allReactNativeProjectDependencies[name];
      return result;
    }, {
      'react-native': reactNativeVersion
    }),
    scripts: {
      "postinstall": "npm i jetifier && npx jetify"
    }
  };
  const nodeModulesPath = `${modulePath}/node_modules`;
  await fs.writeJSON(`${modulePath}/package.json`, moduleJSON, {spaces: 2, EOL: '\n'});
  log(`Clear react-native and firebase analytics repos, just in case they're already set so replacements will only happen once`);
  await fs.remove(`${nodeModulesPath}/react-native`, {cwd: process.cwd()});
  await fs.remove(`${nodeModulesPath}/@react-native-firebase`, {cwd: process.cwd()});
  await fs.remove(`${nodeModulesPath}/@bugsnag`, {cwd: process.cwd()});
  log(`Removing package-lock.json if it exists`);
  await fs.remove(`${modulePath}/package-lock.json`);
  log(`Installing native node modules to android module directory`);
  await exec('npm i', {cwd: modulePath, shell: true});
  log('Fixing react.gradle paths to react project + node modules');
  await replace({
    files: `${nodeModulesPath}/react-native/react.gradle`,
    from: /\.\.\/\.\./g,
    to: '..'
  });
  log('Fixing bugsnag dependency');
  await replace({
    files: `${nodeModulesPath}/@bugsnag/react-native/android/build.gradle`,
    from: /5\.5\.0-react-native/g,
    to: '5.5.1'
  });
  // // Replacing ReactNativeModule.module.applyReactNativeDependency("api") with method that allows custom directory
  // // see https://github.com/invertase/react-native-gradle-plugin/issues/2 and https://github.com/invertase/react-native-firebase/pull/4375/files
  // // May be able to do the following if a fix is related for the above react-native-gradle-plugin issue (1.5) and published in firebase
  // // await exec(`sed -i -e '/set(/a \ \ \ \ options: [ reactNativeAndroidDir: "/../../../react-native/android" ],' build.gradle`,
  // //   {cwd: `${nodeModulesPath}/@react-native-firebase/analytics/android`});
  log('Using custom applyReactNativeDependency method with custom node modules path');
  for (const firebaseDependencyName of nativeDependencyNames.filter(d => d.includes('@react-native-firebase'))) {
    await replace({
      files: `${nodeModulesPath}/${firebaseDependencyName}/android/build.gradle`,
      from: /ReactNative\.module\.applyReactNativeDependency\("api"\)/,
      to: applyReactNativeDependencyReplacement
    });
  }
}