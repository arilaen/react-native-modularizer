const applyReactNativeDependencyReplacement = `
applyReactNativeDependency("api")

void applyReactNativeDependency(String type) {
  Boolean found = false
  String androidSourcesName = "\${project.name} -> React Native sources"
  File defaultDir = new File(
    (File) project.projectDir,
    (String) "/../../node_modules/react-native/android"
  )
  
  if (defaultDir.exists()) {
    project.repositories.add(project.repositories.maven {
      url defaultDir.toString()
      name androidSourcesName
    })

    found = true
  } else {
    File parentDir = rootProject.projectDir

    for (int i = 0; i < 5; i++) {
      parentDir = parentDir.parentFile

      File androidSourcesDir = new File(
        (File) parentDir,
        (String) "node_modules/react-native"
      )

      File androidPrebuiltBinaryDir = new File(
        (File) parentDir,
        (String) "node_modules/react-native/android"
      )

      if (androidPrebuiltBinaryDir.exists()) {
        project.repositories.add(project.repositories.maven {
          url androidPrebuiltBinaryDir.toString()
          name androidSourcesName
        })

        found = true
        break
      }

      if (androidSourcesDir.exists()) {
        project.repositories.add(project.repositories.maven {
          url androidSourcesDir.toString()
          name androidSourcesName
        })

        found = true
        break
      }
    }
  }

  if (!found) {
    throw new GradleException(
      ":\${project.name}: unable to locate React Native android sources. " +
        "Ensure you have you installed React Native as a dependency in your project and try again."
    )
  }

  switch (type) {
    case "implementation":
      project.dependencies.add("implementation", "com.facebook.react:react-native:+")
      break
    default:
      project.dependencies.add("api", "com.facebook.react:react-native:+")
  }
}
`;
export default applyReactNativeDependencyReplacement;