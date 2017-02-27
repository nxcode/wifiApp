package com.maneskul.cordova.trafficmonitor;

import android.app.Fragment;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.TrafficStats;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.ContentObserver;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.telephony.SmsManager;
import android.telephony.SmsMessage;
import android.telephony.PhoneNumberUtils;
import android.util.Log;

import java.util.List;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class TrafficPlugin
extends CordovaPlugin {
    private static final String LOGTAG = "TrafficPlugin";
	private static final String ACTION_LIST_TRAFFIC = "showStats";

    public boolean execute(String action, JSONArray inputs, CallbackContext callbackContext) throws JSONException {
        PluginResult result = null;
        if (ACTION_LIST_TRAFFIC.equals(action)) {
            JSONObject filters = inputs.optJSONObject(0);
            result = this.showStats(callbackContext);
        } else {
            Log.d(LOGTAG, String.format("Invalid action passed: %s", action));
            result = new PluginResult(PluginResult.Status.INVALID_ACTION);
        }
        if (result != null) {
            callbackContext.sendPluginResult(result);
        }
        return true;
    }

    public void onDestroy() {
    }

    public void setOptions(JSONObject options) {
    }

    protected String __getProductShortName() {
        return "Traffic";
    }

    public final String md5(String s) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            digest.update(s.getBytes());
            byte[] messageDigest = digest.digest();
            StringBuffer hexString = new StringBuffer();
            for (int i = 0; i < messageDigest.length; ++i) {
                String h = Integer.toHexString(255 & messageDigest[i]);
                while (h.length() < 2) {
                    h = "0" + h;
                }
                hexString.append(h);
            }
            return hexString.toString();
        }
        catch (NoSuchAlgorithmException digest) {
            return "";
        }
    }
	
	private PluginResult showStats(CallbackContext callbackContext) {
        Log.i(LOGTAG, ACTION_LIST_TRAFFIC);
		JSONArray jsons = new JSONArray();
		
		PackageManager pm = this.cordova.getActivity().getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(0);

        for (ApplicationInfo packageInfo : packages) {
            // get the UID for the selected app
			
            int UID = packageInfo.uid;
            String package_name = packageInfo.packageName;
            ApplicationInfo app = null;
            try {
                app = pm.getApplicationInfo(package_name, 0);
            } catch (PackageManager.NameNotFoundException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            String name = (String) pm.getApplicationLabel(app);
            double received = (double) TrafficStats.getUidRxBytes(UID) / (1024 * 1024);
            double send = (double) TrafficStats.getUidTxBytes(UID) / (1024 * 1024);
            double total = received + send;
			
			if (total > 0) {
				try {
					JSONObject json = new JSONObject();
					json.put("uid", UID);
					json.put("name", name);
					json.put("received", received);
					json.put("send", send);
					json.put("total", total);
					jsons.put((Object)json);
				} catch ( Exception e ) { 
					e.printStackTrace(); 
				}
			}
        }
		
        callbackContext.success(jsons);
        return null;
    }
}
