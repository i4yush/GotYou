package com.runnr07.ReplyAI

import android.app.Service
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast

class OverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: LinearLayout? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.getStringExtra("action") ?: return START_NOT_STICKY

        when (action) {
            "SHOW" -> {
                val suggestions = intent.getStringArrayListExtra("suggestions") ?: return START_NOT_STICKY
                showOverlay(suggestions)
            }
            "HIDE" -> hideOverlay()
        }

        return START_NOT_STICKY
    }

    private fun showOverlay(suggestions: List<String>) {
        hideOverlay() // remove any existing overlay first

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM
            softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        }

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_HORIZONTAL
            setBackgroundColor(0xCC1A1A2E.toInt())
            setPadding(16, 12, 16, 12)
        }

        for (suggestion in suggestions) {
            val button = Button(this).apply {
                text = suggestion
                textSize = 13f
                setTextColor(0xFFE0E0E0.toInt())
                setBackgroundColor(0xFF16213E.toInt())
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    setMargins(8, 0, 8, 0)
                }
                setOnClickListener {
                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    clipboard.setPrimaryClip(ClipData.newPlainText("reply", suggestion))
                    Toast.makeText(this@OverlayService, "Copied! Long-press to paste", Toast.LENGTH_SHORT).show()
                    val hideIntent = Intent(this@OverlayService, OverlayService::class.java).apply {
                        putExtra("action", "HIDE")
                    }
                    startService(hideIntent)
                }
            }
            layout.addView(button)
        }

        overlayView = layout
        windowManager?.addView(layout, params)
    }

    private fun hideOverlay() {
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                // View already removed
            }
            overlayView = null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        hideOverlay()
    }
}
