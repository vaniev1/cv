// ============ QUANTUM COMPUTER (three.js) ============
// IBM Quantum Cryostat "Chandelier" - accurate recreation
(() => {
  if (!window.THREE) return;
  if (new URLSearchParams(location.search).has('no3d')) return;

  const canvas = document.getElementById('quantum');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 6.5, 12);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.15, 5.8);

  let resScale = 1;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(Math.round(w * resScale), Math.round(h * resScale), false);
    camera.aspect = w / h;
    camera.position.z = w < 700 ? 7.6 : 5.8;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- lights ----
  scene.add(new THREE.AmbientLight(0x505a75, 1.0));
  const key = new THREE.DirectionalLight(0xfff0d0, 1.25);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7c5cff, 0.6);
  rim.position.set(-4, -2, -3);
  scene.add(rim);
  const coreLight = new THREE.PointLight(0x00d4ff, 1.2, 7);
  coreLight.position.set(0, -2.1, 0);
  scene.add(coreLight);

  // ---- materials ----
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9b06e, metalness: 0.95, roughness: 0.3, emissive: 0x2a1e08, emissiveIntensity: 0.5 });
  const goldBright = new THREE.MeshStandardMaterial({ color: 0xf0c987, metalness: 1.0, roughness: 0.22, emissive: 0x332208, emissiveIntensity: 0.4 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xc4713d, metalness: 0.9, roughness: 0.38, emissive: 0x1e0a02, emissiveIntensity: 0.6 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xd6dce8, metalness: 0.95, roughness: 0.28 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0x596070, metalness: 1.0, roughness: 0.18 });

  function glowTexture(colorStr) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, colorStr);
    grad.addColorStop(0.35, colorStr.replace('1)', '0.35)'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const cyanGlow = glowTexture('rgba(90,225,255,1)');
  const violetGlow = glowTexture('rgba(160,120,255,1)');

  const machine = new THREE.Group();
  scene.add(machine);

  const dummy = new THREE.Object3D();

  // ---- Top mounting plate (largest) ----
  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.12, 64), steel);
  topPlate.position.y = 2.1;
  machine.add(topPlate);
  
  // Top plate rim
  const topRim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 12, 64), goldBright);
  topRim.position.y = 2.1;
  topRim.rotation.x = Math.PI / 2;
  machine.add(topRim);

  // ---- Gold plates (tapering downward) ----
  const plates = [
    { y: 1.5, r: 1.35 },
    { y: 0.6, r: 1.15 },
    { y: -0.25, r: 0.95 },
    { y: -1.05, r: 0.7 }
  ];
  
  plates.forEach((p, idx) => {
    // Main disc
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(p.r, p.r, 0.06, 64), gold);
    disc.position.y = p.y;
    machine.add(disc);
    
    // Rim
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(p.r, 0.035, 10, 64), goldBright);
    rim2.position.y = p.y;
    rim2.rotation.x = Math.PI / 2;
    machine.add(rim2);
    
    // Inner ring detail
    if (idx < 3) {
      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(p.r * 0.6, 0.02, 8, 48), copper);
      innerRing.position.y = p.y + 0.03;
      innerRing.rotation.x = Math.PI / 2;
      machine.add(innerRing);
    }
  });

  // ---- Neck connector ----
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.55, 32), steel);
  neck.position.y = 1.82;
  machine.add(neck);

  // ---- Dense rod curtains between levels ----
  const gaps = [
    { top: { y: 2.1, r: 1.6 }, bot: plates[0] },
    { top: plates[0], bot: plates[1] },
    { top: plates[1], bot: plates[2] },
    { top: plates[2], bot: plates[3] }
  ];
  
  gaps.forEach((g, gi) => {
    const gapH = g.top.y - g.bot.y - 0.06;
    const midY = (g.top.y + g.bot.y) / 2;
    const rr = Math.min(g.top.r, g.bot.r) * 0.92;
    const count = gi === 0 ? 42 : 52;
    
    // Outer rods
    const rods = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.012, 0.012, gapH, 6),
      gi % 2 === 0 ? gold : goldBright,
      count
    );
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * rr, midY, Math.sin(a) * rr);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      rods.setMatrixAt(i, dummy.matrix);
    }
    rods.instanceMatrix.needsUpdate = true;
    machine.add(rods);

    // Inner rods
    const innerCount = 16;
    const inner = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.018, 0.018, gapH, 6),
      steel,
      innerCount
    );
    for (let i = 0; i < innerCount; i++) {
      const a = (i / innerCount) * Math.PI * 2 + 0.3;
      dummy.position.set(Math.cos(a) * rr * 0.7, midY, Math.sin(a) * rr * 0.7);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      inner.setMatrixAt(i, dummy.matrix);
    }
    inner.instanceMatrix.needsUpdate = true;
    machine.add(inner);
  });

  // ---- Central column ----
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.8, 20), steel);
  column.position.y = 0.2;
  machine.add(column);
  
  // Column collars at each plate
  plates.forEach(p => {
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 20), goldBright);
    collar.position.y = p.y;
    machine.add(collar);
  });

  // ---- Spring coils between plates ----
  for (let level = 0; level < 3; level++) {
    const startY = plates[level].y - 0.1;
    const endY = plates[level + 1].y + 0.1;
    const coilCount = Math.floor((startY - endY) / 0.08);
    
    for (let i = 0; i < coilCount; i++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 8, 24), gold);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = startY - i * 0.08;
      machine.add(coil);
    }
  }

  // ---- Copper braids under top plate ----
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.07), copper);
    strap.position.set(Math.cos(a) * 1.15, 1.82, Math.sin(a) * 1.15);
    strap.lookAt(0, 1.82, 0);
    machine.add(strap);
  }

  // ---- Bottom quantum chip assembly ----
  const bottomCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 28), goldBright);
  bottomCollar.position.y = -1.15;
  machine.add(bottomCollar);
  
  const bottomCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 28), chrome);
  bottomCyl.position.y = -1.65;
  machine.add(bottomCyl);
  
  const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 28), gold);
  bottomCap.position.y = -2.12;
  machine.add(bottomCap);

  // ---- Glowing qubits ----
  const qubits = [];
  plates.forEach((p, li) => {
    const nq = 8 - li;
    for (let i = 0; i < nq; i++) {
      const a = (i / nq) * Math.PI * 2 + li * 0.8;
      const x = Math.cos(a) * p.r, z = Math.sin(a) * p.r;
      const cyan = (i + li) % 2 === 0;
      const q = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 10),
        new THREE.MeshBasicMaterial({ color: cyan ? 0x59e6ff : 0xa07bff })
      );
      q.position.set(x, p.y, z);
      machine.add(q);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: cyan ? cyanGlow : violetGlow,
        transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      halo.scale.setScalar(0.4);
      halo.position.copy(q.position);
      machine.add(halo);
      qubits.push({ mesh: q, halo, phase: Math.random() * Math.PI * 2 });
    }
  });

  // ---- Hanging wires ----
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xbf9455, metalness: 0.85, roughness: 0.5 });
  for (let k = 0; k < 18; k++) {
    const li = k % (plates.length - 1);
    const l1 = plates[li], l2 = plates[li + 1];
    const a1 = Math.random() * Math.PI * 2;
    const a2 = a1 + (Math.random() - 0.5) * 1.6;
    const p1 = new THREE.Vector3(Math.cos(a1) * l1.r * 0.95, l1.y - 0.03, Math.sin(a1) * l1.r * 0.95);
    const p2 = new THREE.Vector3(Math.cos(a2) * l2.r * 0.95, l2.y + 0.03, Math.sin(a2) * l2.r * 0.95);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    mid.y -= 0.22;
    const outward = mid.clone().setY(0).normalize().multiplyScalar(0.25);
    mid.add(outward);
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.009, 6), wireMat);
    machine.add(tube);
  }

  // ---- Glowing core ----
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0x7df1ff }));
  core.position.y = -2.2;
  machine.add(core);
  const coreHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: cyanGlow, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  coreHalo.scale.setScalar(1.4);
  coreHalo.position.copy(core.position);
  machine.add(coreHalo);

  // ---- Orbiting particles ----
  const pCount = 280;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 2.2 + Math.random() * 1.4;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 4.6;
    pPos[i * 3] = Math.cos(theta) * r;
    pPos[i * 3 + 1] = y;
    pPos[i * 3 + 2] = Math.sin(theta) * r;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x88aaff, size: 0.024, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(particles);

  // ---- animation ----
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let spin = 0;
  let scrollRot = 0;
  let slowMode = false;
  let probeFrames = 0;
  let probeCost = 0;
  let lastFrame = 0;
  let needsRender = true;

  window.addEventListener('scroll', () => { needsRender = true; }, { passive: true });
  window.addEventListener('resize', () => { needsRender = true; });

  function updateFade(s) {
    const h = window.innerHeight;
    const docH = document.documentElement.scrollHeight;
    const p = s / h;
    let op = p < 0.55 ? 0.95 : Math.max(0.38, 0.95 - (p - 0.55) * 0.55);
    const fromBottom = (docH - h - s) / h;
    if (fromBottom < 0.9) op = Math.min(0.85, op + (0.9 - fromBottom) * 0.45);
    canvas.style.opacity = op.toFixed(2);
  }

  function animate(t) {
    requestAnimationFrame(animate);
    const interval = slowMode ? 120 : 33;
    if (t - lastFrame < interval) return;
    lastFrame = t;

    const s = window.scrollY;
    const scrollTarget = s * 0.0022;

    if (!slowMode) {
      spin += 0.0016;
      machine.position.y = Math.sin(t * 0.0005) * 0.09;
      particles.rotation.y -= 0.0007;
      for (const q of qubits) {
        const k = 1 + Math.sin(t * 0.003 + q.phase) * 0.3;
        q.mesh.scale.setScalar(k);
        q.halo.material.opacity = 0.45 + Math.abs(Math.sin(t * 0.003 + q.phase)) * 0.5;
      }
      coreHalo.material.opacity = 0.7 + Math.sin(t * 0.004) * 0.25;
      coreLight.intensity = 1.1 + Math.sin(t * 0.004) * 0.4;
      needsRender = true;
    }

    scrollRot += (scrollTarget - scrollRot) * (slowMode ? 0.35 : 0.06);
    if (Math.abs(scrollTarget - scrollRot) > 0.001) needsRender = true;
    machine.rotation.y = spin + scrollRot;
    machine.rotation.x += ((my * 0.07 + 0.03) - machine.rotation.x) * 0.05;
    machine.rotation.z += ((mx * -0.04) - machine.rotation.z) * 0.05;

    updateFade(s);

    if (!needsRender) return;
    needsRender = false;

    const t0 = performance.now();
    renderer.render(scene, camera);
    const cost = performance.now() - t0;

    if (probeFrames < 6 && !document.hidden) {
      probeFrames++;
      probeCost += cost;
      if (probeFrames === 6 && probeCost / 6 > 40) {
        slowMode = true;
        resScale = 0.5;
        renderer.setPixelRatio(1);
        resize();
        needsRender = true;
      }
    }
  }
  requestAnimationFrame(animate);
})();
