/**
 * Tasky Notifier — Local Node.js server
 * 
 * - Serves Tasky.html on http://localhost:3000
 * - Accepts task sync from the browser via POST /sync
 * - Checks deadlines every 60 seconds
 * - Fires native OS desktop notifications via node-notifier
 * - Works even when the browser tab is closed (as long as this server is running)
 */

const http        = require('http');
const fs          = require('fs');
const path        = require('path');
const notifier    = require('node-notifier');

const PORT        = 3000;
const TASKS_FILE  = path.join(__dirname, 'tasks.json');
const HTML_FILE   = path.join(__dirname, 'Tasky.html');

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    }
  } catch (e) { console.error('Error reading tasks.json:', e.message); }
  return [];
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// Track which notifications we've already sent so we don't repeat
const notified = new Set(); // keys: taskId + ':warn' or taskId + ':deadline'

function notify(title, message, type = 'info') {
  const icons = {
    warn:    '⚠️',
    danger:  '🚨',
    success: '✅',
    info:    '📋',
  };
  const prefix = icons[type] || '📋';

  console.log(`[${new Date().toLocaleTimeString()}] NOTIFY [${type.toUpperCase()}] ${title} — ${message}`);

  notifier.notify({
    title:    `${prefix} Tasky — ${title}`,
    message:  message,
    sound:    true,          // plays default OS sound
    wait:     type === 'danger', // deadline alerts wait for click
    timeout:  type === 'danger' ? 30 : 8,
    appID:    'Tasky',       // Windows only — groups notifications
  });
}

// ── Deadline checker (runs every 60 seconds) ─────────────────────────────────

function checkDeadlines() {
  const tasks = loadTasks();
  const now   = Date.now();
  let changed = false;

  tasks.forEach(task => {
    if (!task.reminder || task.col === 'done') return;

    const deadline = new Date(task.reminder).getTime();
    const diff     = deadline - now;
    const warnKey  = task.id + ':warn';
    const dlineKey = task.id + ':deadline';

    // 5-minute warning (between 5min and 6min remaining)
    if (diff > 0 && diff <= 5 * 60 * 1000 && diff > 4 * 60 * 1000) {
      if (!notified.has(warnKey)) {
        notified.add(warnKey);
        notify(task.title, '⏰ Deadline in 5 minutes! Finish it up.', 'warn');
      }
    }

    // Deadline reached or passed (within last 2 minutes to catch the check interval)
    if (diff <= 0 && diff > -2 * 60 * 1000) {
      if (!notified.has(dlineKey)) {
        notified.add(dlineKey);
        notify(task.title, '🚨 Deadline reached! This task is now overdue.', 'danger');

        // Apply XP penalty if not already done
        if (!task.xpPenalized && !task.xpAwarded) {
          task.xpPenalized = true;
          changed = true;
        }
      }
    }

    // Overdue reminder — every hour after deadline, re-notify
    if (diff < -60 * 60 * 1000) {
      const hourKey = task.id + ':hour:' + Math.floor(Math.abs(diff) / (60 * 60 * 1000));
      if (!notified.has(hourKey)) {
        notified.add(hourKey);
        const hoursLate = Math.floor(Math.abs(diff) / (60 * 60 * 1000));
        notify(task.title, `Still not done! ${hoursLate}h overdue 😬`, 'danger');
      }
    }
  });

  if (changed) saveTasks(tasks);
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  // CORS headers so the HTML page (even opened as a file) can POST here
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET / — serve Tasky.html ──────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/') {
    try {
      const html = fs.readFileSync(HTML_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Tasky.html not found. Make sure it is in the same folder as server.js');
    }
    return;
  }

  // ── POST /sync — receive tasks from the browser ───────────────────────────
  if (req.method === 'POST' && req.url === '/sync') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { tasks, xp } = JSON.parse(body);
        saveTasks(tasks);
        if (xp !== undefined) fs.writeFileSync(
          path.join(__dirname, 'xp.json'), JSON.stringify({ xp }), 'utf8'
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ── GET /tasks — let the HTML load tasks saved by server ─────────────────
  if (req.method === 'GET' && req.url === '/tasks') {
    const tasks = loadTasks();
    let xp = 100;
    try {
      const xpFile = path.join(__dirname, 'xp.json');
      if (fs.existsSync(xpFile)) xp = JSON.parse(fs.readFileSync(xpFile, 'utf8')).xp;
    } catch(e) {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tasks, xp }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// ── Boot ──────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║     🔔  Tasky Notifier is running!     ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Open: http://localhost:${PORT}           ║`);
  console.log('║  Desktop alerts: ACTIVE                ║');
  console.log('║  Press Ctrl+C to stop                  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  // First check immediately on start
  checkDeadlines();
});

// Check deadlines every 60 seconds
setInterval(checkDeadlines, 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Tasky Notifier stopped.');
  process.exit(0);
});
