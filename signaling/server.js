import http from "node:http";
import { WebSocketServer } from "ws";
import { jwtVerify } from "jose";

/**
 * Minimal 1:1 signaling server.
 *
 * Env:
 * - PORT (default 8787)
 * - SIGNALING_JWT_SECRET (required) must match Next.js
 */

const PORT = Number.parseInt(process.env.PORT || "8787", 10);
const JWT_SECRET = process.env.SIGNALING_JWT_SECRET;
if (!JWT_SECRET) {
  console.error("Missing env: SIGNALING_JWT_SECRET");
  process.exit(1);
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

/** @type {Map<string, Set<import('ws').WebSocket>>} */
const rooms = new Map();
/** @type {WeakMap<import('ws').WebSocket, {roomId: string, sub: string, role: string, displayName?: string}>} */
const clientMeta = new WeakMap();

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function send(ws, obj) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(obj));
}

function broadcastToRoomExcept(roomId, exceptWs, obj) {
  const set = rooms.get(roomId);
  if (!set) return;
  for (const ws of set) {
    if (exceptWs && ws === exceptWs) continue;
    send(ws, obj);
  }
}

function roomSize(roomId) {
  return rooms.get(roomId)?.size ?? 0;
}

async function verifyJoinJwt(token) {
  const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
  const roomId = typeof payload.roomId === "string" ? payload.roomId : "";
  const role = typeof payload.role === "string" ? payload.role : "";
  const displayName = typeof payload.displayName === "string" ? payload.displayName : undefined;
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  if (!roomId || !role || !sub) throw new Error("invalid token claims");
  return { roomId, role, sub, displayName };
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ok");
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  send(ws, { type: "hello", version: 1 });

  ws.on("message", async (raw) => {
    const msg = safeJsonParse(String(raw));
    if (!msg || typeof msg.type !== "string") return;

    // Require join before any other message
    if (msg.type !== "join" && !clientMeta.has(ws)) {
      return send(ws, { type: "error", code: "not_joined" });
    }

    if (msg.type === "join") {
      const token = typeof msg.token === "string" ? msg.token : "";
      if (!token) return send(ws, { type: "error", code: "missing_token" });

      let claims;
      try {
        claims = await verifyJoinJwt(token);
      } catch {
        return send(ws, { type: "error", code: "invalid_token" });
      }

      const { roomId, role, sub, displayName } = claims;

      const existingSize = roomSize(roomId);
      if (existingSize >= 2) {
        return send(ws, { type: "error", code: "room_full" });
      }

      clientMeta.set(ws, { roomId, role, sub, displayName });
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId).add(ws);

      send(ws, { type: "joined", roomId, role, sub, peers: existingSize });
      broadcastToRoomExcept(roomId, ws, { type: "peer_joined" });

      // When room is full(2), tell both sides to start negotiation.
      if (roomSize(roomId) === 2) {
        broadcastToRoomExcept(roomId, null, { type: "peer_ready" });
      }
      return;
    }

    if (msg.type === "signal") {
      const meta = clientMeta.get(ws);
      if (!meta) return;
      // Relay any payload to the other peer in the room.
      broadcastToRoomExcept(meta.roomId, ws, { type: "signal", data: msg.data ?? null });
      return;
    }

    if (msg.type === "leave") {
      ws.close(1000, "leave");
      return;
    }
  });

  ws.on("close", () => {
    const meta = clientMeta.get(ws);
    if (!meta) return;
    const set = rooms.get(meta.roomId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) rooms.delete(meta.roomId);
    }
    broadcastToRoomExcept(meta.roomId, ws, { type: "peer_left" });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Signaling server listening on :${PORT} (ws path /ws)`);
});

