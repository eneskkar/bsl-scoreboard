const { createVolleyballSportState } = require("./sports/volleyball");
const { createTennisSportState } = require("./sports/tennis");

function createBaseState(sport = "volleyball") {
  return {
    sport,
    meta: {
      tournamentName: "",
      round: "",
      createdAt: Date.now()
    },
    teams: {
      A: {
        name: "TEAM A",
        abbr: "",
        logoUrl: "",
        panelBg: ""
      },
      B: {
        name: "TEAM B",
        abbr: "",
        logoUrl: "",
        panelBg: ""
      }
    }
  };
}

function deepMerge(target, source) {
  if (!source) return target;

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    const isObject =
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue);

    if (isObject) {
      target[key] = deepMerge(targetValue || {}, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }

  return target;
}

function createDefaultState(sport = "volleyball") {
  const base = createBaseState(sport);

  const sportState =
    sport === "tennis"
      ? createTennisSportState()
      : createVolleyballSportState();

  return deepMerge(base, sportState);
}

module.exports = {
  createDefaultState,
  deepMerge
};