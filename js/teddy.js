/* ==========================================================================
   Maybac — the Sleeping Teddy, built in three.js
   Chocolate-mousse bear on a gold-rimmed Maybac plate, a warm chocolate pour
   that tucks him in, and a slow sleeping breath. Scroll drives the pour on
   desktop; on phones it plays when you reach it.
   ========================================================================== */
(() => {
  "use strict";
  const stage = document.querySelector("[data-teddy]");
  if (!stage) return;
  const section = stage.closest(".teddy") || stage;
  const canvas = stage.querySelector("canvas");
  const MB = (window.MB = window.MB || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function webglOK() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }
  const fail = (why) => { if (why) console.warn("[teddy] falling back to photo:", why); section.classList.add("no-webgl"); };
  if (!webglOK()) return fail("no WebGL");

  const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
  const ENV_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js";

  // load lazily, a little before the section scrolls into view
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    import("three")
      .catch(() => import(THREE_URL))
      .then((THREE) => import("three/addons/environments/RoomEnvironment.js")
        .then((m) => [THREE, m.RoomEnvironment])
        .catch(() => import(ENV_URL).then((m) => [THREE, m.RoomEnvironment]).catch(() => [THREE, null])))
      .then(([THREE, RoomEnvironment]) => init(THREE, RoomEnvironment))
      .catch((e) => fail(e && e.message));
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: "120% 0px" });
    io.observe(stage);
  } else go();

  /* ---------- little canvas textures ---------- */
  function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }

  // grated-chocolate fur: hundreds of tiny curls over a cocoa base
  function shavingsTexture(THREE, size = 512) {
    const [c, g] = makeCanvas(size, size);
    g.fillStyle = "#6b3b24"; g.fillRect(0, 0, size, size);
    for (let i = 0; i < 5200; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 1.5 + Math.random() * 4.5;
      const a0 = Math.random() * Math.PI * 2;
      const light = Math.random();
      g.strokeStyle = light > 0.62 ? `rgba(160,104,70,${0.35 + Math.random() * 0.4})` : light > 0.3 ? `rgba(58,28,16,${0.4 + Math.random() * 0.45})` : `rgba(116,70,44,${0.5})`;
      g.lineWidth = 0.8 + Math.random() * 1.4;
      g.beginPath(); g.arc(x, y, r, a0, a0 + 1.4 + Math.random() * 2.4); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  function shavingsBump(THREE, size = 512) {
    const [c, g] = makeCanvas(size, size);
    g.fillStyle = "#808080"; g.fillRect(0, 0, size, size);
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 1.5 + Math.random() * 4;
      const a0 = Math.random() * Math.PI * 2, v = Math.random() > 0.5 ? 230 : 30;
      g.strokeStyle = `rgba(${v},${v},${v},0.7)`; g.lineWidth = 1 + Math.random() * 1.5;
      g.beginPath(); g.arc(x, y, r, a0, a0 + 1.5 + Math.random() * 2); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  // walnut table, like the ones upstairs
  function walnutTexture(THREE) {
    const W = 1024, H = 1024;
    const [c, g] = makeCanvas(W, H);
    const grd = g.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, "#4a2214"); grd.addColorStop(0.5, "#5a2c19"); grd.addColorStop(1, "#3c1a0f");
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) {
      const y0 = Math.random() * H, amp = 4 + Math.random() * 18, f = 0.002 + Math.random() * 0.006, ph = Math.random() * 6;
      g.strokeStyle = Math.random() > 0.5 ? `rgba(30,12,6,${0.08 + Math.random() * 0.18})` : `rgba(140,80,48,${0.05 + Math.random() * 0.12})`;
      g.lineWidth = 0.6 + Math.random() * 2.6;
      g.beginPath();
      for (let x = 0; x <= W; x += 8) { const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1) * amp * 0.25; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 1.6);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  function radialAlpha(THREE) {
    const [c, g] = makeCanvas(512, 512);
    const grd = g.createRadialGradient(256, 256, 40, 256, 256, 256);
    grd.addColorStop(0, "#fff"); grd.addColorStop(0.55, "#bbb"); grd.addColorStop(1, "#000");
    g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
  }
  // "M A Y B A C" printed around the far side of the plate, like the real ones
  function plateTextTexture(THREE, outerR, textR) {
    const S = 1024;
    const [c, g] = makeCanvas(S, S);
    g.clearRect(0, 0, S, S);
    const scale = S / (outerR * 2), cx = S / 2, cy = S / 2, R = textR * scale;
    g.fillStyle = "#9b4a6a";
    g.font = `400 ${Math.round(S * 0.034)}px Outfit, "Segoe UI", sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle";
    const letters = "MAYBAC".split(""), spread = 0.62;
    letters.forEach((ch, i) => {
      const th = -spread / 2 + (spread * i) / (letters.length - 1);
      g.save();
      g.translate(cx + R * Math.sin(th), cy - R * Math.cos(th));
      g.rotate(th);
      g.fillText(ch === "A" ? "Λ" : ch, 0, 0);
      g.restore();
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  function dotSprite(THREE) {
    const [c, g] = makeCanvas(64, 64);
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,240,215,1)"); grd.addColorStop(0.4, "rgba(255,220,180,.5)"); grd.addColorStop(1, "rgba(255,220,180,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- scene ---------- */
  function init(THREE, RoomEnvironment) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return fail("renderer"); }
    const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || window.innerWidth < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    if (RoomEnvironment) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
      pmrem.dispose();
    }

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const look = new THREE.Vector3(0, 0.42, 0);

    // light: warm key from the bar side, a rose rim like the canopy glow, soft fill
    scene.add(new THREE.HemisphereLight(0xffeadf, 0x3a0a12, RoomEnvironment ? 0.35 : 0.9));
    const key = new THREE.DirectionalLight(0xffe0c0, 2.6);
    key.position.set(-3.2, 6.2, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 16 });
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf3a3b2, 1.9);
    rim.position.set(4.5, 3.2, -4.5);
    scene.add(rim);
    const warm = new THREE.PointLight(0xffb27a, 9, 9, 2);
    warm.position.set(2.4, 1.6, 2.6);
    scene.add(warm);

    /* table */
    const table = new THREE.Mesh(
      new THREE.CircleGeometry(7, 96),
      new THREE.MeshPhysicalMaterial({ map: walnutTexture(THREE), alphaMap: radialAlpha(THREE), transparent: true, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.25 })
    );
    table.rotation.x = -Math.PI / 2;
    table.receiveShadow = true;
    scene.add(table);

    /* the dish = plate + bear + chocolate, rotates as one */
    const dish = new THREE.Group();
    scene.add(dish);

    const V = (x, y) => new THREE.Vector2(x, y);
    const plateProfile = [V(0, 0), V(1.3, 0), V(1.42, 0.02), V(1.5, 0.06), V(1.62, 0.13), V(1.74, 0.19), V(1.8, 0.215), V(1.82, 0.235),
      V(1.79, 0.247), V(1.7, 0.222), V(1.56, 0.162), V(1.46, 0.118), V(1.38, 0.1), V(0.0001, 0.1)];
    const plate = new THREE.Mesh(
      new THREE.LatheGeometry(plateProfile, 120),
      new THREE.MeshPhysicalMaterial({ color: 0xf8f3ec, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.12, side: THREE.DoubleSide })
    );
    plate.castShadow = true; plate.receiveShadow = true;
    dish.add(plate);
    const gold = new THREE.Mesh(
      new THREE.TorusGeometry(1.665, 0.009, 10, 200),
      new THREE.MeshStandardMaterial({ color: 0xd8b26a, metalness: 1, roughness: 0.22 })
    );
    gold.rotation.x = -Math.PI / 2; gold.position.y = 0.213;
    dish.add(gold);
    const print = new THREE.Mesh(
      new THREE.CircleGeometry(1.36, 96),
      new THREE.MeshStandardMaterial({ map: plateTextTexture(THREE, 1.36, 1.2), transparent: true, roughness: 0.35, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
    );
    print.rotation.x = -Math.PI / 2; print.position.y = 0.1015;
    dish.add(print);

    /* the bear */
    const furMap = shavingsTexture(THREE), furBump = shavingsBump(THREE);
    furMap.repeat.set(2.2, 2.2); furBump.repeat.set(2.2, 2.2);
    const fur = new THREE.MeshStandardMaterial({ map: furMap, bumpMap: furBump, bumpScale: 1.6, roughness: 0.94, metalness: 0, color: 0xe2c2b0 });
    const furLight = fur.clone(); furLight.color = new THREE.Color(0xf4d9c7);
    const darkGloss = new THREE.MeshPhysicalMaterial({ color: 0x1a0904, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 });

    const bear = new THREE.Group();
    bear.position.set(-0.12, 0.1, 0.08);
    bear.rotation.y = -0.38;
    dish.add(bear);

    const part = (geo, mat, p, s, r) => {
      const m = new THREE.Mesh(geo, mat);
      if (p) m.position.set(...p);
      if (s) m.scale.set(...s);
      if (r) m.rotation.set(...r);
      m.castShadow = true; m.receiveShadow = true;
      return m;
    };
    const sphere = (r, seg = 64) => new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75));

    const BODY_S = [1.22, 0.74, 0.95];
    const body = part(sphere(0.62, 72), fur, [0.42, 0.4, -0.05], BODY_S);
    bear.add(body);

    const head = new THREE.Group();
    head.position.set(-0.52, 0.5, 0.12);
    head.rotation.set(0.05, 0.12, 0.09);
    bear.add(head);
    head.add(part(sphere(0.52, 72), fur, [0, 0, 0], [1, 0.94, 0.96]));
    // ears
    head.add(part(sphere(0.17, 40), fur, [-0.32, 0.37, -0.06], [1, 1, 0.55], [0, 0.3, 0.45]));
    head.add(part(sphere(0.17, 40), fur, [0.2, 0.42, -0.12], [1, 1, 0.55], [0, -0.25, -0.3]));
    head.add(part(sphere(0.095, 24), darkGloss, [-0.31, 0.37, 0.0], [1, 1, 0.3], [0, 0.3, 0.45]));
    head.add(part(sphere(0.095, 24), darkGloss, [0.2, 0.42, -0.06], [1, 1, 0.3], [0, -0.25, -0.3]));
    // muzzle + nose
    head.add(part(sphere(0.21, 48), furLight, [-0.02, -0.13, 0.41], [1.15, 0.82, 0.75]));
    head.add(part(sphere(0.066, 24), darkGloss, [-0.02, -0.05, 0.56], [1.35, 0.85, 0.8]));
    // sleepy eyes: two little downward arcs
    const lid = new THREE.TorusGeometry(0.072, 0.013, 8, 28, Math.PI);
    head.add(part(lid, darkGloss, [-0.22, 0.08, 0.455], null, [-0.2, -0.38, Math.PI]));
    head.add(part(lid, darkGloss, [0.17, 0.08, 0.465], null, [-0.2, 0.32, Math.PI]));
    // a tiny mouth
    head.add(part(new THREE.TorusGeometry(0.035, 0.008, 6, 16, Math.PI), darkGloss, [-0.02, -0.19, 0.555], null, [-0.35, 0, Math.PI]));

    // paws tucked in front, feet out the back, a stubby tail
    const capsule = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 20);
    bear.add(part(capsule(0.12, 0.22), fur, [-0.8, 0.12, 0.5], null, [0, 0.55, Math.PI / 2]));
    bear.add(part(capsule(0.12, 0.22), fur, [-0.24, 0.12, 0.58], null, [0, -0.25, Math.PI / 2]));
    bear.add(part(capsule(0.15, 0.16), fur, [1.1, 0.15, 0.42], null, [0, 0.15, Math.PI / 2]));
    bear.add(part(capsule(0.15, 0.16), fur, [1.1, 0.15, -0.5], null, [0, -0.15, Math.PI / 2]));
    bear.add(part(new THREE.CircleGeometry(0.09, 24), furLight, [1.34, 0.15, 0.43], null, [0, Math.PI / 2, 0]));
    bear.add(part(new THREE.CircleGeometry(0.09, 24), furLight, [1.34, 0.15, -0.49], null, [0, Math.PI / 2, 0]));
    bear.add(part(sphere(0.12, 32), fur, [1.17, 0.56, -0.05]));

    /* ---------- the chocolate ---------- */
    const ganache = new THREE.MeshPhysicalMaterial({
      color: 0x200c06, roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05,
      sheen: 0.4, sheenColor: new THREE.Color(0x5a2a18), envMapIntensity: 1.25
    });

    // blanket: a slightly lumpy shell over his back, revealed top-down with drippy edges
    const U = { uCut: { value: 0.75 }, uTime: { value: 0 } };
    const blanketGeo = sphere(0.665, 120);
    {
      const pos = blanketGeo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const n = Math.sin(v.x * 9.0) * Math.cos(v.z * 7.0) * 0.012 + Math.sin(v.x * 17 + v.z * 13) * 0.006;
        v.multiplyScalar(1 + n / 0.665);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      blanketGeo.computeVertexNormals();
    }
    const blanketMat = ganache.clone();
    blanketMat.side = THREE.DoubleSide;
    blanketMat.onBeforeCompile = (shader) => {
      shader.uniforms.uCut = U.uCut;
      shader.uniforms.uTime = U.uTime;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;\nuniform float uCut;\nuniform float uTime;")
        .replace("void main() {", [
          "void main() {",
          "  float ang = atan(vLocal.z, vLocal.x);",
          "  float drip = 0.085 * sin(ang * 7.0 + 1.3) + 0.05 * sin(ang * 13.0 + 0.7) + 0.035 * sin(ang * 3.0 + uTime * 0.15);",
          "  float edge = uCut + min(drip, 0.02) * smoothstep(0.75, 0.35, uCut);",
          "  if (vLocal.y < edge) discard;"
        ].join("\n"));
    };
    blanketMat.customProgramCacheKey = () => "maybac-blanket";
    const blanket = new THREE.Mesh(blanketGeo, blanketMat);
    blanket.position.copy(body.position);
    blanket.scale.set(...BODY_S);
    blanket.castShadow = true;
    bear.add(blanket);

    // the pool on the plate
    const pool = (() => {
      const shape = new THREE.Shape();
      const N = 96;
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * Math.PI * 2;
        const r = 0.82 * (1 + 0.15 * Math.sin(3 * t + 0.5) + 0.08 * Math.sin(5 * t + 2) + 0.045 * Math.sin(9 * t + 1));
        const x = Math.cos(t) * r * 1.2, y = Math.sin(t) * r;
        i ? shape.lineTo(x, y) : shape.moveTo(x, y);
      }
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.05, bevelSegments: 6, curveSegments: 96 });
      geo.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, ganache);
      m.position.set(0.5, 0.028, 0.02);
      m.receiveShadow = true;
      return m;
    })();
    bear.add(pool);

    // the pour, from somewhere above the frame
    const POUR_X = 0.52, POUR_Z = -0.02, LAND_Y = 0.86, TOP_Y = 6;
    const streamGeo = new THREE.CylinderGeometry(0.028, 0.036, 1, 20, 24, true);
    streamGeo.translate(0, -0.5, 0);
    const stream = new THREE.Mesh(streamGeo, ganache);
    stream.position.set(POUR_X, TOP_Y, POUR_Z);
    stream.visible = false;
    bear.add(stream);
    const splash = new THREE.Mesh(sphere(0.085, 32), ganache);
    splash.position.set(POUR_X, LAND_Y - 0.02, POUR_Z);
    splash.scale.setScalar(0.001);
    bear.add(splash);

    /* cocoa dust in the light */
    const DUST = lowPower ? 90 : 170;
    const dustGeo = new THREE.BufferGeometry();
    const dp = new Float32Array(DUST * 3), ds = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 8; dp[i * 3 + 1] = Math.random() * 4; dp[i * 3 + 2] = (Math.random() - 0.5) * 6;
      ds[i] = 0.2 + Math.random() * 0.8;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.045, map: dotSprite(THREE), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd6a8 }));
    scene.add(dust);

    /* ---------- layout: where the dish sits on screen ---------- */
    let W = 1, H = 1, aspect = 1, baseX = 0;
    function layout() {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      aspect = W / H;
      renderer.setSize(W, H, false);
      camera.aspect = aspect;
      const wide = aspect > 1.25;
      // on wide screens the words sit on the left, so the dish moves right
      baseX = wide ? Math.min(1.15, (aspect - 1.2) * 1.1) : 0;
      const dist = wide ? 7.4 : aspect > 0.95 ? 8.6 : 9.8;
      camera.position.set(0, dist * 0.36, dist);
      camera.fov = wide ? 30 : 32;
      camera.updateProjectionMatrix();
      dish.position.x = baseX;
      dish.position.y = wide ? -0.05 : 0.1;
    }
    layout();
    if ("ResizeObserver" in window) new ResizeObserver(layout).observe(stage);
    else window.addEventListener("resize", layout);

    /* ---------- the pour, as a function of progress 0..1 ---------- */
    const clamp01 = (x) => Math.min(1, Math.max(0, x));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeIn = (t) => t * t * t;
    const zzz = stage.querySelector("[data-zzz]");

    let target = 0, shown = 0, mode = MB.teddyScroll ? "scroll" : "idle";
    let auto = null; // { start, dur }

    function apply(p, t) {
      const down = easeOut(clamp01(p / 0.13));
      const tail = easeIn(clamp01((p - 0.66) / 0.16));
      const bottom = lerp(TOP_Y, LAND_Y, down);
      const top = lerp(TOP_Y, LAND_Y, tail);
      const len = top - bottom;
      stream.visible = len > 0.01;
      if (stream.visible) {
        stream.position.y = top;
        stream.scale.set(1 + Math.sin(t * 9) * 0.06, len, 1 + Math.cos(t * 7) * 0.06);
        stream.rotation.z = Math.sin(t * 2.3) * 0.012;
      }
      const pouring = down > 0.98 && tail < 0.99;
      const s = pouring ? 0.85 + Math.sin(t * 14) * 0.12 : Math.max(0.001, splash.scale.x * 0.85);
      splash.scale.set(s, s * 0.6, s);

      U.uCut.value = lerp(0.75, -0.52, easeInOut(clamp01((p - 0.07) / 0.62)));
      const pg = easeOut(clamp01((p - 0.22) / 0.55));
      pool.scale.set(lerp(0.2, 1, pg), lerp(0.3, 1, pg), lerp(0.2, 1, pg));
      pool.visible = pg > 0.001;

      if (zzz) zzz.classList.toggle("is-on", p > 0.88);
    }

    function playPour(delay = 0) {
      mode = "auto";
      auto = { start: performance.now() + delay, dur: reduce ? 10 : 5200 };
      target = shown = 0;
    }
    MB.teddy = {
      setProgress(p) {
        if (mode === "auto" && auto && performance.now() - auto.start < auto.dur && Math.abs(p - target) < 0.004) return;
        mode = "scroll"; auto = null; target = clamp01(p);
      },
      pour: () => playPour(0)
    };
    if (MB.teddyScroll) target = MB.teddyProgress || 0;

    const pourBtn = section.querySelector("[data-pour]");
    if (pourBtn) pourBtn.addEventListener("click", () => playPour(0));

    /* ---------- turning him with a finger or a mouse ---------- */
    let rotT = -0.15, rot = -0.15, vel = 0, dragging = false, lastX = 0, lastMove = 0, idleSince = performance.now();
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    canvas.addEventListener("pointerdown", (e) => {
      dragging = true; lastX = e.clientX; vel = 0;
      stage.classList.add("is-dragging");
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      vel = dx * 0.006;
      rotT += vel;
      lastMove = performance.now();
    });
    const up = () => { dragging = false; idleSince = performance.now(); stage.classList.remove("is-dragging"); };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", () => { pointer.x = 0; pointer.y = 0; });
    canvas.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") rotT -= 0.3;
      if (e.key === "ArrowRight") rotT += 0.3;
    });
    canvas.tabIndex = 0;

    /* ---------- loop (only while visible) ---------- */
    let visible = false, raf = 0, firstSeen = false;
    const clock = new THREE.Clock();
    const zzzPos = new THREE.Vector3();

    function frame() {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      U.uTime.value = t;

      if (mode === "auto" && auto) {
        const k = clamp01((performance.now() - auto.start) / auto.dur);
        target = k;
        if (k >= 1) { auto = null; mode = MB.teddyScroll ? "scroll" : "idle"; }
      }
      shown += (target - shown) * (mode === "auto" ? 1 : 1 - Math.pow(0.0008, dt));
      apply(shown, t);

      // inertia after a drag, then a slow drift back to a nice angle
      if (!dragging) {
        vel *= Math.pow(0.04, dt);
        rotT += vel;
        if (performance.now() - Math.max(idleSince, lastMove) > 2600) rotT += (-0.15 + Math.sin(t * 0.25) * 0.22 - rotT) * (1 - Math.pow(0.6, dt));
      }
      rot += (rotT - rot) * (1 - Math.pow(0.0005, dt));
      dish.rotation.y = rot;

      // he breathes
      const b = Math.sin(t * 1.55);
      body.scale.set(BODY_S[0] * (1 + b * 0.008), BODY_S[1] * (1 + b * 0.022), BODY_S[2] * (1 + b * 0.012));
      blanket.scale.copy(body.scale);
      head.position.y = 0.5 + b * 0.008;

      // a little parallax from the pointer
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;
      const camBase = camera.position.z;
      camera.position.x = pointer.sx * 0.35;
      camera.position.y = camBase * 0.36 - pointer.sy * 0.18;
      camera.lookAt(look.x + baseX * 0.55, look.y, look.z);

      // dust drifts upward and loops
      const arr = dust.geometry.attributes.position.array;
      for (let i = 0; i < DUST; i++) {
        arr[i * 3 + 1] += dt * 0.08 * ds[i];
        arr[i * 3] += Math.sin(t * 0.3 + i) * dt * 0.02;
        if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = 0;
      }
      dust.geometry.attributes.position.needsUpdate = true;

      // keep the "zzz" floating just above his head
      if (zzz) {
        head.getWorldPosition(zzzPos);
        zzzPos.y += 0.7; zzzPos.x += 0.1;
        zzzPos.project(camera);
        zzz.style.transform = `translate(${((zzzPos.x + 1) / 2) * W}px, ${((1 - zzzPos.y) / 2) * H}px)`;
      }

      renderer.render(scene, camera);
    }
    function start() { if (!raf && visible && !document.hidden) { clock.getDelta(); raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    const io = new IntersectionObserver((ents) => {
      visible = ents.some((e) => e.isIntersecting);
      if (visible) {
        start();
        // phones (no scroll-linked pour): play it when he first comes into view
        if (!firstSeen && !MB.teddyScroll) { firstSeen = true; playPour(500); }
        firstSeen = true;
      } else stop();
    }, { threshold: 0.15 });
    io.observe(stage);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    // first frame straight away so the stage is never empty
    apply(MB.teddyScroll ? target : 0, 0);
    renderer.render(scene, camera);
    section.classList.add("is-3d-ready");
  }
})();
