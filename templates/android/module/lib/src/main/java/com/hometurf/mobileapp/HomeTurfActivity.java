package com.hometurf.mobileapp;

import android.app.Activity;
import android.os.Bundle;

import com.facebook.react.BuildConfig;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactInstanceManagerBuilder;
import com.facebook.react.ReactRootView;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.soloader.SoLoader;
import com.instabug.reactlibrary.RNInstabugReactnativePackage;
{{#includesCodePush}}
import com.microsoft.codepush.react.CodePush;
{{/includesCodePush}}
import java.util.List;
{{#imports}}
    {{{.}}}
{{/imports}}

public class {{{moduleName}}}ReactNativeActivity extends Activity implements DefaultHardwareBackBtnHandler {
    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SoLoader.init(this, false);
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = getReactInstanceManager();

        Bundle initialProperties = getIntent().getExtras();
        // teamId needs to be defined; TODO: add check?

        mReactRootView.startReactApplication(mReactInstanceManager, "mobile-app", initialProperties);

        setContentView(mReactRootView);
    }

    protected ReactInstanceManager getReactInstanceManager() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      RNInstabugReactnativePackage instabugRNPackage = new RNInstabugReactnativePackage
        .Builder(getResources().getString(R.string.{{moduleName}}InstabugId), getApplication())
        .setInvocationEvent("none")
        .setPrimaryColor("#1D82DC")
        .setFloatingEdge("left")
        .setFloatingButtonOffsetFromTop(250)
        .build();
      ReactInstanceManagerBuilder builder = ReactInstanceManager.builder()
        .setApplication(getApplication())
        .setCurrentActivity(this)
        .setUseDeveloperSupport(BuildConfig.IS_INTERNAL_BUILD)
        .setJSMainModulePath("index")
        .setInitialLifecycleState(LifecycleState.RESUMED);
{{#packageInstances}}
    builder.addPackage({{.}});
{{/packageInstances}}
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
          .setJSBundleFile("res/raw/hometurf.jsbundle") // Use bundled file
          .build();
      } else {
        // release
        return builder
{{#includesCodePush}}
          .setJSBundleFile(CodePush.getJSBundleFile())
{{/includesCodePush}}
{{^includesCodePush}}
          .setJSBundleFile("res/raw/hometurf.jsbundle") 
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
}
