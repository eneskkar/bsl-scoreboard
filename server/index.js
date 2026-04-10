const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { ensureMatch, saveMatch } = require("./storage");
const volleyball = require("./sports/volleyball");
const tennis = require("./sports/tennis");

const app = express();
app.use(cors());
app.use(express.json());
// uploads klasörü
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// /uploads altından statik servis
app.use("/uploads", express.static(UPLOAD_DIR));

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.mimetype);
    cb(ok ? null : new Error("Only image files allowed"), ok);
  }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const matches = {};

function getMatch(matchId, sport = "volleyball") {
  if (!matches[matchId]) {
    matches[matchId] = ensureMatch(matchId, sport);
  }
  return matches[matchId];
}

function setMatch(matchId, newState) {
  matches[matchId] = newState;
  saveMatch(matchId, newState);
}

// ---- API (opsiyonel; admin panel socket ile de yapabilir) ----
app.get("/api/state/:matchId", (req, res) => {
  const { matchId } = req.params;
  if (!matchId) return res.status(400).json({ error: "matchId gerekli" });

  const state = getMatch(matchId);
  res.json(state);
});

app.get("/api/target/:matchId", (req, res) => {
  const { matchId } = req.params;
  if (!matchId) return res.status(400).json({ error: "matchId gerekli" });

  const state = getMatch(matchId);

  if (state.sport !== "volleyball") {
    return res.json({ target: null, setNo: null });
  }

  res.json({
    target: volleyball.setTargetPoints(state),
    setNo: state.match.currentSet
  });
});
app.post("/api/upload/team-logo", upload.single("file"), (req, res) => {
  const { matchId, team } = req.query;

  if (!matchId) {
    return res.status(400).json({ error: "matchId gerekli" });
  }

  if (!["A", "B"].includes(team)) {
    return res.status(400).json({ error: "team must be A or B" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "file missing" });
  }

  const state = getMatch(matchId);
  const url = `/uploads/${req.file.filename}`;

  state.teams = state.teams || {};
  state.teams[team] = state.teams[team] || {};
  state.teams[team].logoUrl = url;

  setMatch(matchId, state);
  io.to(matchId).emit("state", state);

  res.json({ ok: true, matchId, team, logoUrl: url });
});

// ---- Socket.IO ----
io.on("connection", (socket) => {
  socket.on("joinMatch", ({ matchId, sport }) => {
    if (!matchId) return;

    socket.join(matchId);

    const state = getMatch(matchId, sport || "volleyball");
    socket.emit("state", state);
  });

  socket.on("admin:createMatch", ({ matchId, sport }) => {
  if (!matchId) return;

  const normalizedSport = sport === "tennis" ? "tennis" : "volleyball";
  const state = getMatch(matchId, normalizedSport);

  setMatch(matchId, state);
  socket.join(matchId);
  socket.emit("state", state);
  io.to(matchId).emit("state", state);
});

  socket.on("admin:update", ({ matchId, patch }) => {
    if (!matchId || !patch) return;

    const state = getMatch(matchId);

    if (patch.meta) {
      state.meta = { ...state.meta, ...patch.meta };
    }

    if (patch.match) {
      state.match = { ...state.match, ...patch.match };
    }

    if (patch.ui) {
      state.ui = { ...state.ui, ...patch.ui };
    }

    if (patch.teams) {
      state.teams = state.teams || {};

      if (patch.teams.A) {
        state.teams.A = {
          ...(state.teams.A || {}),
          ...patch.teams.A
        };
      }

      if (patch.teams.B) {
        state.teams.B = {
          ...(state.teams.B || {}),
          ...patch.teams.B
        };
      }
    }

    setMatch(matchId, state);
    io.to(matchId).emit("state", state);
  });

  socket.on("admin:setStage", ({ matchId, stage }) => {
    if (!matchId) return;

    const state = getMatch(matchId);
    if (state.sport !== "volleyball") return;
    volleyball.applyStage(state, stage);
    setMatch(matchId, state);
    io.to(matchId).emit("state", state);
  });

socket.on("admin:score", ({ matchId, team, delta }) => {
  if (!matchId) return;
  if (!["A", "B"].includes(team)) return;

  const state = getMatch(matchId);
  if (state.sport !== "volleyball") return;
  if (state.match.status !== "live") return;

  const next = Math.max(0, (state.teams[team].points || 0) + delta);
  state.teams[team].points = next;

  // 🔥 KRİTİK SATIR
  if (delta > 0) {
    state.match.serve = team;
  }

  volleyball.updateScore(state);
  volleyball.computePointAlerts(state);
  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});

socket.on("admin:sets", ({ matchId, team, delta }) => {
  if (!matchId) return;
  if (!["A", "B"].includes(team)) return;

  const state = getMatch(matchId);
  if (state.sport !== "volleyball") return;

  const next = Math.max(0, (state.teams[team].setsWon || 0) + delta);
  state.teams[team].setsWon = next;

  if (
    state.teams.A.setsWon >= state.meta.setsToWin ||
    state.teams.B.setsWon >= state.meta.setsToWin
  ) {
    state.match.status = "finished";
    state.ui.showCard = "result";
  }

  volleyball.computePointAlerts(state);
  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});

  socket.on("admin:serve", ({ matchId, team }) => {
  if (!matchId) return;
  if (!["A", "B"].includes(team)) return;

  const state = getMatch(matchId);
  if (state.sport !== "volleyball") return;

  state.match.serve = team;
  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});
  socket.on("admin:timeout", ({ matchId, team, delta }) => {
  if (!matchId) return;
  if (!["A", "B"].includes(team)) return;

  const state = getMatch(matchId);
  if (state.sport !== "volleyball") return;

  const next = Math.max(0, (state.teams[team].timeouts || 0) + delta);
  state.teams[team].timeouts = next;

  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});

  socket.on("admin:resetSet", ({ matchId }) => {
  if (!matchId) return;

  const state = getMatch(matchId);
  if (state.sport !== "volleyball") return;

  state.teams.A.points = 0;
  state.teams.B.points = 0;

  volleyball.computePointAlerts(state);
  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});

  socket.on("admin:newMatch", ({ matchId, keepTeams }) => {
    if (!matchId) return;

    const state = getMatch(matchId);
    let nextState;

    if (state.sport === "tennis") {
      nextState = tennis.resetMatch(state, keepTeams !== false);
    } else {
      nextState = volleyball.resetMatch(state, keepTeams !== false);
      volleyball.computePointAlerts(nextState);
    }
    setMatch(matchId, nextState);
    io.to(matchId).emit("state", nextState);
  });

  socket.on("admin:showCard", ({ matchId, card }) => {
    if (!matchId) return;

    const state = getMatch(matchId);
    state.ui.showCard = card;

    setMatch(matchId, state);
    io.to(matchId).emit("state", state);
  });

  socket.on("admin:break", ({ matchId, active, team, durationSec }) => {
  if (!matchId) return;

  const state = getMatch(matchId);
  if (state.sport !== "volleyball") return;

  state.match.break = state.match.break || {
    active: false,
    team: null,
    startedAt: null,
    durationSec: 30
  };

  state.match.break.active = !!active;
  state.match.break.team = ["A", "B"].includes(team) ? team : null;
  state.match.break.durationSec = Number.isFinite(durationSec)
    ? durationSec
    : (state.match.break.durationSec || 30);
  state.match.break.startedAt = state.match.break.active ? Date.now() : null;

  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});

  socket.on("admin:updateLineup", ({ matchId, team, players }) => {
    if (!matchId) return;
    if (!["A", "B"].includes(team)) return;

    const state = getMatch(matchId);
    state.lineups = state.lineups || { A: [], B: [] };
    state.lineups[team] = players || [];

    setMatch(matchId, state);
    io.to(matchId).emit("state", state);
  });

  socket.on("admin:showLineup", ({ matchId, team }) => {
    if (!matchId) return;
    if (!["A", "B"].includes(team)) return;

    const state = getMatch(matchId);
    state.ui = state.ui || {};
    state.ui.showCard = team === "A" ? "lineupA" : "lineupB";

    setMatch(matchId, state);
    io.to(matchId).emit("state", state);
  });

  socket.on("admin:hideCard", ({ matchId }) => {
    if (!matchId) return;

    const state = getMatch(matchId);
    state.ui.showCard = null;

    setMatch(matchId, state);
    io.to(matchId).emit("state", state);
  });
  socket.on("admin:tennis:setStage", ({ matchId, stage }) => {
  if (!matchId) return;

  const state = getMatch(matchId);
  if (state.sport !== "tennis") return;

  tennis.applyStage(state, stage);
  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});
socket.on("admin:tennis:point", ({ matchId, team, delta }) => {
  if (!matchId) return;
  if (!["A", "B"].includes(team)) return;

  const state = getMatch(matchId);
  if (state.sport !== "tennis") return;

  if (delta > 0) {
    tennis.addPoint(state, team);
  } else if (delta < 0) {
    tennis.removePoint(state, team);
  }

  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});
socket.on("admin:tennis:server", ({ matchId, team }) => {
  if (!matchId) return;
  if (!["A", "B"].includes(team)) return;

  const state = getMatch(matchId);
  if (state.sport !== "tennis") return;

  tennis.setServer(state, team);

  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});
socket.on("admin:tennis:resetSet", ({ matchId }) => {
  if (!matchId) return;

  const state = getMatch(matchId);
  if (state.sport !== "tennis") return;

  tennis.resetCurrentSet(state);

  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});
socket.on("admin:tennis:finishSet", ({ matchId }) => {
  if (!matchId) return;

  const state = getMatch(matchId);
  if (state.sport !== "tennis") return;

  tennis.forceFinishSet(state);

  setMatch(matchId, state);
  io.to(matchId).emit("state", state);
});
});

const PORT = process.env.PORT || 3000;

// Prod’da web build'i serve ederiz. Dev’de Vite ayrı portta çalışacak.
app.get("/", (req, res) => {
  res.send("BSL Scoreboard server running. In dev, web runs via Vite.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});



app.use(express.static(path.join(__dirname, "../web/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../web/dist/index.html"));
});