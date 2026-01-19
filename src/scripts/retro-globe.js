/**
 * STASIC - Retro Globe Terminal
 * Three.js Wireframe Globe with Platform Markers & Connection Lines
 */

// =====================================================
// GLOBAL VARIABLES
// =====================================================

let scene, camera, renderer, globe;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let baseRotationY = 0; // Base rotation from scroll
let mouseX = 0;
let mouseY = 0;
let connectionLines = [];
let platformMarkers = [];
let releaseMarkers = [];
let activeSection = 0;
let isHovering = false; // Track if hovering over a location
let animationId = null; // Track animation frame for cleanup
let isAnimating = true; // Control animation loop

// Audio visualizer variables
let audioContext = null;
let analyser = null;
let dataArray = null;
let isAudioInitialized = false;
let globeLines = []; // Store globe wireframe lines for audio reactivity

// Platform data with positions on globe (lat, lon)
const platforms = [
    { name: 'spotify', lat: 59.33, lon: 18.07, color: 0x1DB954, url: 'https://open.spotify.com/album/2Jpbic6qg16rnjkEhLxJP2' },
    { name: 'bandcamp', lat: 37.77, lon: -122.42, color: 0x1DA0C3, url: 'https://stasic.bandcamp.com/' },
    { name: 'apple', lat: 37.33, lon: -122.03, color: 0xFC3C44, url: 'https://music.apple.com/de/artist/stasic/1650234910' },
    { name: 'soundcloud', lat: 52.52, lon: 13.40, color: 0xFF5500, url: 'https://soundcloud.com/stayrealsick' },
    { name: 'instagram', lat: 37.45, lon: -122.16, color: 0xE1306C, url: 'https://www.instagram.com/stayrealsick/' }
];

// Release data with positions spread across globe
const releases = [
    { name: 'dystopian-non-fiction', label: 'DYSTOPIAN NON-FICTION', type: 'ALBUM', year: '2025', lat: 52.52, lon: 13.40, color: 0x00ff41 },  // Berlin
    { name: 'technoir', label: 'TECHNOIR', type: 'EP', year: '2025', lat: 35.68, lon: 139.69, color: 0x00ff41 },  // Tokyo
    { name: 'business', label: 'BUSINESS', type: 'SINGLE', year: '2025', lat: 40.71, lon: -74.01, color: 0x00ff41 },  // New York
    { name: 'new-beginning', label: 'NEW BEGINNING', type: 'SINGLE', year: '2025', lat: -33.87, lon: 151.21, color: 0x00ff41 },  // Sydney
    { name: 'these-days', label: 'THESE DAYS', type: 'EP', year: '2022', lat: 51.51, lon: -0.13, color: 0x00ff41 }  // London
];

// =====================================================
// GLOBE INITIALIZATION
// =====================================================

function initGlobe() {
    const container = document.getElementById('globe');
    if (!container) return;

    // Scene
    scene = new THREE.Scene();

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.z = 2.8;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: container,
        alpha: true,
        antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create Globe
    createGlobe();

    // Add platform markers
    createPlatformMarkers();

    // Add release markers
    createReleaseMarkers();

    // Start Animation
    animate();

    // Handle Resize
    window.addEventListener('resize', onWindowResize);
}

function createGlobe() {
    // Create globe group
    globe = new THREE.Group();
    scene.add(globe);

    // Clear globe lines array
    globeLines = [];

    // Latitude circles (horizontal)
    const latitudeCount = 12;
    for (let i = 0; i <= latitudeCount; i++) {
        const lat = (i / latitudeCount) * Math.PI - Math.PI / 2;
        const radius = Math.cos(lat);
        const y = Math.sin(lat);

        if (radius > 0.01) {
            const geometry = new THREE.BufferGeometry();
            const points = [];
            const segments = 64;

            for (let j = 0; j <= segments; j++) {
                const lon = (j / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    radius * Math.cos(lon),
                    y,
                    radius * Math.sin(lon)
                ));
            }

            geometry.setFromPoints(points);
            const baseOpacity = i === latitudeCount / 2 ? 1.0 : 0.7;
            const material = new THREE.LineBasicMaterial({
                color: 0x00ff41,
                transparent: true,
                opacity: baseOpacity,
                linewidth: 3
            });

            const line = new THREE.Line(geometry, material);
            line.userData = { baseOpacity: baseOpacity, type: 'latitude', index: i };
            globe.add(line);
            globeLines.push(line);
        }
    }

    // Longitude lines (vertical/meridians)
    const longitudeCount = 24;
    for (let i = 0; i < longitudeCount; i++) {
        const lon = (i / longitudeCount) * Math.PI * 2;

        const geometry = new THREE.BufferGeometry();
        const points = [];
        const segments = 64;

        for (let j = 0; j <= segments; j++) {
            const lat = (j / segments) * Math.PI - Math.PI / 2;
            points.push(new THREE.Vector3(
                Math.cos(lat) * Math.cos(lon),
                Math.sin(lat),
                Math.cos(lat) * Math.sin(lon)
            ));
        }

        geometry.setFromPoints(points);
        const baseOpacity = (i % 6 === 0) ? 0.9 : 0.6;
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff41,
            transparent: true,
            opacity: baseOpacity,
            linewidth: 3
        });

        const line = new THREE.Line(geometry, material);
        line.userData = { baseOpacity: baseOpacity, type: 'longitude', index: i };
        globe.add(line);
        globeLines.push(line);
    }

    // Add outer glow ring
    const glowGeometry = new THREE.RingGeometry(1.02, 1.08, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });
    const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
    globe.add(glowRing);

    // Add scanning line 1 (horizontal orbit)
    const scanGeometry = new THREE.BufferGeometry();
    const scanPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        scanPoints.push(new THREE.Vector3(Math.cos(angle) * 1.01, 0, Math.sin(angle) * 1.01));
    }
    scanGeometry.setFromPoints(scanPoints);
    const scanMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.8
    });
    const scanLine = new THREE.Line(scanGeometry, scanMaterial);
    scanLine.name = 'scanLine';
    globe.add(scanLine);

    // Add scanning line 2 (vertical orbit - different axis)
    const scanGeometry2 = new THREE.BufferGeometry();
    const scanPoints2 = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        scanPoints2.push(new THREE.Vector3(Math.cos(angle) * 1.01, Math.sin(angle) * 1.01, 0));
    }
    scanGeometry2.setFromPoints(scanPoints2);
    const scanMaterial2 = new THREE.LineBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.5
    });
    const scanLine2 = new THREE.Line(scanGeometry2, scanMaterial2);
    scanLine2.name = 'scanLine2';
    globe.add(scanLine2);

    // Add scanning line 3 (diagonal orbit)
    const scanGeometry3 = new THREE.BufferGeometry();
    const scanPoints3 = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * 1.01;
        const y = Math.sin(angle) * 0.7 * 1.01;
        const z = Math.sin(angle) * 0.7 * 1.01;
        scanPoints3.push(new THREE.Vector3(x, y, z));
    }
    scanGeometry3.setFromPoints(scanPoints3);
    const scanMaterial3 = new THREE.LineBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.3
    });
    const scanLine3 = new THREE.Line(scanGeometry3, scanMaterial3);
    scanLine3.name = 'scanLine3';
    globe.add(scanLine3);
}

// =====================================================
// PLATFORM MARKERS
// =====================================================

function createPlatformMarkers() {
    // No 3D markers - only store positions for HTML labels
    platforms.forEach((platform, index) => {
        // Convert lat/lon to 3D position
        const phi = (90 - platform.lat) * (Math.PI / 180);
        const theta = (platform.lon + 180) * (Math.PI / 180);

        const x = -Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        // Create invisible anchor point on globe
        const anchorGroup = new THREE.Group();
        anchorGroup.userData = { platform: platform.name, index: index };
        anchorGroup.position.set(x * 1.01, y * 1.01, z * 1.01);

        globe.add(anchorGroup);
        platformMarkers.push({
            group: anchorGroup,
            basePosition: new THREE.Vector3(x, y, z),
            platform: platform
        });
    });
}

// =====================================================
// RELEASE MARKERS
// =====================================================

function createReleaseMarkers() {
    // No 3D markers - only store positions for HTML labels
    releases.forEach((release, index) => {
        // Convert lat/lon to 3D position
        const phi = (90 - release.lat) * (Math.PI / 180);
        const theta = (release.lon + 180) * (Math.PI / 180);

        const x = -Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        // Create invisible anchor point on globe
        const anchorGroup = new THREE.Group();
        anchorGroup.userData = { release: release.name, index: index };
        anchorGroup.position.set(x * 1.02, y * 1.02, z * 1.02);

        globe.add(anchorGroup);
        releaseMarkers.push({
            group: anchorGroup,
            basePosition: new THREE.Vector3(x, y, z),
            release: release
        });
    });
}

// =====================================================
// AUDIO-REACTIVE GLOBE LINES
// =====================================================

function updateGlobeAudioReactivity() {
    if (!globeLines.length) return;

    if (analyser && dataArray) {
        // Get frequency data
        analyser.getByteFrequencyData(dataArray);

        // Calculate average bass only - extremely subtle pulse
        const bass = getFrequencyRange(0, 10);
        const bassIntensity = (bass / 255) * 0.05; // Barely noticeable

        globeLines.forEach((line, index) => {
            const baseOpacity = line.userData.baseOpacity;
            const depthFactor = line.userData.depthFactor || 1;

            // Subtle opacity boost on bass - no scaling, no color shift
            line.material.opacity = Math.min(1, (baseOpacity + bassIntensity) * depthFactor);
            line.material.color.setHex(0x00ff41);
            line.scale.set(1, 1, 1);
        });
    } else {
        // Reset to base opacity when no audio
        globeLines.forEach(line => {
            line.material.color.setHex(0x00ff41);
            line.scale.set(1, 1, 1);
        });
    }
}

function getFrequencyRange(start, end) {
    if (!dataArray) return 0;
    let sum = 0;
    for (let i = start; i < end && i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    return sum / (end - start);
}

// =====================================================
// DEPTH-BASED GLOBE RENDERING (3D Effect)
// =====================================================

function updateGlobeDepth() {
    if (!globeLines.length || !globe) return;

    // Get camera direction for depth calculation
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    globeLines.forEach(line => {
        // Get the center point of the line in world space
        const geometry = line.geometry;
        const positions = geometry.attributes.position;

        // Sample a point from the middle of the line
        const midIndex = Math.floor(positions.count / 2);
        const localPoint = new THREE.Vector3(
            positions.getX(midIndex),
            positions.getY(midIndex),
            positions.getZ(midIndex)
        );

        // Transform to world space
        const worldPoint = localPoint.clone();
        line.localToWorld(worldPoint);

        // Calculate direction from camera to point
        const pointDirection = worldPoint.clone().sub(camera.position).normalize();

        // Dot product tells us if point faces camera (positive = facing away)
        const dot = pointDirection.dot(cameraDirection);

        // Map dot product to depth factor
        // dot near -1 = directly facing camera (bright)
        // dot near 1 = facing away (dim)
        const depthFactor = Math.max(0.15, 1 - (dot + 1) * 0.5);

        // Store depth factor for audio reactivity to use
        line.userData.depthFactor = depthFactor;

        // Apply depth to base opacity (only when no audio)
        if (!analyser || !dataArray) {
            line.material.opacity = line.userData.baseOpacity * depthFactor;
        }
    });
}

// Update release labels (HTML overlay)
function updateReleaseLabels() {
    const container = document.getElementById('globe');
    const labelsContainer = document.getElementById('releaseLabels');
    if (!container || !labelsContainer || !globe) return;

    const rect = container.getBoundingClientRect();

    releaseMarkers.forEach((marker, index) => {
        let label = document.getElementById(`release-label-${index}`);

        // Create label if doesn't exist
        if (!label) {
            label = document.createElement('div');
            label.id = `release-label-${index}`;
            label.className = 'release-label';
            label.innerHTML = `
                <span class="release-label-type">[${marker.release.type}]</span>
                <span class="release-label-name">> ${marker.release.label}</span>
            `;
            label.dataset.release = marker.release.name;
            labelsContainer.appendChild(label);
        }

        // Get world position of marker
        const worldPos = new THREE.Vector3();
        marker.group.getWorldPosition(worldPos);

        // Project to screen coordinates
        const screenPos = worldPos.clone().project(camera);

        // Convert to pixel coordinates
        const x = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-screenPos.y * 0.5 + 0.5) * rect.height + rect.top;

        // Check if marker is on front side of globe (visible)
        const cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        const markerDir = worldPos.clone().normalize();
        const dotProduct = cameraDir.dot(markerDir);

        const isHovered = hoveredRelease === marker.release.name;
        const isVisible = dotProduct < 0.2;

        if (isHovered || (isVisible && activeSection === 1)) {
            // Show if hovered or visible and on releases section
            label.style.opacity = isHovered ? '1' : '0.6';
            label.style.left = (x + 15) + 'px';
            label.style.top = (y - 10) + 'px';

            // Highlight when hovered
            if (isHovered) {
                label.classList.add('highlighted');
            } else {
                label.classList.remove('highlighted');
            }
        } else {
            label.style.opacity = '0';
            label.classList.remove('highlighted');
        }
    });
}

// Update platform labels (HTML overlay)
function updatePlatformLabels() {
    const container = document.getElementById('globe');
    const labelsContainer = document.getElementById('releaseLabels');
    if (!container || !labelsContainer || !globe) return;

    const rect = container.getBoundingClientRect();

    platformMarkers.forEach((marker, index) => {
        let label = document.getElementById(`platform-label-${index}`);

        // Create label if doesn't exist
        if (!label) {
            label = document.createElement('div');
            label.id = `platform-label-${index}`;
            label.className = 'platform-label';
            label.innerHTML = `<span class="platform-label-name">> ${marker.platform.name.toUpperCase()}</span>`;
            label.dataset.platform = marker.platform.name;
            labelsContainer.appendChild(label);
        }

        // Get world position of marker
        const worldPos = new THREE.Vector3();
        marker.group.getWorldPosition(worldPos);

        // Project to screen coordinates
        const screenPos = worldPos.clone().project(camera);

        // Convert to pixel coordinates
        const x = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-screenPos.y * 0.5 + 0.5) * rect.height + rect.top;

        // Check if marker is on front side of globe (visible)
        const cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        const markerDir = worldPos.clone().normalize();
        const dotProduct = cameraDir.dot(markerDir);

        const isHovered = hoveredPlatform === marker.platform.name;
        const isVisible = dotProduct < 0.2;

        if (isHovered || (isVisible && activeSection === 3)) {
            // Show if hovered or visible and on Connect section
            label.style.opacity = isHovered ? '1' : '0.6';
            label.style.left = (x + 15) + 'px';
            label.style.top = (y - 10) + 'px';

            // Highlight when hovered
            if (isHovered) {
                label.classList.add('highlighted');
            } else {
                label.classList.remove('highlighted');
            }
        } else {
            label.style.opacity = '0';
            label.classList.remove('highlighted');
        }
    });
}

// =====================================================
// CONNECTION LINES (2D SVG Overlay) - Only on Hover
// =====================================================

let hoveredPlatform = null;
let hoveredRelease = null;

function drawConnectionLine(platformName) {
    const svg = document.getElementById('connectionLines');
    if (!svg || !globe) return;

    // Clear existing lines
    svg.innerHTML = '';

    if (!platformName) return;

    const marker = platformMarkers.find(m => m.platform.name === platformName);
    if (!marker) return;

    // Get the canvas element and its bounding rect
    const canvas = document.getElementById('globe');
    const canvasRect = canvas.getBoundingClientRect();

    // Get world position of marker
    const worldPos = new THREE.Vector3();
    marker.group.getWorldPosition(worldPos);

    // Project to normalized device coordinates (-1 to 1)
    const screenPos = worldPos.clone().project(camera);

    // Convert to screen pixel coordinates (relative to viewport)
    const markerX = (screenPos.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
    const markerY = (-screenPos.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top;

    // Get corresponding link element in the content panel
    const linkElement = document.querySelector(`.link-item[data-platform="${platformName}"]`);
    if (!linkElement) return;

    const linkRect = linkElement.getBoundingClientRect();
    // Connect to the left edge of the link, vertically centered
    const linkX = linkRect.left;
    const linkY = linkRect.top + linkRect.height / 2;

    const color = '#00ff41';

    // Create glow filter (subtle)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    `;
    svg.appendChild(defs);

    // Create straight line from globe marker to panel link
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', markerX);
    line.setAttribute('y1', markerY);
    line.setAttribute('x2', linkX);
    line.setAttribute('y2', linkY);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('filter', 'url(#glow)');
    line.classList.add('connection-line');
    svg.appendChild(line);

    // Small endpoint circle on globe
    const circleGlobe = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleGlobe.setAttribute('cx', markerX);
    circleGlobe.setAttribute('cy', markerY);
    circleGlobe.setAttribute('r', '3');
    circleGlobe.setAttribute('fill', color);
    circleGlobe.setAttribute('filter', 'url(#glow)');
    svg.appendChild(circleGlobe);

    // Small endpoint circle on panel
    const circlePanel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circlePanel.setAttribute('cx', linkX);
    circlePanel.setAttribute('cy', linkY);
    circlePanel.setAttribute('r', '2');
    circlePanel.setAttribute('fill', color);
    circlePanel.setAttribute('filter', 'url(#glow)');
    svg.appendChild(circlePanel);
}

function updateConnectionLines() {
    // Redraw connection lines while hovering (globe is rotating)
    if (hoveredPlatform) {
        drawConnectionLine(hoveredPlatform);
    } else if (hoveredRelease) {
        drawReleaseConnectionLine(hoveredRelease);
    }
}

// =====================================================
// GLOBE ROTATION TO LOCATION
// =====================================================

function rotateGlobeToLocation(lat, lon) {
    isHovering = true;

    // Convert lat/lon to rotation angles
    // We need to rotate the globe so this point faces the camera
    // Longitude controls Y rotation, Latitude controls X rotation
    const targetLon = -(lon * Math.PI / 180) - Math.PI / 2;
    const targetLat = lat * Math.PI / 180;

    targetRotationY = targetLon;
    targetRotationX = targetLat * 0.5; // Dampen latitude effect
}

function resetGlobeRotation() {
    isHovering = false;
    // Rotation will smoothly return to scroll-based rotation
}

// =====================================================
// ANIMATION
// =====================================================

function animate() {
    if (!isAnimating) return;

    animationId = requestAnimationFrame(animate);

    // Smooth rotation interpolation (slower lerp = smoother)
    currentRotationX += (targetRotationX - currentRotationX) * 0.03;
    currentRotationY += (targetRotationY - currentRotationY) * 0.03;

    // Apply rotation to globe
    if (globe) {
        globe.rotation.x = currentRotationX;
        globe.rotation.y = currentRotationY;

        // Add subtle continuous rotation (very slow)
        baseRotationY += 0.00008;
        targetRotationY = baseRotationY;
        targetRotationX = 0.1;
    }

    // Animate scan line 1 (wobbling horizontal) - slower
    const scanLine = globe?.getObjectByName('scanLine');
    if (scanLine) {
        scanLine.rotation.x = Math.sin(Date.now() * 0.0002) * 0.3;
        scanLine.rotation.z = Date.now() * 0.00008;
    }

    // Animate scan line 2 (rotating vertical) - slower
    const scanLine2 = globe?.getObjectByName('scanLine2');
    if (scanLine2) {
        scanLine2.rotation.y = Date.now() * 0.00012;
        scanLine2.rotation.z = Math.sin(Date.now() * 0.0003) * 0.2;
    }

    // Animate scan line 3 (diagonal spin) - slower
    const scanLine3 = globe?.getObjectByName('scanLine3');
    if (scanLine3) {
        scanLine3.rotation.x = Date.now() * 0.0001;
        scanLine3.rotation.y = Date.now() * 0.00005;
    }


    // Update audio-reactive globe
    updateGlobeAudioReactivity();

    // Update depth-based line opacity for 3D effect
    updateGlobeDepth();

    // Update labels
    updateReleaseLabels();
    updatePlatformLabels();

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('globe');
    if (!container) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// =====================================================
// MEMORY MANAGEMENT & VISIBILITY
// =====================================================

/**
 * Dispose Three.js resources to prevent memory leaks
 */
function disposeGlobe() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (globe) {
        // Dispose all children
        globe.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        scene.remove(globe);
        globe = null;
    }

    // Clear arrays
    globeLines = [];
    platformMarkers = [];
    releaseMarkers = [];

    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer = null;
    }

    scene = null;
    camera = null;
}

/**
 * Pause animation when tab is hidden (saves CPU/GPU)
 */
function initVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Tab is hidden - pause animation
            isAnimating = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            // Tab is visible - resume animation
            isAnimating = true;
            if (renderer && !animationId) {
                animate();
            }
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        disposeGlobe();
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }
    });
}

// =====================================================
// SCROLL HANDLING
// =====================================================

function initScrollHandler() {
    const content = document.getElementById('content');
    const progressFill = document.getElementById('progressFill');
    const sections = document.querySelectorAll('.section');
    const progressItems = document.querySelectorAll('.progress-sections span');

    if (!content) return;

    content.addEventListener('scroll', () => {
        const scrollTop = content.scrollTop;
        const scrollHeight = content.scrollHeight - content.clientHeight;
        const scrollPercent = scrollTop / scrollHeight;

        // Update globe rotation based on scroll (only when not hovering)
        if (!isHovering) {
            baseRotationY = scrollPercent * Math.PI * 4; // 2 full rotations
        }

        // Update progress bar
        if (progressFill) {
            progressFill.style.height = (scrollPercent * 100) + '%';
        }

        // Update active section
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const containerRect = content.getBoundingClientRect();

            if (rect.top < containerRect.height / 2 && rect.bottom > containerRect.height / 2) {
                sections.forEach(s => s.classList.remove('active'));
                section.classList.add('active');
                activeSection = index;

                progressItems.forEach(item => item.classList.remove('active'));
                if (progressItems[index]) {
                    progressItems[index].classList.add('active');
                }

                // Highlight markers when on Connect section
                updateMarkerVisibility();
            }
        });
    });

    // Click on progress items to navigate
    progressItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetIndex = item.dataset.target;
            const targetSection = document.querySelector(`[data-section="${targetIndex}"]`);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function updateMarkerVisibility() {
    platformMarkers.forEach(marker => {
        const ring = marker.group.getObjectByName('ring');
        const children = marker.group.children;

        children.forEach(child => {
            if (activeSection === 4) {
                // On Connect section - show markers prominently
                child.material.opacity = child.name === 'ring' ? 0.8 : 1;
            } else {
                // Other sections - dim markers
                child.material.opacity = child.name === 'ring' ? 0.2 : 0.3;
            }
        });
    });
}

// =====================================================
// MOUSE PARALLAX
// =====================================================

function initMouseParallax() {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);

        // Subtle camera movement
        if (camera) {
            camera.position.x = mouseX * 0.0002;
            camera.position.y = -mouseY * 0.0002;
            camera.lookAt(scene.position);
        }
    });
}

// =====================================================
// PLATFORM LINK HOVER EFFECTS
// =====================================================

function initPlatformHover() {
    // Platform hover no longer rotates globe or draws lines
    // Globe now rotates continuously on scroll
}

// =====================================================
// RELEASE HOVER EFFECTS
// =====================================================

function initReleaseHover() {
    // Release hover no longer rotates globe or draws lines
    // Globe now rotates continuously on scroll
}

// Draw connection line to release marker
function drawReleaseConnectionLine(releaseName) {
    const svg = document.getElementById('connectionLines');
    if (!svg || !globe) return;

    svg.innerHTML = '';

    const marker = releaseMarkers.find(m => m.release.name === releaseName);
    if (!marker) return;

    // Get the canvas element and its bounding rect
    const canvas = document.getElementById('globe');
    const canvasRect = canvas.getBoundingClientRect();

    // Get world position of marker
    const worldPos = new THREE.Vector3();
    marker.group.getWorldPosition(worldPos);

    // Project to normalized device coordinates (-1 to 1)
    const screenPos = worldPos.clone().project(camera);

    // Convert to screen pixel coordinates (relative to viewport)
    const markerX = (screenPos.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
    const markerY = (-screenPos.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top;

    // Get corresponding release element in the content panel
    const releaseElement = document.querySelector(`.release-card[data-release="${releaseName}"]`);
    if (!releaseElement) return;

    const releaseRect = releaseElement.getBoundingClientRect();
    // Connect to the left edge of the release item, vertically centered
    const releaseX = releaseRect.left;
    const releaseY = releaseRect.top + releaseRect.height / 2;

    const color = '#00ff41';

    // Create glow filter (subtle)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    `;
    svg.appendChild(defs);

    // Create straight line from globe marker to panel release
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', markerX);
    line.setAttribute('y1', markerY);
    line.setAttribute('x2', releaseX);
    line.setAttribute('y2', releaseY);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('filter', 'url(#glow)');
    line.classList.add('connection-line');
    svg.appendChild(line);

    // Small endpoint circle on globe
    const circleGlobe = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleGlobe.setAttribute('cx', markerX);
    circleGlobe.setAttribute('cy', markerY);
    circleGlobe.setAttribute('r', '3');
    circleGlobe.setAttribute('fill', color);
    circleGlobe.setAttribute('filter', 'url(#glow)');
    svg.appendChild(circleGlobe);

    // Small endpoint circle on panel
    const circlePanel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circlePanel.setAttribute('cx', releaseX);
    circlePanel.setAttribute('cy', releaseY);
    circlePanel.setAttribute('r', '2');
    circlePanel.setAttribute('fill', color);
    circlePanel.setAttribute('filter', 'url(#glow)');
    svg.appendChild(circlePanel);
}

// =====================================================
// CRT EFFECTS
// =====================================================

function initCRTEffects() {
    // Random screen glitch
    setInterval(() => {
        if (Math.random() > 0.97) {
            const flicker = document.querySelector('.flicker');
            if (flicker) {
                flicker.style.opacity = '0.1';
                setTimeout(() => {
                    flicker.style.opacity = '0.03';
                }, 50);
            }
        }
    }, 100);

    // Random horizontal shift glitch
    setInterval(() => {
        if (Math.random() > 0.98) {
            const panel = document.querySelector('.content-panel');
            if (panel) {
                panel.style.transform = `translateX(${Math.random() * 4 - 2}px)`;
                setTimeout(() => {
                    panel.style.transform = 'translateX(0)';
                }, 50);
            }
        }
    }, 200);
}

// =====================================================
// SIGNAL METER ANIMATION
// =====================================================

function initSignalMeter() {
    const bars = document.querySelectorAll('.meter-bar');

    setInterval(() => {
        bars.forEach(bar => {
            const randomHeight = 4 + Math.random() * 12;
            bar.style.height = randomHeight + 'px';
        });
    }, 150);
}

// =====================================================
// TYPEWRITER EFFECT
// =====================================================

function initTypewriter() {
    const typewriters = document.querySelectorAll('.typewriter');

    typewriters.forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        el.style.width = 'auto';
        el.style.borderRight = '2px solid var(--green)';

        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 50);
    });
}

// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Show preloader, then init site
    initPreloader(() => {
        initGlobe();
        initVisibilityHandler(); // Memory management
        initScrollHandler();
        initMouseParallax();
        initPlatformHover();
        initReleaseHover();
        initCRTEffects();
        initSignalMeter();
        initDetailPanel();
        initKeyboardNav();

        // Delay typewriter for effect
        setTimeout(initTypewriter, 500);

        // Set first section as active
        const firstSection = document.querySelector('.section');
        if (firstSection) {
            firstSection.classList.add('active');
        }

        console.log('%c STASIC TERMINAL v2.5 ', 'background: #00ff41; color: #0a0a0a; font-family: monospace;');
        console.log('%c Connection established... ', 'color: #00ff41; font-family: monospace;');

        // Initialize audio player
        initAudioPlayer();

        // Initialize visitor counter
        initVisitorCounter();

        // Initialize newsletter form
        initNewsletter();
    });
});

// =====================================================
// PRELOADER
// =====================================================

function initPreloader(callback) {
    const preloader = document.getElementById('preloader');
    if (!preloader) {
        callback();
        return;
    }

    // Hide preloader after boot sequence completes
    setTimeout(() => {
        preloader.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
            preloader.remove();
        }, 500);
        callback();
    }, 4000);
}

// =====================================================
// KEYBOARD NAVIGATION
// =====================================================

function initKeyboardNav() {
    const content = document.getElementById('content');
    const sections = document.querySelectorAll('.section');
    const detailPanel = document.getElementById('detailPanel');

    document.addEventListener('keydown', (e) => {
        // ESC to close detail panel
        if (e.key === 'Escape') {
            if (detailPanel && detailPanel.classList.contains('active')) {
                closeDetailPanel();
            }
        }

        // Arrow keys to navigate sections
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            navigateSection(1);
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateSection(-1);
        }

        // Number keys 1-4 to jump to sections
        if (e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const targetIndex = parseInt(e.key) - 1;
            const targetSection = document.querySelector(`[data-section="${targetIndex}"]`);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // Space to toggle audio
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            const audioToggle = document.getElementById('audioToggle');
            if (audioToggle) audioToggle.click();
        }
    });
}

function navigateSection(direction) {
    const sections = document.querySelectorAll('.section');
    let currentIndex = activeSection;
    let newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < sections.length) {
        const targetSection = sections[newIndex];
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// =====================================================
// DETAIL PANEL (Release Click Interaction)
// =====================================================

function initDetailPanel() {
    const detailPanel = document.getElementById('detailPanel');
    const detailContent = document.getElementById('detailContent');
    const detailClose = document.getElementById('detailClose');
    const releaseCards = document.querySelectorAll('.release-card');
    const merchCards = document.querySelectorAll('.merch-card');

    if (!detailPanel || !detailContent || !detailClose) return;

    // Click on release card to open detail
    releaseCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDetailPanel(card);
        });

        // Keyboard support: Enter/Space to activate
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                openDetailPanel(card);
            }
        });
    });

    // Click on merch card to open detail
    merchCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMerchCardDetail(card, detailPanel, detailContent);
        });

        // Keyboard support: Enter/Space to activate
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                openMerchCardDetail(card, detailPanel, detailContent);
            }
        });
    });

    // Close button
    detailClose.addEventListener('click', () => {
        closeDetailPanel();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailPanel.classList.contains('active')) {
            closeDetailPanel();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (detailPanel.classList.contains('active') &&
            !detailPanel.contains(e.target) &&
            !e.target.closest('.release-card') &&
            !e.target.closest('.merch-card')) {
            closeDetailPanel();
        }
    });
}

function openDetailPanel(card) {
    const detailPanel = document.getElementById('detailPanel');
    const detailContent = document.getElementById('detailContent');
    const type = card.dataset.type;

    // Handle MERCH type differently
    if (type === 'MERCH') {
        openMerchDetailPanel(card, detailPanel, detailContent);
        return;
    }

    // Get data from card (for releases)
    const title = card.dataset.title;
    const year = card.dataset.year;
    const tracks = card.dataset.tracks;
    const duration = card.dataset.duration;
    const artwork = card.dataset.artwork;
    const links = JSON.parse(card.dataset.links || '[]');
    const tracklist = JSON.parse(card.dataset.tracklist || '[]');

    // Build tracklist HTML
    let tracklistHTML = '';
    tracklist.forEach(track => {
        tracklistHTML += `
            <div class="detail-track">
                <span class="detail-track-num">${track.num}</span>
                <span class="detail-track-title">${track.title}</span>
                <span class="detail-track-time">${track.time}</span>
            </div>
        `;
    });

    // Build streaming links HTML
    let linksHTML = '';
    links.forEach(link => {
        linksHTML += `<a href="${link.url}" target="_blank" rel="noopener" class="detail-stream-btn">[${link.name}]</a>`;
    });

    // Add SoundCloud link if not already present
    const hasSoundCloud = links.some(l => l.name === 'SOUNDCLOUD');
    if (!hasSoundCloud) {
        const scUrl = getSoundCloudEmbed(card.dataset.release);
        if (scUrl) {
            linksHTML += `<a href="${scUrl}" target="_blank" rel="noopener" class="detail-stream-btn">[SOUNDCLOUD]</a>`;
        }
    }

    // Build SoundCloud player
    const releaseName = card.dataset.release;
    const isPlaylist = type === 'ALBUM' || type === 'EP';
    const embedHTML = buildSoundCloudPlayer(releaseName, isPlaylist);

    // Build content
    detailContent.innerHTML = `
        <div class="detail-artwork">
            <img src="${artwork}" alt="${title}">
            <div class="artwork-scanline"></div>
        </div>
        <div class="detail-header">
            <div class="detail-type">[${type}]</div>
            <h2 class="detail-title">> ${title}</h2>
            <div class="detail-meta">${year} | ${tracks} TRACKS | ${duration}</div>
        </div>
        ${embedHTML}
        <div class="detail-tracklist">
            <div class="detail-tracklist-title">[TRACKLIST]</div>
            ${tracklistHTML}
        </div>
        <div class="detail-links">
            <div class="detail-links-title">[STREAM]</div>
            ${linksHTML}
        </div>
    `;

    // Open panel
    detailPanel.classList.add('active');

    // Rotate globe to release location (releaseName already defined above)
    const marker = releaseMarkers.find(m => m.release.name === releaseName);
    if (marker) {
        rotateGlobeToLocation(marker.release.lat, marker.release.lon);
    }
}

function closeDetailPanel() {
    const detailPanel = document.getElementById('detailPanel');
    detailPanel.classList.remove('active');
    detailPanel.classList.remove('merch-panel');
    resetGlobeRotation();
}

// =====================================================
// MERCH DETAIL PANEL
// =====================================================

function openMerchCardDetail(card, detailPanel, detailContent) {
    // Load merch.html in an iframe
    detailContent.innerHTML = `
        <iframe
            src="merch.html"
            class="merch-iframe"
            frameborder="0"
            title="STASIC Merch"
        ></iframe>
    `;

    // Add merch panel styling
    detailPanel.classList.add('merch-panel');

    // Open panel
    detailPanel.classList.add('active');

    // Rotate globe to Berlin (where merch is from)
    rotateGlobeToLocation(52.52, 13.40);
}

// Get SoundCloud embed URL for releases
function getSoundCloudEmbed(releaseName) {
    // SoundCloud track/playlist URLs for embedding
    const soundcloudUrls = {
        'dystopian-non-fiction': 'https://soundcloud.com/stayrealsick/sets/dystopian-non-fiction',
        'technoir': 'https://soundcloud.com/stayrealsick/sets/technoir',
        'business': 'https://soundcloud.com/stayrealsick/business',
        'new-beginning': 'https://soundcloud.com/stayrealsick/new-beginning',
        'these-days': 'https://soundcloud.com/stayrealsick/these-days'
    };
    return soundcloudUrls[releaseName] || null;
}

// Build SoundCloud player HTML
function buildSoundCloudPlayer(releaseName, isPlaylist = false) {
    const url = getSoundCloudEmbed(releaseName);
    if (!url) return '';

    const encodedUrl = encodeURIComponent(url);
    const height = isPlaylist ? '300' : '166';

    return `
        <div class="detail-player soundcloud-player">
            <div class="detail-player-title">[SOUNDCLOUD PLAYER]</div>
            <div class="player-wrapper">
                <iframe
                    width="100%"
                    height="${height}"
                    scrolling="no"
                    frameborder="no"
                    allow="autoplay"
                    loading="lazy"
                    src="https://w.soundcloud.com/player/?url=${encodedUrl}&color=%2300ff41&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false">
                </iframe>
            </div>
        </div>
    `;
}

// =====================================================
// AUDIO PLAYER
// =====================================================

function initAudioPlayer() {
    const audio = document.getElementById('bgMusic');
    const toggle = document.getElementById('audioToggle');
    const icon = toggle?.querySelector('.audio-icon');

    if (!audio || !toggle || !icon) return;

    // Set initial volume
    audio.volume = 0.5;

    toggle.addEventListener('click', async () => {
        if (audio.paused) {
            try {
                // Initialize audio context on first play (required by browsers)
                if (!isAudioInitialized) {
                    await initAudioAnalyser(audio);
                }

                await audio.play();
                toggle.classList.add('playing');
                icon.textContent = '♪ ON';
            } catch (err) {
                console.warn('Audio playback failed:', err);
                // Show user-friendly feedback
                icon.textContent = '♪ ERR';
                setTimeout(() => {
                    icon.textContent = '♪ OFF';
                }, 2000);
            }
        } else {
            audio.pause();
            toggle.classList.remove('playing');
            icon.textContent = '♪ OFF';
        }
    });
}

async function initAudioAnalyser(audio) {
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Resume audio context if suspended (required by Chrome autoplay policy)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        analyser = audioContext.createAnalyser();

        // Connect audio to analyser
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Configure analyser
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        isAudioInitialized = true;
    } catch (error) {
        console.warn('Audio analyser initialization failed:', error);
        // Still allow basic audio playback without visualization
        isAudioInitialized = true;
    }
}

// =====================================================
// VISITOR COUNTER
// =====================================================

function initVisitorCounter() {
    const counterElement = document.getElementById('visitorCount');
    if (!counterElement) return;

    // Simple localStorage-based counter
    const storageKey = 'stasic_visit_count';
    const lastVisitKey = 'stasic_last_visit';

    // Base count (simulated existing visitors)
    const baseCount = 847;

    // Get stored count or start from base
    let count = parseInt(localStorage.getItem(storageKey)) || baseCount;
    const lastVisit = localStorage.getItem(lastVisitKey);
    const now = Date.now();

    // Only increment if it's been more than 1 hour since last visit
    if (!lastVisit || (now - parseInt(lastVisit)) > 3600000) {
        count++;
        localStorage.setItem(storageKey, count);
        localStorage.setItem(lastVisitKey, now);
    }

    // Format number with leading zeros for retro look
    const formattedCount = count.toString().padStart(6, '0');
    animateCounter(counterElement, formattedCount);
}

function animateCounter(element, targetValue) {
    // Typewriter effect for the counter
    let index = 0;
    element.textContent = '';

    const interval = setInterval(() => {
        if (index < targetValue.length) {
            element.textContent += targetValue[index];
            index++;
        } else {
            clearInterval(interval);
        }
    }, 80);
}

// =====================================================
// NEWSLETTER SIGNUP
// =====================================================

function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');
    const statusDiv = document.getElementById('newsletterStatus');
    const submitBtn = form?.querySelector('.newsletter-submit');
    const submitText = submitBtn?.querySelector('.submit-text');
    const submitLoading = submitBtn?.querySelector('.submit-loading');

    if (!form || !emailInput || !statusDiv) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) return;

        // Show loading state
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
        statusDiv.textContent = '';
        statusDiv.className = 'newsletter-status';

        // Simulate newsletter signup (replace with actual service)
        // For now, store in localStorage as a placeholder
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store email locally (replace with actual API call)
            const subscribers = JSON.parse(localStorage.getItem('stasic_subscribers') || '[]');

            if (subscribers.includes(email)) {
                throw new Error('ALREADY_SUBSCRIBED');
            }

            subscribers.push(email);
            localStorage.setItem('stasic_subscribers', JSON.stringify(subscribers));

            // Success
            statusDiv.textContent = '> SUBSCRIPTION CONFIRMED. SIGNAL LOCKED.';
            statusDiv.className = 'newsletter-status success';
            emailInput.value = '';

        } catch (error) {
            if (error.message === 'ALREADY_SUBSCRIBED') {
                statusDiv.textContent = '> ERROR: SIGNAL ALREADY REGISTERED';
            } else {
                statusDiv.textContent = '> ERROR: TRANSMISSION FAILED. TRY AGAIN.';
            }
            statusDiv.className = 'newsletter-status error';
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    });
}
