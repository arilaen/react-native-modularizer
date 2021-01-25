package {{{groupId}}};

import android.app.Activity;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.BuildConfig;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactInstanceManagerBuilder;
import com.facebook.react.ReactRootView;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;
import com.facebook.soloader.SoLoader;
import com.facebook.react.shell.MainReactPackage;
{{#imports}}
{{{.}}}
{{/imports}}
{{#manualImports}}
import {{{.}}};
{{/manualImports}}
{{#additionalActivityImports}}
import {{{.}}};
{{/additionalActivityImports}}

public class {{{moduleName}}}ReactNativeActivity extends Activity
      implements DefaultHardwareBackBtnHandler, PermissionAwareActivity {

    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;
    private ReactActivityDelegate mDelegate;

    protected ReactInstanceManager getReactInstanceManager() {
      ReactInstanceManagerBuilder builder = ReactInstanceManager.builder()
        .setApplication(getApplication())
        .setCurrentActivity(this)
        .setUseDeveloperSupport(BuildConfig.IS_INTERNAL_BUILD)
        .setJSMainModulePath("index")
        .setInitialLifecycleState(LifecycleState.RESUMED);
{{#packageInstances}}
      builder.addPackage({{{.}}});
{{/packageInstances}}
// Each manual package instance is an array, so will need to include builder.addPackage in first line
{{#manualPackageInstances}}
      {{{.}}}
{{/manualPackageInstances}}
      builder.addPackage(new MainReactPackage());
      if ({{{groupId}}}.BuildConfig.BUILD_TYPE.contentEquals("debug")) {
      //   builder
      //     .setBundleAssetName("index.android.bundle"); // Use local server
      // } else if ({{{groupId}}}.BuildConfig.BUILD_TYPE.contentEquals("staging")) {
        builder
          .setJSBundleFile({{{jsBundleFilePathStaging}}}); // Use bundled file
      } else {
        builder
          .setJSBundleFile({{{jsBundleFilePathRelease}}});
      }
      return builder.build();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        {{#beforeOnCreate}}
          {{{.}}}
        {{/beforeOnCreate}}
        super.onCreate(savedInstanceState);
        SoLoader.init(this, false);
        mDelegate = createReactActivityDelegate();
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = getReactInstanceManager();

        Bundle initialProperties = getIntent().getExtras();

        mReactRootView.startReactApplication(mReactInstanceManager, "{{{reactAppName}}}", initialProperties);

        setContentView(mReactRootView);
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostPause(this);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostResume(this, this);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostDestroy(this);
        }
        if (mReactRootView != null) {
            mReactRootView.unmountReactApplication();
        }
    }

    @Override
    public void onBackPressed() {
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onBackPressed();
        } else {
            super.onBackPressed();
        }
    }

    protected @Nullable
    String getMainComponentName() {
      return null;
    }
  
    /** Called at construction time, override if you have a custom delegate implementation. */
    protected ReactActivityDelegate createReactActivityDelegate() {
      return new ReactActivityDelegate(this, getMainComponentName());
    }
  
    @Override
    public void requestPermissions(
      String[] permissions, int requestCode, PermissionListener listener) {
      mDelegate.requestPermissions(permissions, requestCode, listener);
    }
  
    @Override
    public void onRequestPermissionsResult(
      int requestCode, String[] permissions, int[] grantResults) {
      mDelegate.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
