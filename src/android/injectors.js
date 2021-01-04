/* This function retrieve the 'jsc-android' package and unzip the AAR
   * matching the desired JSC variant ('android-jsc' or 'android-jsc-intl').
   * It then copy the 'libjsc.so' files to the 'jniLibs' directory of the
   * Container. This way, the JSC engine is shipped within the Container and
   * applications won't crash at runtime when trying to load this library.
   */
// export async function injectJavaScriptCoreEngine(
//     config,
//     reactNativeVersion,
//   ) {
//     let jscVersion =
//       (config.androidConfig && config.androidConfig.jscVersion) ||
//       android.getDefaultJSCVersion(reactNativeVersion);
//     const jscVariant =
//       (config.androidConfig && config.androidConfig.jscVariant) ||
//       android.DEFAULT_JSC_VARIANT;
//     const workingDir = createTmpDir();
//     try {
//       shell.pushd(workingDir);
//       await yarn.init();
//       await yarn.add(PackagePath.fromString(`jsc-android@${jscVersion}`));
//       const versionMajor = semver.major(semver.coerce(jscVersion)!.version);
//       const jscVersionPath = path.resolve(
//         `./node_modules/jsc-android/dist/org/webkit/${jscVariant}/r${versionMajor}`,
//       );
//       const jscAARPath = path.join(
//         jscVersionPath,
//         `${jscVariant}-r${versionMajor}.aar`,
//       );
//       return new Promise((resolve, reject) => {
//         const unzipper = new DecompressZip(jscAARPath);
//         const unzipOutDir = createTmpDir();
//         const containerJniLibsPath = path.join(
//           config.outDir,
//           'lib/src/main/jniLibs',
//         );
//         const unzippedJniPath = path.join(unzipOutDir, 'jni');
//         unzipper.on('error', (err: any) => reject(err));
//         unzipper.on('extract', () => {
//           shell.cp('-Rf', unzippedJniPath, containerJniLibsPath);
//           resolve();
//         });
//         unzipper.extract({ path: unzipOutDir });
//       });
//     } finally {
//       shell.popd();
//     }
//   }

  /**
   * Inject hermes engine into the Container
   * Done in a similar way as injectJavaScriptCoreEngine method
   */
  export async function injectHermesEngine(
    config,
  ) {
    const hermesVersion =
      (config.androidConfig && config.androidConfig.hermesVersion);
    const workingDir = createTmpDir();
    try {
      shell.pushd(workingDir);
      await yarn.init();
      await yarn.add(PackagePath.fromString(`hermes-engine@${hermesVersion}`));
      const hermesAarPath = path.resolve(
        `./node_modules/hermes-engine/android/hermes-release.aar`,
      );
      console.log(hermesAarPath);
      return new Promise((resolve, reject) => {
        const unzipper = new DecompressZip(hermesAarPath);
        const unzipOutDir = createTmpDir();
        const containerJniLibsPath = path.join(
          config.outDir,
          'lib/src/main/jniLibs',
        );
        const unzippedJniPath = path.join(unzipOutDir, 'jni');
        unzipper.on('error', (err: any) => reject(err));
        unzipper.on('extract', () => {
          shell.cp('-Rf', unzippedJniPath, containerJniLibsPath);
          resolve();
        });
        unzipper.extract({ path: unzipOutDir });
      });
    } finally {
      shell.popd();
    }
  }

  export function buildImplementationStatements(
    dependencies,
    androidVersions,
  ) {
    const result = [];

    // Replace versions of support libraries with set version
    dependencies.regular = dependencies.regular.map((d) =>
      d.startsWith('com.android.support:')
        ? `${d.slice(0, d.lastIndexOf(':'))}:${
            androidVersions.supportLibraryVersion
          }`
        : d,
    );

    // Dedupe dependencies with same version
    dependencies.regular = _.uniq(dependencies.regular);
    dependencies.files = _.uniq(dependencies.files);
    dependencies.raw = _.uniq(dependencies.raw);
    dependencies.transitive = _.uniq(dependencies.transitive);
    dependencies.annotationProcessor = _.uniq(dependencies.annotationProcessor);

    // Use highest versions for regular and transitive
    // dependencies with multiple versions
    const g = _.groupBy(
      dependencies.regular,
      (x) => x.match(/^[^:]+:[^:]+/)![0],
    );
    dependencies.regular = Object.keys(g).map((x) => this.highestVersion(g[x]));
    const h = _.groupBy(
      dependencies.transitive,
      (x) => x.match(/^[^:]+:[^:]+/)![0],
    );
    dependencies.transitive = Object.keys(h).map((x) =>
      this.highestVersion(h[x]),
    );

    // Add dependencies to result
    dependencies.regular.forEach((d) => result.push(`implementation '${d}'`));
    dependencies.files.forEach((d) => result.push(`implementation ${d}`));
    dependencies.raw.forEach((d) => {
      result.push(d);
    });
    dependencies.transitive.forEach((d) =>
      result.push(`implementation ('${d}') { transitive = true }`),
    );
    dependencies.annotationProcessor.forEach((d) =>
      result.push(`annotationProcessor '${d}'`),
    );
    return result;
  }