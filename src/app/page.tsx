"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";

type Element = "leaf" | "spark" | "tide" | "stone" | "shade" | "flare";
type Phase = "intro" | "starter" | "overworld" | "battle" | "hall";
type Direction = "up" | "down" | "left" | "right";
type BattleKind = "wild" | "rival" | "leader" | "league";

type Species = {
  id: string;
  name: string;
  element: Element;
  mark: string;
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
  mark: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  moveA: string;
  moveB: string;
};

type Chapter = {
  town: string;
  route: string;
  leader: string;
  badge: string;
  wild: string[];
  team: Array<[string, number]>;
  map: string[];
  start: { x: number; y: number };
};

type Battle = {
  kind: BattleKind;
  title: string;
  opponent: string;
  team: Monster[];
  active: number;
  canCatch: boolean;
  rewardBadge?: string;
  chapterIndex?: number;
  log: string[];
};

type GameState = {
  phase: Phase;
  playerName: string;
  rivalName: string;
  chapterIndex: number;
  x: number;
  y: number;
  dir: Direction;
  party: Monster[];
  box: Monster[];
  badges: string[];
  defeated: string[];
  leagueStep: number;
  tonics: number;
  capsules: number;
  battle: Battle | null;
  message: string;
  menuOpen: boolean;
};

const species: Record<string, Species> = {
  spriglow: {
    id: "spriglow",
    name: "Spriglow",
    element: "leaf",
    mark: "L",
    moveA: "Leaf Jab",
    moveB: "Root Bind",
    base: { hp: 28, attack: 8, defense: 8, speed: 6 },
  },
  emberlynx: {
    id: "emberlynx",
    name: "Emberlynx",
    element: "flare",
    mark: "F",
    moveA: "Coal Paw",
    moveB: "Heat Rush",
    base: { hp: 26, attack: 10, defense: 6, speed: 8 },
  },
  puddlefin: {
    id: "puddlefin",
    name: "Puddlefin",
    element: "tide",
    mark: "T",
    moveA: "Foam Hit",
    moveB: "Tide Turn",
    base: { hp: 30, attack: 7, defense: 9, speed: 6 },
  },
  mosskip: {
    id: "mosskip",
    name: "Mosskip",
    element: "leaf",
    mark: "M",
    moveA: "Stem Tap",
    moveB: "Green Guard",
    base: { hp: 22, attack: 6, defense: 6, speed: 9 },
  },
  zaplet: {
    id: "zaplet",
    name: "Zaplet",
    element: "spark",
    mark: "Z",
    moveA: "Static Nip",
    moveB: "Volt Step",
    base: { hp: 21, attack: 8, defense: 5, speed: 11 },
  },
  shello: {
    id: "shello",
    name: "Shello",
    element: "tide",
    mark: "S",
    moveA: "Shell Knock",
    moveB: "Foam Wall",
    base: { hp: 27, attack: 6, defense: 10, speed: 4 },
  },
  pebblit: {
    id: "pebblit",
    name: "Pebblit",
    element: "stone",
    mark: "P",
    moveA: "Pebble Toss",
    moveB: "Stone Curl",
    base: { hp: 26, attack: 9, defense: 11, speed: 3 },
  },
  duskid: {
    id: "duskid",
    name: "Duskid",
    element: "shade",
    mark: "D",
    moveA: "Dim Tap",
    moveB: "Quiet Wave",
    base: { hp: 24, attack: 9, defense: 5, speed: 8 },
  },
  flamite: {
    id: "flamite",
    name: "Flamite",
    element: "flare",
    mark: "A",
    moveA: "Ash Bite",
    moveB: "Flare Hop",
    base: { hp: 23, attack: 9, defense: 5, speed: 7 },
  },
  crystowl: {
    id: "crystowl",
    name: "Crystowl",
    element: "spark",
    mark: "C",
    moveA: "Glass Wing",
    moveB: "Bright Bolt",
    base: { hp: 29, attack: 10, defense: 8, speed: 10 },
  },
  brambleox: {
    id: "brambleox",
    name: "Brambleox",
    element: "leaf",
    mark: "B",
    moveA: "Horn Vine",
    moveB: "Forest Wall",
    base: { hp: 36, attack: 11, defense: 12, speed: 4 },
  },
  vulterm: {
    id: "vulterm",
    name: "Vulterm",
    element: "flare",
    mark: "V",
    moveA: "Magma Lift",
    moveB: "Ash Crash",
    base: { hp: 34, attack: 13, defense: 9, speed: 7 },
  },
};

const starterIds = ["spriglow", "emberlynx", "puddlefin"];

const baseMap = [
  "TTTTTTTTTTTT",
  "T...GGG..L.T",
  "T.GGGGG....T",
  "T..TT..GG..T",
  "T..T...GG..T",
  "T..T.......T",
  "T..D..N....T",
  "T..........E",
  "TTTTTTTTTTTT",
];

const chapters: Chapter[] = [
  {
    town: "Hometown",
    route: "Route 1",
    leader: "Mira",
    badge: "Seed Badge",
    wild: ["mosskip", "zaplet", "shello"],
    team: [["mosskip", 6], ["spriglow", 7]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
  {
    town: "Harbor Town",
    route: "Route 2",
    leader: "Rowan",
    badge: "Foam Badge",
    wild: ["shello", "puddlefin", "zaplet"],
    team: [["shello", 9], ["puddlefin", 10]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
  {
    town: "Quarry Town",
    route: "Route 3",
    leader: "Gant",
    badge: "Stone Badge",
    wild: ["pebblit", "mosskip", "duskid"],
    team: [["pebblit", 12], ["brambleox", 13]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
  {
    town: "Lamp Town",
    route: "Route 4",
    leader: "Noa",
    badge: "Moon Badge",
    wild: ["duskid", "zaplet", "flamite"],
    team: [["duskid", 15], ["crystowl", 16]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
  {
    town: "Marsh Town",
    route: "Route 5",
    leader: "Iris",
    badge: "Prism Badge",
    wild: ["puddlefin", "shello", "crystowl"],
    team: [["crystowl", 18], ["puddlefin", 19]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
  {
    town: "Cinder Town",
    route: "Route 6",
    leader: "Vale",
    badge: "Coal Badge",
    wild: ["flamite", "pebblit", "vulterm"],
    team: [["flamite", 21], ["vulterm", 22]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
  {
    town: "Tower Town",
    route: "Route 7",
    leader: "Sera",
    badge: "Gale Badge",
    wild: ["zaplet", "crystowl", "duskid"],
    team: [["zaplet", 24], ["crystowl", 25]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
  {
    town: "Gate Town",
    route: "Route 8",
    leader: "Orin",
    badge: "Crown Badge",
    wild: ["brambleox", "vulterm", "crystowl"],
    team: [["brambleox", 27], ["vulterm", 28], ["crystowl", 28]],
    map: baseMap,
    start: { x: 2, y: 6 },
  },
];

const league = [
  { name: "Aster", title: "League One", team: [["shello", 30], ["puddlefin", 31], ["crystowl", 32]] },
  { name: "Basalt", title: "League Two", team: [["pebblit", 32], ["brambleox", 33], ["vulterm", 34]] },
  { name: "Nyx", title: "League Three", team: [["duskid", 34], ["crystowl", 35], ["duskid", 36]] },
  { name: "Sol", title: "League Four", team: [["flamite", 36], ["vulterm", 37], ["emberlynx", 38]] },
  { name: "Ren", title: "Champion", team: [["spriglow", 39], ["puddlefin", 39], ["emberlynx", 40], ["crystowl", 41]] },
] as const;

const initialState: GameState = {
  phase: "intro",
  playerName: "",
  rivalName: "Ren",
  chapterIndex: 0,
  x: chapters[0].start.x,
  y: chapters[0].start.y,
  dir: "down",
  party: [],
  box: [],
  badges: [],
  defeated: [],
  leagueStep: 0,
  tonics: 3,
  capsules: 8,
  battle: null,
  message: "A professor is waiting in the lab.",
  menuOpen: false,
};

function makeMonster(speciesId: string, level: number): Monster {
  const template = species[speciesId];
  const maxHp = template.base.hp + level * 4;
  return {
    uid: `${speciesId}-${level}-${Math.random().toString(16).slice(2)}`,
    speciesId,
    name: template.name,
    element: template.element,
    mark: template.mark,
    moveA: template.moveA,
    moveB: template.moveB,
    level,
    xp: 0,
    maxHp,
    hp: maxHp,
    attack: template.base.attack + level * 2,
    defense: template.base.defense + level,
    speed: template.base.speed + level,
  };
}

function loadInitialState() {
  if (typeof window === "undefined") return initialState;
  const saved = window.localStorage.getItem("monster-trail-save-v2");
  if (!saved) return initialState;
  try {
    return JSON.parse(saved) as GameState;
  } catch {
    window.localStorage.removeItem("monster-trail-save-v2");
    return initialState;
  }
}

function hpPercent(monster: Monster) {
  return `${Math.max(0, Math.round((monster.hp / monster.maxHp) * 100))}%`;
}

function livingIndex(team: Monster[]) {
  return team.findIndex((monster) => monster.hp > 0);
}

function healParty(party: Monster[]) {
  return party.map((monster) => ({ ...monster, hp: monster.maxHp }));
}

function levelUp(monster: Monster): Monster {
  return {
    ...monster,
    level: monster.level + 1,
    xp: 0,
    maxHp: monster.maxHp + 5,
    hp: monster.maxHp + 5,
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
  const raw = (attacker.attack * (heavy ? 1.28 : 1) + attacker.level * 2 - defender.defense * 0.7) * elementBonus(attacker.element, defender.element);
  const roll = 0.88 + Math.random() * 0.24;
  return Math.max(3, Math.round(raw * roll));
}

function classForTile(tile: string) {
  if (tile === "T") return "tree";
  if (tile === "G") return "grass";
  if (tile === "L") return "leader";
  if (tile === "D") return "door";
  if (tile === "N") return "npc";
  if (tile === "E") return "exit";
  return "path";
}

function nextPoint(x: number, y: number, dir: Direction) {
  if (dir === "up") return { x, y: y - 1 };
  if (dir === "down") return { x, y: y + 1 };
  if (dir === "left") return { x: x - 1, y };
  return { x: x + 1, y };
}

function rivalTeam(chapterIndex: number) {
  const level = Math.max(5, chapterIndex * 3 + 7);
  return [makeMonster("zaplet", level), makeMonster(chapterIndex > 3 ? "duskid" : "mosskip", level + 1)];
}

export default function Home() {
  const [state, setState] = useState<GameState>(() => loadInitialState());
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    window.localStorage.setItem("monster-trail-save-v2", JSON.stringify(state));
  }, [state]);

  const chapter = chapters[state.chapterIndex] ?? chapters[chapters.length - 1];
  const active = useMemo(() => state.party.find((monster) => monster.hp > 0) ?? state.party[0], [state.party]);
  const leaderDown = state.defeated.includes(`leader-${state.chapterIndex}`);
  const allBadges = state.badges.length >= chapters.length;

  function begin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = nameInput.trim().slice(0, 10);
    if (!name) return;
    setState({
      ...initialState,
      phase: "starter",
      playerName: name,
      message: `PROF. LARCH: ${name}, your record begins today. Pick one partner from the table.`,
    });
  }

  function chooseStarter(speciesId: string) {
    const starter = makeMonster(speciesId, 5);
    setState((game) => ({
      ...game,
      phase: "overworld",
      party: [starter],
      message: `${starter.name} joined you. ${game.rivalName} took another capsule and ran ahead.`,
    }));
  }

  function tileAt(ch: Chapter, x: number, y: number) {
    return ch.map[y]?.[x] ?? "T";
  }

  function startBattle(battle: Battle) {
    setState((game) => ({
      ...game,
      phase: "battle",
      party: healParty(game.party),
      battle,
      menuOpen: false,
    }));
  }

  function startWild(chapterIndex = state.chapterIndex) {
    const ch = chapters[chapterIndex];
    const id = ch.wild[Math.floor(Math.random() * ch.wild.length)];
    const wild = makeMonster(id, Math.max(3, chapterIndex * 3 + 4 + Math.floor(Math.random() * 3)));
    startBattle({
      kind: "wild",
      title: `${ch.route}`,
      opponent: "Wild",
      team: [wild],
      active: 0,
      canCatch: true,
      chapterIndex,
      log: [`Wild ${wild.name} appeared.`],
    });
  }

  function startLeader() {
    startBattle({
      kind: "leader",
      title: `${chapter.town} Badge Match`,
      opponent: chapter.leader,
      team: chapter.team.map(([id, level]) => makeMonster(id, level)),
      active: 0,
      canCatch: false,
      rewardBadge: chapter.badge,
      chapterIndex: state.chapterIndex,
      log: [`${chapter.leader}: Show me your trained team.`],
    });
  }

  function startRival() {
    startBattle({
      kind: "rival",
      title: "Rival Battle",
      opponent: state.rivalName,
      team: rivalTeam(state.chapterIndex),
      active: 0,
      canCatch: false,
      chapterIndex: state.chapterIndex,
      log: [`${state.rivalName}: I was waiting. Let's compare teams.`],
    });
  }

  function startLeague() {
    const opponent = league[state.leagueStep];
    startBattle({
      kind: "league",
      title: opponent.title,
      opponent: opponent.name,
      team: opponent.team.map(([id, level]) => makeMonster(id, level)),
      active: 0,
      canCatch: false,
      log: [`${opponent.name} stepped into the league room.`],
    });
  }

  function move(dir: Direction) {
    setState((game) => {
      if (game.phase !== "overworld") return { ...game, dir };
      const ch = chapters[game.chapterIndex];
      const point = nextPoint(game.x, game.y, dir);
      const tile = tileAt(ch, point.x, point.y);
      if (tile === "T") return { ...game, dir, message: "The way is blocked." };
      if (tile === "E") {
        if (!game.defeated.includes(`leader-${game.chapterIndex}`)) {
          return { ...game, dir, message: `${ch.leader} still holds this town's badge.` };
        }
        if (game.chapterIndex >= chapters.length - 1) {
          return { ...game, x: point.x, y: point.y, dir, message: "A guard checks for eight badges. Press A to enter the league." };
        }
        const nextChapter = chapters[game.chapterIndex + 1];
        return {
          ...game,
          chapterIndex: game.chapterIndex + 1,
          x: nextChapter.start.x,
          y: nextChapter.start.y,
          dir: "down",
          party: healParty(game.party),
          message: `You reached ${nextChapter.town}.`,
        };
      }
      if (tile === "G" && game.party.length > 0 && Math.random() < 0.2) {
        const id = ch.wild[Math.floor(Math.random() * ch.wild.length)];
        const wild = makeMonster(id, Math.max(3, game.chapterIndex * 3 + 4 + Math.floor(Math.random() * 3)));
        return {
          ...game,
          x: point.x,
          y: point.y,
          dir,
          phase: "battle",
          party: healParty(game.party),
          battle: {
            kind: "wild",
            title: ch.route,
            opponent: "Wild",
            team: [wild],
            active: 0,
            canCatch: true,
            chapterIndex: game.chapterIndex,
            log: [`Wild ${wild.name} appeared.`],
          },
        };
      }
      return { ...game, x: point.x, y: point.y, dir, message: tile === "G" ? "Tall grass rustles." : game.message };
    });
  }

  function interact() {
    setState((game) => {
      if (game.phase !== "overworld") return game;
      const ch = chapters[game.chapterIndex];
      const front = nextPoint(game.x, game.y, game.dir);
      const tile = tileAt(ch, front.x, front.y);
      if (tile === "D") {
        return {
          ...game,
          party: healParty(game.party),
          tonics: game.tonics + 1,
          message: "You rested at the local lab counter. Team HP restored. Got 1 tonic.",
        };
      }
      if (tile === "N") {
        return { ...game, message: `${game.rivalName}: Badges open roads. Beat the local leader, then go east.` };
      }
      if (tile === "L") {
        if (game.defeated.includes(`leader-${game.chapterIndex}`)) return { ...game, message: `${ch.leader}: Your ${ch.badge} is proof enough.` };
        const battle: Battle = {
          kind: "leader",
          title: `${ch.town} Badge Match`,
          opponent: ch.leader,
          team: ch.team.map(([id, level]) => makeMonster(id, level)),
          active: 0,
          canCatch: false,
          rewardBadge: ch.badge,
          chapterIndex: game.chapterIndex,
          log: [`${ch.leader}: Show me your trained team.`],
        };
        return { ...game, phase: "battle", party: healParty(game.party), battle, menuOpen: false };
      }
      if (tile === "E" && game.chapterIndex >= chapters.length - 1) {
        if (!allBadges) return { ...game, message: "The league guard asks for eight badges." };
        const opponent = league[game.leagueStep];
        return {
          ...game,
          phase: "battle",
          party: healParty(game.party),
          battle: {
            kind: "league",
            title: opponent.title,
            opponent: opponent.name,
            team: opponent.team.map(([id, level]) => makeMonster(id, level)),
            active: 0,
            canCatch: false,
            log: [`${opponent.name} stepped into the league room.`],
          },
        };
      }
      return { ...game, message: "There is nothing to inspect here." };
    });
  }

  function finishWin(game: GameState, battle: Battle, party: Monster[], log: string[]): GameState {
    const healed = healParty(party);
    let next: GameState = {
      ...game,
      phase: "overworld",
      party: healed,
      battle: null,
      tonics: game.tonics + (battle.kind === "wild" ? 0 : 1),
      capsules: game.capsules + (battle.kind === "wild" ? 0 : 2),
      message: `You defeated ${battle.opponent}.`,
    };
    if (battle.kind === "leader" && battle.rewardBadge) {
      const token = `leader-${battle.chapterIndex ?? game.chapterIndex}`;
      next = {
        ...next,
        badges: next.badges.includes(battle.rewardBadge) ? next.badges : [...next.badges, battle.rewardBadge],
        defeated: next.defeated.includes(token) ? next.defeated : [...next.defeated, token],
        message: `${battle.opponent} awarded the ${battle.rewardBadge}. The road east opened.`,
      };
    }
    if (battle.kind === "league") {
      if (game.leagueStep >= league.length - 1) {
        return { ...next, phase: "hall", leagueStep: league.length, message: "Your team entered the Hall of Records." };
      }
      next = { ...next, leagueStep: game.leagueStep + 1, message: `League room ${game.leagueStep + 1} cleared. Press League to continue.` };
    }
    return { ...next, battle: { ...battle, log } };
  }

  function handleAttack(heavy = false) {
    setState((game) => {
      if (!game.battle) return game;
      const playerIndex = livingIndex(game.party);
      if (playerIndex < 0) return game;
      const battle = game.battle;
      const player = game.party[playerIndex];
      const foe = battle.team[battle.active];
      const hit = damage(player, foe, heavy);
      const nextTeam = battle.team.map((monster, index) => (index === battle.active ? { ...monster, hp: Math.max(0, monster.hp - hit) } : monster));
      const log = [`${player.name} used ${heavy ? player.moveB : player.moveA}. ${hit} damage.`, ...battle.log].slice(0, 6);
      const nextFoeIndex = livingIndex(nextTeam);
      if (nextFoeIndex < 0) {
        const nextParty = game.party.map((monster, index) => {
          if (index !== playerIndex) return monster;
          const xp = monster.xp + foe.level * 5 + (battle.kind === "wild" ? 4 : 10);
          return xp > 25 + monster.level * 2 ? levelUp({ ...monster, xp }) : { ...monster, xp };
        });
        const leveled = nextParty[playerIndex].level > player.level ? [`${player.name} grew to Lv.${nextParty[playerIndex].level}.`] : [];
        return finishWin(game, battle, nextParty, ["Enemy team fainted.", ...leveled, ...log].slice(0, 6));
      }
      const activeIndex = nextTeam[battle.active].hp > 0 ? battle.active : nextFoeIndex;
      const counter = nextTeam[activeIndex];
      const back = damage(counter, player, false);
      const nextParty = game.party.map((monster, index) => (index === playerIndex ? { ...monster, hp: Math.max(0, monster.hp - back) } : monster));
      if (livingIndex(nextParty) < 0) {
        return {
          ...game,
          phase: "overworld",
          party: healParty(nextParty),
          battle: null,
          message: `You blacked out against ${battle.opponent}. The lab restored your team.`,
        };
      }
      return {
        ...game,
        party: nextParty,
        battle: {
          ...battle,
          team: nextTeam,
          active: activeIndex,
          log: [`${counter.name} used ${counter.moveA}. ${back} damage.`, ...log].slice(0, 6),
        },
      };
    });
  }

  function useTonic() {
    setState((game) => {
      if (!game.battle || game.tonics <= 0) return game;
      const playerIndex = livingIndex(game.party);
      if (playerIndex < 0) return game;
      return {
        ...game,
        tonics: game.tonics - 1,
        party: game.party.map((monster, index) => (index === playerIndex ? { ...monster, hp: Math.min(monster.maxHp, monster.hp + 30) } : monster)),
        battle: { ...game.battle, log: [`Used a tonic on ${game.party[playerIndex].name}.`, ...game.battle.log].slice(0, 6) },
      };
    });
  }

  function throwCapsule() {
    setState((game) => {
      if (!game.battle || !game.battle.canCatch || game.capsules <= 0) return game;
      const target = game.battle.team[game.battle.active];
      const chance = 0.3 + (1 - target.hp / target.maxHp) * 0.58;
      if (Math.random() < chance) {
        const caught = { ...target, hp: target.maxHp };
        return {
          ...game,
          phase: "overworld",
          party: game.party.length < 6 ? healParty([...game.party, caught]) : healParty(game.party),
          box: game.party.length < 6 ? game.box : [...game.box, caught],
          capsules: game.capsules - 1,
          battle: null,
          message: `${caught.name} was caught.`,
        };
      }
      return {
        ...game,
        capsules: game.capsules - 1,
        battle: { ...game.battle, log: ["The capsule clicked open. It failed.", ...game.battle.log].slice(0, 6) },
      };
    });
  }

  function reset() {
    window.localStorage.removeItem("monster-trail-save-v2");
    setState(initialState);
    setNameInput("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowUp") move("up");
    if (event.key === "ArrowDown") move("down");
    if (event.key === "ArrowLeft") move("left");
    if (event.key === "ArrowRight") move("right");
    if (event.key.toLowerCase() === "z" || event.key === "Enter") interact();
    if (event.key.toLowerCase() === "x") setState((game) => ({ ...game, menuOpen: !game.menuOpen }));
  }

  if (state.phase === "intro") {
    return (
      <main className="gb-shell intro-screen">
        <section className="gb-screen intro-box">
          <div className="prof-sprite">PROF</div>
          <div className="text-stack">
            <p className="tiny">MONSTER TRAIL</p>
            <h1>New game</h1>
            <p>A field professor turns on a handheld index and asks for your name.</p>
            <form className="name-form" onSubmit={begin}>
              <input aria-label="Trainer name" maxLength={10} onChange={(event) => setNameInput(event.target.value)} placeholder="NAME" value={nameInput} />
              <button type="submit">A: OK</button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  if (state.phase === "starter") {
    return (
      <main className="gb-shell">
        <section className="gb-screen starter-layout">
          <OverworldMap chapter={chapter} state={state} />
          <div className="dialogue-box">
            <p>{state.message}</p>
          </div>
          <div className="starter-menu">
            {starterIds.map((id) => (
              <button key={id} onClick={() => chooseStarter(id)} type="button">
                <MonsterMark monster={makeMonster(id, 5)} />
                <strong>{species[id].name}</strong>
                <span>{species[id].element.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (state.phase === "battle" && state.battle) {
    const battle = state.battle;
    const foe = battle.team[battle.active];
    return (
      <main className="gb-shell">
        <section className="battle-screen">
          <div className="battle-field">
            <Combatant monster={foe} label={`${battle.opponent} Lv.${foe.level}`} />
            <Combatant monster={active} label={`${state.playerName} Lv.${active.level}`} player />
          </div>
          <div className="dialogue-box battle-log">
            {battle.log.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="battle-menu">
            <button onClick={() => handleAttack(false)} type="button">
              FIGHT: {active.moveA}
            </button>
            <button onClick={() => handleAttack(true)} type="button">
              FIGHT: {active.moveB}
            </button>
            <button disabled={state.tonics <= 0} onClick={useTonic} type="button">
              BAG: Tonic x{state.tonics}
            </button>
            <button disabled={!battle.canCatch || state.capsules <= 0} onClick={throwCapsule} type="button">
              ITEM: Capsule x{state.capsules}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (state.phase === "hall") {
    return (
      <main className="gb-shell">
        <section className="gb-screen hall-screen">
          <p className="tiny">HALL OF RECORDS</p>
          <h1>{state.playerName} became Champion</h1>
          <div className="hall-party">
            {state.party.map((monster) => (
              <div key={monster.uid}>
                <MonsterMark monster={monster} />
                <strong>{monster.name}</strong>
                <span>Lv.{monster.level}</span>
              </div>
            ))}
          </div>
          <button onClick={reset} type="button">
            New record
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="gb-shell" onKeyDown={onKeyDown} tabIndex={0}>
      <section className="gb-frame">
        <div className="top-bar">
          <strong>{chapter.town}</strong>
          <span>
            Badges {state.badges.length}/{chapters.length}
          </span>
        </div>
        <div className="play-grid">
          <div>
            <OverworldMap chapter={chapter} state={state} />
            <div className="dialogue-box">
              <p>{state.message}</p>
            </div>
          </div>
          <aside className="status-menu">
            <button onClick={() => setState((game) => ({ ...game, menuOpen: !game.menuOpen }))} type="button">
              X: MENU
            </button>
            <button onClick={interact} type="button">
              A: TALK / CHECK
            </button>
            <button onClick={() => startWild()} type="button">
              SEARCH
            </button>
            <button onClick={startRival} type="button">
              RIVAL
            </button>
            <button disabled={leaderDown} onClick={startLeader} type="button">
              LEADER
            </button>
            <button disabled={!leaderDown} onClick={() => move("right")} type="button">
              NEXT ROUTE
            </button>
            <button disabled={!allBadges} onClick={startLeague} type="button">
              LEAGUE
            </button>
            <div className="dpad">
              <span />
              <button onClick={() => move("up")} type="button">
                UP
              </button>
              <span />
              <button onClick={() => move("left")} type="button">
                LEFT
              </button>
              <button onClick={() => move("down")} type="button">
                DOWN
              </button>
              <button onClick={() => move("right")} type="button">
                RIGHT
              </button>
            </div>
          </aside>
        </div>
        {state.menuOpen ? <MainMenu state={state} reset={reset} /> : null}
      </section>
    </main>
  );
}

function OverworldMap({ chapter, state }: { chapter: Chapter; state: GameState }) {
  return (
    <div className="tile-map" aria-label={`${chapter.town} map`}>
      {chapter.map.map((row, y) =>
        row.split("").map((tile, x) => (
          <div className={`map-tile ${classForTile(tile)}`} key={`${x}-${y}`}>
            {tile === "L" ? "LEAD" : tile === "D" ? "LAB" : tile === "N" ? "REN" : tile === "E" ? ">" : ""}
          </div>
        )),
      )}
      <div className={`player ${state.dir}`} style={{ gridColumn: state.x + 1, gridRow: state.y + 1 }}>
        @
      </div>
    </div>
  );
}

function MainMenu({ state, reset }: { state: GameState; reset: () => void }) {
  return (
    <div className="main-menu">
      <div>
        <h2>MONSTERS</h2>
        {state.party.map((monster) => (
          <div className="party-row" key={monster.uid}>
            <MonsterMark monster={monster} />
            <span>
              {monster.name} Lv.{monster.level}
            </span>
            <div className="hp-bar">
              <span style={{ width: hpPercent(monster) }} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2>BAG</h2>
        <p>Tonic x{state.tonics}</p>
        <p>Capsule x{state.capsules}</p>
        <p>Box x{state.box.length}</p>
      </div>
      <div>
        <h2>BADGES</h2>
        <p>{state.badges.length ? state.badges.join(" / ") : "None"}</p>
      </div>
      <button onClick={reset} type="button">
        RESET
      </button>
    </div>
  );
}

function Combatant({ monster, label, player = false }: { monster: Monster; label: string; player?: boolean }) {
  return (
    <div className={player ? "combatant player-side" : "combatant"}>
      <MonsterMark monster={monster} />
      <div className="combat-card">
        <strong>{monster.name}</strong>
        <span>{label}</span>
        <div className="hp-bar">
          <span style={{ width: hpPercent(monster) }} />
        </div>
        <small>
          {monster.hp}/{monster.maxHp}
        </small>
      </div>
    </div>
  );
}

function MonsterMark({ monster }: { monster: Monster }) {
  return <span className={`monster-mark ${monster.element}`}>{monster.mark}</span>;
}
