package com.hometurf.democonsumerapp;

import androidx.appcompat.app.AppCompatActivity;
import com.hometurf.mobileapp.InAppHomeTurfReactNativeActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void enterHomeTurf(View view) {
        Intent i = new Intent(MainActivity.this, InAppHomeTurfReactNativeActivity.class);
        i.putExtra("teamId", "4254d319-1bc7-4f81-b4ab-b5e6f3402b69");
        MainActivity.this.startActivity(i);
    }
}
