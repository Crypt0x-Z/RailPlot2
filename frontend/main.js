const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scaleDisplay = document.getElementById('scaleDisplay');
const addLineBtn = document.getElementById('addLineBtn');
const addLineModal = document.getElementById('addLineModal');
const closeAddLineModalBtn = document.getElementById('closeAddLineModal');
const saveLineBtn = document.getElementById('saveLine');
const deleteLineBtn = document.getElementById('deleteLine');
const assignedTrainSelect = document.getElementById('assignedTrain');
const trainQuantityInput = document.getElementById('trainQuantity');
const maxTrainQuantitySpan = document.getElementById('maxTrainQuantity');
const createExpressServiceBtn = document.getElementById('createExpressServiceBtn');
const expressServiceModal = document.getElementById('expressServiceModal');
const closeExpressServiceModalBtn = document.querySelector('.express-service-modal-close');
const expressStationsList = document.getElementById('expressStationsList');
const createExpressLineBtn = document.getElementById('createExpressLineBtn');

// --- Touch Interaction State Variables ---
let isPanning = false;
let isPinching = false;
let lastTouchX = 0;
let lastTouchY = 0;
let initialPinchDistance = 0;
let pinchCenterX = 0;
let pinchCenterY = 0;
let lastTapTime = 0;
const doubleTapDelay = 300; // ms delay for double tap detection (optional)
// --- End Touch Interaction State Variables ---


const mouse = { x: 0, y: 0, button: false, wheel: 0, lastX: 0, lastY: 0, drag: false, downX: 0, downY: 0 };
const gridLimit = 64;
const gridSize = 128;
const scaleRate = 1.02;
const topLeft = { x: 0, y: 0 };
const lineOffsetAmount = 8; // Amount to offset overlapping lines

let stations = [];
let zoomDisabled = 0; // 0: none, 1: zoom in, -1: zoom out
let selectedStation = null;
let newStationWorldCoord = null;
let lines = [];
let hoveredLine = null;
let editingLineIndex = null; // To track which line is being edited

// Sample trains data with quantity
let trains = [
    { name: "Underground Express", type: "underground", quantity: 5 },
    { name: "Ground Commuter", type: "ground", quantity: 10 },
    { name: "Suspended Shuttle", type: "suspended", quantity: 3 },
    { name: "Another Underground", type: "underground", quantity: 7 },
    { name: "Fast Ground", type: "ground", quantity: 12 },
    { name: "Sky Train", type: "suspended", quantity: 4 },
    { name: "Deep Metro", type: "underground", quantity: 6 },
    { name: "Surface Runner", type: "ground", quantity: 8 }
];


const newItemInput = document.getElementById('new-item');
const addButton = document.getElementById('add-button');
const showModalButton = document.getElementById('show-modal-button');
const listModal = document.getElementById('list-modal');
const modalList = document.getElementById('modal-list');
const closeModalButton = document.getElementById('close-modal-button');
const plusButtonsContainer = document.getElementById('plus-buttons-container');
let selectedValues = new Set();
let recentlySelected = null;

// Get the modals and close buttons
const stationModal = document.getElementById("stationModal");
const lineModal = document.getElementById("addLineModal"); // Renamed for clarity
const stationLinesModal = document.getElementById("stationLinesModal");

const closeStationModalBtn = document.querySelector(".station-modal-close");
const closeLineModalBtn = document.querySelector(".line-modal-close");
const closeStationLinesModalBtn = document.querySelector(".station-lines-modal-close");


// When the user clicks on the close button, close the modal
closeStationModalBtn.onclick = function () {
    stationModal.style.display = "none";
}

closeLineModalBtn.onclick = function () {
    lineModal.style.display = "none";
    resetLineForm(); // Reset form when closing
}

closeStationLinesModalBtn.onclick = function () {
    stationLinesModal.style.display = "none";
}

closeExpressServiceModalBtn.onclick = function () {
    expressServiceModal.style.display = "none";
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    // Close modals only if click is directly on the modal backdrop
    if (event.target == stationModal) {
        stationModal.style.display = "none";
    }
    if (event.target == lineModal) {
        lineModal.style.display = "none";
        resetLineForm(); // Reset form when closing
    }
    if (event.target == stationLinesModal) {
        stationLinesModal.style.display = "none";
    }
    if (event.target == expressServiceModal) {
        expressServiceModal.style.display = "none";
    }
    if (event.target == listModal) { // Close station list modal on outside click
        listModal.style.display = "none";
    }
};

// --- MOUSE EVENT HANDLING ---
canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = 'default'; // Show default cursor when leaving canvas
    mouse.button = false; // Ensure button state is reset
    mouse.drag = false; // Ensure drag state is reset
});

canvas.addEventListener('mouseenter', () => {
    // canvas.style.cursor = 'none'; // Re-enable custom cursor if desired for mouse
});

function updateStationStats() {
    const totalStations = stations.length;
    const groundStations = stations.filter(s => s.location.includes('ground')).length;
    const undergroundStations = stations.filter(s => s.location.includes('underground')).length;
    const suspendedStations = stations.filter(s => s.location.includes('suspended')).length;

    // Check if elements exist before updating
    const totalStationsEl = document.getElementById('totalStations');
    const groundStationsEl = document.getElementById('groundStations');
    const undergroundStationsEl = document.getElementById('undergroundStations');
    const suspendedStationsEl = document.getElementById('suspendedStations');

    if (totalStationsEl) totalStationsEl.textContent = totalStations;
    if (groundStationsEl) groundStationsEl.textContent = groundStations;
    if (undergroundStationsEl) undergroundStationsEl.textContent = undergroundStations;
    if (suspendedStationsEl) suspendedStationsEl.textContent = suspendedStations;

    // Calculate line stats, including express lines
    const totalLines = lines.length;
    const groundLines = lines.filter(l => l.type === 'ground').length;
    const undergroundLines = lines.filter(l => l.type === 'underground').length;
    const suspendedLines = lines.filter(l => l.type === 'suspended').length;
    const expressLines = lines.filter(l => l.originalLineCode).length; // Count lines with originalLineCode

    const totalLinesEl = document.getElementById('totalLines');
    const groundLinesEl = document.getElementById('groundLines');
    const undergroundLinesEl = document.getElementById('undergroundLines');
    const suspendedLinesEl = document.getElementById('suspendedLines');
    const expressLinesStatEl = document.getElementById('expressLinesStat');

    if (totalLinesEl) totalLinesEl.textContent = totalLines;
    if (groundLinesEl) groundLinesEl.textContent = groundLines;
    if (undergroundLinesEl) undergroundLinesEl.textContent = undergroundLines;
    if (suspendedLinesEl) suspendedLinesEl.textContent = suspendedLines;
    if (expressLinesStatEl) expressLinesStatEl.textContent = expressLines; // Update Express stat

    // Update Train Stats
    const totalTrains = trains.reduce((sum, train) => sum + train.quantity, 0);
    const groundTrains = trains.filter(t => t.type === 'ground').reduce((sum, train) => sum + train.quantity, 0);
    const undergroundTrains = trains.filter(t => t.type === 'underground').reduce((sum, train) => sum + train.quantity, 0);
    const suspendedTrains = trains.filter(t => t.type === 'suspended').reduce((sum, train) => sum + train.quantity, 0);

    const totalTrainsStatEl = document.getElementById('totalTrainsStat');
    const groundTrainsStatEl = document.getElementById('groundTrainsStat');
    const undergroundTrainsStatEl = document.getElementById('undergroundTrainsStat');
    const suspendedTrainsStatEl = document.getElementById('suspendedTrainsStat');

    if (totalTrainsStatEl) totalTrainsStatEl.textContent = totalTrains;
    if (groundTrainsStatEl) groundTrainsStatEl.textContent = groundTrains;
    if (undergroundTrainsStatEl) undergroundTrainsStatEl.textContent = undergroundTrains;
    if (suspendedTrainsStatEl) suspendedTrainsStatEl.textContent = suspendedTrains;
}


function fetchStations() {
    // Initial resize and draw
    handleResize();
    update();
    updateStationStats();
    updateLinesUI(); // Initial update of the line list
}

// Call fetchStations after DOM is loaded
document.addEventListener("DOMContentLoaded", fetchStations);

// Add resize listener
window.addEventListener('resize', handleResize);


function clearGrid() {
    if (!confirm("Are you sure you want to delete all stations and lines? This action cannot be undone.")) {
        return;
    }
    stations = [];
    lines = [];
    update();           // Redraw canvas
    updateLinesUI();    // Clear right-hand line list
    updateStationStats(); // Update stats if applicable
}

document.getElementById('clearGridBtn').addEventListener('click', clearGrid);


function mouseEvents(e) {
    const bounds = canvas.getBoundingClientRect();
    mouse.x = e.pageX - bounds.left - scrollX; // Use pageX for consistency
    mouse.y = e.pageY - bounds.top - scrollY;  // Use pageY for consistency
    if (e.type === "mousedown") {
        mouse.button = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
        // Reset touch states if mouse is used
        isPanning = false;
        isPinching = false;
    } else if (e.type === "mouseup") {
        mouse.button = false;
    }
    if (e.type === "wheel") {
        mouse.wheel += -e.deltaY;
        e.preventDefault();
    }
}

// Add mouse listeners to the document to capture events even outside canvas during drag
["mousedown", "mouseup", "mousemove"].forEach(name => document.addEventListener(name, mouseEvents));
// Keep wheel listener on canvas to prevent zooming whole page
canvas.addEventListener("wheel", mouseEvents, { passive: false });


// --- TOUCH EVENT HANDLING ---
function getTouchPos(touch) {
    const bounds = canvas.getBoundingClientRect();
    return {
        x: touch.pageX - bounds.left - scrollX,
        y: touch.pageY - bounds.top - scrollY
    };
}

function getPinchDistance(touches) {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getPinchCenter(touches) {
    const bounds = canvas.getBoundingClientRect();
    const x1 = touches[0].pageX - bounds.left - scrollX;
    const y1 = touches[0].pageY - bounds.top - scrollY;
    const x2 = touches[1].pageX - bounds.left - scrollX;
    const y2 = touches[1].pageY - bounds.top - scrollY;
    return {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    };
}

function handleTouchStart(e) {
    // Prevent mouse events from firing after touch
    // e.preventDefault(); // Keep this commented unless double events occur

    mouse.button = false; // Ensure mouse drag is off

    if (e.touches.length === 1) {
        const touchPos = getTouchPos(e.touches[0]);
        isPanning = true;
        isPinching = false;
        lastTouchX = touchPos.x;
        lastTouchY = touchPos.y;
        mouse.downX = touchPos.x; // Store initial touch for tap detection
        mouse.downY = touchPos.y;
    } else if (e.touches.length === 2) {
        isPinching = true;
        isPanning = false;
        initialPinchDistance = getPinchDistance(e.touches);
        const center = getPinchCenter(e.touches);
        pinchCenterX = center.x;
        pinchCenterY = center.y;
    }
}

function handleTouchMove(e) {
    // Only prevent default if we are handling the touch (panning or pinching)
    if (isPanning || isPinching) {
        e.preventDefault();
    }

    if (isPanning && e.touches.length === 1) {
        const touchPos = getTouchPos(e.touches[0]);
        const dx = touchPos.x - lastTouchX;
        const dy = touchPos.y - lastTouchY;
        panZoom.x += dx;
        panZoom.y += dy;
        lastTouchX = touchPos.x;
        lastTouchY = touchPos.y;
    } else if (isPinching && e.touches.length === 2) {
        const currentDistance = getPinchDistance(e.touches);
        const scale = currentDistance / initialPinchDistance;
        const center = getPinchCenter(e.touches); // Use current center

        // Apply scale, ensuring limits are respected
        const currentZoomDisabled = zoomDisabled; // Store current state
        panZoom.scaleAt(center.x, center.y, scale);

        // Only update initial distance if zoom was not disabled
        if (zoomDisabled === 0 || (currentZoomDisabled !== zoomDisabled)) {
            initialPinchDistance = currentDistance;
        }
    }
}

function handleTouchEnd(e) {
    // e.preventDefault(); // Might interfere with click event

    if (e.touches.length < 2) {
        isPinching = false;
    }
    if (e.touches.length < 1) {
        isPanning = false;
    }

    // --- Basic Tap Detection (using existing click listener) ---
    // Calculate distance moved during touch
    const touchPos = getTouchPos(e.changedTouches[0]);
    const distance = Math.sqrt((touchPos.x - mouse.downX) ** 2 + (touchPos.y - mouse.downY) ** 2);

    // If little movement, let the 'click' event handle the tap
    // The existing click listener already has distance check
    // console.log("Touch end distance:", distance);

    // Optional: Implement double-tap zoom here if needed
    // const now = Date.now();
    // if (now - lastTapTime < doubleTapDelay) {
    //     // Double tap detected - zoom in/out at tap location
    //     const scaleFactor = panZoom.scale > 1 ? 0.5 : 1.5; // Toggle zoom
    //     panZoom.scaleAt(touchPos.x, touchPos.y, scaleFactor);
    // }
    // lastTapTime = now;
}

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false }); // Handle cancellation

// --- End TOUCH EVENT HANDLING ---


const panZoom = {
    x: 0,
    y: 0,
    scale: 1,
    apply(ctxToUse = ctx) { ctxToUse.setTransform(this.scale, 0, 0, this.scale, this.x, this.y) },
    scaleAt(x, y, sc) {
        const previousScale = this.scale;
        let newScale = this.scale * sc;
        newScale = Math.max(0.5, Math.min(newScale, 3)); // Limit zoom here

        // Check if zoom limit is reached
        if ((newScale === 3 && sc > 1) || (newScale === 0.5 && sc < 1)) {
            // If trying to zoom beyond limits, don't change scale or position
            zoomDisabled = newScale === 3 ? 1 : -1;
            return; // Exit without applying change
        }

        const actualScaleChange = newScale / previousScale; //calculate actual scale change
        this.scale = newScale; // Apply the new scale

        this.x = x - (x - this.x) * actualScaleChange;
        this.y = y - (y - this.y) * actualScaleChange;

        // Update zoomDisabled state based on the new scale
        if (this.scale >= 3) {
            zoomDisabled = 1; // Disable zoom in
        } else if (this.scale <= 0.5) {
            zoomDisabled = -1; // Disable zoom out
        } else {
            zoomDisabled = 0; // Enable all zoom
        }
    },
    toWorld(x, y, point = {}) {
        const inv = 1 / this.scale;
        point.x = (x - this.x) * inv;
        point.y = (y - this.y) * inv;
        return point;
    },
    toScreen(x, y, point = {}) {
        point.x = x * this.scale + this.x;
        point.y = y * this.scale + this.y;
        return point;
    }
}

function drawGrid(gridScreenSize = 128, adaptive = true) {
    var scale, gridScale, size, x, y, limitedGrid = false;
    if (adaptive) {
        scale = 1 / panZoom.scale;
        gridScale = 2 ** (Math.log2(gridScreenSize * scale) | 0);
        size = Math.max(w, h) * scale + gridScale * 2;
        x = ((-panZoom.x * scale - gridScale) / gridScale | 0) * gridScale;
        y = ((-panZoom.y * scale - gridScale) / gridScale | 0) * gridScale;
    } else {
        gridScale = gridScreenSize;
        size = Math.max(w, h) / panZoom.scale + gridScale * 2;
        panZoom.toWorld(0, 0, topLeft);
        x = Math.floor(topLeft.x / gridScale) * gridScale;
        y = Math.floor(topLeft.y / gridScale) * gridScale;
        if (size / gridScale > gridLimit) {
            size = gridScale * gridLimit;
            limitedGrid = true;
        }
    }
    panZoom.apply();
    ctx.lineWidth = 1 / panZoom.scale; // Make grid lines thinner when zoomed in
    ctx.strokeStyle = "#aaa"; // Lighter grid color
    ctx.beginPath();
    for (let i = 0; i < size; i += gridScale) { // Changed var to let
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + size);
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + size, y + i);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.stroke();
}

// Draw crosshair only for mouse input
function drawPoint(x, y) {
    // Only draw if not panning/pinching (likely mouse input)
    if (isPanning || isPinching) return;

    const size = 8;
    const ringRadius = 6;

    // Crosshair lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - size, y); // Horizontal left
    ctx.lineTo(x - 2, y);
    ctx.moveTo(x + 2, y); // Horizontal right
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size); // Vertical up
    ctx.lineTo(x, y - 2);
    ctx.moveTo(x, y + 2); // Vertical down
    ctx.lineTo(x, y + size);
    ctx.stroke();

    // Central ring
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.stroke();
}


function drawStation(station) {
    panZoom.apply();
    // Scale line width and radius based on zoom
    const baseRadius = 8;
    const baseLineWidth = 2;
    const scaledRadius = baseRadius / Math.sqrt(panZoom.scale); // Scale radius less aggressively
    const scaledLineWidth = baseLineWidth / panZoom.scale;
    const scaledFontSize = 12 / panZoom.scale;
    const scaledLabelOffset = 20 / panZoom.scale;
    const scaledLineLabelOffset = 35 / panZoom.scale;
    const scaledLineLabelGap = 12 / panZoom.scale;
    const scaledLineLabelFontSize = 10 / panZoom.scale;


    ctx.lineWidth = scaledLineWidth;

    // Define colors for each type
    const typeColors = {
        ground: "yellow",
        underground: "red",
        suspended: "blue"
    };

    // Extract the station's types
    const types = Array.isArray(station.location) ? station.location : [];

    const centerX = station.x;
    const centerY = station.y;


    // Draw multi-colored ring around the station based on types
    if (types.length > 0) {
        const arcSize = (2 * Math.PI) / types.length; // Divide circle based on number of types
        ctx.lineWidth = scaledLineWidth * 1.5; // Make ring slightly thicker
        for (let i = 0; i < types.length; i++) {
            const startAngle = i * arcSize - Math.PI / 2; // Start from top
            const endAngle = (i + 1) * arcSize - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, scaledRadius, startAngle, endAngle);
            ctx.strokeStyle = typeColors[types[i]] || "black"; // Default to black if unknown type
            ctx.stroke();
        }
    }


    // Draw center dot
    ctx.fillStyle = "black";
    ctx.beginPath();
    // Scale center dot size slightly
    ctx.arc(centerX, centerY, Math.max(1, 3 / panZoom.scale), 0, 2 * Math.PI);
    ctx.fill();

    // Don't draw text if zoomed out too far
    if (panZoom.scale > 0.6) {
        // Display station name
        ctx.fillStyle = "black";
        ctx.font = `${scaledFontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(station.name, centerX, centerY + scaledLabelOffset);

        // --- Add Line Numbered Station Labels ---
        const connectedLineLabels = [];
        lines.forEach(line => {
            const stationIndex = line.stations.indexOf(station.name);
            if (stationIndex !== -1) {
                const stationNumber = stationIndex + 1;
                connectedLineLabels.push({
                    text: `${line.code}${stationNumber}`,
                    color: line.color || 'black' // Use line color for label
                });
            }
        });

        // Draw connected line labels below the station name
        let textOffsetY = centerY + scaledLineLabelOffset; // Starting Y position below station name
        ctx.font = `bold ${scaledLineLabelFontSize}px Arial`; // Smaller font for line labels
        connectedLineLabels.forEach(labelInfo => {
            ctx.fillStyle = labelInfo.color;
            ctx.fillText(labelInfo.text, centerX, textOffsetY);
            textOffsetY += scaledLineLabelGap; // Increment Y position for the next label
        });
        // --- End Add Line Numbered Station Labels ---
    }


    ctx.setTransform(1, 0, 0, 1, 0, 0);
}


var w = canvas.width;
var h = canvas.height;

// --- Resize Handler ---
function handleResize() {
    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 50;
    const statsPanelHeight = document.getElementById('statsPanel')?.offsetHeight || 60;
    // Use visual viewport for better mobile sizing, fallback to innerWidth/Height
    w = canvas.width = window.visualViewport ? window.visualViewport.width : innerWidth;
    h = canvas.height = (window.visualViewport ? window.visualViewport.height : innerHeight) - navbarHeight - statsPanelHeight - (window.visualViewport ? window.visualViewport.offsetTop : 0);

    // Adjust for safe areas (notches, etc.) - primarily affects height calculation
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('padding-top')) || 0;
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('padding-bottom')) || 0;
    h -= (safeAreaTop + safeAreaBottom);


    // Optional: Center content after resize if needed, or just redraw
    // panZoom.x = w / 2 - (centerX * panZoom.scale); // Example centering
    // panZoom.y = h / 2 - (centerY * panZoom.scale);
    update(); // Redraw after resize
}
// --- End Resize Handler ---


// Draw loop
function update() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform at the start
    ctx.globalAlpha = 1;

    // Clearing the canvas MUST happen every frame
    ctx.clearRect(0, 0, w, h);

    // Handle MOUSE zoom
    if (mouse.wheel !== 0) {
        let scale = 1;
        scale = mouse.wheel < 0 ? 1 / scaleRate : scaleRate;
        // Check zoom limits before applying
        if ((panZoom.scale <= 0.5 && scale < 1) || (panZoom.scale >= 3 && scale > 1)) {
            // Don't apply zoom if limits reached
        } else {
            panZoom.scaleAt(mouse.x, mouse.y, scale);
        }
        mouse.wheel *= 0.8; // Dampen wheel movement
        if (Math.abs(mouse.wheel) < 1) {
            mouse.wheel = 0;
        }
    }

    // Handle MOUSE pan (drag)
    if (mouse.button && !isPanning && !isPinching) { // Only pan with mouse if not touching
        if (!mouse.drag) {
            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
            mouse.drag = true;
        } else {
            panZoom.x += mouse.x - mouse.lastX;
            panZoom.y += mouse.y - mouse.lastY;
            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
        }
    } else if (mouse.drag) {
        mouse.drag = false;
    }

    // Draw the background grid
    drawGrid(gridSize, true);

    // --- Draw Lines ---
    const segmentUsage = {}; // Map: "StationA->StationB" -> [lineInfo1, lineInfo2, ...] // Key represents a PHYSICAL segment

    // First pass: Populate segmentUsage based on PHYSICAL paths shared between lines
    lines.forEach((line, lineIndex) => {
        let physicalStations = line.stations; // Stations defining the physical path
        if (line.originalLineCode) {
            const originalLine = lines.find(ol => ol.code === line.originalLineCode);
            if (originalLine) {
                physicalStations = originalLine.stations;
            } else {
                console.warn(`Original line ${line.originalLineCode} not found for express line ${line.code}`);
                // Use the express line's own stations as fallback if original is missing
            }
        }

        // Iterate through the physical path segments
        for (let i = 0; i < physicalStations.length - 1; i++) {
            const stationA_name = physicalStations[i];
            const stationB_name = physicalStations[i + 1];
            const stationA = stations.find(s => s.name === stationA_name);
            const stationB = stations.find(s => s.name === stationB_name);

            if (stationA && stationB) {
                // Ensure consistent key order (e.g., alphabetical)
                const keyPart1 = stationA.name < stationB.name ? stationA.name : stationB.name;
                const keyPart2 = stationA.name < stationB.name ? stationB.name : stationA.name;
                const segmentKey = `${keyPart1}->${keyPart2}`; // Undirected physical segment key

                if (!segmentUsage[segmentKey]) {
                    segmentUsage[segmentKey] = [];
                }
                // Add this line to the usage list for this physical segment if not already present
                if (!segmentUsage[segmentKey].some(entry => entry.code === line.code)) {
                    segmentUsage[segmentKey].push({ index: lineIndex, code: line.code });
                }
            }
        }
    });

    // Sort lines within each segment consistently (e.g., by line code)
    for (const segmentKey in segmentUsage) {
        segmentUsage[segmentKey].sort((a, b) => a.code.localeCompare(b.code));
    }

    // Second pass: Draw each line
    lines.forEach((line, lineIndex) => {
        const isHovered = hoveredLine && hoveredLine.code === line.code;
        const serviceStations = line.stations; // Stations this line actually serves

        if (serviceStations.length < 2) return; // Cannot draw a line with less than 2 stations

        ctx.beginPath(); // Start path for the current line
        panZoom.apply(); // Apply zoom/pan transform
        ctx.strokeStyle = isHovered ? 'orange' : (line.color || '#000');
        // Scale line width based on zoom
        ctx.lineWidth = (isHovered ? 6 : 4) / panZoom.scale;


        // Determine the physical path stations
        let physicalStations = serviceStations;
        if (line.originalLineCode) {
            const originalLine = lines.find(ol => ol.code === line.originalLineCode);
            if (originalLine) {
                physicalStations = originalLine.stations;
            }
        }

        // Iterate through the segments defined by the SERVICE stations
        for (let i = 0; i < serviceStations.length - 1; i++) {
            const currentServiceStationName = serviceStations[i];
            const nextServiceStationName = serviceStations[i + 1];

            // Find the indices of these service stations in the PHYSICAL path
            const physicalIndexCurrent = physicalStations.indexOf(currentServiceStationName);
            const physicalIndexNext = physicalStations.indexOf(nextServiceStationName);

            // Check if both stations exist in the physical path and are adjacent or have intermediate physical stations
            if (physicalIndexCurrent !== -1 && physicalIndexNext !== -1) {
                // Determine the direction of travel along the physical path
                const step = physicalIndexCurrent < physicalIndexNext ? 1 : -1;

                // Iterate through the PHYSICAL segments between the current and next SERVICE stations
                for (let j = physicalIndexCurrent; j !== physicalIndexNext; j += step) {
                    const physicalStationA_name = physicalStations[j];
                    const physicalStationB_name = physicalStations[j + step];

                    const stationA = stations.find(s => s.name === physicalStationA_name);
                    const stationB = stations.find(s => s.name === physicalStationB_name);

                    if (stationA && stationB) {
                        // Get the consistent segment key
                        const keyPart1 = stationA.name < stationB.name ? stationA.name : stationB.name;
                        const keyPart2 = stationA.name < stationB.name ? stationB.name : stationA.name;
                        const segmentKey = `${keyPart1}->${keyPart2}`;

                        const linesUsingSegment = segmentUsage[segmentKey] || [];
                        const numOverlappingLines = linesUsingSegment.length;
                        let offsetX = 0;
                        let offsetY = 0;

                        // Calculate offset (scale offset amount by zoom)
                        if (numOverlappingLines > 1) {
                            const lineEntryIndexInSegment = linesUsingSegment.findIndex(entry => entry.code === line.code);
                            if (lineEntryIndexInSegment !== -1) {
                                const offsetIndex = lineEntryIndexInSegment - (numOverlappingLines - 1) / 2;
                                // Scale the offset amount based on zoom
                                const currentOffsetAmount = (offsetIndex * lineOffsetAmount) / panZoom.scale;
                                const dx = stationB.x - stationA.x;
                                const dy = stationB.y - stationA.y;
                                const segmentLength = Math.sqrt(dx * dx + dy * dy);
                                if (segmentLength > 0) {
                                    const normalX = -dy / segmentLength;
                                    const normalY = dx / segmentLength;
                                    offsetX = normalX * currentOffsetAmount;
                                    offsetY = normalY * currentOffsetAmount;
                                }
                            }
                        }

                        // Add the segment to the current line's path
                        if (j === physicalIndexCurrent) { // Move to start of the first physical segment in this service leg
                            ctx.moveTo(stationA.x + offsetX, stationA.y + offsetY);
                        }
                        ctx.lineTo(stationB.x + offsetX, stationB.y + offsetY);

                        // --- Line Number Labeling Logic ---
                        // Only draw labels if sufficiently zoomed in
                        if (panZoom.scale > 0.7) {
                            // Label the segment between SERVICE stations (only once per service segment)
                            if (j === physicalIndexCurrent) { // Label at the start of the sequence of physical segments
                                const midX = (stationA.x + stationB.x) / 2 + offsetX; // Approx midpoint of first physical seg
                                const midY = (stationA.y + stationB.y) / 2 + offsetY;
                                const angle = Math.atan2(stationB.y - stationA.y, stationB.x - stationA.x);
                                const scaledFontSize = 12 / panZoom.scale;
                                const scaledLabelOffset = -6 / panZoom.scale;


                                // Save context state for rotation/translation
                                ctx.save();
                                ctx.translate(midX, midY);
                                ctx.rotate(angle);
                                ctx.fillStyle = isHovered ? 'darkorange' : (line.color || '#000');
                                ctx.font = `bold ${scaledFontSize}px Arial`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom'; // Place label above the line
                                ctx.fillText(i + 1, 0, scaledLabelOffset); // Use index 'i' from the serviceStations loop
                                ctx.restore(); // Restore context state
                            }
                        }
                        // --- End Line Number Labeling Logic ---
                    }
                }
            } else {
                console.warn(`Could not find physical path segment between service stations ${currentServiceStationName} and ${nextServiceStationName} for line ${line.code}`);
            }
        }
        // Stroke the complete path for the line after iterating through all its service segments
        ctx.stroke();

        // --- Draw Line Name Label ---
        // Only draw if sufficiently zoomed in
        if (panZoom.scale > 0.6) {
            // Find midpoint based on the first and last SERVICE stations
            const firstServiceStation = stations.find(s => s.name === serviceStations[0]);
            const lastServiceStation = stations.find(s => s.name === serviceStations[serviceStations.length - 1]);
            if (firstServiceStation && lastServiceStation) {
                const midX = (firstServiceStation.x + lastServiceStation.x) / 2;
                const midY = (firstServiceStation.y + lastServiceStation.y) / 2;

                // Calculate average offset for the label (similar to segment offset calculation)
                let totalOffsetX = 0;
                let totalOffsetY = 0;
                let labelSegmentCount = 0;
                // Use physical path for offset calculation
                for (let i = 0; i < physicalStations.length - 1; i++) {
                    const sA_name = physicalStations[i];
                    const sB_name = physicalStations[i + 1];
                    const sA = stations.find(s => s.name === sA_name);
                    const sB = stations.find(s => s.name === sB_name);
                    if (sA && sB) {
                        const keyPart1 = sA.name < sB.name ? sA.name : sB.name;
                        const keyPart2 = sA.name < sB.name ? sB.name : sA.name;
                        const segKey = `${keyPart1}->${keyPart2}`;
                        const linesOnSeg = segmentUsage[segKey] || [];
                        if (linesOnSeg.length > 1) {
                            const lineEntryIndexInSegment = linesOnSeg.findIndex(entry => entry.code === line.code);
                            if (lineEntryIndexInSegment !== -1) {
                                const offsetIdx = lineEntryIndexInSegment - (linesOnSeg.length - 1) / 2;
                                const currentOffset = (offsetIdx * lineOffsetAmount) / panZoom.scale; // Scale offset
                                const dx = sB.x - sA.x;
                                const dy = sB.y - sA.y;
                                const segLen = Math.sqrt(dx * dx + dy * dy);
                                if (segLen > 0) {
                                    const normalX = -dy / segLen;
                                    const normalY = dx / segLen;
                                    totalOffsetX += normalX * currentOffset;
                                    totalOffsetY += normalY * currentOffset;
                                    labelSegmentCount++;
                                }
                            }
                        }
                    }
                }
                const avgOffsetX = labelSegmentCount > 0 ? totalOffsetX / labelSegmentCount : 0;
                const avgOffsetY = labelSegmentCount > 0 ? totalOffsetY / labelSegmentCount : 0;
                const scaledFontSize = 14 / panZoom.scale;
                const scaledOffset = 8 / panZoom.scale;


                // Draw the label
                ctx.fillStyle = isHovered ? 'orange' : (line.color || '#000');
                ctx.font = `bold ${scaledFontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top'; // Place below the line midpoint
                ctx.fillText(`${line.code} - ${line.name || ''}`, midX + avgOffsetX, midY + avgOffsetY + scaledOffset);
            }
        }
        // --- End Draw Line Name Label ---


        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform after drawing everything for this line
    });
    // --- End Draw Lines ---

    // Draw stations on top of lines
    stations.forEach(station => {
        drawStation(station);
    });

    // Draw mouse cursor crosshair (only for mouse)
    drawPoint(mouse.x, mouse.y);

    // Update scale display
    scaleDisplay.textContent = `Scale: ${panZoom.scale.toFixed(2)}x`;

    // Request next frame
    requestAnimationFrame(update);
}
// *** END OF CORRECTED FUNCTION: update() ***


const cursorCoords = document.getElementById('cursorCoords');

// Update cursor coords only on mouse move
canvas.addEventListener('mousemove', function (e) {
    // Only show if not panning/pinching (likely mouse input)
    if (isPanning || isPinching) {
        cursorCoords.style.display = 'none';
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panZoom.x) / panZoom.scale;
    const y = (e.clientY - rect.top - panZoom.y) / panZoom.scale;

    // Update tooltip content and position
    cursorCoords.innerText = `x: ${Math.round(x)}, y: ${Math.round(y)}`;
    cursorCoords.style.left = `${e.clientX + 10}px`;
    cursorCoords.style.top = `${e.clientY + 10}px`;
    cursorCoords.style.display = 'block';
});

canvas.addEventListener('mouseleave', function () {
    cursorCoords.style.display = 'none';
});


// --- CLICK/TAP HANDLING ---
// Use a single handler for both click and tap end
function handleCanvasTap(event) {
    let clickX, clickY;
    let isTouchEvent = event.type.startsWith('touch');

    if (isTouchEvent) {
        // Use changedTouches for touchend
        if (!event.changedTouches || event.changedTouches.length === 0) return;
        const touch = event.changedTouches[0];
        const pos = getTouchPos(touch);
        clickX = pos.x;
        clickY = pos.y;
        // Check distance moved during touch for tap validation
        const distance = Math.sqrt((clickX - mouse.downX) ** 2 + (clickY - mouse.downY) ** 2);
        // console.log("Tap distance:", distance);
        if (distance > 10) return; // If moved too much, it's a pan, not a tap
    } else { // Mouse click
        const bounds = canvas.getBoundingClientRect();
        clickX = event.pageX - bounds.left - scrollX;
        clickY = event.pageY - bounds.top - scrollY;
        // Check distance for mouse click as well
        const distance = Math.sqrt((clickX - mouse.downX) ** 2 + (clickY - mouse.downY) ** 2);
        // console.log("Click distance:", distance);
        if (distance > 5) return; // Prevent click on drag
    }


    let worldCoord = panZoom.toWorld(clickX, clickY);

    // Find station near the tap/click
    selectedStation = stations.find(station =>
        Math.sqrt((station.x - worldCoord.x) ** 2 + (station.y - worldCoord.y) ** 2) < (15 / panZoom.scale) // Increase tap radius slightly, adjust with scale
    );

    if (selectedStation) {
        // Edit Station
        document.getElementById('stationModalTitle').textContent = 'Edit Station';
        document.getElementById('saveStation').textContent = 'Save Changes';
        document.getElementById('deleteStation').style.display = 'block';
        document.getElementById('stationId').value = selectedStation.id; // Set hidden ID

        document.getElementById('stationName').value = selectedStation.name;
        document.getElementById('stationX').value = selectedStation.x.toFixed(0);
        document.getElementById('stationY').value = selectedStation.y.toFixed(0);
        document.getElementById('undergroundType').checked = selectedStation.location.includes("underground");
        document.getElementById('groundType').checked = selectedStation.location.includes("ground");
        document.getElementById('suspendedType').checked = selectedStation.location.includes("suspended");

        // Show lines connected to this station
        displayConnectedLines(selectedStation.name);

    } else {
        // Add New Station
        document.getElementById('stationModalTitle').textContent = 'Add Station';
        document.getElementById('saveStation').textContent = 'Save Station';
        document.getElementById('deleteStation').style.display = 'none';
        document.getElementById('stationId').value = ''; // Clear hidden ID

        newStationWorldCoord = { x: worldCoord.x, y: worldCoord.y };
        document.getElementById('stationName').value = "";
        document.getElementById('stationX').value = newStationWorldCoord.x.toFixed(0);
        document.getElementById('stationY').value = newStationWorldCoord.y.toFixed(0);
        document.getElementById('undergroundType').checked = false;
        document.getElementById('groundType').checked = false;
        document.getElementById('suspendedType').checked = false;

        // Hide connected lines modal if open
        stationLinesModal.style.display = 'none';
    }

    stationModal.style.display = "block";
}

// Use 'click' for mouse and rely on touchend logic for taps
canvas.addEventListener('click', handleCanvasTap);
// Add touchend listener specifically for tap detection
canvas.addEventListener('touchend', handleCanvasTap);

// --- END CLICK/TAP HANDLING ---


document.getElementById('saveStation').addEventListener('click', function (event) {
    event.preventDefault();
    const name = document.getElementById('stationName').value.trim();
    const stationId = document.getElementById('stationId').value; // Get ID

    if (!name) {
        alert("Station name is required.");
        return;
    }

    // Check for duplicate name, excluding the current station if editing
    if (stations.some(s => s.name === name && (stationId === '' || s.id != stationId))) {
        alert("A station with this name already exists.");
        return;
    }

    const selectedLocations = [];
    if (document.getElementById('undergroundType').checked) selectedLocations.push("underground");
    if (document.getElementById('groundType').checked) selectedLocations.push("ground");
    if (document.getElementById('suspendedType').checked) selectedLocations.push("suspended");

    if (selectedLocations.length === 0) {
        alert("Please select at least one station type.");
        return;
    }

    if (stationId) { // Editing existing station
        const updatedStation = stations.find(station => station.id == stationId);
        if (updatedStation) {
            updatedStation.name = name;
            // Coordinates are read-only, no need to update from form
            updatedStation.location = selectedLocations;
        }
    } else { // Adding new station
        if (!newStationWorldCoord) {
            alert("Cannot add station without coordinates. Please click on the map first.");
            return;
        }
        const newStation = {
            id: Date.now(), // Use timestamp for a more unique ID
            x: newStationWorldCoord.x, // Use stored coords
            y: newStationWorldCoord.y, // Use stored coords
            name: name,
            location: selectedLocations
        };
        stations.push(newStation);
    }
    update();
    updateStationStats();
    stationModal.style.display = "none";
    selectedStation = null; // Clear selected station
    newStationWorldCoord = null;
});

document.getElementById('deleteStation').addEventListener('click', function () {
    const stationId = document.getElementById('stationId').value;
    if (!stationId) return;

    // Check if the station is part of any line before deleting
    const stationToDelete = stations.find(s => s.id == stationId);
    if (!stationToDelete) return; // Should not happen, but safety check
    const stationName = stationToDelete.name;

    const linesUsingStation = lines.filter(line => line.stations.includes(stationName));
    if (linesUsingStation.length > 0) {
        const lineNames = linesUsingStation.map(line => line.name || line.code).join(', ');
        alert(`Cannot delete station "${stationName}". It is currently used in the following lines: ${lineNames}. Please remove it from these lines first.`);
        return;
    }


    stations = stations.filter(station => station.id != stationId);
    updateStationStats();
    update();
    stationModal.style.display = "none";
    selectedStation = null;
    newStationWorldCoord = null;
});

// Line Creation/Editing Logic
addLineBtn.onclick = function () {
    resetLineForm(); // Reset form for new line
    document.getElementById('lineModalTitle').textContent = 'Create Line';
    document.getElementById('saveLine').textContent = 'Save Line';
    document.getElementById('deleteLine').style.display = 'none';
    createExpressServiceBtn.style.display = 'none'; // Hide express service button in create mode
    editingLineIndex = null; // Not editing
    populateTrainSelect(); // Populate train select when opening modal
    lineModal.style.display = "block";
};

function resetLineForm() {
    document.getElementById('lineIndex').value = '';
    document.getElementById('lineName').value = '';
    document.getElementById('lineCode').value = '';
    document.getElementById('lineColor').value = '#000000';
    document.querySelectorAll('input[name="lineType"]').forEach(r => r.checked = false);
    plusButtonsContainer.innerHTML = '<button class="plus-button">+</button>';
    selectedValues.clear();
    document.getElementById('deleteLine').style.display = 'none';
    createExpressServiceBtn.style.display = 'none'; // Hide express service button
    assignedTrainSelect.innerHTML = '<option value="">-- Select a Train --</option>'; // Clear and reset train select
    trainQuantityInput.value = 0;
    trainQuantityInput.disabled = true;
    maxTrainQuantitySpan.textContent = '';
}

// Function to populate the train select dropdown based on line type
function populateTrainSelect(selectedTrainName = null) {
    assignedTrainSelect.innerHTML = '<option value="">-- Select a Train --</option>'; // Clear existing options
    trainQuantityInput.value = 0;
    trainQuantityInput.disabled = true;
    maxTrainQuantitySpan.textContent = '';


    const selectedLineTypeRadio = document.querySelector('input[name="lineType"]:checked');
    const selectedLineType = selectedLineTypeRadio ? selectedLineTypeRadio.value : null;

    if (!selectedLineType) {
        // If no line type is selected, disable the train select
        assignedTrainSelect.disabled = true;
        return;
    }

    assignedTrainSelect.disabled = false; // Enable if a type is selected

    const filteredTrains = trains.filter(train => train.type === selectedLineType);

    filteredTrains.forEach(train => {
        const option = document.createElement('option');
        option.value = train.name;
        option.textContent = `${train.name} (Qty: ${train.quantity})`; // Display quantity
        if (selectedTrainName && train.name === selectedTrainName) {
            option.selected = true;
        }
        assignedTrainSelect.appendChild(option);
    });

    // If a train was pre-selected (editing mode), update quantity input
    if (selectedTrainName) {
        const selectedTrain = trains.find(train => train.name === selectedTrainName);
        if (selectedTrain) {
            trainQuantityInput.disabled = false;
            trainQuantityInput.max = selectedTrain.quantity;
            maxTrainQuantitySpan.textContent = `(Max: ${selectedTrain.quantity})`;
            // Set the quantity input value if editing
            const currentLine = lines[editingLineIndex];
            if (currentLine && currentLine.assignedTrain === selectedTrainName) {
                trainQuantityInput.value = currentLine.trainQuantity || 0;
            } else {
                trainQuantityInput.value = 0; // Default to 0 if not set or train changed
            }
        } else {
            trainQuantityInput.value = 0; // Reset if selected train not found
        }
    } else {
        trainQuantityInput.value = 0; // Reset if no train selected
    }
}

// Add event listeners to line type radio buttons to update train select
document.querySelectorAll('input[name="lineType"]').forEach(radio => {
    radio.addEventListener('change', () => {
        // Pass the currently selected train (if any) to preserve selection if possible
        populateTrainSelect(assignedTrainSelect.value);
    });
});

// Add event listener to train select to update quantity input
assignedTrainSelect.addEventListener('change', () => {
    const selectedTrainName = assignedTrainSelect.value;
    if (selectedTrainName) {
        const selectedTrain = trains.find(train => train.name === selectedTrainName);
        if (selectedTrain) {
            trainQuantityInput.disabled = false;
            trainQuantityInput.max = selectedTrain.quantity;
            maxTrainQuantitySpan.textContent = `(Max: ${selectedTrain.quantity})`;
            // Don't default to 1, keep existing value or 0
            trainQuantityInput.value = trainQuantityInput.value > 0 ? Math.min(trainQuantityInput.value, selectedTrain.quantity) : 0;
        }
    } else {
        trainQuantityInput.value = 0;
        trainQuantityInput.disabled = true;
        maxTrainQuantitySpan.textContent = '';
    }
});

// Save Line Button Logic
saveLineBtn.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default form submission

    const lineName = document.getElementById('lineName').value.trim();
    const lineCode = document.getElementById('lineCode').value.trim().toUpperCase(); // Store code as uppercase
    const lineColor = document.getElementById('lineColor').value;
    const lineTypeRadio = document.querySelector('input[name="lineType"]:checked');
    const lineType = lineTypeRadio ? lineTypeRadio.value : null;
    const assignedTrain = assignedTrainSelect.value; // Get selected train name
    const trainQuantity = parseInt(trainQuantityInput.value, 10); // Get train quantity


    const stationButtons = plusButtonsContainer.querySelectorAll('.plus-button span');
    const stationNames = Array.from(stationButtons).map(span => span.textContent.trim()).filter(Boolean);

    // Validation
    if (!lineName || !lineCode || !lineType || stationNames.length < 2) {
        alert("Please fill all fields and select at least two stations.");
        return;
    }

    if (lineCode.length !== 2) {
        alert("Line Code must be exactly 2 letters.");
        return;
    }

    // Validate consecutive stations
    for (let i = 0; i < stationNames.length - 1; i++) {
        if (stationNames[i] === stationNames[i + 1]) {
            alert("A station cannot appear twice in a row on the same line.");
            return;
        }
    }

    // Validate train assignment and quantity
    const availableTrainsForType = trains.filter(train => train.type === lineType);
    if (availableTrainsForType.length > 0) {
        if (!assignedTrain) {
            alert(`Please assign a train of type "${lineType}" to this line.`);
            return;
        }
        if (isNaN(trainQuantity) || trainQuantity <= 0) {
            alert("Please specify a valid train quantity (must be a positive number).");
            return;
        }
        const selectedTrainObj = trains.find(train => train.name === assignedTrain);
        if (!selectedTrainObj || trainQuantity > selectedTrainObj.quantity) {
            alert(`Invalid train quantity. You can only assign up to ${selectedTrainObj ? selectedTrainObj.quantity : 0} of "${assignedTrain}".`);
            return;
        }
    } else {
        // If no trains of the selected type exist, ensure no train is assigned
        if (assignedTrain || trainQuantity > 0) {
            alert(`There are no trains of type "${lineType}" available to assign.`);
            // Reset train fields if type changes and no trains are available
            assignedTrainSelect.value = "";
            trainQuantityInput.value = 0;
            trainQuantityInput.disabled = true;
            maxTrainQuantitySpan.textContent = '';
            // Don't necessarily block saving, just clear invalid train assignment
            // return;
        }
    }


    const newLineData = {
        name: lineName,
        code: lineCode,
        color: lineColor,
        type: lineType,
        stations: stationNames, // Stations are already in the correct order from the UI
        assignedTrain: assignedTrain || null, // Store null if no train assigned
        trainQuantity: (assignedTrain && trainQuantity > 0) ? trainQuantity : 0 // Store 0 if no train or quantity is 0/invalid
    };

    let originalLineUpdated = false; // Flag to track if an original line was updated

    if (editingLineIndex !== null) { // Editing existing line
        const originalLineDataBeforeEdit = { ...lines[editingLineIndex] }; // Store original data before edit

        // Preserve originalLineCode if it exists (for express lines)
        if (lines[editingLineIndex].originalLineCode) {
            newLineData.originalLineCode = lines[editingLineIndex].originalLineCode;
            // If editing an express line, ensure its endpoints still match the original line's current endpoints
            const originalLine = lines.find(l => l.code === newLineData.originalLineCode);
            if (originalLine) {
                // Re-validate endpoints after potential edits (though UI should prevent changing them)
                if (newLineData.stations[0] !== originalLine.stations[0] ||
                    newLineData.stations[newLineData.stations.length - 1] !== originalLine.stations[originalLine.stations.length - 1]) {
                    alert("Express line endpoints must match the original line's endpoints.");
                    // Optionally revert endpoints in newLineData or just prevent saving
                    // For now, just alert and stop
                    return;
                }
            } else {
                // Original line was deleted while editing? Handle this edge case
                alert(`Error: Original line ${newLineData.originalLineCode} not found. Cannot save express line.`);
                return;
            }

        } else {
            // Only check for code duplicates if it's not an express line OR if the code actually changed
            if (lines[editingLineIndex].code !== newLineData.code) {
                const existingIndexWithCode = lines.findIndex((line, index) => line.code === newLineData.code && index !== editingLineIndex);
                if (existingIndexWithCode !== -1) {
                    alert(`A line with code "${lineCode}" already exists.`);
                    return;
                }
            }
            originalLineUpdated = true; // Mark that an original line was potentially updated
        }

        lines[editingLineIndex] = newLineData;
        console.log("Edited line saved:", newLineData); // Log the saved line

        // --- CORRECTED LOGIC: Update Express Lines if Original Line Changed ---
        if (originalLineUpdated) {
            const updatedOriginalLine = lines[editingLineIndex]; // The line just saved
            const originalCode = updatedOriginalLine.code;
            const newStartStation = updatedOriginalLine.stations[0];
            const newEndStation = updatedOriginalLine.stations[updatedOriginalLine.stations.length - 1];

            // Iterate through all lines to find associated express lines
            lines.forEach((line, index) => {
                if (line.originalLineCode === originalCode) {
                    // This is an express line associated with the edited original line
                    const currentExpressStations = [...line.stations]; // Copy current stations

                    // Build the new station list, preserving intermediates
                    let newExpressStations = [];

                    // Add the new start station
                    newExpressStations.push(newStartStation);

                    // Add intermediate stations (excluding old start/end)
                    for (let i = 1; i < currentExpressStations.length - 1; i++) {
                        const intermediateStation = currentExpressStations[i];
                        // Only add if it's not the new start or new end AND it still exists in the updated original line
                        if (intermediateStation !== newStartStation && intermediateStation !== newEndStation && updatedOriginalLine.stations.includes(intermediateStation)) {
                            newExpressStations.push(intermediateStation);
                        }
                    }

                    // Add the new end station (only if different from start)
                    if (newStartStation !== newEndStation) {
                        newExpressStations.push(newEndStation);
                    }

                    // Remove duplicates from the final list (handles cases where new start/end might have been intermediates)
                    lines[index].stations = newExpressStations.filter((value, idx, self) => self.indexOf(value) === idx);

                    console.log(`Updated express line "${line.code}" endpoints and preserved intermediates based on original line "${originalCode}". New stations: ${lines[index].stations.join(', ')}`);
                }
            });
        }
        // --- END CORRECTED LOGIC ---

    } else { // Adding new line
        // Check for duplicate code
        if (lines.some(line => line.code === newLineData.code)) {
            alert(`A line with code "${lineCode}" already exists.`);
            return;
        }
        lines.push(newLineData);
        console.log("New line added:", newLineData); // Log the new line
    }

    // If execution reaches here, validation passed and line was added/updated.
    update(); // Redraw canvas
    updateStationStats(); // Update stats panel
    updateLinesUI(); // Update the list of lines on the right
    lineModal.style.display = 'none'; // Hide the modal
    resetLineForm(); // Reset the form fields
});


deleteLineBtn.addEventListener('click', function () {
    if (editingLineIndex !== null && confirm("Are you sure you want to delete this line?")) {
        // Check if deleting an original line that has express lines
        const lineToDelete = lines[editingLineIndex];
        if (!lineToDelete.originalLineCode) { // It's an original line
            const dependentExpressLines = lines.filter(l => l.originalLineCode === lineToDelete.code);
            if (dependentExpressLines.length > 0) {
                const expressCodes = dependentExpressLines.map(l => l.code).join(', ');
                if (!confirm(`Deleting line "${lineToDelete.code}" will also delete its express lines: ${expressCodes}. Continue?`)) {
                    return; // User cancelled
                }
                // Filter out the dependent express lines
                lines = lines.filter(l => l.originalLineCode !== lineToDelete.code);
            }
        }

        // Delete the target line itself (adjust index if express lines were removed before it)
        const actualIndexToDelete = lines.findIndex(l => l.code === lineToDelete.code);
        if (actualIndexToDelete !== -1) {
            lines.splice(actualIndexToDelete, 1);
        }


        update();
        updateStationStats();
        updateLinesUI();
        lineModal.style.display = 'none';
        resetLineForm();
    }
});

createExpressServiceBtn.addEventListener('click', function () {
    if (editingLineIndex === null) return; // Only available when editing

    const originalLine = lines[editingLineIndex];
    expressStationsList.innerHTML = ''; // Clear previous list

    originalLine.stations.forEach(stationName => {
        const listItem = document.createElement('li');
        listItem.textContent = stationName;
        listItem.dataset.stationName = stationName; // Store station name
        listItem.addEventListener('click', () => {
            listItem.classList.toggle('selected-station');
            // Automatically select/deselect endpoints if they are clicked
            if (stationName === originalLine.stations[0] || stationName === originalLine.stations[originalLine.stations.length - 1]) {
                listItem.classList.add('selected-station'); // Endpoints must be selected
            }
        });
        // Pre-select endpoints
        if (stationName === originalLine.stations[0] || stationName === originalLine.stations[originalLine.stations.length - 1]) {
            listItem.classList.add('selected-station');
        }
        expressStationsList.appendChild(listItem);
    });

    expressServiceModal.style.display = 'block';
});

createExpressLineBtn.addEventListener('click', function () {
    const selectedStationsItems = Array.from(expressStationsList.querySelectorAll('li.selected-station'));
    const selectedStationNames = selectedStationsItems.map(li => li.dataset.stationName);


    if (selectedStationNames.length < 2) {
        alert("Please select at least two stations for the express service (endpoints are mandatory).");
        return;
    }

    // Ensure endpoints are selected
    const originalLine = lines[editingLineIndex];
    const startStation = originalLine.stations[0];
    const endStation = originalLine.stations[originalLine.stations.length - 1];
    if (!selectedStationNames.includes(startStation) || !selectedStationNames.includes(endStation)) {
        alert("The start and end stations of the original line must be included in the express service.");
        return;
    }


    // Sort selected stations based on their order in the original line
    const sortedSelectedStations = originalLine.stations.filter(stationName => selectedStationNames.includes(stationName));


    // Generate a unique code for the express line: first letter of original code + "X"
    let expressCodeBase = `${originalLine.code.charAt(0)}X`;
    let expressCode = expressCodeBase;
    let counter = 1;
    while (lines.some(line => line.code === expressCode)) {
        expressCode = `${expressCodeBase}${counter}`; // Try X1, X2 etc. if X is taken
        if (expressCode.length > 2) { // Prevent overly long codes, fallback needed maybe?
            // Fallback or error - For now, just alert
            alert("Could not generate a unique 2-character code starting with " + expressCodeBase);
            return;
        }
        counter++;
    }


    const newExpressLine = {
        name: `${originalLine.name} Express`,
        code: expressCode,
        color: originalLine.color, // Inherit color
        type: originalLine.type,   // Inherit type
        stations: sortedSelectedStations, // Use sorted selected stations
        assignedTrain: originalLine.assignedTrain, // Inherit assigned train
        trainQuantity: originalLine.trainQuantity, // Inherit train quantity
        originalLineCode: originalLine.code // Store reference to original line
    };

    lines.push(newExpressLine);

    update();
    updateStationStats();
    updateLinesUI();
    expressServiceModal.style.display = 'none';
    alert(`Express line "${newExpressLine.code}" created successfully!`);
});


// *** START OF UPDATED FUNCTION: plusButtonsContainer.addEventListener('click', ...) ***
plusButtonsContainer.addEventListener('click', (event) => {
    const clickedButton = event.target.closest('.plus-button');
    if (!clickedButton) return;

    // Only trigger if the clicked button is empty or explicitly a "+"
    if (clickedButton.textContent.trim() === '+' || clickedButton.innerHTML.trim() === '+') {
        modalList.innerHTML = '';  // Clear the modal list content safely
        const lineTypeRadio = document.querySelector('input[name="lineType"]:checked');
        const selectedLineType = lineTypeRadio ? lineTypeRadio.value : null;

        const isEditingExpress = editingLineIndex !== null && lines[editingLineIndex].originalLineCode;
        let originalLineStations = [];
        if (isEditingExpress) {
            const originalLine = lines.find(l => l.code === lines[editingLineIndex].originalLineCode);
            if (originalLine) {
                originalLineStations = originalLine.stations;
            } else {
                console.error("Original line not found when trying to add station to express line.");
                // Optionally disable adding or alert user
            }
        }

        stations.forEach(item => {
            // Filter stations by selected line type
            if (selectedLineType && !item.location.includes(selectedLineType)) return;

            // If editing express, only show stations present in the original line
            if (isEditingExpress && !originalLineStations.includes(item.name)) {
                return;
            }

            // Check if station is already in the list (prevent duplicates)
            const currentStationNamesInEditor = Array.from(plusButtonsContainer.querySelectorAll('.plus-button span')).map(span => span.textContent.trim());
            if (currentStationNamesInEditor.includes(item.name)) {
                return; // Don't show already added stations in the modal
            }


            const listItem = document.createElement('li');
            listItem.textContent = item.name;

            listItem.onclick = () => {
                // Prevent adding the same station twice in a row (redundant check now, but keep for safety)
                const currentButtons = plusButtonsContainer.querySelectorAll('.plus-button');
                const currentStations = Array.from(currentButtons).map(btn => btn.querySelector('span')?.textContent.trim()).filter(Boolean);

                if (currentStations.length > 0 && currentStations[currentStations.length - 1] === item.name) {
                    alert("Cannot add the same station twice in a row.");
                    listModal.style.display = 'none'; // Close modal even if validation fails
                    return;
                }

                // --- Express Line Specific Adding Logic ---
                if (isEditingExpress) {
                    const originalLineCode = lines[editingLineIndex].originalLineCode;
                    const originalLine = lines.find(l => l.code === originalLineCode);

                    if (!originalLine) {
                        console.error("Original line not found for express edit!");
                        listModal.style.display = 'none';
                        return; // Stop if original line is missing
                    }

                    const newItemName = item.name; // Station name to add

                    // Get current stations in the editor (excluding the final '+')
                    const currentStationButtonsInEditor = Array.from(plusButtonsContainer.querySelectorAll('.plus-button span'));
                    const currentStationNamesInEditor = currentStationButtonsInEditor.map(span => span.textContent.trim());

                    // Create a combined list including the new station
                    const potentialStations = [...currentStationNamesInEditor, newItemName];

                    // Filter this list based on the original line's order
                    const orderedStations = originalLine.stations.filter(stationName => potentialStations.includes(stationName));

                    // Find the index where the new item *should be* in the ordered list
                    const insertAtIndex = orderedStations.indexOf(newItemName);

                    // Find the DOM element to insert before (could be another station button or the final '+')
                    // plusButtonsContainer.children includes the final '+' button if it exists
                    const insertBeforeButton = plusButtonsContainer.children[insertAtIndex];

                    // Create the new station button element
                    const button = document.createElement('button');
                    button.classList.add('plus-button');

                    const container = document.createElement('div');
                    container.style.display = 'flex';
                    container.style.alignItems = 'center';
                    container.style.justifyContent = 'space-between';
                    container.style.width = '100%';

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = newItemName;

                    const btnGroup = document.createElement('div');
                    btnGroup.classList.add('btn-group'); // Add class for styling if needed
                    btnGroup.style.display = 'flex';
                    btnGroup.style.gap = '4px';

                    const upBtn = document.createElement('button');
                    upBtn.textContent = '↑';
                    upBtn.disabled = true; // Disable for express lines
                    upBtn.onclick = (e) => e.stopPropagation(); // Prevent default if needed

                    const downBtn = document.createElement('button');
                    downBtn.textContent = '↓';
                    downBtn.disabled = true; // Disable for express lines
                    downBtn.onclick = (e) => e.stopPropagation();

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '×';
                    // Enable deletion for added intermediate stations, disable for original endpoints
                    const isEndpoint = newItemName === originalLine.stations[0] || newItemName === originalLine.stations[originalLine.stations.length - 1];
                    deleteBtn.disabled = isEndpoint;
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        button.remove();
                        // Ensure there's always a trailing "+" if all stations are removed
                        if (plusButtonsContainer.querySelectorAll('.plus-button span').length === 0 && plusButtonsContainer.innerHTML.trim() === '') {
                            const newPlusButton = document.createElement('button');
                            newPlusButton.classList.add('plus-button');
                            newPlusButton.textContent = '+';
                            plusButtonsContainer.appendChild(newPlusButton);
                        }
                    };

                    btnGroup.appendChild(upBtn);
                    btnGroup.appendChild(downBtn);
                    btnGroup.appendChild(deleteBtn);

                    container.appendChild(nameSpan);
                    container.appendChild(btnGroup);
                    button.appendChild(container);

                    // Insert the new button at the calculated position
                    plusButtonsContainer.insertBefore(button, insertBeforeButton);

                    listModal.style.display = 'none'; // Close the modal
                    return; // Important: Stop execution here to prevent default append logic
                }
                // --- End Express Line Specific Adding Logic ---


                // --- Default Adding Logic (for non-express lines) ---
                clickedButton.innerHTML = ''; // Clear the "+" button's content
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'space-between';
                container.style.width = '100%';

                const nameSpan = document.createElement('span');
                nameSpan.textContent = item.name; // Add the station name here

                const btnGroup = document.createElement('div');
                btnGroup.classList.add('btn-group'); // Add class for styling if needed
                btnGroup.style.display = 'flex';
                btnGroup.style.gap = '4px';

                const upBtn = document.createElement('button');
                upBtn.textContent = '↑';
                upBtn.onclick = (e) => {
                    e.stopPropagation();
                    const prev = clickedButton.previousElementSibling;
                    if (prev && prev.classList.contains('plus-button')) {
                        plusButtonsContainer.insertBefore(clickedButton, prev);
                    }
                };

                const downBtn = document.createElement('button');
                downBtn.textContent = '↓';
                downBtn.onclick = (e) => {
                    e.stopPropagation();
                    const next = clickedButton.nextElementSibling;
                    if (next && next.classList.contains('plus-button')) {
                        plusButtonsContainer.insertBefore(next, clickedButton);
                    }
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    clickedButton.remove();
                    // Ensure there's always a trailing "+" if all stations are removed
                    if (plusButtonsContainer.querySelectorAll('.plus-button span').length === 0 && plusButtonsContainer.innerHTML.trim() === '') {
                        const newPlusButton = document.createElement('button');
                        newPlusButton.classList.add('plus-button');
                        newPlusButton.textContent = '+';
                        plusButtonsContainer.appendChild(newPlusButton);
                    }
                };

                btnGroup.appendChild(upBtn);
                btnGroup.appendChild(downBtn);
                btnGroup.appendChild(deleteBtn);

                container.appendChild(nameSpan);
                container.appendChild(btnGroup);
                clickedButton.appendChild(container);

                // Add a new trailing "+" button if the one we just filled was the last one
                if (clickedButton === plusButtonsContainer.lastElementChild) {
                    const newPlusButton = document.createElement('button');
                    newPlusButton.classList.add('plus-button');
                    newPlusButton.textContent = '+';
                    plusButtonsContainer.appendChild(newPlusButton);
                }
                // --- End Default Adding Logic ---

                listModal.style.display = 'none'; // Close the station list modal
            };

            modalList.appendChild(listItem);
        });
        listModal.style.display = 'block';
    }
});
// *** END OF UPDATED FUNCTION: plusButtonsContainer.addEventListener('click', ...) ***


// *** START OF UPDATED FUNCTION: updateLinesUI() ***
function updateLinesUI() {
    const lineListElement = document.getElementById('lineListItems'); // Renamed variable
    if (!lineListElement) { // Check if element exists
        console.error("Element with ID 'lineListItems' not found.");
        return;
    }
    lineListElement.innerHTML = ''; // Clear the list

    lines.forEach((line, index) => {
        const lineItem = document.createElement('li');
        lineItem.classList.add('line-item'); // Add class for styling

        const label = document.createElement('span');
        label.textContent = `${line.code} - ${line.name || ''}`; // Display code and name
        label.style.color = line.color || 'black'; // Apply line color to the label
        if (line.originalLineCode) {
            label.style.fontStyle = 'italic'; // Indicate express line in the list
            label.title = `Express service for line ${line.originalLineCode}`;
        }

        // Hover effect - less relevant for touch, but keep for mouse
        label.addEventListener('mouseenter', () => hoveredLine = line);
        label.addEventListener('mouseleave', () => hoveredLine = null);

        // Click/Tap handler to open edit modal
        const openEditModal = () => {
            // Populate form for editing
            document.getElementById('lineModalTitle').textContent = `Edit Line: ${line.code}`;
            document.getElementById('saveLine').textContent = 'Save Changes';
            document.getElementById('deleteLine').style.display = 'inline-block'; // Show delete button

            // Only show "Create Express Service" button if it's NOT an express line
            if (!line.originalLineCode) {
                createExpressServiceBtn.style.display = 'inline-block';
            } else {
                createExpressServiceBtn.style.display = 'none';
            }


            editingLineIndex = index; // Store index for saving

            document.getElementById('lineName').value = line.name;
            document.getElementById('lineCode').value = line.code;
            document.getElementById('lineColor').value = line.color;

            document.querySelectorAll('input[name="lineType"]').forEach(r => {
                r.checked = r.value === line.type;
            });

            plusButtonsContainer.innerHTML = ''; // Clear previous buttons
            selectedValues.clear();

            const isExpressLine = !!line.originalLineCode; // Check if it's an express line

            // Populate the station buttons in the modal
            line.stations.forEach((name, i) => {
                const isEndpoint = isExpressLine && (i === 0 || i === line.stations.length - 1);

                const button = document.createElement('button');
                button.classList.add('plus-button');
                if (isEndpoint) {
                    button.style.borderColor = '#aaa'; // Visually indicate fixed endpoint
                    button.title = "Endpoint fixed by original line";
                }

                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.justifyContent = 'space-between';
                container.style.alignItems = 'center';
                container.style.width = '100%';

                const nameSpan = document.createElement('span');
                nameSpan.textContent = name;
                if (isEndpoint) {
                    nameSpan.style.color = '#555'; // Dim text for fixed endpoint
                }

                const btnGroup = document.createElement('div');
                btnGroup.classList.add('btn-group'); // Add class for styling if needed
                btnGroup.style.display = 'flex';
                btnGroup.style.gap = '4px';

                const upBtn = document.createElement('button');
                upBtn.classList.add("btn");
                upBtn.classList.add("btn-outline-primary");
                upBtn.textContent = '↑';
                // Disable up/down for ALL stations if it's an express line
                upBtn.disabled = isExpressLine;
                upBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (isExpressLine) return; // Double-check disabled state
                    const prev = button.previousElementSibling;
                    if (prev && prev.classList.contains('plus-button')) {
                        plusButtonsContainer.insertBefore(button, prev);
                    }
                };

                const downBtn = document.createElement('button');
                downBtn.classList.add("btn");
                downBtn.classList.add("btn-outline-primary");
                downBtn.textContent = '↓';
                // Disable up/down for ALL stations if it's an express line
                downBtn.disabled = isExpressLine;
                downBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (isExpressLine) return; // Double-check disabled state
                    const next = button.nextElementSibling;
                    if (next && next.classList.contains('plus-button')) {
                        plusButtonsContainer.insertBefore(next, button);
                    }
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add("btn");
                deleteBtn.classList.add("btn-outline-danger");
                deleteBtn.textContent = '×';
                // Disable delete ONLY for endpoints if it's an express line
                deleteBtn.disabled = isEndpoint;
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (isEndpoint) return; // Double-check disabled state
                    button.remove();
                    // Ensure there's always a trailing "+" if all stations are removed
                    if (plusButtonsContainer.querySelectorAll('.plus-button span').length === 0 && plusButtonsContainer.innerHTML.trim() === '') {
                        const newPlusButton = document.createElement('button');
                        newPlusButton.classList.add('plus-button');
                        newPlusButton.textContent = '+';
                        plusButtonsContainer.appendChild(newPlusButton);
                    }
                };

                btnGroup.appendChild(upBtn);
                btnGroup.appendChild(downBtn);
                btnGroup.appendChild(deleteBtn);

                container.appendChild(nameSpan);
                container.appendChild(btnGroup);
                button.appendChild(container);

                plusButtonsContainer.appendChild(button);
            });

            // ALWAYS Add a trailing "+" button (logic inside plusButtonsContainer listener will handle adding)
            const trailingPlus = document.createElement('button');
            trailingPlus.classList.add('plus-button');
            trailingPlus.textContent = '+';
            plusButtonsContainer.appendChild(trailingPlus);


            editingLineIndex = index; // Set the index of the line being edited
            populateTrainSelect(line.assignedTrain); // Populate with current train
            // No need to set quantity here, populateTrainSelect handles it

            lineModal.style.display = 'block';
        };

        // Add event listeners for both click and touchstart (for tap)
        label.addEventListener('click', openEditModal);
        label.addEventListener('touchstart', (e) => {
            // Optional: Add a slight delay or visual feedback for touchstart
            // This helps distinguish scroll from tap on the list
        }, { passive: true }); // Passive if not preventing default
        label.addEventListener('touchend', (e) => {
            // Prevent triggering if it was likely a scroll
            // You might need more sophisticated tap detection here if needed
            openEditModal();
            e.preventDefault(); // Prevent potential ghost click
        });


        const editBtn = document.createElement('button');
        editBtn.classList.add("btn");
        editBtn.classList.add("btn-outline-info")
        editBtn.textContent = 'Edit'; // Changed text content to "Edit"
        editBtn.style.marginLeft = '8px';
        editBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent the list item click from also firing
            openEditModal(); // Trigger the same logic
        };
        // Add touch listener to button as well
        editBtn.addEventListener('touchend', (e) => {
            e.stopPropagation();
            openEditModal();
            e.preventDefault(); // Prevent potential ghost click
        });


        lineItem.appendChild(label);
        lineItem.appendChild(editBtn);
        lineListElement.appendChild(lineItem); // Use the renamed variable
    });
}
// *** END OF UPDATED FUNCTION: updateLinesUI() ***


closeModalButton.addEventListener('click', () => {
    listModal.style.display = 'none';
});

// Display lines connected to a station
function displayConnectedLines(stationName) {
    const connectedLines = lines.filter(line => line.stations.includes(stationName));
    const stationLinesList = document.getElementById('stationLinesList');
    stationLinesList.innerHTML = ''; // Clear previous list

    document.getElementById('connectedStationName').textContent = stationName;

    if (connectedLines.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No lines connected.';
        stationLinesList.appendChild(listItem);
    } else {
        connectedLines.forEach(line => {
            const listItem = document.createElement('li');
            const stationIndex = line.stations.indexOf(stationName);
            const stationNumber = stationIndex !== -1 ? stationIndex + 1 : '?'; // Get station number
            listItem.textContent = `${line.code}${stationNumber} - ${line.name || ''} (${line.type})` + (line.assignedTrain ? ` - Train: ${line.assignedTrain} (x${line.trainQuantity || 0})` : ''); // Display assigned train and quantity
            // Optional: Add click handler to highlight the line on the canvas
            listItem.style.cursor = 'pointer';
            // Hover less relevant on touch
            // listItem.addEventListener('mouseenter', () => hoveredLine = line);
            // listItem.addEventListener('mouseleave', () => hoveredLine = null);
            listItem.addEventListener('click', () => {
                // Maybe zoom to the line or highlight it more prominently
                // For now, just hovering provides visual feedback
            });
            stationLinesList.appendChild(listItem);
        });
    }

    stationLinesModal.style.display = 'block';
}


// Export
document.getElementById('exportBtn').addEventListener('click', () => {
    const data = {
        stations: stations,
        lines: lines,
        trains: trains // Include trains in export
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'station_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Import
document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importInput').click();
});

document.getElementById('importInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const json = JSON.parse(e.target.result);

            // --- Enhanced Validation ---
            // Basic structure validation
            if (!json || typeof json !== 'object' || !Array.isArray(json.stations) || !Array.isArray(json.lines) || !Array.isArray(json.trains)) {
                throw new Error("Invalid file format. Missing 'stations', 'lines', or 'trains' array.");
            }
            const stationNameMap = new Map(json.stations.map(station => [station.name, station]));
            const trainNameMap = new Map(json.trains.map(train => [train.name, train]));
            const lineCodeMap = new Map(json.lines.map(line => [line.code, line]));

            // Validate stations
            json.stations.forEach((station, index) => {
                if (!(typeof station === 'object' && station !== null && typeof station.id !== 'undefined' && typeof station.x === 'number' && typeof station.y === 'number' && typeof station.name === 'string' && station.name.trim() !== '' && Array.isArray(station.location) && station.location.every(loc => typeof loc === 'string' && ['underground', 'ground', 'suspended'].includes(loc)))) {
                    throw new Error(`Invalid station data at index ${index}. Check properties (id, x, y, name, location).`);
                }
            });
            const stationNames = json.stations.map(station => station.name);
            if (stationNames.length !== new Set(stationNames).size) throw new Error("Duplicate station names found.");

            // Validate trains
            json.trains.forEach((train, index) => {
                if (!(typeof train === 'object' && train !== null && typeof train.name === 'string' && train.name.trim() !== '' && typeof train.type === 'string' && ['underground', 'ground', 'suspended'].includes(train.type) && typeof train.quantity === 'number' && train.quantity >= 0)) {
                    throw new Error(`Invalid train data at index ${index}. Check properties (name, type, quantity).`);
                }
            });
            const trainNames = json.trains.map(train => train.name);
            if (trainNames.length !== new Set(trainNames).size) throw new Error("Duplicate train names found.");

            // Validate lines
            json.lines.forEach((line, index) => {
                if (!(typeof line === 'object' && line !== null && typeof line.name === 'string' && typeof line.code === 'string' && line.code.length === 2 && typeof line.color === 'string' && typeof line.type === 'string' && ['underground', 'ground', 'suspended'].includes(line.type) && Array.isArray(line.stations) && line.stations.length >= 2 && line.stations.every(stationName => typeof stationName === 'string') && (line.assignedTrain === null || typeof line.assignedTrain === 'undefined' || (typeof line.assignedTrain === 'string' && trainNameMap.has(line.assignedTrain))) && (typeof line.trainQuantity === 'undefined' || (typeof line.trainQuantity === 'number' && line.trainQuantity >= 0)) && (typeof line.originalLineCode === 'undefined' || (typeof line.originalLineCode === 'string' && lineCodeMap.has(line.originalLineCode))))) {
                    throw new Error(`Invalid line data at index ${index} (Code: ${line.code}). Check properties, station count, train/quantity, originalLineCode.`);
                }
            });
            const lineCodes = json.lines.map(line => line.code);
            if (lineCodes.length !== new Set(lineCodes).size) throw new Error("Duplicate line codes found.");

            // Validate references and consistency
            for (const line of json.lines) {
                if (!line.stations.every(stationName => stationNameMap.has(stationName))) throw new Error(`Line "${line.code}" contains unknown station names.`);
                for (let i = 0; i < line.stations.length - 1; i++) if (line.stations[i] === line.stations[i + 1]) throw new Error(`Line "${line.code}" has consecutive duplicate station: "${line.stations[i]}".`);
                if (!line.stations.every(stationName => stationNameMap.get(stationName)?.location.includes(line.type))) throw new Error(`Line "${line.code}" contains stations not matching line type (${line.type}).`);
                if (line.assignedTrain) {
                    const assignedTrainObj = trainNameMap.get(line.assignedTrain);
                    if (!assignedTrainObj || assignedTrainObj.type !== line.type) throw new Error(`Assigned train "${line.assignedTrain}" on line "${line.code}" does not match line type.`);
                    if (typeof line.trainQuantity !== 'number' || line.trainQuantity < 0 || line.trainQuantity > assignedTrainObj.quantity) throw new Error(`Invalid train quantity for train "${line.assignedTrain}" on line "${line.code}". Max: ${assignedTrainObj.quantity}, Found: ${line.trainQuantity}.`);
                } else if (line.trainQuantity > 0) throw new Error(`Train quantity specified for line "${line.code}" but no train assigned.`);
                if (line.originalLineCode) {
                    const originalLine = lineCodeMap.get(line.originalLineCode);
                    if (!originalLine) throw new Error(`Express line "${line.code}" references non-existent original line "${line.originalLineCode}".`);
                    if (!line.stations.every(stationName => originalLine.stations.includes(stationName))) throw new Error(`Express line "${line.code}" contains stations not in original line "${originalLine.code}".`);
                    if (line.stations[0] !== originalLine.stations[0] || line.stations[line.stations.length - 1] !== originalLine.stations[originalLine.stations.length - 1]) throw new Error(`Express line "${line.code}" endpoints do not match original line "${originalLine.code}".`);
                    if (line.type !== originalLine.type) throw new Error(`Express line "${line.code}" type does not match original line "${originalLine.code}".`);
                }
            }
            // --- End Enhanced Validation ---


            // If all validation passes, load the data
            stations = json.stations;
            lines = json.lines;
            trains = json.trains; // Load trains from the imported data
            update();
            updateLinesUI();
            updateStationStats();
            alert("Data imported successfully!");

        } catch (err) {
            alert("Import Error: " + err.message); // Display specific validation error
        }
        // Clear the file input so the same file can be imported again if needed
        event.target.value = null;
    };
    reader.readAsText(file);
});


document.getElementById('refocusBtn').addEventListener('click', () => {
    panZoom.scale = 1.0;
    panZoom.x = 0;
    panZoom.y = 0;
    update();
});

