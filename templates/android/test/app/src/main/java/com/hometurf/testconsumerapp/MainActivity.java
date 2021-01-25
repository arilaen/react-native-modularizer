package com.hometurf.testconsumerapp;

import androidx.appcompat.app.AppCompatActivity;
import {{{groupId}}}.{{{moduleName}}}ReactNativeActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void enter{{{moduleName}}}(View view) {
        // Start application and set contentView
        Intent i = new Intent(MainActivity.this, {{{moduleName}}}ReactNativeActivity.class);
        i.putExtra("teamId", "4254d319-1bc7-4f81-b4ab-b5e6f3402b69");
        MainActivity.this.startActivity(i);
    }
}
