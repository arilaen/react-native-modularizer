
const DEFAULT_ANDROID_GRADLE_PLUGIN = "4.2.0-beta02"
const DEFAULT_BUILD_TOOLS_VERSION = "29.0.2";
const DEFAULT_REACT_NATIVE_VERSION = "0.63.4";

const DEFAULT_COMPILE_SDK_VERSION = 29;
const DEFAULT_MIN_SDK_VERSION = 29;
const DEFAULT_TARGET_SDK_VERSION = 29;

const DEFAULT_MULTI_DEX_ENABLED = true;

const DEFAULT_SOURCE_COMPATIBILITY = "VERSION_1_8";
const DEFAULT_TARGET_COMPATIBILITY = "VERSION_1_8";

const DEFAULT_VERSION_CODE = 1;
const DEFAULT_VERSION_NAME = "1.0";

const DEFAULT_BUILD_TYPES_BLOCK = `
  debug {
    // Note: CodePush updates should not be tested in Debug mode as they are overriden by the RN packager. However, because CodePush checks for updates in all modes, we must supply a key.
    resValue "string", "CodePushDeployment", '""'
    resValue "string", "InstabugId", '"6da660c42b1e6617866ae4372cb59833"'
  }

  staging {
    resValue "string", "InAppHomeTurfCodePushAndroid", '"gz19H3hIVe7LBCF3zTK0jXzpBrmX19920bc3-8868-4dbb-8825-6ec265e099a0"'
    resValue "string", "InstabugId", '"6da660c42b1e6617866ae4372cb59833"'
    // Note: It is a good idea to provide matchingFallbacks for the new buildType you create to prevent build issues
    // Add the following line if not already there
    matchingFallbacks = ['release']
  }

  dexOptions {
    // release & debug is in project animators
    matchingFallbacks = ['release', 'debug']
  }

  release {
    minifyEnabled false
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    resValue 'string', 'InAppHomeTurfCodePushAndroid', '"hV1XsR7kNq73KEPBvkFIEyPgaC-519920bc3-8868-4dbb-8825-6ec265e099a0"'
    resValue "string", "InstabugId", '"5ec9e298933a520b50e2463da7ac3760"'
  }
`;

const DEFAULT_EXTRA_ANDROID_CONTENT = ``;
const DEFAULT_MANIFEST_BLOCK = ``;

const DEFAULT_MODULE_NAME = 'MyApp';

export const DEFAULT_ANDROID_PROJECT_GRADLE_DATA = {
  androidGradlePlugin: DEFAULT_ANDROID_GRADLE_PLUGIN,
  customBuildDependencies: [],
  customRepos: [],
}

export const DEFAULT_ANDROID_LIB_GRADLE_DATA = {
  buildToolsVersion: DEFAULT_BUILD_TOOLS_VERSION,
  buildTypesBlock: DEFAULT_BUILD_TYPES_BLOCK,
  compileSdkVersion: DEFAULT_COMPILE_SDK_VERSION,
  extraAndroidContent: DEFAULT_EXTRA_ANDROID_CONTENT,
  implementations: [],
  minSdkVersion: DEFAULT_MIN_SDK_VERSION,
  multiDexEnabled: DEFAULT_MULTI_DEX_ENABLED,
  reactNativeVersion: DEFAULT_REACT_NATIVE_VERSION,
  resSrcDirs: ``,
  sourceCompatibility: DEFAULT_SOURCE_COMPATIBILITY,
  targetCompatibility: DEFAULT_TARGET_COMPATIBILITY,
  targetSdkVersion: DEFAULT_TARGET_SDK_VERSION,
  versionCode: DEFAULT_VERSION_CODE,
  versionName: DEFAULT_VERSION_NAME
}

export const DEFAULT_ANDROID_MANIFEST_DATA = {
  customManifestBlock: DEFAULT_MANIFEST_BLOCK,
  moduleName: DEFAULT_MODULE_NAME,
  permissions: []
}

export const DEFAULT_ACTIVITY_DATA = {
  moduleName: DEFAULT_MODULE_NAME,
  imports: [],
  packageInstances: []
}

export const DEFAUlT_ANDROID_SETTINGS_GRADLE_DATA = {
  settings: []
}