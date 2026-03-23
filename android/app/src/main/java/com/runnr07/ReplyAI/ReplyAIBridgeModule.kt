package com.runnr07.ReplyAI

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.modules.core.DeviceEventManagerModule

class ReplyAIBridgeModule(reactContext: ReactApplicationContext) :
    NativeReplyAIModuleSpec(reactContext) {

    companion object {
        const val NAME = "NativeReplyAIModule"
        private var sharedReactContext: ReactApplicationContext? = null

        fun emitNotificationReceived(app: String, sender: String, text: String) {
            sharedReactContext?.let { ctx ->
                if (ctx.hasCatalystInstance()) {
                    val payload = ctx.nativeModule(com.facebook.react.bridge.Arguments::class.java)
                    val map = com.facebook.react.bridge.Arguments.createMap().apply {
                        putString("app", app)
                        putString("sender", sender)
                        putString("text", text)
                    }
                    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onNotificationReceived", map)
                }
            }
        }
    }

    init {
        sharedReactContext = reactContext
    }

    override fun getName(): String = NAME

    override fun showOverlay(suggestions: ReadableArray) {
        val list = ArrayList<String>()
        for (i in 0 until suggestions.size()) {
            list.add(suggestions.getString(i))
        }
        val intent = Intent(reactApplicationContext, OverlayService::class.java).apply {
            putExtra("action", "SHOW")
            putStringArrayListExtra("suggestions", list)
        }
        reactApplicationContext.startService(intent)
    }

    override fun hideOverlay() {
        val intent = Intent(reactApplicationContext, OverlayService::class.java).apply {
            putExtra("action", "HIDE")
        }
        reactApplicationContext.startService(intent)
    }

    override fun startNotificationService() {
        // No-op: NotificationListenerService is declared in manifest and managed by system
    }
}
