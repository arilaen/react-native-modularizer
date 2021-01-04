# React Native Modularizer

## Overview

A utility to create exports from React Native projects that can be implemented as modules into native iOS and Android apps for brownfield projects.

### Rationale

There are occassions where native teams want to start using React Native without rewriting the rest of their app immediately (greenfield approach), so they opt for a brownfield approach where they can use React Native code within their native apps.

On paper, this is supported by React Native (see: [Integration with Existing Apps](https://reactnative.dev/docs/integration-with-existing-apps)). Unfortunately, they do not cover every use case:

- The guides assume the same teams are working on the Native and React Native apps, when it is possible for different teams (even different companies) to work on them. This requires using an export approach which adds significant complexity. For instance, many react native libraries do not automatically compile when in a library module rather than an application on android, and auto-linking does not work out of the box either. In addition, creating fat AAR exports containing all of the node module dependencies is not supported yet by default (see this long-lived [google issue](https://issuetracker.google.com/issues/62121508)).
- If a company wants to publish their React Native code as a native SDK, they may be interested in obfuscation of code, which is also not possible without specific packaging rules
- Consumers may not want to use node at all - so we need to bundle all native modules (react-native-webview, etc.) into the module and override certain defaults (i.e. have an export that lets us use the debug metro JS bundle on localhost:8081, but provide another export for teams that uses the production bundle JS even in debug mode)
- While doing all this the React Native teams may still want to maintain a build/release process for their standalone app, so this process is still separate and does not replace or preclude regular React Native development
- Certain libraries (firebase, code push) require initialization/configuration code that is difficult to move to modules

### Similar Projects

Some of the provided scripts are similar to those used by [Electrode Native](https://native.electrode.io/), particularly the container-gen projects, with the following differences:

- No need to use a separate CLI for all tasks - only for build tasks
- No need to convert an existing project for compatibility with the tool (currently that process is not well documented for electrode native)
- Support for navigation (i.e. `react-navigation` due to support for `react-native-gesture-handler`), no need for separate navigation libraries
- No concepts of "MiniApp", "Composite". Every exported module corresponds to just one React Native project. If multiple projects are used, any dependency conflicts must be resolved by the maintainers. We do allow publishing a list of native dependencies and versions to a "Manifest" repo to help with this
- More guidance around providing private/extra third party libraries. [Details TBD - we found that one of our third party libraries did not work with electrode native at all even after adding it to our private manifest, but were able to add it with this process]

We have also taken inspiration from [react-native-brownfield](https://github.com/callstack/react-native-brownfield) for utility functions (starting/exiting the app) but that project does not cover building binary modules.

## Steps

### Initial Setup

1. Add this line to your existing React Native app's package.json:
```.sh
    "react-native-call-detection": "https://github.com/HomeTurf-LLC/react-native-modularizer.git",
```

2. `npm i`

3. Run `npm run rnm init` and/or create/update a `rnmrc.json` file with the following properties (and create these repos as well on github etc.):

```.sh
{
  "moduleName": "$MODULE_NAME",
  "launchMode": "navigation|modal",
  "android": {
    "customBuildDependencies": [],
    "customPlugins": [],
    "resSrcDirs": [],
    "implementations": [],
    "sourceCompatibility": "VERSION_1_8",
    "targetCompatibility": "VERSION_1_8",
    "multiDexEnabled": "true|false",
    "androidGradlePlugin": "4.2.0-beta02",
    "local": {
      "moduleRepo": "$LOCAL_ANDROID_MODULE_REPO",
      "testRepo": "$LOCAL_ANDROID_TEST_REPO",
      "demoRepo": "$LOCAL_ANDROID_DEMO_REPO"
    },
    "remote": {
      "moduleRepo": "$REMOTE_ANDROID_MODULE_REPO",
      "testRepo": "$REMOTE_ANDROID_TEST_REPO",
      "demoRepo": "$REMOTE_ANDROID_DEMO_REPO"
    }
  },
  "ios": {
    "customBuildDependencies": [],
    "local": {
      "moduleRepo": "$LOCAL_IOS_MODULE_REPO",
      "testRepo": "$LOCAL_IOS_TEST_REPO",
      "demoRepo": "$LOCAL_IOS_DEMO_REPO"
    },
    "remote": {
      "moduleRepo": "$REMOTE_IOS_MODULE_REPO",
      "testRepo": "$REMOTE_IOS_TEST_REPO",
      "demoRepo": "$REMOTE_IOS_DEMO_REPO"
    }
  },
  "version-manifest-repo": "$VERSION_MANIFEST_REPO"
}
```

The test repos can be used internally by the React Native teams to verify functionality with debug mode bundle hot reloading on localhost:8081, and the demo repos can be made public to native app teams, and will only use the production JS bundle (even in debug mode) so there are no javascript dependencies.

Note: using github etc. URLs in `ssh` format is recommended, since it does not require logging in when scripts are run. If you prefer listing as https you can set your config to force SSH by adding the following to your global ~/.gitconfig:

```.sh
[url "git@github.com:"]
        insteadOf = https://github.com/
```

4. (Optional) To obfuscate your JS code, use (React Native Obfuscating Transformer)[https://github.com/javascript-obfuscator/react-native-obfuscating-transformer]

_TODO: Update/point to fork that uses up to date version >=1.3.0 of js-transformer_

### Android

1. Run `npx react-native-modularizer android`

2. Run `npm start`. In a separate terminal, checkout and pull your `ANDROID_TEST_REPO`, build and run, re-running step 1 to update JS bundle when changes are complete

3. Checkout and pull your `ANDROID_DEMO_REPO` and verify integration before sharing repos

### iOS

1. Run `npx react-native-modularizer ios`

2. Run `npm start`. In a separate terminal, checkout and pull your `IOS_TEST_REPO`, build and run, re-running step 1 to update JS bundle when changes are complete

3. Checkout and pull your `IOS_DEMO_REPO` and verify integration before sharing repos

## Other possible topics

- Firebase-specific integration (where to put assets)
- Font integration (assets again)
- Code push integration + testing
- Setting environment variables (we use Firebase remote-config for most)
- Linking custom libraries (i.e. iOS lib that usually requires manually linked framework)
- Turning on/off native code obfuscation
- Setting navigation type (i.e. in navigation controller vs modal)
- Code/template overrides
