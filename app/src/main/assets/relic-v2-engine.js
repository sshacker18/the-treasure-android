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
    const state = { stageId: 1, x: 0.18, y: 0, jumpY: 0, jumpV: 0, velocity: 0, running: true, frame: 0, lastTime: 0, held: new Set(), completed: false };
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

    function drawCharacter(x, floor, scale, time) {
      ctx.save(); ctx.translate(x, floor); ctx.scale(scale, scale);
      const bob = reducedMotion ? 0 : Math.sin(time / 110) * 1.8;
      // Original pulp-adventure explorer silhouette; deliberately not a copy of a film character.
      ctx.translate(0, bob);
      ctx.fillStyle = "#17120f"; ctx.beginPath(); ctx.ellipse(0, -2, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b9844d"; ctx.fillRect(-7, -24, 14, 17);
      ctx.fillStyle = "#493324"; ctx.fillRect(-8, -26, 16, 5);
      ctx.fillStyle = "#d9ad79"; ctx.beginPath(); ctx.arc(0, -30, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#4b3220"; ctx.fillRect(-8, -37, 16, 5); ctx.fillRect(-5, -42, 10, 6);
      ctx.strokeStyle = "#241b14"; ctx.lineWidth = 3;
      const stride = reducedMotion ? 0 : Math.sin(time / 80) * 5;
      ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(-5 + stride, 0); ctx.moveTo(3, -8); ctx.lineTo(5 - stride, 0); ctx.stroke();
      ctx.strokeStyle = "#d5b16c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, -21); ctx.lineTo(12, -12); ctx.stroke();
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
      drawCharacter(w * state.x, floor, Math.max(0.8, Math.min(1.3, h / 320)), state.frame);
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
      const movement = (state.held.has("right") ? 1 : 0) - (state.held.has("left") ? 1 : 0);
      state.x = Math.max(0.06, Math.min(0.88, state.x + movement * 0.0017 * (reducedMotion ? 1 : 1.25)));
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
      getStages: () => STAGES.map(s => Object.assign({}, s)),
      destroy() { state.running = false; if (state.raf) root.cancelAnimationFrame(state.raf); root.removeEventListener("keydown", keyDown); root.removeEventListener("keyup", keyUp); }
    };
  }

  const api = { CHAPTERS, STAGES, getStage, createGame };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.RelicV2 = api;
})(typeof window !== "undefined" ? window : globalThis);
