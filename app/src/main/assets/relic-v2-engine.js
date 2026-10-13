/* RELIC V2 scene engine — dependency-free Canvas 2D, suitable for Android WebView. */
(function (root) {
  "use strict";

  const CHAPTERS = [
    { id: 1, title: "The Forgotten Jungle", region: "jungle", palette: ["#173a2d", "#47764c", "#d7b46d"], stages: [
      ["Into the Wild", "Learn movement and discover the first clue."],
      ["Broken Trails", "Combine jumps with moving hazards."],
      ["Hunter's Path", "Read enemy patterns and find a hidden cache."],
      ["Ancient Gate", "Survive the guardian trial to enter the temple."]
    ]},
    { id: 2, title: "The Sunken Temple", region: "temple", palette: ["#122c3a", "#28717a", "#e7bd72"], stages: [
      ["The Descent", "Navigate narrow platforms and shifting stone."],
      ["Hall of Traps", "React to faster, overlapping trap cycles."],
      ["The Waterworks", "Solve timing puzzles while hazards combine."],
      ["Temple Guardian", "Defeat the guardian's multi-phase pattern."]
    ]},
    { id: 3, title: "The Lost Kingdom", region: "kingdom", palette: ["#2b263d", "#736a88", "#f1c47a"], stages: [
      ["Beyond the Ruins", "Traverse exposed routes and stronger foes."],
      ["Abandoned City", "Use cover and moving platforms under pressure."],
      ["Shadows of the Past", "Handle feints, ranged attacks, and traps together."],
      ["Broken Crown", "Win a multi-phase encounter with fewer safe windows."]
    ]},
    { id: 4, title: "The Final Relic", region: "finale", palette: ["#281d29", "#a14d28", "#ffe29b"], stages: [
      ["Forbidden Passage", "Master precision movement through lethal hazards."],
      ["Trial of the Relic", "Combine every learned mechanic in a gauntlet."],
      ["Final Guardian", "Face the toughest boss pattern and narrow recovery windows."],
      ["Treasure Revealed", "Complete the final challenge and cinematic ending."]
    ]}
  ];

  const STAGES = CHAPTERS.flatMap((chapter, chapterIndex) => chapter.stages.map((stage, stageIndex) => {
    const globalIndex = chapterIndex * 4 + stageIndex;
    return {
      id: globalIndex + 1, chapter: chapter.id, chapterTitle: chapter.title,
      region: chapter.region, title: stage[0], objective: stage[1],
      difficulty: globalIndex + 1,
      difficultyLabel: ["Easy", "Easy+", "Medium", "Medium-Hard", "Hard", "Hard+", "Very Hard", "Boss", "Very Hard+", "Expert", "Expert+", "Boss", "Extreme", "Extreme+", "Nightmare", "Finale"][globalIndex],
      enemyHealth: 1 + globalIndex * 0.18,
      enemySpeed: 0.8 + globalIndex * 0.075,
      hazardRate: Math.max(0.45, 1.8 - globalIndex * 0.075),
      checkpointCount: globalIndex < 4 ? 2 : globalIndex < 8 ? 2 : 1
    };
  }));

  function getStage(id) {
    const n = Number(id);
    return STAGES[Math.max(1, Math.min(16, Number.isFinite(n) ? n : 1)) - 1];
  }

  function createGame(options) {
    options = options || {};
    const canvas = options.canvas || (root.document && root.document.querySelector("#stageCanvas"));
    if (!canvas) throw new Error("RELIC V2 requires a canvas element with id stageCanvas");
    const ctx = canvas.getContext("2d");
    const reducedMotion = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { stageId: 1, x: 0.18, y: 0, jumpY: 0, jumpV: 0, velocity: 0, running: true, frame: 0, lastTime: 0, held: new Set(), action: "", actionUntil: 0, dodgeUntil: 0, completed: false };
    const width = () => Math.max(320, canvas.clientWidth || canvas.width || 800);
    const height = () => Math.max(180, canvas.clientHeight || canvas.height || 450);

    function resize() {
      const ratio = Math.min(root.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width() * ratio);
      canvas.height = Math.floor(height() * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }

    function stageChanged() {
      const stage = getStage(state.stageId);
      state.x = 0.18; state.y = 0; state.velocity = 0; state.completed = false;
      if (root.document) {
        const title = root.document.querySelector("#stageTitle");
        const meta = root.document.querySelector("#stageMeta");
        const objective = root.document.querySelector("#stageObjective");
        const progress = root.document.querySelector("#stageProgress");
        if (title) title.textContent = "STAGE " + stage.id + " · " + stage.title;
        if (meta) meta.textContent = stage.chapterTitle + " · " + stage.difficultyLabel;
        if (objective) objective.textContent = stage.objective;
        if (progress) progress.textContent = "Stage " + stage.id + " of 16";
      }
      draw();
    }

    function setStage(id) {
      state.stageId = Math.max(1, Math.min(16, Number(id) || 1));
      stageChanged();
      return getStage(state.stageId);
    }

    function performAction(action) {
      const actions = { triangle: "attack", square: "interact", circle: "dodge", cross: "jump" };
      const resolved = actions[action] || action;
      state.action = resolved;
      state.actionUntil = state.frame + 550;
      if (resolved === "jump" && state.jumpY <= 0) state.jumpV = 260;
      if (resolved === "dodge") state.dodgeUntil = state.frame + 420;
      draw();
      return resolved;
    }

    function drawCharacter(x, floor, scale, time, characterState) {
      ctx.save(); ctx.translate(x, floor); ctx.scale(scale, scale);
      const talking = !!(characterState && characterState.talking);
      const bob = reducedMotion ? 0 : Math.sin(time / 110) * 1.8;
      const stride = reducedMotion ? 0 : Math.sin(time / 80) * 5;
      const armSwing = reducedMotion ? 0 : Math.sin(time / 95) * 3;
      ctx.translate(0, bob);

      // Original tiny human adventurer: oversized friendly head, scarf, explorer pack and big boots.
      // Lightweight 2D style-study placeholder; the planned final character is rigged 3D.
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.beginPath(); ctx.ellipse(0, -2, 17, 4, 0, 0, Math.PI * 2); ctx.fill();

      // Backpack and rolled blanket.
      ctx.fillStyle = "#9b633e"; ctx.fillRect(-15, -48, 10, 23);
      ctx.fillStyle = "#d0a45f"; ctx.fillRect(-17, -49, 13, 5);
      ctx.fillStyle = "#4c382a"; ctx.fillRect(-13, -40, 6, 7);
      ctx.strokeStyle = "#5b3e2b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -47); ctx.lineTo(-9, -27); ctx.stroke();

      // Legs and chunky boots.
      ctx.lineCap = "round"; ctx.lineWidth = 5; ctx.strokeStyle = "#755037";
      ctx.beginPath(); ctx.moveTo(-4, -17); ctx.lineTo(-6 + stride, -5); ctx.moveTo(4, -17); ctx.lineTo(5 - stride, -5); ctx.stroke();
      ctx.fillStyle = "#493326";
      ctx.beginPath(); ctx.ellipse(-7 + stride, -4, 6, 3, -0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(6 - stride, -4, 6, 3, -0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d6a45e"; ctx.fillRect(-10 + stride, -5, 5, 1.5); ctx.fillRect(3 - stride, -5, 5, 1.5);

      // Teal explorer jacket and belt.
      ctx.fillStyle = "#3d826e"; ctx.beginPath(); ctx.moveTo(-8, -36); ctx.quadraticCurveTo(-11, -31, -9, -19);
      ctx.lineTo(-5, -15); ctx.lineTo(6, -15); ctx.lineTo(10, -22); ctx.lineTo(7, -35); ctx.quadraticCurveTo(0, -40, -8, -36); ctx.fill();
      ctx.fillStyle = "#e9c17a"; ctx.fillRect(-7, -24, 14, 3);
      ctx.fillStyle = "#6d4932"; ctx.fillRect(3, -25, 3, 5);

      // Arms and orange scarf.
      ctx.strokeStyle = "#f0c08f"; ctx.lineWidth = 4; ctx.beginPath();
      ctx.moveTo(-7, -33); ctx.lineTo(-10 - armSwing, -25); ctx.lineTo(-8 - armSwing, -22);
      ctx.moveTo(7, -33); ctx.lineTo(10 + armSwing, -27); ctx.lineTo(8 + armSwing, -24); ctx.stroke();
      ctx.fillStyle = "#e87945"; ctx.beginPath(); ctx.moveTo(-5, -38); ctx.lineTo(5, -38); ctx.lineTo(3, -33);
      ctx.lineTo(11, -30); ctx.lineTo(8, -27); ctx.lineTo(0, -32); ctx.lineTo(-5, -34); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffc17a"; ctx.fillRect(-11, -34, 6, 2);

      // Round face, swept hair and a readable side-facing eye.
      ctx.fillStyle = "#f3c99d"; ctx.beginPath(); ctx.ellipse(1, -48, 11, 12, 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5b3726"; ctx.beginPath(); ctx.moveTo(-10, -51); ctx.quadraticCurveTo(-13, -62, -3, -62);
      ctx.quadraticCurveTo(1, -67, 7, -60); ctx.quadraticCurveTo(13, -58, 11, -51);
      ctx.lineTo(5, -55); ctx.lineTo(-1, -54); ctx.lineTo(-6, -49); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#f3c99d"; ctx.beginPath(); ctx.arc(10, -47, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff7df"; ctx.beginPath(); ctx.ellipse(5, -49, 2.5, 3.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3d3027"; ctx.beginPath(); ctx.arc(6, -49, 1.25, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#8c4e38"; ctx.lineWidth = 1.5; ctx.beginPath();
      if (talking) { const mouthOpen = 1.2 + (reducedMotion ? 0 : Math.abs(Math.sin(time / 55)) * 2.2); ctx.ellipse(8, -42, 2.1, mouthOpen, 0, 0, Math.PI * 2); }
      else { ctx.moveTo(5, -42); ctx.quadraticCurveTo(8, -40, 10, -42); }
      ctx.stroke();

      // Talking cue floats above the hero while voice playback is active.
      if (talking) {
        ctx.fillStyle = "#fff5dc"; ctx.fillRect(9, -76, 26, 15);
        ctx.beginPath(); ctx.moveTo(14, -61); ctx.lineTo(12, -57); ctx.lineTo(20, -61); ctx.fill();
        ctx.fillStyle = "#6d583d";
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(15 + i * 7, -69, 1.3, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
    }

    function draw() {
      if (!ctx) return;
      const w = width(), h = height(), stage = getStage(state.stageId);
      const palette = CHAPTERS[stage.chapter - 1].palette;
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, palette[0]); gradient.addColorStop(1, "#101319");
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
      // Parallax silhouettes.
      for (let layer = 0; layer < 3; layer++) {
        const baseY = h * (0.47 + layer * 0.12);
        ctx.fillStyle = [palette[1], "#1c302b", "#121c1c"][layer];
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w + 60; x += 60) {
          const wave = Math.sin((x + state.frame * (layer + 1) * 0.15) / (45 + layer * 20)) * (16 + layer * 10);
          ctx.lineTo(x, baseY + wave);
        }
        ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      }
      const floor = h * 0.82;
      ctx.fillStyle = "#241d18"; ctx.fillRect(0, floor, w, h - floor);
      ctx.fillStyle = palette[2]; ctx.fillRect(0, floor, w, 3);
      // Platforms and hazards become denser as stage difficulty increases.
      const count = 2 + Math.floor((stage.id - 1) / 3);
      for (let i = 0; i < count; i++) {
        const px = w * (0.28 + i * (0.62 / count));
        const py = floor - h * (0.12 + ((i * 7 + stage.id) % 4) * 0.075);
        ctx.fillStyle = "#66523a"; ctx.fillRect(px, py, w * 0.12, 7);
        ctx.fillStyle = palette[2]; ctx.fillRect(px, py, w * 0.12, 2);
      }
      const hazards = Math.min(5, Math.floor((stage.id + 1) / 4));
      for (let i = 0; i < hazards; i++) {
        const hx = w * (0.42 + i * 0.105);
        ctx.fillStyle = "#c05d36"; ctx.beginPath(); ctx.moveTo(hx, floor); ctx.lineTo(hx + 9, floor - 18); ctx.lineTo(hx + 18, floor); ctx.fill();
      }
      if (state.action === "attack" && state.frame < state.actionUntil) {
        ctx.save(); ctx.strokeStyle = "#f8e5ad"; ctx.lineWidth = 4; ctx.beginPath();
        ctx.arc(w * state.x + 14, floor - state.jumpY - 25, 25, -1.15, 0.7); ctx.stroke(); ctx.restore();
      }
      if (state.frame < state.dodgeUntil) {
        ctx.fillStyle = "#e7bd7240"; ctx.beginPath(); ctx.ellipse(w * state.x - 18, floor - 9, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
      }
      drawCharacter(w * state.x, floor - state.jumpY, Math.max(0.8, Math.min(1.3, h / 320)), state.frame, state);
      // Scene marker / exit.
      ctx.fillStyle = palette[2]; ctx.fillRect(w * 0.91, floor - 44, 4, 44);
      ctx.beginPath(); ctx.moveTo(w * 0.915, floor - 43); ctx.lineTo(w * 0.97, floor - 32); ctx.lineTo(w * 0.915, floor - 21); ctx.fill();
      ctx.fillStyle = "#fff0d0"; ctx.font = "bold 10px system-ui"; ctx.fillText("RELIC · " + String(stage.id).padStart(2, "0"), 12, 20);
      ctx.fillStyle = "#ffffff80"; ctx.fillRect(12, 29, w * 0.2, 3);
      ctx.fillStyle = palette[2]; ctx.fillRect(12, 29, w * 0.2 * (stage.id / 16), 3);
    }

    function tick(time) {
      if (!state.running) return;
      state.frame = time || state.frame + 16;
      const delta = state.lastTickTime ? Math.min(32, Math.max(0, time - state.lastTickTime)) : 16;
      state.lastTickTime = time || state.lastTickTime + delta;
      const movement = (state.held.has("right") ? 1 : 0) - (state.held.has("left") ? 1 : 0);
      state.x = Math.max(0.06, Math.min(0.88, state.x + movement * delta * 0.00012 * (reducedMotion ? 1 : 1.25)));
      if (state.jumpV || state.jumpY > 0) {
        state.jumpY = Math.max(0, state.jumpY + state.jumpV * delta / 1000);
        state.jumpV -= 680 * delta / 1000;
        if (state.jumpY === 0) state.jumpV = 0;
      }
      draw();
      state.raf = root.requestAnimationFrame(tick);
    }
    function keyDown(e) {
      const key = e.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) state.held.add("left");
      if (["arrowright", "d"].includes(key)) state.held.add("right");
      if ([" ", "arrowup", "w"].includes(key)) { if (state.jumpY <= 0) state.jumpV = 260; if (e.preventDefault) e.preventDefault(); }
    }
    function keyUp(e) {
      const key = e.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) state.held.delete("left");
      if (["arrowright", "d"].includes(key)) state.held.delete("right");
      if ([" ", "arrowup", "w"].includes(key)) state.y = 0;
    }
    if (root.addEventListener) {
      root.addEventListener("keydown", keyDown);
      root.addEventListener("keyup", keyUp);
      if (root.ResizeObserver) new root.ResizeObserver(resize).observe(canvas);
      else root.addEventListener("resize", resize);
    }
    const left = root.document && root.document.querySelector("#moveLeft");
    const right = root.document && root.document.querySelector("#moveRight");
    if (left) { left.addEventListener("pointerdown", () => state.held.add("left")); ["pointerup", "pointercancel", "pointerleave"].forEach(e => left.addEventListener(e, () => state.held.delete("left"))); }
    if (right) { right.addEventListener("pointerdown", () => state.held.add("right")); ["pointerup", "pointercancel", "pointerleave"].forEach(e => right.addEventListener(e, () => state.held.delete("right"))); }
    resize(); stageChanged(); state.raf = root.requestAnimationFrame(tick);
    return {
      state,
      getStage,
      setStage,
      performAction,
      setTalking(value) { state.talking = Boolean(value); draw(); },
      getStages: () => STAGES.map(s => Object.assign({}, s)),
      destroy() { state.running = false; if (state.raf) root.cancelAnimationFrame(state.raf); root.removeEventListener("keydown", keyDown); root.removeEventListener("keyup", keyUp); }
    };
  }

  const api = { CHAPTERS, STAGES, getStage, getStages: () => STAGES.map(s => Object.assign({}, s)), createGame };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.RelicV2 = api;
})(typeof window !== "undefined" ? window : globalThis);
