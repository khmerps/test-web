// api/ping.js
let lastStatus = null; // Store the latest server status
const OFFLINE_THRESHOLD = 12; // 12 seconds → online/offline detection

export default function handler(req, res) {
  const now = Math.floor(Date.now() / 1000);

  // POST: Receive webhook from Lua
  if (req.method === "POST") {
    try {
      const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!data.serverName) 
        return res.status(400).json({ success: false, error: "Missing serverName" });

      lastStatus = {
        serverName: data.serverName,
        onlinePlayersCount: data.onlinePlayersCount || 0,
        currentDate: data.currentDate || null,
        timestamp: data.timestamp || now
      };

      return res.status(200).json({ success: true, stored: lastStatus });
    } catch {
      return res.status(400).json({ success: false, error: "Invalid JSON" });
    }
  }

  // GET: Return the latest server status
  if (req.method === "GET") {
    if (!lastStatus) {
      return res.status(200).json({
        serverName: "Unknown",
        onlinePlayersCount: 0,
        currentDate: null,
        timestamp: now,
        serverStatus: "offline",
        lastUpdateSecondsAgo: null
      });
    }

    const diff = now - lastStatus.timestamp;

    return res.status(200).json({
      ...lastStatus,
      serverStatus: diff <= OFFLINE_THRESHOLD ? "online" : "offline",
      lastUpdateSecondsAgo: diff
    });
  }

  res.setHeader("Allow", "POST, GET");
  return res.status(405).json({ error: "Method Not Allowed" });
}
