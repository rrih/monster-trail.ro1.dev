"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Element = "leaf" | "spark" | "tide" | "stone" | "shade" | "flare";
type BattleKind = "wild" | "rival" | "leader" | "league";
type Phase = "intro" | "starter" | "field" | "battle" | "hall";

type Species = {
  id: string;
  name: string;
  element: Element;
  icon: string;
  color: string;
  moveA: string;
  moveB: string;
  base: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
};

type Monster = Species["base"] & {
  uid: string;
  speciesId: string;
  name: string;
  element: Element;
  icon: string;
  color: string;
  level: number;
  xp: number;
  maxHp: number;
  hp: number;
  moveA: string;
  moveB: string;
};

type Location = {
  name: string;
  area: string;
  story: string;
  wild: string[];
  leader: {
    name: string;
    title: string;
    badge: string;
    team: Array<[string, number]>;
  };
};

type Battle = {
  kind: BattleKind;
  title: string;
  opponentName: string;
  team: Monster[];
  active: number;
  log: string[];
  rewardBadge?: string;
  locationIndex?: number;
  canCapture: boolean;
};

type GameState = {
  phase: Phase;
  playerName: string;
  rivalName: string;
  party: Monster[];
  box: Monster[];
  locationIndex: number;
  badges: string[];
  defeated: string[];
  leagueStep: number;
  potions: number;
  orbs: number;
  journal: string[];
  battle: Battle | null;
};

const species: Record<string, Species> = {
  spriglow: {
    id: "spriglow",
    name: "Spriglow",
    element: "leaf",
    icon: "✦",
    color: "#48a868",
    moveA: "Vine Tap",
    moveB: "Green Pulse",
    base: { hp: 28, attack: 8, defense: 7, speed: 7 },
  },
  emberlynx: {
    id: "emberlynx",
    name: "Emberlynx",
    element: "flare",
    icon: "◆",
    color: "#d85b3f",
    moveA: "Cinder Paw",
    moveB: "Heat Arc",
    base: { hp: 26, attack: 10, defense: 5, speed: 8 },
  },
  puddlefin: {
    id: "puddlefin",
    name: "Puddlefin",
    element: "tide",
    icon: "●",
    color: "#3b8fc8",
    moveA: "Bubble Jab",
    moveB: "Tide Ring",
    base: { hp: 30, attack: 7, defense: 8, speed: 6 },
  },
  mosskip: {
    id: "mosskip",
    name: "Mosskip",
    element: "leaf",
    icon: "▲",
    color: "#6eb24f",
    moveA: "Leaf Flick",
    moveB: "Root Snare",
    base: { hp: 22, attack: 6, defense: 5, speed: 9 },
  },
  zaplet: {
    id: "zaplet",
    name: "Zaplet",
    element: "spark",
    icon: "⚡",
    color: "#d1a923",
    moveA: "Static Peck",
    moveB: "Volt Skip",
    base: { hp: 20, attack: 8, defense: 4, speed: 11 },
  },
  shello: {
    id: "shello",
    name: "Shello",
    element: "tide",
    icon: "◐",
    color: "#4d9cbd",
    moveA: "Shell Bump",
    moveB: "Foam Guard",
    base: { hp: 27, attack: 6, defense: 9, speed: 4 },
  },
  pebblit: {
    id: "pebblit",
    name: "Pebblit",
    element: "stone",
    icon: "⬟",
    color: "#887861",
    moveA: "Gravel Hit",
    moveB: "Iron Curl",
    base: { hp: 25, attack: 8, defense: 10, speed: 3 },
  },
  duskid: {
    id: "duskid",
    name: "Duskid",
    element: "shade",
    icon: "☾",
    color: "#67538c",
    moveA: "Night Tap",
    moveB: "Mute Wave",
    base: { hp: 24, attack: 9, defense: 5, speed: 8 },
  },
  flamite: {
    id: "flamite",
    name: "Flamite",
    element: "flare",
    icon: "◇",
    color: "#c84e2f",
    moveA: "Coal Bite",
    moveB: "Flare Hop",
    base: { hp: 23, attack: 9, defense: 5, speed: 7 },
  },
  crystowl: {
    id: "crystowl",
    name: "Crystowl",
    element: "spark",
    icon: "✧",
    color: "#6aa7d9",
    moveA: "Prism Wing",
    moveB: "Bright Bolt",
    base: { hp: 29, attack: 10, defense: 8, speed: 10 },
  },
  brambleox: {
    id: "brambleox",
    name: "Brambleox",
    element: "leaf",
    icon: "■",
    color: "#497f3f",
    moveA: "Horn Vine",
    moveB: "Forest Wall",
    base: { hp: 36, attack: 11, defense: 11, speed: 4 },
  },
  vulterm: {
    id: "vulterm",
    name: "Vulterm",
    element: "flare",
    icon: "◈",
    color: "#a73f2b",
    moveA: "Magma Lift",
    moveB: "Ash Crash",
    base: { hp: 34, attack: 13, defense: 9, speed: 7 },
  },
};

const starters = ["spriglow", "emberlynx", "puddlefin"];

const locations: Location[] = [
  {
    name: "Dawnfield",
    area: "North Meadow",
    story: "Lumen Lab sends you across the meadow to test the new Field Index. A quiet rival appears at the fence line.",
    wild: ["mosskip", "zaplet", "shello"],
    leader: {
      name: "Mira",
      title: "Meadow Warden",
      badge: "Seed Sigil",
      team: [["mosskip", 6], ["spriglow", 7]],
    },
  },
  {
    name: "Harborvein",
    area: "Old Pier",
    story: "Sailors report restless lights below the planks. Your index records a new tide pattern.",
    wild: ["shello", "puddlefin", "zaplet"],
    leader: {
      name: "Rowan",
      title: "Pier Captain",
      badge: "Foam Sigil",
      team: [["shello", 9], ["puddlefin", 10]],
    },
  },
  {
    name: "Coppercut",
    area: "Quarry Road",
    story: "The road climbs through stone walls, and every echo sounds like a challenge.",
    wild: ["pebblit", "mosskip", "duskid"],
    leader: {
      name: "Gant",
      title: "Quarry Keeper",
      badge: "Granite Sigil",
      team: [["pebblit", 12], ["brambleox", 13]],
    },
  },
  {
    name: "Nightmarket",
    area: "Lamp Alley",
    story: "Under the lanterns, your rival admits they are chasing the same league letter.",
    wild: ["duskid", "zaplet", "flamite"],
    leader: {
      name: "Noa",
      title: "Lantern Duelist",
      badge: "Moon Sigil",
      team: [["duskid", 15], ["crystowl", 16]],
    },
  },
  {
    name: "Glassfen",
    area: "Mirror Marsh",
    story: "Reflections in the marsh copy your steps. Only a steady team can cross.",
    wild: ["puddlefin", "shello", "crystowl"],
    leader: {
      name: "Iris",
      title: "Marsh Curator",
      badge: "Prism Sigil",
      team: [["crystowl", 18], ["puddlefin", 19]],
    },
  },
  {
    name: "Cinderpass",
    area: "Warm Ridge",
    story: "The mountain path glows after sunset. The league gate is finally visible.",
    wild: ["flamite", "pebblit", "vulterm"],
    leader: {
      name: "Vale",
      title: "Ridge Guard",
      badge: "Coal Sigil",
      team: [["flamite", 21], ["vulterm", 22]],
    },
  },
  {
    name: "Windspire",
    area: "High Tower",
    story: "A tower above the clouds tests speed, patience, and clean switching.",
    wild: ["zaplet", "crystowl", "duskid"],
    leader: {
      name: "Sera",
      title: "Tower Ace",
      badge: "Gale Sigil",
      team: [["zaplet", 24], ["crystowl", 25]],
    },
  },
  {
    name: "Crownroot",
    area: "League Gate",
    story: "With the gate in sight, your rival asks for one final proof before the summit.",
    wild: ["brambleox", "vulterm", "crystowl"],
    leader: {
      name: "Orin",
      title: "Gate Founder",
      badge: "Crown Sigil",
      team: [["brambleox", 27], ["vulterm", 28], ["crystowl", 28]],
    },
  },
];

const league = [
  {
    name: "Aster",
    title: "First Star",
    team: [["shello", 30], ["puddlefin", 31], ["crystowl", 32]],
  },
  {
    name: "Basalt",
    title: "Second Star",
    team: [["pebblit", 32], ["brambleox", 33], ["vulterm", 34]],
  },
  {
    name: "Nyx",
    title: "Third Star",
    team: [["duskid", 34], ["crystowl", 35], ["duskid", 36]],
  },
  {
    name: "Sol",
    title: "Fourth Star",
    team: [["flamite", 36], ["vulterm", 37], ["emberlynx", 38]],
  },
  {
    name: "Champion",
    title: "Summit Holder",
    team: [["spriglow", 39], ["puddlefin", 39], ["emberlynx", 40], ["crystowl", 41]],
  },
] as const;

const initialState: GameState = {
  phase: "intro",
  playerName: "",
  rivalName: "Kai",
  party: [],
  box: [],
  locationIndex: 0,
  badges: [],
  defeated: [],
  leagueStep: 0,
  potions: 4,
  orbs: 8,
  journal: ["The Field Index is waiting for a trainer name."],
  battle: null,
};

function makeMonster(speciesId: string, level: number): Monster {
  const template = species[speciesId];
  const hp = template.base.hp + level * 4;
  return {
    uid: `${speciesId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    speciesId,
    name: template.name,
    element: template.element,
    icon: template.icon,
    color: template.color,
    level,
    xp: 0,
    hp,
    maxHp: hp,
    attack: template.base.attack + level * 2,
    defense: template.base.defense + level,
    speed: template.base.speed + level,
    moveA: template.moveA,
    moveB: template.moveB,
  };
}

function levelUp(monster: Monster): Monster {
  const nextLevel = monster.level + 1;
  const hpGain = 4 + (nextLevel % 3);
  return {
    ...monster,
    level: nextLevel,
    xp: 0,
    maxHp: monster.maxHp + hpGain,
    hp: monster.maxHp + hpGain,
    attack: monster.attack + 2,
    defense: monster.defense + 1,
    speed: monster.speed + 1,
  };
}

function elementBonus(attacker: Element, defender: Element) {
  const strong: Record<Element, Element[]> = {
    leaf: ["tide", "stone"],
    tide: ["flare", "stone"],
    flare: ["leaf", "shade"],
    spark: ["tide", "shade"],
    stone: ["spark", "flare"],
    shade: ["leaf", "spark"],
  };
  if (strong[attacker].includes(defender)) return 1.35;
  if (strong[defender].includes(attacker)) return 0.78;
  return 1;
}

function damage(attacker: Monster, defender: Monster, heavy = false) {
  const move = heavy ? 1.25 : 1;
  const variance = 0.88 + Math.random() * 0.24;
  const raw = (attacker.attack * move + attacker.level * 1.8 - defender.defense * 0.65) * elementBonus(attacker.element, defender.element);
  return Math.max(3, Math.round(raw * variance));
}

function healParty(party: Monster[]) {
  return party.map((monster) => ({ ...monster, hp: monster.maxHp }));
}

function livingIndex(team: Monster[]) {
  return team.findIndex((monster) => monster.hp > 0);
}

function hpPercent(monster: Monster) {
  return `${Math.max(0, Math.round((monster.hp / monster.maxHp) * 100))}%`;
}

function loadInitialState() {
  if (typeof window === "undefined") return initialState;
  const saved = window.localStorage.getItem("monster-trail-save");
  if (!saved) return initialState;
  try {
    return JSON.parse(saved) as GameState;
  } catch {
    window.localStorage.removeItem("monster-trail-save");
    return initialState;
  }
}

function rivalTeam(locationIndex: number) {
  const level = Math.max(5, locationIndex * 3 + 6);
  return [
    makeMonster("zaplet", level),
    makeMonster(locationIndex > 3 ? "duskid" : "mosskip", level + 1),
  ];
}

export default function Home() {
  const [state, setState] = useState<GameState>(() => loadInitialState());
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    window.localStorage.setItem("monster-trail-save", JSON.stringify(state));
  }, [state]);

  const active = useMemo(() => state.party.find((monster) => monster.hp > 0) ?? state.party[0], [state.party]);
  const current = locations[state.locationIndex] ?? locations[locations.length - 1];
  const hasLeaderDown = state.defeated.includes(`leader-${state.locationIndex}`);
  const canLeague = state.badges.length >= locations.length;

  function beginJourney(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = nameInput.trim().slice(0, 12);
    if (!trimmed) return;
    setState((game) => ({
      ...game,
      phase: "starter",
      playerName: trimmed,
      journal: [`Dr. Lumen registered ${trimmed} as the newest Field Index holder.`, ...game.journal],
    }));
  }

  function chooseStarter(speciesId: string) {
    const starter = makeMonster(speciesId, 5);
    setState((game) => ({
      ...game,
      phase: "field",
      party: [starter],
      journal: [`${starter.name} joined ${game.playerName}. The first trail opened toward Dawnfield.`, ...game.journal],
    }));
  }

  function startBattle(battle: Battle) {
    setState((game) => ({
      ...game,
      phase: "battle",
      party: healParty(game.party),
      battle,
    }));
  }

  function startWildBattle() {
    const pool = current.wild;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const level = Math.max(4, state.locationIndex * 3 + 4 + Math.floor(Math.random() * 3));
    const wild = makeMonster(chosen, level);
    startBattle({
      kind: "wild",
      title: `${current.area} encounter`,
      opponentName: "Wild signal",
      team: [wild],
      active: 0,
      canCapture: true,
      locationIndex: state.locationIndex,
      log: [`A wild ${wild.name} stepped from the trail.`],
    });
  }

  function startRivalBattle() {
    startBattle({
      kind: "rival",
      title: "Rival challenge",
      opponentName: state.rivalName,
      team: rivalTeam(state.locationIndex),
      active: 0,
      canCapture: false,
      locationIndex: state.locationIndex,
      log: [`${state.rivalName} blocks the path and asks for a clean match.`],
    });
  }

  function startLeaderBattle() {
    startBattle({
      kind: "leader",
      title: current.leader.title,
      opponentName: current.leader.name,
      team: current.leader.team.map(([id, level]) => makeMonster(id, level)),
      active: 0,
      canCapture: false,
      rewardBadge: current.leader.badge,
      locationIndex: state.locationIndex,
      log: [`${current.leader.name}, ${current.leader.title}, accepts your challenge.`],
    });
  }

  function startLeagueBattle() {
    const opponent = league[state.leagueStep];
    startBattle({
      kind: "league",
      title: opponent.title,
      opponentName: opponent.name,
      team: opponent.team.map(([id, level]) => makeMonster(id, level)),
      active: 0,
      canCapture: false,
      log: [`${opponent.name}, ${opponent.title}, steps into the summit arena.`],
    });
  }

  function finishWin(game: GameState, battle: Battle, party: Monster[], log: string[]): GameState {
    let next = {
      ...game,
      phase: "field" as Phase,
      party: healParty(party),
      battle: null,
      potions: game.potions + (battle.kind === "wild" ? 0 : 1),
      orbs: game.orbs + (battle.kind === "wild" ? 0 : 2),
      journal: [`Won against ${battle.opponentName}.`, ...game.journal].slice(0, 8),
    };

    if (battle.kind === "leader" && battle.rewardBadge) {
      const token = `leader-${battle.locationIndex ?? game.locationIndex}`;
      next = {
        ...next,
        badges: next.badges.includes(battle.rewardBadge) ? next.badges : [...next.badges, battle.rewardBadge],
        defeated: next.defeated.includes(token) ? next.defeated : [...next.defeated, token],
        journal: [`Earned the ${battle.rewardBadge}.`, ...next.journal].slice(0, 8),
      };
    }

    if (battle.kind === "league") {
      if (game.leagueStep >= league.length - 1) {
        return {
          ...next,
          phase: "hall",
          leagueStep: league.length,
          journal: ["Entered the Hall of Memory as summit champion.", ...next.journal].slice(0, 8),
        };
      }
      next = {
        ...next,
        leagueStep: game.leagueStep + 1,
        journal: [`Cleared ${battle.opponentName}. The next summit door opened.`, ...next.journal].slice(0, 8),
      };
    }

    return { ...next, battle: { ...battle, log } };
  }

  function handleAttack(heavy = false) {
    setState((game) => {
      if (!game.battle) return game;
      const battle = game.battle;
      const playerIndex = livingIndex(game.party);
      if (playerIndex < 0) return game;
      const opponent = battle.team[battle.active];
      const player = game.party[playerIndex];
      const hit = damage(player, opponent, heavy);
      const nextTeam = battle.team.map((monster, index) =>
        index === battle.active ? { ...monster, hp: Math.max(0, monster.hp - hit) } : monster,
      );
      const log = [`${player.name} used ${heavy ? player.moveB : player.moveA} for ${hit}.`, ...battle.log].slice(0, 7);
      const nextOpponentIndex = livingIndex(nextTeam);

      let nextParty = game.party;
      if (nextOpponentIndex < 0) {
        nextParty = game.party.map((monster, index) => {
          if (index !== playerIndex) return monster;
          const xp = monster.xp + opponent.level * 4 + (battle.kind === "wild" ? 4 : 8);
          return xp >= 24 + monster.level * 2 ? levelUp({ ...monster, xp }) : { ...monster, xp };
        });
        const leveled = nextParty[playerIndex].level > player.level ? [`${player.name} grew to level ${nextParty[playerIndex].level}.`] : [];
        return finishWin(game, battle, nextParty, ["Victory.", ...leveled, ...log].slice(0, 7));
      }

      const activeOpponentIndex = nextTeam[battle.active].hp > 0 ? battle.active : nextOpponentIndex;
      const counter = nextTeam[activeOpponentIndex];
      const back = damage(counter, player, false);
      nextParty = game.party.map((monster, index) =>
        index === playerIndex ? { ...monster, hp: Math.max(0, monster.hp - back) } : monster,
      );
      const afterPlayerIndex = livingIndex(nextParty);
      const nextLog = [`${counter.name} answered with ${counter.moveA} for ${back}.`, ...log].slice(0, 7);

      if (afterPlayerIndex < 0) {
        return {
          ...game,
          phase: "field",
          party: healParty(nextParty),
          potions: Math.max(1, game.potions),
          battle: null,
          journal: [`Lost to ${battle.opponentName}, returned to the last safe camp.`, ...game.journal].slice(0, 8),
        };
      }

      return {
        ...game,
        party: nextParty,
        battle: {
          ...battle,
          active: activeOpponentIndex,
          team: nextTeam,
          log: nextLog,
        },
      };
    });
  }

  function capture() {
    setState((game) => {
      if (!game.battle || !game.battle.canCapture || game.orbs <= 0) return game;
      const target = game.battle.team[game.battle.active];
      const lowHp = 1 - target.hp / target.maxHp;
      const chance = 0.34 + lowHp * 0.55;
      if (Math.random() < chance) {
        const captured = { ...target, hp: target.maxHp };
        const party = game.party.length < 6 ? [...game.party, captured] : game.party;
        const box = game.party.length < 6 ? game.box : [...game.box, captured];
        return {
          ...game,
          phase: "field",
          party: healParty(party),
          box,
          orbs: game.orbs - 1,
          battle: null,
          journal: [`Captured ${captured.name}.`, ...game.journal].slice(0, 8),
        };
      }
      return {
        ...game,
        orbs: game.orbs - 1,
        battle: {
          ...game.battle,
          log: [`The field orb shook, then opened.`, ...game.battle.log].slice(0, 7),
        },
      };
    });
  }

  function usePotion() {
    setState((game) => {
      if (!game.battle || game.potions <= 0) return game;
      const index = livingIndex(game.party);
      if (index < 0) return game;
      const healed = game.party.map((monster, monsterIndex) =>
        monsterIndex === index ? { ...monster, hp: Math.min(monster.maxHp, monster.hp + 28) } : monster,
      );
      return {
        ...game,
        party: healed,
        potions: game.potions - 1,
        battle: {
          ...game.battle,
          log: [`Used a trail tonic on ${game.party[index].name}.`, ...game.battle.log].slice(0, 7),
        },
      };
    });
  }

  function moveNext() {
    setState((game) => ({
      ...game,
      locationIndex: Math.min(locations.length - 1, game.locationIndex + 1),
      party: healParty(game.party),
      journal: [`Arrived at ${locations[Math.min(locations.length - 1, game.locationIndex + 1)].name}.`, ...game.journal].slice(0, 8),
    }));
  }

  function resetGame() {
    window.localStorage.removeItem("monster-trail-save");
    setState(initialState);
    setNameInput("");
  }

  if (state.phase === "intro") {
    return (
      <main className="shell intro-screen">
        <section className="screen-panel intro-panel">
          <div className="professor-sprite" aria-hidden="true">
            <span>◆</span>
          </div>
          <div>
            <p className="kicker">Lumen Lab Field Index</p>
            <h1>Monster Trail</h1>
            <p className="dialogue">
              Welcome. I am Dr. Lumen. Before this index opens, tell me the name that should be written on its first page.
            </p>
            <form className="name-form" onSubmit={beginJourney}>
              <input
                aria-label="Trainer name"
                maxLength={12}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Your name"
                value={nameInput}
              />
              <button type="submit">Begin</button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  if (state.phase === "starter") {
    return (
      <main className="shell">
        <section className="screen-panel">
          <p className="kicker">Dr. Lumen</p>
          <h1>Choose a first partner, {state.playerName}.</h1>
          <div className="starter-grid">
            {starters.map((id) => {
              const item = species[id];
              return (
                <button className="monster-card" key={id} onClick={() => chooseStarter(id)} type="button">
                  <MonsterSprite monster={makeMonster(id, 5)} />
                  <strong>{item.name}</strong>
                  <span>{item.element.toUpperCase()}</span>
                  <small>
                    {item.moveA} / {item.moveB}
                  </small>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  if (state.phase === "battle" && state.battle) {
    const battle = state.battle;
    const player = active;
    const foe = battle.team[battle.active];
    return (
      <main className="shell battle-screen">
        <section className="battle-stage">
          <div className="battle-topline">
            <span>{battle.title}</span>
            <span>{battle.opponentName}</span>
          </div>
          <div className="arena">
            <Combatant label={battle.opponentName} monster={foe} reverse />
            <Combatant label={state.playerName} monster={player} />
          </div>
          <div className="command-panel">
            <div className="battle-log">
              {battle.log.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="commands">
              <button onClick={() => handleAttack(false)} type="button">
                {player.moveA}
              </button>
              <button onClick={() => handleAttack(true)} type="button">
                {player.moveB}
              </button>
              <button disabled={state.potions <= 0} onClick={usePotion} type="button">
                Tonic x{state.potions}
              </button>
              <button disabled={!battle.canCapture || state.orbs <= 0} onClick={capture} type="button">
                Orb x{state.orbs}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (state.phase === "hall") {
    return (
      <main className="shell">
        <section className="screen-panel hall">
          <p className="kicker">Hall of Memory</p>
          <h1>{state.playerName}, Summit Champion</h1>
          <div className="party-row">
            {state.party.map((monster) => (
              <div className="hall-member" key={monster.uid}>
                <MonsterSprite monster={monster} />
                <strong>{monster.name}</strong>
                <span>Lv. {monster.level}</span>
              </div>
            ))}
          </div>
          <p className="dialogue">
            Your Field Index records every badge, every trail, and the final summit battle. The journey is complete.
          </p>
          <button onClick={resetGame} type="button">
            Start a new record
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="world-grid">
        <div className="map-panel screen-panel">
          <div className="hud">
            <span>{state.playerName}</span>
            <span>
              Badges {state.badges.length}/{locations.length}
            </span>
          </div>
          <div className="pixel-map" aria-label={`${current.name} map`}>
            {Array.from({ length: 64 }, (_, index) => (
              <span
                className={index % 9 === 0 ? "tile path" : index % 7 === 0 ? "tile water" : index % 5 === 0 ? "tile rock" : "tile grass"}
                key={index}
              />
            ))}
            <div className="avatar">◆</div>
          </div>
          <div className="location-copy">
            <p className="kicker">{current.area}</p>
            <h1>{current.name}</h1>
            <p>{current.story}</p>
          </div>
          <div className="actions">
            <button onClick={startWildBattle} type="button">
              Search grass
            </button>
            <button onClick={startRivalBattle} type="button">
              Rival match
            </button>
            <button disabled={hasLeaderDown} onClick={startLeaderBattle} type="button">
              {hasLeaderDown ? "Sigil earned" : "Challenge warden"}
            </button>
            <button disabled={!hasLeaderDown || state.locationIndex >= locations.length - 1} onClick={moveNext} type="button">
              Next town
            </button>
            <button disabled={!canLeague} onClick={startLeagueBattle} type="button">
              {canLeague ? `Summit door ${Math.min(state.leagueStep + 1, league.length)}/${league.length}` : "Need all sigils"}
            </button>
          </div>
        </div>

        <aside className="side-panel">
          <section className="screen-panel">
            <div className="section-title">
              <h2>Party</h2>
              <span>{state.party.length}/6</span>
            </div>
            <div className="party-list">
              {state.party.map((monster) => (
                <div className="party-member" key={monster.uid}>
                  <MonsterSprite monster={monster} small />
                  <div>
                    <strong>{monster.name}</strong>
                    <span>
                      Lv. {monster.level} · {monster.element}
                    </span>
                    <div className="hp-track">
                      <span style={{ width: hpPercent(monster) }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="screen-panel">
            <div className="section-title">
              <h2>Sigils</h2>
              <span>{state.orbs} orbs</span>
            </div>
            <div className="badge-grid">
              {locations.map((location) => (
                <span className={state.badges.includes(location.leader.badge) ? "badge earned" : "badge"} key={location.leader.badge}>
                  {location.leader.badge}
                </span>
              ))}
            </div>
          </section>

          <section className="screen-panel">
            <div className="section-title">
              <h2>Journal</h2>
              <button onClick={resetGame} type="button">
                Reset
              </button>
            </div>
            <div className="journal">
              {state.journal.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function MonsterSprite({ monster, small = false }: { monster: Monster; small?: boolean }) {
  return (
    <div className={small ? "sprite small" : "sprite"} style={{ "--monster-color": monster.color } as React.CSSProperties}>
      <span>{monster.icon}</span>
    </div>
  );
}

function Combatant({ label, monster, reverse = false }: { label: string; monster: Monster; reverse?: boolean }) {
  return (
    <div className={reverse ? "combatant reverse" : "combatant"}>
      <div className="status-card">
        <strong>{monster.name}</strong>
        <span>
          {label} · Lv. {monster.level}
        </span>
        <div className="hp-track">
          <span style={{ width: hpPercent(monster) }} />
        </div>
        <small>
          {monster.hp}/{monster.maxHp}
        </small>
      </div>
      <MonsterSprite monster={monster} />
    </div>
  );
}
