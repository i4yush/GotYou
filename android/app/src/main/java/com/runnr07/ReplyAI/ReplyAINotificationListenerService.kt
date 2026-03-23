package com.runnr07.ReplyAI

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class ReplyAINotificationListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val extras = sbn.notification?.extras ?: return
        val app = sbn.packageName ?: return
        val sender = extras.getString(Notification.EXTRA_TITLE) ?: return
        val text = extras.getString(Notification.EXTRA_TEXT) ?: return

        ReplyAIBridgeModule.emitNotificationReceived(app, sender, text)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // No-op
    }
}
