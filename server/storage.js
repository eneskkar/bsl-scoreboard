const fs = require("fs");
const path = require("path");
const { createDefaultState } = require("./state");

const STATE_FILE = path.join(__dirname, "match-state.json");

function loadAllMatches() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf8");
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("loadAllMatches error:", error);
  }

  return {};
}

function saveAllMatches(matches) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(matches, null, 2), "utf8");
  } catch (error) {
    console.error("saveAllMatches error:", error);
  }
}

function loadMatch(matchId) {
  const matches = loadAllMatches();
  return matches[matchId] || null;
}

function saveMatch(matchId, state) {
  const matches = loadAllMatches();
  matches[matchId] = state;
  saveAllMatches(matches);
}

function ensureMatch(matchId, sport = "volleyball") {
  const matches = loadAllMatches();

  if (!matches[matchId]) {
    matches[matchId] = createDefaultState(sport);
    saveAllMatches(matches);
  }

  return matches[matchId];
}

module.exports = {
  loadAllMatches,
  saveAllMatches,
  loadMatch,
  saveMatch,
  ensureMatch
};