
# 🗂️ Tasky

> A beautifully minimal, zero-dependency Kanban board with gamified XP progression and native desktop deadline notifications — delivered in a single HTML file.

---

## 📌 Overview

Tasky is a fully client-side task management app built with pure Vanilla JS, CSS, and HTML. No frameworks, no build tools, no accounts. Open the file and start working. Pair it with the lightweight Node.js notifier server and you get real native OS desktop alerts for deadlines — even when your browser is completely closed.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 Kanban Board | Three-column drag-and-drop board — To Do, In Progress, Done |
| 🎮 XP & Levels | Earn XP for completing tasks on time, lose it for missed deadlines |
| ⏰ Deadline Reminders | Set per-task deadlines with 5-minute warnings and exact-moment alerts |
| 🔔 Background Notifications | Native OS desktop alerts via Node.js — fires even when the browser is closed |
| 🗑️ Drag-to-Delete | Drag completed tasks onto the bin icon to remove them |
| 🌙 Dark / Light Mode | Persistent theme toggle stored in localStorage |
| 🟢 Server Status Badge | Live indicator showing whether the notifier server is connected |
| 💾 Offline Storage | All data saved to `localStorage` — no database, no account, no cloud required |

---

## 🛠️ Tech Stack

### Frontend — `Tasky.html`

| Technology | Purpose |
|---|---|
| **HTML5** | App structure and layout |
| **CSS3** | Custom properties (CSS vars), animations, responsive grid |
| **Vanilla JavaScript (ES2020)** | All app logic — drag-and-drop, XP system, reminders, rendering |
| **Web Notifications API** | In-browser desktop notifications (when tab is open) |
| **localStorage API** | Persisting tasks, XP, and theme across sessions |
| **Fetch API** | Syncing tasks to the local notifier server |

### Backend — `server.js`

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime for the local notification server |
| **`http` (built-in)** | Lightweight HTTP server — no Express needed |
| **`fs` (built-in)** | Reading and writing `tasks.json` for persistent task storage |
| **`node-notifier`** | Fires native OS notifications on Windows, macOS, and Linux |

---

## 📁 Project Structure

```
tasky-notifier/
├── Tasky.html          # Full frontend app (self-contained)
├── server.js           # Node.js background notification server
├── package.json        # Project metadata and dependencies
├── tasks.json          # Auto-generated — synced task data (do not edit manually)
├── xp.json             # Auto-generated — synced XP state
└── README.md           # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v16 or higher
- Any modern browser (Chrome, Firefox, Edge, Safari)

Verify your Node version:

```bash
node -v
```

---

### Installation

Clone the repository or download and extract the ZIP:

```bash
git clone https://github.com/your-username/tasky.git
cd tasky
```

Install dependencies:

```bash
npm install
```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Start** | `npm start` | Starts the notifier server on `http://localhost:3000` |
| **Dev** | `npm run dev` | Alias for `npm start` |
| **Direct** | Open `Tasky.html` in browser | Runs the app without the notifier server (no background notifications) |

---

## 🖥️ Usage

### Option A — Basic (no background notifications)

Just open `Tasky.html` directly in your browser. Everything works except notifications when the tab is closed.

---

### Option B — Full (with background notifications)

**1. Start the server:**

```bash
npm start
```

You'll see:

```
╔════════════════════════════════════════╗
║     🗂  Tasky Notifier is running!     ║
╠════════════════════════════════════════╣
║  Open: http://localhost:3000           ║
║  Desktop alerts: ACTIVE ✅              ║
╚════════════════════════════════════════╝
```

**2. Open Tasky in your browser:**

```
http://localhost:3000
```

**3. Confirm the 🟢 Notifier On badge** appears in the top bar — you're live.

---

## 🔔 Notification Behaviour

The server polls `tasks.json` every **60 seconds** and fires native OS notifications based on deadline proximity:

| Trigger | Type | Behaviour |
|---|---|---|
| 5 minutes before deadline | ⚠️ Warning | Auto-dismisses after 8s |
| Deadline reached | 🚨 Alert | Stays on screen until clicked |
| Every hour overdue | 😬 Overdue reminder | Repeats hourly until task is done |

Clicking any notification brings the Tasky tab back into focus.

---

## 🔁 Auto-start on System Boot (Optional)

### Windows

1. Press `Win + R`, type `shell:startup`, press Enter
2. Create `tasky.bat` in that folder:

```bat
@echo off
cd /d "C:\path\to\tasky-notifier"
node server.js
```

### macOS

```bash
cat > ~/Library/LaunchAgents/tasky.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>tasky.notifier</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/tasky-notifier/server.js</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
EOF

launchctl load ~/Library/LaunchAgents/tasky.plist
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `node` command not found | Install Node.js from [nodejs.org](https://nodejs.org) |
| Port 3000 already in use | Change `const PORT = 3000` to `3001` in `server.js` |
| 🔴 Notifier Off badge in app | Run `npm start` first, then refresh the page |
| Notifications not appearing on Windows | Go to Settings → System → Notifications → allow Node.js |
| Notifications not appearing on macOS | System Preferences → Notifications → allow Terminal |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with ❤️ using zero frameworks. Just HTML, CSS, JavaScript, and Node.js.
