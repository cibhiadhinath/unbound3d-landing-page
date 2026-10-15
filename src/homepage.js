import * as THREE from 'three';

// ─── Configuration ───
const CONFIG = {
    bg: 0x000000,
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
    globeRadius: window.innerWidth <= 768 ? 3.0 : 4.5,
    starCount: 8,
    rotationSpeed: (Math.PI * 2) / 60, // 60 seconds per full rotation
    hoverSlowdown: 0.2,       // 20% of normal speed during hover
    mobileCycleTime: 3000,    // 3 seconds per node highlight
    dampingFactor: 0.05,      // For smooth controls
    idleResumeDelay: 3000,    // ms to wait before resuming auto-rotation
    maxDPR: 1.8               // Performance cap
};

// ─── Globe Hotspots ───
const GLOBE_HOTSPOTS = [
    { title: 'Design & Engineering', desc: 'DFM, material selection, CAD improvement, tolerance planning.' },
    { title: 'Prototyping', desc: 'Functional prototypes, fit checks, investor models, rapid iterations.' },
    { title: 'Manufacturing', desc: 'CNC machining, sheet metal, injection moulding, industrial 3D printing, tooling.' },
    { title: 'Quality & Validation', desc: 'Inspection reports, FAI, testing support, traceability, verification.' },
    { title: 'Production Management', desc: 'Vendor coordination, sourcing, cost optimization, delivery tracking.' }
];

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

let mobileBreathTime = 0;

// Globe & Service Stars state
let globeGroup, stars = [], starLabels = [], starDots = [], beamsGroup;
let raycaster, mouse = new THREE.Vector2();
let hoveredNodeIndex = -1;
let mobileCycleTimer = null;
let currentRotationSpeed = CONFIG.rotationSpeed;
let isUserInteracting = false;
let lastInteractionTime = 0;
let autoRotationEnabled = true;

// Custom pointer drag state
let pointerDown = false;
let pointerPrevX = 0;
let pointerPrevY = 0;
let dragVelocityX = 0;
let dragVelocityY = 0;

// Globe navigation state
let isNavigating = false;
let navTransitionRaf = null;
let originalCameraZ = 12;
let originalGlobeOpacity = 0.1;
let activeNavSection = null;

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
    originalCameraZ = isMobile ? 14 : 12;
    camera.position.set(0, 0, originalCameraZ);
    camera.lookAt(0, 0, 0);

    try {
        renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxDPR || 2));
        renderer.shadowMap.enabled = !isMobile;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.9;
        canvas = renderer.domElement;
        canvas.classList.add('hero-canvas');
        container.appendChild(canvas);
    } catch (e) {
        console.warn("WebGL failed, showing 2D fallback", e);
        show2DFallback();
        // Still build nodes for visibility
        buildCapabilityNodes();
        return;
    }

    // Ground plane removed to show full globe sphere

    // Ambient
    scene.add(new THREE.AmbientLight(0x1a1a2e, 0.15));

    // Spotlight removed per design update

    // Custom pointer drag: rotate globeGroup directly, camera stays fixed
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);
    canvas.style.touchAction = 'none'; // prevent scroll on touch drag

    createDustParticles();
    createGlobeStructure();
    buildCapabilityNodes();

    raycaster = new THREE.Raycaster();

    if (!document.getElementById('globe-tooltip')) {
        const tt = document.createElement('div');
        tt.id = 'globe-tooltip';
        tt.className = 'glass-tooltip';
        document.body.appendChild(tt);
    }

    // Event listeners
    if (!isMobile) {
        window.addEventListener('mousemove', onMouseMove);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

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

// ─── Event Handlers ───
function onMouseMove(e) {
    targetNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.x = targetNorm.x;
    mouse.y = targetNorm.y;
}

function onPointerDown(e) {
    pointerDown = true;
    pointerPrevX = e.clientX;
    pointerPrevY = e.clientY;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isUserInteracting = true;
    autoRotationEnabled = false;
    dragVelocityX = 0;
    dragVelocityY = 0;
}

function onPointerMove(e) {
    if (!pointerDown || !globeGroup) return;
    const dx = e.clientX - pointerPrevX;
    const dy = e.clientY - pointerPrevY;
    // Rotate globe directly — slow sensitivity for premium feel
    const sensitivity = 0.004;
    globeGroup.rotation.y += dx * sensitivity;
    globeGroup.rotation.x += dy * sensitivity * 0.5;
    // Clamp X rotation so globe doesn't flip
    globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x));
    dragVelocityX = dx * sensitivity;
    dragVelocityY = dy * sensitivity * 0.5;
    pointerPrevX = e.clientX;
    pointerPrevY = e.clientY;
}

function onPointerUp(e) {
    if (pointerDown && e && e.clientX !== undefined) {
        // Check if it was a click (not a drag)
        const totalDrag = Math.abs(e.clientX - pointerStartX) + Math.abs(e.clientY - pointerStartY);
        if (totalDrag < 8 && !isNavigating) {
            // It's a click — check if a 3D node was hit
            const clickMouse = new THREE.Vector2();
            clickMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            clickMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            const clickRaycaster = new THREE.Raycaster();
            clickRaycaster.setFromCamera(clickMouse, camera);
            const intersects = clickRaycaster.intersectObjects(stars);
            if (intersects.length > 0) {
                const idx = intersects[0].object.userData.index;
                if (idx !== undefined) {
                    navigateToSection(idx);
                }
            }
        }
    }
    pointerDown = false;
    isUserInteracting = false;
    lastInteractionTime = performance.now();
}

function onVisibilityChange() {
    animationActive = !document.hidden;
    if (animationActive) {
        lastFrameTime = performance.now();
        animate(lastFrameTime);
    } else {
        if (rafId) cancelAnimationFrame(rafId);
    }
}

function onResize() {
    isMobile = window.innerWidth <= CONFIG.mobileBreak;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    originalCameraZ = isMobile ? 14 : 12;
    if (!isNavigating) {
        camera.position.set(0, 0, originalCameraZ);
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

    // Update node layouts for new screen size
    if (typeof updateNodePositions === 'function') {
        updateNodePositions();
    }

    if (isMobile) {
        if (typeof startMobileRandomReveal === 'function') startMobileRandomReveal();
    } else if (typeof mobileRevealTimer !== 'undefined' && mobileRevealTimer) {
        clearInterval(mobileRevealTimer);
        const nodes = document.querySelectorAll('.cap-node');
        nodes.forEach(n => n.classList.remove('revealed'));
    }
}

function onScroll() {
    const hero = document.getElementById('hero-section');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    scrollProgress = Math.max(0, Math.min(1, -rect.top / (hero.offsetHeight * 0.6)));
}

// ─── Mobile Services Ticker (horizontal scrolling marquee) ───
function buildMobileTicker() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    const ticker = document.createElement('div');
    ticker.className = 'services-ticker';

    const track = document.createElement('div');
    track.className = 'services-ticker-track';

    // Filter to just individual services (not headers) for the ticker
    const tickerServices = SERVICE_TILES.filter(s => !s.isHeader);

    // Create items twice for seamless loop
    for (let loop = 0; loop < 2; loop++) {
        tickerServices.forEach(cap => {
            const item = document.createElement('div');
            item.className = 'services-ticker-item';
            // Simple text label since we removed icons
            item.innerHTML = `
                <span class="ticker-label">${cap.text}</span>
            `;
            // Ticker items can just scroll, navigation removed for simplicity as there are 80+ items
            track.appendChild(item);
        });
    }

    ticker.appendChild(track);
    heroSection.appendChild(ticker);
}

// ═════════════════════════════════════════════════════
//  GLOBE NAVIGATION SYSTEM
// ═════════════════════════════════════════════════════

function navigateToSection(sectionId, globeNodeIndex = -1) {
    if (isNavigating) return;
    isNavigating = true;

    const targetSection = document.getElementById(sectionId);
    if (!targetSection) { isNavigating = false; return; }

    activeNavSection = sectionId;

    // 1. Pause rotation
    autoRotationEnabled = false;
    currentRotationSpeed = 0;

    // 2. Hide or isolate globe dots and labels
    starLabels.forEach((l, idx) => {
        if (l) {
            l.style.opacity = (idx === globeNodeIndex) ? '1' : '0';
            l.style.pointerEvents = 'none';
        }
    });

    starDots.forEach((dot, idx) => {
        if (dot) {
            dot.style.opacity = '0'; // Hide dots when navigating
            dot.style.pointerEvents = 'none';
        }
    });

    // 3. Add body classes for hero fade + scroll lock
    document.body.classList.add('globe-nav-active', 'globe-section-open');

    // 4. Camera zoom + globe dissolve (600ms)
    const startTime = performance.now();
    const duration = 600;
    const startZ = camera.position.z;
    const targetZ = 2.5; // Deep zoom inside the globe

    function animateTransition(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - t, 3);

        camera.position.z = startZ + (targetZ - startZ) * ease;

        // Dissolve globe
        if (globeGroup) {
            globeGroup.traverse((child) => {
                if (child.material && child.material.transparent) {
                    child.material.opacity *= (1 - ease * 0.9);
                }
            });
        }

        // Fade canvas
        if (canvas) {
            canvas.style.opacity = 1 - ease;
        }

        if (t < 1) {
            navTransitionRaf = requestAnimationFrame(animateTransition);
        } else {
            // 5. Transition complete — show section as full-screen overlay
            if (canvas) canvas.style.opacity = '0';

            // Inject close button if not already present
            if (!targetSection.querySelector('.section-close-btn')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'section-close-btn';
                closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                closeBtn.addEventListener('click', returnToGlobe);
                targetSection.prepend(closeBtn);
            }

            // Show section as fixed overlay
            targetSection.classList.add('section-overlay-active');

            // Show back button
            const backBtn = document.getElementById('globe-back-btn');
            if (backBtn) backBtn.classList.add('visible');
        }
    }

    navTransitionRaf = requestAnimationFrame(animateTransition);
}

function returnToGlobe() {
    if (!isNavigating) return;

    // 1. Hide back button
    const backBtn = document.getElementById('globe-back-btn');
    if (backBtn) backBtn.classList.remove('visible');

    // 2. Fade out the active section
    if (activeNavSection) {
        const section = document.getElementById(activeNavSection);
        if (section) {
            section.style.animation = 'sectionFadeOut 0.4s ease-in forwards';
            setTimeout(() => {
                section.classList.remove('section-overlay-active');
                section.style.animation = '';
            }, 400);
        }
    }

    // 3. Restore globe (start after section begins fading)
    setTimeout(() => {
        // Show canvas
        if (canvas) canvas.style.opacity = '1';

        const startTime = performance.now();
        const duration = 600;
        const startZ = camera.position.z;

        function animateReturn(now) {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            const ease = 1 - Math.pow(1 - t, 3);

            // Restore camera
            camera.position.z = startZ + (originalCameraZ - startZ) * ease;

            // Restore globe materials
            if (globeGroup) {
                globeGroup.traverse((child) => {
                    if (child.material && child.material.transparent) {
                        if (child.geometry && child.geometry.type === 'SphereGeometry' &&
                            child.geometry.parameters.radius === CONFIG.globeRadius) {
                            child.material.opacity = originalGlobeOpacity * ease;
                        } else {
                            child.material.opacity = 0.8 * ease;
                        }
                    }
                });
            }

            // Restore star colors (if we were using them)
            stars.forEach(s => {
                s.material.color.setHex(0xf0eee6);
            });

            if (t < 1) {
                navTransitionRaf = requestAnimationFrame(animateReturn);
            } else {
                // Fully restored
                isNavigating = false;
                activeNavSection = null;
                autoRotationEnabled = true;
                lastInteractionTime = performance.now();
                document.body.classList.remove('globe-nav-active', 'globe-section-open');

                starLabels.forEach((l, idx) => {
                    if (l) l.style.pointerEvents = '';
                });

                starDots.forEach((dot, idx) => {
                    if (dot) {
                        dot.style.pointerEvents = 'auto';
                        dot.style.opacity = '1';
                    }
                });
            }
        }

        navTransitionRaf = requestAnimationFrame(animateReturn);
    }, 200); // Start globe restore 200ms into section fade
}

// Export for external use (back button + Escape key)
window.returnToGlobe = returnToGlobe;

// Escape key to close section
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isNavigating) {
        returnToGlobe();
    }
});


function show2DFallback() {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;

    const fallback = document.createElement('div');
    fallback.className = 'sphere-fallback';
    fallback.innerHTML = '<div class="fallback-grid"></div>';
    container.appendChild(fallback);
}

// ─── Minimal Globe & Hotspots ───

function createGlobeStructure() {
    globeGroup = new THREE.Group();
    globeGroup.position.set(0, 0, 0); // Globe centered at origin

    // Tilt the globe for a dynamic 3D look
    globeGroup.rotation.x = 0.2;
    globeGroup.rotation.z = 0.1;
    scene.add(globeGroup);

    // 1. Wireframe Globe
    const globeGeo = new THREE.SphereGeometry(CONFIG.globeRadius, 40, 30);
    const globeMat = new THREE.MeshBasicMaterial({
        color: 0xf0eee6,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);
}

// ─── Capability Discovery Nodes (Static Overlay) ───
function buildCapabilityNodes() {
    const container = document.getElementById('capability-nodes');
    if (!container) return;

    container.innerHTML = '';

    GLOBE_HOTSPOTS.forEach((cap, i) => {
        const node = document.createElement('div');
        node.className = 'cap-node';
        node.dataset.index = i;

        node.innerHTML = `
            <div class="cap-node-line"></div>
            <div class="cap-node-content" style="background:transparent; padding:0;">
                <span class="cap-node-label" style="font-size:0.85rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#f0eee6; white-space:nowrap;">${cap.title}</span>
                <div style="font-size:0.75rem; color:#f0eee6; opacity:0.7; margin-top:0.4rem; max-width:200px; line-height:1.4; white-space:normal;">${cap.desc}</div>
            </div>
            <div class="cap-node-glow"></div>
        `;

        container.appendChild(node);
    });

    updateNodePositions();

    // Start mobile random reveal interval
    startMobileRandomReveal();
}

// ─── Responsive Node Positioning ───
function updateNodePositions() {
    const nodes = document.querySelectorAll('.cap-node');
    if (!nodes.length) return;

    // Update Globe Radius dynamically
    CONFIG.globeRadius = window.innerWidth <= 768 ? 3.0 : 4.5;

    const totalNodes = GLOBE_HOTSPOTS.length;

    nodes.forEach((node, i) => {
        let cx, cy;

        if (isMobile) {
            // For mobile, distribute evenly around a larger radius so they don't cover the small globe
            const mobileRad = (i * (360 / totalNodes) * Math.PI) / 180;
            const radius = 38;
            cx = 50 + Math.cos(mobileRad) * radius;
            cy = 50 + Math.sin(mobileRad) * (radius * 0.9);
            // Keep clamping so it doesn't go off-screen
            cx = Math.max(10, Math.min(90, cx));
            cy = Math.max(12, Math.min(88, cy));

            node.style.left = `${cx}%`;
            node.style.top = `${cy}%`;
            node.style.transform = 'translate(-50%, -50%)';
            node.style.alignItems = 'center';
            node.style.textAlign = 'center';

            // Reset opacity and revealed class for mobile handling
            node.style.opacity = '';
        } else {
            // Desktop: distribute symmetrically on left and right sides to perfectly avoid the center globe
            const half = Math.ceil(totalNodes / 2);
            const isLeft = i < half;

            const sideCount = isLeft ? half : (totalNodes - half);
            const sideIndex = isLeft ? i : (i - half);

            if (sideCount === 1) {
                cy = 50;
                cx = isLeft ? 15 : 85;
            } else {
                const startY = 20;
                const endY = 80;
                cy = startY + (sideIndex / (sideCount - 1)) * (endY - startY);

                // Arc offset: push text further outwards near the center of the screen
                const normalizedY = (cy - 50) / 30; // ranges from -1 to 1
                const arcOffset = (1 - (normalizedY * normalizedY)) * 8; // max bulge 8%

                cx = isLeft ? (18 - arcOffset) : (82 + arcOffset);
            }

            node.style.left = `${cx}%`;
            node.style.top = `${cy}%`;

            // Critical alignment: ensure text expands away from the globe
            if (isLeft) {
                node.style.transform = 'translate(-100%, -50%)';
                node.style.alignItems = 'flex-end';
                node.style.textAlign = 'right';
            } else {
                node.style.transform = 'translate(0, -50%)';
                node.style.alignItems = 'flex-start';
                node.style.textAlign = 'left';
            }

            // Remove mobile-specific reveals
            node.classList.remove('revealed');
        }
    });
}

// ─── Mobile Random Auto-Inspection ───
let mobileRevealTimer = null;
function startMobileRandomReveal() {
    if (mobileRevealTimer) clearInterval(mobileRevealTimer);

    // Pick an initial random node immediately
    const nodes = document.querySelectorAll('.cap-node');
    if (!nodes.length) return;

    let currentIndex = Math.floor(Math.random() * nodes.length);
    nodes[currentIndex].classList.add('revealed');

    // Change every 3 seconds
    mobileRevealTimer = setInterval(() => {
        if (!isMobile) return;
        if (scrollProgress > 0.3) return; // Don't highlight if scrolled past hero

        // Hide all
        nodes.forEach(n => n.classList.remove('revealed'));

        // Pick next random (guaranteed different)
        let nextIndex = Math.floor(Math.random() * nodes.length);
        if (nextIndex === currentIndex) {
            nextIndex = (nextIndex + 1) % nodes.length;
        }
        currentIndex = nextIndex;

        nodes[currentIndex].classList.add('revealed');
    }, 3000);
}

function updateCapabilityNodesDesktop() {
    const nodes = document.querySelectorAll('.cap-node');
    if (!nodes.length) return;

    const spotX = (mouseNorm.x + 1) / 2;
    const spotY = (-mouseNorm.y + 1) / 2;

    nodes.forEach((node, i) => {
        // Find center mathematically regardless of alignment offsets
        let nodeX, nodeY;

        const totalNodes = GLOBE_HOTSPOTS.length;
        const half = Math.ceil(totalNodes / 2);
        const isLeft = i < half;

        // Parse percentages from style string directly
        const startX = parseFloat(node.style.left) / 100;
        const startY = parseFloat(node.style.top) / 100;

        nodeX = startX;
        nodeY = startY;

        const dist = Math.sqrt((spotX - nodeX) ** 2 + (spotY - nodeY) ** 2);

        // Original logic used 0.22 distance for reveal
        if (dist < 0.25 && scrollProgress < 0.4) {
            node.classList.add('revealed');
            node.style.pointerEvents = 'auto'; // allow text selection if hovered
        } else {
            node.classList.remove('revealed');
            node.style.pointerEvents = 'none';
        }
    });
}

// Tooltip functions removed per design update



// Mobile auto-highlight removed as labels are now always visible

// (Legacy mobile auto-inspection functions removed — replaced by startMobileServiceCycle)

// ─── Desktop: proximity-based reveal ───

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
    if (isMobile) {
        mobileBreathTime += 16;
        breathGlow = 0.12 * (0.5 + 0.5 * Math.sin(mobileBreathTime * 2 * Math.PI / CONFIG.mobileIdleBreath));
    }

    // Minimalistic constant glow for the central text
    const titleBright = Math.min(1, 0.85 + proximity * 0.15 + scrollProgress * 0.5 + breathGlow);
    titleEl.style.opacity = titleBright;
    titleEl.style.textShadow = `0 0 ${15 + (proximity + breathGlow) * 15}px rgba(240,238,230,${0.2 + (proximity + breathGlow) * 0.2})`;

    const lightAngle = Math.atan2(spotY, spotX) * (180 / Math.PI);
    titleEl.style.setProperty('--light-angle', `${135 + lightAngle * 0.3}deg`);

    // Mobile: intensify glow when node is active
    if (subEl) subEl.style.opacity = Math.min(1, 0.7 + proximity * 0.3 + scrollProgress * 0.5);
    if (trustEl) trustEl.style.opacity = Math.min(1, 0.4 + proximity * 0.3 + scrollProgress * 0.5);

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

    // Rotate Globe: auto-rotate when idle, pause when user drags
    if (globeGroup) {
        if (!isUserInteracting) {
            const now = performance.now();
            const timeSinceInteraction = now - lastInteractionTime;

            if (timeSinceInteraction > CONFIG.idleResumeDelay) {
                // Ease back to full auto-rotation
                const resumeFactor = Math.min(1, (timeSinceInteraction - CONFIG.idleResumeDelay) / 2000);
                autoRotationEnabled = true;
                currentRotationSpeed = THREE.MathUtils.lerp(0, CONFIG.rotationSpeed, resumeFactor);
            }

            // Apply inertia from drag
            if (Math.abs(dragVelocityX) > 0.0001) {
                globeGroup.rotation.y += dragVelocityX;
                dragVelocityX *= 0.95; // Damping
            }
            if (Math.abs(dragVelocityY) > 0.0001) {
                globeGroup.rotation.x += dragVelocityY;
                globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x));
                dragVelocityY *= 0.95;
            }

            if (autoRotationEnabled && globeGroup) {
                globeGroup.rotation.y += currentRotationSpeed / 60;
            }
        }
    }

    // handleRaycasting(); // Removed as per instruction
    updateScrollTransition();
    updateDustParticles();
    updateTextIllumination();
    if (!isMobile) {
        updateCapabilityNodesDesktop();
    }

    renderer.render(scene, camera);
}

// ─── Cleanup ───
export function destroySpotlightEngine() {
    if (rafId) cancelAnimationFrame(rafId);
    if (mobileCycleTimer) clearInterval(mobileCycleTimer);
    if (mobileRevealTimer) clearInterval(mobileRevealTimer);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (canvas) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointerleave', onPointerUp);
    }
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
