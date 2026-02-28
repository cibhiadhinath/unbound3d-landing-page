import * as THREE from 'three';

// ─── Configuration ───
const CONFIG = {
    bg: 0x0a0a0c,
    spotColor: 0xf0eee6,
    spotIntensity: 4.5,
    spotAngle: Math.PI / 5.5,
    spotPenumbra: 0.65,
    spotDecay: 1.8,
    spotHeight: 8,
    lerpFactor: 0.06,
    mobileLerpFactor: 0.035, // slower, smoother on mobile
    dustCount: 80,
    mobileDustCount: 24,
    fogDensity: 0.045,
    mobileFogDensity: 0.018,
    mobileBreak: 768,
    capRevealRadius: 0.22,
    mobileCapRevealRadius: 0.30,
    // Mobile auto-inspection timing
    mobileNodeDwell: 1800,     // ms a node stays illuminated
    mobileNodeTravel: 800,     // ms for spotlight to travel between nodes
    mobileIdleBreath: 4500,    // ms for one breathing cycle
    mobileTapHold: 5000,       // ms to hold tapped node before resuming
    mobileFpsLimit: 33,        // ~30fps cap on mobile
};

// ─── Tooltip descriptions ───
const TOOLTIPS = {
    milling: 'High precision machined metal components',
    turning: 'Rotational parts with tight concentricity',
    tolerance: 'Critical dimensions held to spec',
    metal: 'Aerospace and industrial grade alloys',
    printing: 'Complex geometries, rapid turnaround',
    production: 'Consistent batch runs, 10–500 units',
    reverse: 'We recreate parts from existing samples',
    cad: 'Design optimization for manufacturability',
    fitment: 'Verified assembly before delivery',
};

// ─── State ───
let scene, camera, renderer, spotlight, spotTarget;
let dustParticles, dustGeo, dustMat;
let mouseNorm = { x: 0, y: 0 };
let targetNorm = { x: 0, y: 0 };
let scrollProgress = 0;
let rafId = null;
let canvas;
let isMobile = window.innerWidth <= CONFIG.mobileBreak;
let lastFrameTime = 0;

// Mobile auto-inspection state
let mobilePhase = 'idle';       // 'idle' | 'traveling' | 'dwelling' | 'tapped'
let mobileActiveNodeIdx = -1;
let mobileShuffleOrder = [];
let mobileShufflePos = 0;
let mobilePhaseTimer = null;
let mobileTapTimer = null;
let mobileBreathTime = 0;
let tooltipEl = null;

// ─── Capability nodes data ───
const CAPABILITIES = [
    { angle: -110, label: '5-Axis CNC Milling', group: 'Manufacturing', icon: 'milling' },
    { angle: -70, label: 'CNC Turning', group: 'Manufacturing', icon: 'turning' },
    { angle: -35, label: 'Tight Tolerance Machining', group: 'Manufacturing', icon: 'tolerance' },
    { angle: 0, label: 'Aluminum & Stainless Steel', group: 'Manufacturing', icon: 'metal' },
    { angle: 35, label: '3D Printing (SLA, SLS, MJF, FDM/FFF)', group: 'Manufacturing', icon: 'printing' },
    { angle: 70, label: 'Low Volume Production', group: 'Manufacturing', icon: 'production' },
    { angle: 110, label: 'Reverse Engineering', group: 'Engineering', icon: 'reverse' },
    { angle: 145, label: 'CAD & DFM Optimization', group: 'Engineering', icon: 'cad' },
    { angle: -145, label: 'Assembly Fitment Testing', group: 'Engineering', icon: 'fitment' },
];

// ─── SVG icons for capabilities ───
const ICONS = {
    milling: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4m-3.5-7.5L16 6m-8 12l-1.5 1.5m13-1.5L18 18M6 6L4.5 4.5"/></svg>`,
    turning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v3m0 10v3"/></svg>`,
    tolerance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12h4l3-8 4 16 3-8h6"/></svg>`,
    metal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>`,
    printing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9V2h12v7M6 18h12v4H6zM4 9h16v9H4z"/></svg>`,
    production: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20M5 20V8l5-4v16m4 0V8l5-4v16"/></svg>`,
    reverse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 14l-4 4 4 4"/><path d="M5 18h14a4 4 0 000-8h-1"/><path d="M15 10l4-4-4-4"/><path d="M19 6H5a4 4 0 000 8h1"/></svg>`,
    cad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/><path d="M7 10l3 3 7-7"/></svg>`,
    fitment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
};

// ─── Shuffle helper ───
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Initialize Three.js Scene ───
export function initSpotlightEngine() {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(CONFIG.bg, isMobile ? CONFIG.mobileFogDensity : CONFIG.fogDensity);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    canvas = renderer.domElement;
    canvas.classList.add('hero-canvas');
    container.appendChild(canvas);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.92, metalness: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ambient
    scene.add(new THREE.AmbientLight(0x1a1a2e, 0.15));

    // Spot target
    spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -0.5, 0);
    scene.add(spotTarget);

    // Spotlight (lower intensity on mobile for subtler ground glow)
    const mobileSpotIntensity = isMobile ? 2.5 : CONFIG.spotIntensity;
    spotlight = new THREE.SpotLight(CONFIG.spotColor, mobileSpotIntensity, 30, CONFIG.spotAngle, CONFIG.spotPenumbra, CONFIG.spotDecay);
    spotlight.position.set(0, CONFIG.spotHeight, 2);
    spotlight.target = spotTarget;
    spotlight.castShadow = !isMobile;
    if (spotlight.shadow) {
        spotlight.shadow.mapSize.width = 1024;
        spotlight.shadow.mapSize.height = 1024;
        spotlight.shadow.camera.near = 1;
        spotlight.shadow.camera.far = 20;
        spotlight.shadow.bias = -0.001;
    }
    scene.add(spotlight);

    // Volumetric cone (desktop only — looks harsh on mobile)
    if (!isMobile) {
        const coneH = CONFIG.spotHeight + 1;
        const coneR = Math.tan(CONFIG.spotAngle) * coneH * 0.7;
        const coneGeo = new THREE.ConeGeometry(coneR, coneH, 32, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
            color: CONFIG.spotColor, transparent: true, opacity: 0.018,
            side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.copy(spotlight.position);
        cone.position.y -= coneH / 2;
        cone.renderOrder = 1;
        scene.add(cone);
    }

    createDustParticles();

    // Event listeners
    if (!isMobile) {
        window.addEventListener('mousemove', onMouseMove);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Build capability DOM nodes + tooltip container
    buildCapabilityNodes();
    buildTooltip();

    // Start mobile auto-inspection or desktop mode
    if (isMobile) {
        startMobileAutoInspection();
    }

    animate();
}

// ─── Dust Particles ───
function createDustParticles() {
    const count = isMobile ? CONFIG.mobileDustCount : CONFIG.dustCount;
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 16;
        positions[i * 3 + 1] = Math.random() * 6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        velocities.push({
            x: (Math.random() - 0.5) * 0.003,
            y: (Math.random() - 0.5) * 0.002,
            z: (Math.random() - 0.5) * 0.002,
        });
    }

    dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeo.userData.velocities = velocities;

    dustMat = new THREE.PointsMaterial({
        color: 0xffffff, size: isMobile ? 0.025 : 0.035,
        transparent: true, opacity: 0.35, depthWrite: false,
        blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });

    dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);
}

function updateDustParticles() {
    const pos = dustGeo.attributes.position;
    const vels = dustGeo.userData.velocities;
    for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3] += vels[i].x;
        pos.array[i * 3 + 1] += vels[i].y;
        pos.array[i * 3 + 2] += vels[i].z;
        if (Math.abs(pos.array[i * 3]) > 8) vels[i].x *= -1;
        if (pos.array[i * 3 + 1] > 6 || pos.array[i * 3 + 1] < 0) vels[i].y *= -1;
        if (Math.abs(pos.array[i * 3 + 2]) > 4) vels[i].z *= -1;
    }
    pos.needsUpdate = true;
}

// ─── Event Handlers (Desktop only for mouse) ───
function onMouseMove(e) {
    targetNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
    isMobile = window.innerWidth <= CONFIG.mobileBreak;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
}

function onScroll() {
    const hero = document.getElementById('hero-section');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    scrollProgress = Math.max(0, Math.min(1, -rect.top / (hero.offsetHeight * 0.6)));
}

// ─── Capability Discovery Nodes ───
function buildCapabilityNodes() {
    const container = document.getElementById('capability-nodes');
    if (!container) return;

    CAPABILITIES.forEach((cap, i) => {
        const node = document.createElement('div');
        node.className = 'cap-node';
        node.dataset.index = i;
        node.dataset.icon = cap.icon;

        const rad = (cap.angle * Math.PI) / 180;
        let cx, cy;

        if (isMobile) {
            // Upper arc: tight band at top 18–22% of hero, clear of title
            const semiAngle = -180 + (i / (CAPABILITIES.length - 1)) * 180;
            const semiRad = (semiAngle * Math.PI) / 180;
            const radius = 36;
            cx = 50 + Math.cos(semiRad) * radius;
            cy = 20 + Math.sin(semiRad) * (radius * 0.08);
            cx = Math.max(12, Math.min(88, cx));
        } else {
            const radius = 44;
            cx = 50 + Math.cos(rad) * radius;
            cy = 50 + Math.sin(rad) * (radius * 0.55);
        }

        node.style.left = `${cx}%`;
        node.style.top = `${cy}%`;

        node.innerHTML = `
      <div class="cap-node-line"></div>
      <div class="cap-node-content">
        <div class="cap-node-icon">${ICONS[cap.icon] || ''}</div>
        <span class="cap-node-group">${cap.group}</span>
        <span class="cap-node-label">${cap.label}</span>
      </div>
      <div class="cap-node-glow"></div>
    `;

        // Mobile: tap to pause and show tooltip
        if (isMobile) {
            node.style.pointerEvents = 'auto';
            node.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleMobileTap(i);
            }, { passive: false });
        }

        container.appendChild(node);
    });
}

// ─── Tooltip ───
function buildTooltip() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'cap-tooltip';
    tooltipEl.innerHTML = '<span class="cap-tooltip-text"></span>';
    const hero = document.getElementById('hero-section');
    if (hero) hero.appendChild(tooltipEl);
}

function showTooltip(capIndex) {
    if (!tooltipEl) return;
    const cap = CAPABILITIES[capIndex];
    const text = TOOLTIPS[cap.icon] || cap.label;
    tooltipEl.querySelector('.cap-tooltip-text').textContent = text;
    tooltipEl.classList.add('visible');
}

function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('visible');
}

// ─── Desktop: proximity-based reveal ───
function updateCapabilityNodesDesktop() {
    const nodes = document.querySelectorAll('.cap-node');
    if (!nodes.length) return;

    const spotX = (mouseNorm.x + 1) / 2;
    const spotY = (-mouseNorm.y + 1) / 2;

    nodes.forEach(node => {
        const nodeX = parseFloat(node.style.left) / 100;
        const nodeY = parseFloat(node.style.top) / 100;
        const dist = Math.sqrt((spotX - nodeX) ** 2 + (spotY - nodeY) ** 2);

        if (dist < CONFIG.capRevealRadius && scrollProgress < 0.4) {
            node.classList.add('revealed');
        } else {
            node.classList.remove('revealed');
        }
    });
}

// ═════════════════════════════════════════════════════
//  MOBILE AUTO-INSPECTION ENGINE
// ═════════════════════════════════════════════════════

function startMobileAutoInspection() {
    // Build shuffled order
    mobileShuffleOrder = shuffleArray(CAPABILITIES.map((_, i) => i));
    mobileShufflePos = 0;
    mobilePhase = 'idle';

    // Start first cycle after short delay
    mobilePhaseTimer = setTimeout(() => { mobileNextNode(); }, 1500);
}

function mobileNextNode() {
    if (scrollProgress > 0.3 || mobilePhase === 'tapped') return;

    // Deactivate current node
    deactivateMobileNode();

    // Pick next from shuffled order
    const nextIdx = mobileShuffleOrder[mobileShufflePos % mobileShuffleOrder.length];
    mobileShufflePos++;

    // Re-shuffle when all have been visited
    if (mobileShufflePos >= mobileShuffleOrder.length) {
        mobileShuffleOrder = shuffleArray(CAPABILITIES.map((_, i) => i));
        mobileShufflePos = 0;
    }

    // Move spotlight toward the node
    mobilePhase = 'traveling';
    mobileActiveNodeIdx = nextIdx;

    const nodes = document.querySelectorAll('.cap-node');
    const node = nodes[nextIdx];
    if (!node) return;

    const nodeX = parseFloat(node.style.left) / 100;
    const nodeY = parseFloat(node.style.top) / 100;
    targetNorm.x = nodeX * 2 - 1;
    targetNorm.y = -(nodeY * 2 - 1);

    // After travel time, activate the node
    mobilePhaseTimer = setTimeout(() => {
        mobilePhase = 'dwelling';
        activateMobileNode(nextIdx);

        // After dwell time, deactivate and move on
        mobilePhaseTimer = setTimeout(() => {
            deactivateMobileNode();
            mobilePhase = 'idle';

            // Brief idle gap, then next node
            mobilePhaseTimer = setTimeout(() => { mobileNextNode(); },
                400 + Math.random() * 400);
        }, CONFIG.mobileNodeDwell);
    }, CONFIG.mobileNodeTravel);
}

function activateMobileNode(idx) {
    const nodes = document.querySelectorAll('.cap-node');
    // Clear all first
    nodes.forEach(n => n.classList.remove('revealed'));
    if (nodes[idx]) {
        nodes[idx].classList.add('revealed');
    }
}

function deactivateMobileNode() {
    document.querySelectorAll('.cap-node.revealed').forEach(n => n.classList.remove('revealed'));
    mobileActiveNodeIdx = -1;
    hideTooltip();
}

function handleMobileTap(nodeIdx) {
    // Cancel current auto-cycle
    if (mobilePhaseTimer) clearTimeout(mobilePhaseTimer);
    if (mobileTapTimer) clearTimeout(mobileTapTimer);

    mobilePhase = 'tapped';

    // Activate the tapped node
    const nodes = document.querySelectorAll('.cap-node');
    nodes.forEach(n => n.classList.remove('revealed'));
    if (nodes[nodeIdx]) nodes[nodeIdx].classList.add('revealed');

    // Move spotlight to tapped node
    const node = nodes[nodeIdx];
    if (node) {
        const nodeX = parseFloat(node.style.left) / 100;
        const nodeY = parseFloat(node.style.top) / 100;
        targetNorm.x = nodeX * 2 - 1;
        targetNorm.y = -(nodeY * 2 - 1);
    }

    // Show tooltip
    showTooltip(nodeIdx);

    // Resume after 5s
    mobileTapTimer = setTimeout(() => {
        mobilePhase = 'idle';
        deactivateMobileNode();
        mobilePhaseTimer = setTimeout(() => { mobileNextNode(); }, 600);
    }, CONFIG.mobileTapHold);
}

// ─── Text Illumination ───
function updateTextIllumination() {
    const titleEl = document.getElementById('hero-title');
    const subEl = document.getElementById('hero-subtitle');
    const trustEl = document.getElementById('hero-trust');
    const ctaGroup = document.getElementById('hero-cta');

    if (!titleEl) return;

    const spotX = mouseNorm.x;
    const spotY = mouseNorm.y;
    const distFromCenter = Math.sqrt(spotX * spotX + spotY * spotY);
    const proximity = Math.max(0, 1 - distFromCenter * 1.2);

    // Mobile idle breathing glow
    let breathGlow = 0;
    if (isMobile && mobilePhase === 'idle') {
        mobileBreathTime += 16; // approx per frame at 30fps
        breathGlow = 0.15 * (0.5 + 0.5 * Math.sin(mobileBreathTime * 2 * Math.PI / CONFIG.mobileIdleBreath));
    } else if (isMobile && mobilePhase === 'traveling') {
        breathGlow = 0.08;
    }

    const titleBright = Math.min(1, 0.15 + proximity * 0.85 + scrollProgress * 0.8 + breathGlow);
    titleEl.style.opacity = titleBright;
    titleEl.style.textShadow = `0 0 ${(proximity + breathGlow) * 30}px rgba(240,238,230,${(proximity + breathGlow) * 0.3})`;

    const lightAngle = Math.atan2(spotY, spotX) * (180 / Math.PI);
    titleEl.style.setProperty('--light-angle', `${135 + lightAngle * 0.3}deg`);

    // Mobile: intensify glow when node is active
    if (isMobile && (mobilePhase === 'dwelling' || mobilePhase === 'tapped')) {
        titleEl.style.opacity = Math.min(1, titleBright + 0.15);
        titleEl.style.textShadow = `0 0 25px rgba(240,238,230,0.25)`;
    }

    if (subEl) subEl.style.opacity = Math.min(1, 0.1 + proximity * 0.6 + scrollProgress * 0.8 + breathGlow * 0.5);
    if (trustEl) trustEl.style.opacity = Math.min(1, 0.05 + proximity * 0.4 + scrollProgress * 0.7 + breathGlow * 0.3);

    // CTA button illumination (desktop only)
    if (ctaGroup && !isMobile) {
        const btns = ctaGroup.querySelectorAll('.hero-btn');
        btns.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = (rect.left + rect.width / 2) / window.innerWidth * 2 - 1;
            const btnCenterY = -((rect.top + rect.height / 2) / window.innerHeight * 2 - 1);
            const dBtn = Math.sqrt((spotX - btnCenterX) ** 2 + (spotY - btnCenterY) ** 2);
            btn.style.setProperty('--btn-glow', Math.max(0, 1 - dBtn * 2));
        });
    }
}

// ─── Scroll Transition ───
function updateScrollTransition() {
    const workshopOverlay = document.getElementById('workshop-overlay');

    if (scrollProgress > 0.1 && !isMobile) {
        const lockFactor = Math.min(1, (scrollProgress - 0.1) / 0.4);
        targetNorm.x *= (1 - lockFactor);
        targetNorm.y *= (1 - lockFactor);
    }

    if (spotlight) {
        spotlight.intensity = CONFIG.spotIntensity + scrollProgress * 6;
    }

    if (workshopOverlay) {
        workshopOverlay.style.opacity = Math.max(0, (scrollProgress - 0.5) * 2);
    }
}

// ─── Render Loop ───
function animate(timestamp) {
    rafId = requestAnimationFrame(animate);

    // Mobile FPS throttle
    if (isMobile && timestamp) {
        const delta = timestamp - lastFrameTime;
        if (delta < CONFIG.mobileFpsLimit) return;
        lastFrameTime = timestamp;
    }

    // Lerp mouse position
    const lerp = isMobile ? CONFIG.mobileLerpFactor : CONFIG.lerpFactor;
    mouseNorm.x += (targetNorm.x - mouseNorm.x) * lerp;
    mouseNorm.y += (targetNorm.y - mouseNorm.y) * lerp;

    updateScrollTransition();

    // Move spotlight target (smaller range on mobile to prevent clipping)
    const targetRangeX = isMobile ? 3 : 6;
    const targetRangeZ = isMobile ? 1.5 : 3;
    const spotParallaxX = isMobile ? 0.6 : 1.5;
    const spotParallaxZ = isMobile ? 0.3 : 0.8;

    if (spotTarget) {
        spotTarget.position.x = mouseNorm.x * targetRangeX;
        spotTarget.position.z = -mouseNorm.y * targetRangeZ + 1;
    }
    if (spotlight) {
        spotlight.position.x = mouseNorm.x * spotParallaxX;
        spotlight.position.z = -mouseNorm.y * spotParallaxZ + 2;
    }

    updateDustParticles();
    updateTextIllumination();

    // Desktop: proximity-based. Mobile: managed by auto-inspection engine
    if (!isMobile) {
        updateCapabilityNodesDesktop();
    }

    renderer.render(scene, camera);
}

// ─── Cleanup ───
export function destroySpotlightEngine() {
    if (rafId) cancelAnimationFrame(rafId);
    if (mobilePhaseTimer) clearTimeout(mobilePhaseTimer);
    if (mobileTapTimer) clearTimeout(mobileTapTimer);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    if (renderer) {
        renderer.dispose();
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
    if (dustGeo) dustGeo.dispose();
    if (dustMat) dustMat.dispose();
}

// ─── Auto-init ───
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotlightEngine);
} else {
    initSpotlightEngine();
}
