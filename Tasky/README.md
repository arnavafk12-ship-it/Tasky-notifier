# Tasky — Desktop Notification Setup

Get native desktop alerts for task deadlines **even when the browser is closed**.

---



## 🚀 Setup (one time)

Open a terminal in the `tasky-notifier` folder and run:

```bash
npm install
```

This installs `node-notifier` which fires native OS notifications.

---

## ▶️ Running the server

Every time you want background notifications, run:

```bash
node server.js
```

Then open your browser and go to:

```
http://localhost:3000
```

You'll see a **🟢 Notifier On** badge in the top-right of Tasky when it's connected.

---

## 🔔 How it works

| Event | Notification |
|-------|-------------|
| 5 minutes before deadline | ⚠️ Warning toast |
| Deadline reached | 🚨 Alert (stays until clicked) |
| Every hour overdue | 😬 Hourly reminder |

- The server checks deadlines every **60 seconds**
- Tasks are synced from the browser to `tasks.json` automatically on every save
- The server reads `tasks.json` — so notifications fire **even if the browser is closed**

---

## 🖥️ Auto-start on Windows (optional)

To have the server start automatically when Windows boots:

1. Press `Win + R`, type `shell:startup`, press Enter
2. Create a file called `tasky.bat` and write the following text in it:

```bat
@echo off
cd /d "C:\path\to\tasky-notifier"
node server.js
```
‼️IMPORTANT  Replace `C:\path\to\tasky-notifier` with your actual folder path.


---

## 🍎 Auto-start on Mac (optional)

Create a file `~/Library/LaunchAgents/tasky.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>tasky.notifier</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/tasky-notifier/server.js</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
```

Then run: `launchctl load ~/Library/LaunchAgents/tasky.plist`
