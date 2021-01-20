package com.hometurf.mobileapp;

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
{{#includesCodePush}}
import com.microsoft.codepush.react.CodePush;
{{/includesCodePush}}
{{#imports}}
{{{.}}}
{{/imports}}
import com.facebook.react.shell.MainReactPackage;

public class {{{moduleName}}}ReactNativeActivity extends Activity
      implements DefaultHardwareBackBtnHandler, PermissionAwareActivity {

    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;
    private ReactActivityDelegate mDelegate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SoLoader.init(this, false);
        mDelegate = createReactActivityDelegate();
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = getReactInstanceManager();

        Bundle initialProperties = getIntent().getExtras();
        // teamId needs to be defined; TODO: add check?

        mReactRootView.startReactApplication(mReactInstanceManager, "mobileApp", initialProperties);

        setContentView(mReactRootView);
    }

    protected ReactInstanceManager getReactInstanceManager() {
      ReactInstanceManagerBuilder builder = ReactInstanceManager.builder()
        .setApplication(getApplication())
        .setCurrentActivity(this)
        .setUseDeveloperSupport(BuildConfig.IS_INTERNAL_BUILD)
        .setJSMainModulePath("index")
        .setInitialLifecycleState(LifecycleState.RESUMED);
      builder.addPackage(new RNInstabugReactnativePackage
        .Builder(getResources().getString(R.string.{{moduleName}}InstabugId), getApplication())
        .setInvocationEvent("none")
        .setPrimaryColor("#1D82DC")
        .setFloatingEdge("left")
        .setFloatingButtonOffsetFromTop(250)
        .build());
{{#packageInstances}}
      builder.addPackage({{.}});
{{/packageInstances}}
      builder.addPackage(new MainReactPackage());
{{#includesCodePush}}
    String {{moduleName}}CodePushDeploymentKey = getResources().getString(R.string.{{moduleName}}CodePushDeploymentKey);
      builder.addPackage(new CodePush({{moduleName}}CodePushDeploymentKey, getApplicationContext(), BuildConfig.DEBUG));
{{/includesCodePush}}
      if (com.hometurf.mobileapp.BuildConfig.BUILD_TYPE.contentEquals("debug")) {

        return builder
          .setBundleAssetName("index.android.bundle") // Use local server
          .build();
      } else if (com.hometurf.mobileapp.BuildConfig.BUILD_TYPE.contentEquals("staging")) {
        return builder
          .setJSBundleFile("assets://hometurf.jsbundle") // Use bundled file
          .build();
      } else {
        // release
        return builder
{{#includesCodePush}}
          .setJSBundleFile(CodePush.getJSBundleFile())
{{/includesCodePush}}
{{^includesCodePush}}
        .setJSBundleFile("assets://hometurf.jsbundle")
{{/includesCodePush}}
          // Get the JS Bundle File via Code Push
          .build();
      }
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
