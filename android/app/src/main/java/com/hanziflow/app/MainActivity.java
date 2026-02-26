package com.hanziflow.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Clear WebView cache to ensure fresh assets load
        WebView webView = getBridge().getWebView();
        webView.clearCache(true);
        webView.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
        // Prevent overscroll (stylus bounce)
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
    }
}
