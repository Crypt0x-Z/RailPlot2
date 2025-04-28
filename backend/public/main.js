//canvas stuff
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

// mobile canvas stuff
var isPanning = false;
var isPinching = false;
var lastTouchX = 0;
var lastTouchY = 0;
var initialPinchDistance = 0;
var pinchCenterX = 0;
var pinchCenterY = 0;
var lastTapTime = 0;
const doubleTapDelay = 300; // checks for double taps in mobile

// scaling stuff
const mouse = { x: 0, y: 0, button: false, wheel: 0, lastX: 0, lastY: 0, drag: false, downX: 0, downY: 0 };
const gridLimit = 64;
const gridSize = 128;
const scaleRate = 1.02;
const topLeft = { x: 0, y: 0 };
const lineOffsetAmount = 8; // line overlap
var zoomDisabled = 0;

// lists stuff
var stations = [];
var lines = [];
var trains = [];

// station select
var selectedStation = null;
var newStationWorldCoord = null;
var hoveredLine = null;
var editingLineIndex = null; // which line is being edited

const newItemInput = document.getElementById('new-item');
const addButton = document.getElementById('add-button');
const showModalButton = document.getElementById('show-modal-button');
const listModal = document.getElementById('list-modal');
const modalList = document.getElementById('modal-list');
const closeModalButton = document.getElementById('close-modal-button');
const plusButtonsContainer = document.getElementById('plus-buttons-container');
var selectedValues = new Set();
var recentlySelected = null;

// modal indentify
const stationModal = document.getElementById("stationModal");
const lineModal = document.getElementById("addLineModal"); // Renamed for clarity
const stationLinesModal = document.getElementById("stationLinesModal");

const closeStationModalBtn = document.querySelector(".station-modal-close");
const closeLineModalBtn = document.querySelector(".line-modal-close");
const closeStationLinesModalBtn = document.querySelector(".station-lines-modal-close");


// close modal
closeStationModalBtn.onclick = function () {
    stationModal.style.display = "none";
}

closeLineModalBtn.onclick = function () {
    lineModal.style.display = "none";
    resetLineForm();
}

closeStationLinesModalBtn.onclick = function () {
    stationLinesModal.style.display = "none";
}

closeExpressServiceModalBtn.onclick = function () {
    expressServiceModal.style.display = "none";
}


// close modal when clicking outside modal
window.onclick = function (event) {
    if (event.target == stationModal) {
        stationModal.style.display = "none";
    }
    if (event.target == lineModal) {
        lineModal.style.display = "none";
        resetLineForm();
    }
    if (event.target == stationLinesModal) {
        stationLinesModal.style.display = "none";
    }
    if (event.target == expressServiceModal) {
        expressServiceModal.style.display = "none";
    }
    if (event.target == listModal) {
        listModal.style.display = "none";
    }
};

// mouse events
canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = 'default';
    mouse.button = false;
    mouse.drag = false;
});

canvas.addEventListener('mouseenter', () => {
    canvas.style.cursor = 'none';
});

function updateStationStats() {
    const totalStations = stations.length;
    const groundStations = stations.filter(s => s.location.includes('ground')).length;
    const undergroundStations = stations.filter(s => s.location.includes('underground')).length;
    const suspendedStations = stations.filter(s => s.location.includes('suspended')).length;

    // checks
    const totalStationsEl = document.getElementById('totalStations');
    const groundStationsEl = document.getElementById('groundStations');
    const undergroundStationsEl = document.getElementById('undergroundStations');
    const suspendedStationsEl = document.getElementById('suspendedStations');

    if (totalStationsEl) totalStationsEl.textContent = totalStations;
    if (groundStationsEl) groundStationsEl.textContent = groundStations;
    if (undergroundStationsEl) undergroundStationsEl.textContent = undergroundStations;
    if (suspendedStationsEl) suspendedStationsEl.textContent = suspendedStations;

    // calcs
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

    // update stats
    const totalTrains = trains.reduce((sum, train) => sum + train.capacity, 0);
    const groundTrains = trains.filter(t => t.type === 'ground').reduce((sum, train) => sum + train.capacity, 0);
    const undergroundTrains = trains.filter(t => t.type === 'underground').reduce((sum, train) => sum + train.capacity, 0);
    const suspendedTrains = trains.filter(t => t.type === 'suspended').reduce((sum, train) => sum + train.capacity, 0);

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
    handleResize();
    update();
    updateStationStats();
    updateLinesUI();
}


document.addEventListener("DOMContentLoaded", fetchStations);
window.addEventListener('resize', handleResize);


function clearGrid() {
    if (!confirm("Are you sure you want to delete all stations and lines? This action cannot be undone.")) {
        return;
    }
    stations = [];
    lines = [];
    update();
    updateLinesUI();
    updateStationStats();
}

document.getElementById('clearGridBtn').addEventListener('click', clearGrid);


function mouseEvents(e) {
    const bounds = canvas.getBoundingClientRect();
    mouse.x = e.pageX - bounds.left - scrollX;
    mouse.y = e.pageY - bounds.top - scrollY;
    if (e.type === "mousedown") {
        mouse.button = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
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

["mousedown", "mouseup", "mousemove"].forEach(name => document.addEventListener(name, mouseEvents));
canvas.addEventListener("wheel", mouseEvents, { passive: false });


// touch events (mobile)
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

// remember mouse pos for touch pos (start same)
// no mouse events during touch
function handleTouchStart(e) {
    mouse.button = false;

    if (e.touches.length === 1) {
        const touchPos = getTouchPos(e.touches[0]);
        isPanning = true;
        isPinching = false;
        lastTouchX = touchPos.x;
        lastTouchY = touchPos.y;
        mouse.downX = touchPos.x;
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

// touch controls
function handleTouchMove(e) {
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
        const center = getPinchCenter(e.touches);

        const currentZoomDisabled = zoomDisabled;
        panZoom.scaleAt(center.x, center.y, scale);

        if (zoomDisabled === 0 || (currentZoomDisabled !== zoomDisabled)) {
            initialPinchDistance = currentDistance;
        }
    }
}

function handleTouchEnd(e) {

    if (e.touches.length < 2) {
        isPinching = false;
    }
    if (e.touches.length < 1) {
        isPanning = false;
    }

    const touchPos = getTouchPos(e.changedTouches[0]);
    const distance = Math.sqrt((touchPos.x - mouse.downX) ** 2 + (touchPos.y - mouse.downY) ** 2);
}

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false }); // Handle cancellation

const panZoom = {
    x: 0,
    y: 0,
    scale: 1,
    apply(ctxToUse = ctx) { ctxToUse.setTransform(this.scale, 0, 0, this.scale, this.x, this.y) },
    scaleAt(x, y, sc) {
        const previousScale = this.scale;
        let newScale = this.scale * sc;
        newScale = Math.max(0.5, Math.min(newScale, 3)); // Limit zoom here

        // zoom limit
        if ((newScale === 3 && sc > 1) || (newScale === 0.5 && sc < 1)) {
            zoomDisabled = newScale === 3 ? 1 : -1;
            return;
        }

        const actualScaleChange = newScale / previousScale;
        this.scale = newScale;

        this.x = x - (x - this.x) * actualScaleChange;
        this.y = y - (y - this.y) * actualScaleChange;

        if (this.scale >= 3) {
            zoomDisabled = 1;
        } else if (this.scale <= 0.5) {
            zoomDisabled = -1;
        } else {
            zoomDisabled = 0;
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

// grid for canvas
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
    ctx.lineWidth = 1 / panZoom.scale;
    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    for (let i = 0; i < size; i += gridScale) {
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + size);
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + size, y + i);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.stroke();
}

function drawPoint(x, y) {
    if (isPanning || isPinching) return;

    const size = 8;
    const ringRadius = 6;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x - 2, y);
    ctx.moveTo(x + 2, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y - 2);
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x, y + size);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// station drawing on canvas
function drawStation(station) {
    panZoom.apply();
    const baseRadius = 8;
    const baseLineWidth = 2;
    const scaledRadius = baseRadius / Math.sqrt(panZoom.scale);
    const scaledLineWidth = baseLineWidth / panZoom.scale;
    const scaledFontSize = 12 / panZoom.scale;
    const scaledLabelOffset = 20 / panZoom.scale;
    const scaledLineLabelOffset = 35 / panZoom.scale;
    const scaledLineLabelGap = 12 / panZoom.scale;
    const scaledLineLabelFontSize = 10 / panZoom.scale;


    ctx.lineWidth = scaledLineWidth;

    const typeColors = {
        ground: "yellow",
        underground: "red",
        suspended: "blue"
    };

    const types = Array.isArray(station.location) ? station.location : [];

    const centerX = station.x;
    const centerY = station.y;


    // station ring color for type
    if (types.length > 0) {
        const arcSize = (2 * Math.PI) / types.length;
        ctx.lineWidth = scaledLineWidth * 1.5;
        for (let i = 0; i < types.length; i++) {
            const startAngle = i * arcSize - Math.PI / 2;
            const endAngle = (i + 1) * arcSize - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, scaledRadius, startAngle, endAngle);
            ctx.strokeStyle = typeColors[types[i]] || "black";
            ctx.stroke();
        }
    }


    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(1, 3 / panZoom.scale), 0, 2 * Math.PI);
    ctx.fill();

    if (panZoom.scale > 0.6) {
        ctx.fillStyle = "black";
        ctx.font = `${scaledFontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(station.name, centerX, centerY + scaledLabelOffset);

        // japan style line code for station
        const connectedLineLabels = [];
        lines.forEach(line => {
            const stationIndex = line.stations.indexOf(station.name);
            if (stationIndex !== -1) {
                const stationNumber = stationIndex + 1;
                connectedLineLabels.push({
                    text: `${line.code}${stationNumber}`,
                    color: line.color || 'black'
                });
            }
        });

        let textOffsetY = centerY + scaledLineLabelOffset;
        ctx.font = `bold ${scaledLineLabelFontSize}px Arial`;
        connectedLineLabels.forEach(labelInfo => {
            ctx.fillStyle = labelInfo.color;
            ctx.fillText(labelInfo.text, centerX, textOffsetY);
            textOffsetY += scaledLineLabelGap;
        });
    }


    ctx.setTransform(1, 0, 0, 1, 0, 0);
}


var w = canvas.width;
var h = canvas.height;

// resize handling
function handleResize() {
    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 50;
    const statsPanelHeight = document.getElementById('statsPanel')?.offsetHeight || 60;
    w = canvas.width = window.visualViewport ? window.visualViewport.width : innerWidth;
    h = canvas.height = (window.visualViewport ? window.visualViewport.height : innerHeight) - navbarHeight - statsPanelHeight - (window.visualViewport ? window.visualViewport.offsetTop : 0);

    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('padding-top')) || 0;
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('padding-bottom')) || 0;
    h -= (safeAreaTop + safeAreaBottom);
    update();
}

// Draw loop
function update() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    ctx.clearRect(0, 0, w, h);

    // mouse zoom
    if (mouse.wheel !== 0) {
        let scale = 1;
        scale = mouse.wheel < 0 ? 1 / scaleRate : scaleRate;
        if ((panZoom.scale <= 0.5 && scale < 1) || (panZoom.scale >= 3 && scale > 1)) {
            // Zoom limits reached
        } else {
            panZoom.scaleAt(mouse.x, mouse.y, scale);
        }
        mouse.wheel *= 0.8;
        if (Math.abs(mouse.wheel) < 1) {
            mouse.wheel = 0;
        }
    }

    // mouase pan
    if (mouse.button && !isPanning && !isPinching) {
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

    // bg grid
    drawGrid(gridSize, true);

    // line draw
    const segmentUsage = {};

    // tracks (line overlapping doesn't happen)
    lines.forEach((line, lineIndex) => {
        let physicalStations = line.stations;
        if (line.originalLineCode) {
            const originalLine = lines.find(ol => ol.code === line.originalLineCode);
            if (originalLine) {
                physicalStations = originalLine.stations;
            } else {
                console.warn(`Original line ${line.originalLineCode} not found for express line ${line.code}`);
            }
        }

        // iterate throught segments PHYSICAL
        for (let i = 0; i < physicalStations.length - 1; i++) {
            const stationA_name = physicalStations[i];
            const stationB_name = physicalStations[i + 1];
            const stationA = stations.find(s => s.name === stationA_name);
            const stationB = stations.find(s => s.name === stationB_name);

            if (stationA && stationB) {
                // consistancy
                const keyPart1 = stationA.name < stationB.name ? stationA.name : stationB.name;
                const keyPart2 = stationA.name < stationB.name ? stationB.name : stationA.name;
                const segmentKey = `${keyPart1}->${keyPart2}`;

                if (!segmentUsage[segmentKey]) {
                    segmentUsage[segmentKey] = [];
                }
                if (!segmentUsage[segmentKey].some(entry => entry.code === line.code)) {
                    segmentUsage[segmentKey].push({ index: lineIndex, code: line.code });
                }
            }
        }
    });

    // sort lines in segments by line code
    for (const segmentKey in segmentUsage) {
        segmentUsage[segmentKey].sort((a, b) => a.code.localeCompare(b.code));
    }

    // draw lines
    lines.forEach((line, lineIndex) => {
        const isHovered = hoveredLine && hoveredLine.code === line.code;
        const serviceStations = line.stations;

        if (serviceStations.length < 2) return;

        ctx.beginPath();
        panZoom.apply();
        ctx.strokeStyle = isHovered ? 'orange' : (line.color || '#000');
        ctx.lineWidth = (isHovered ? 6 : 4) / panZoom.scale;

        let physicalStations = serviceStations;
        if (line.originalLineCode) {
            const originalLine = lines.find(ol => ol.code === line.originalLineCode);
            if (originalLine) {
                physicalStations = originalLine.stations;
            }
        }

        // iterate throught segments SERVICE
        for (let i = 0; i < serviceStations.length - 1; i++) {
            const currentServiceStationName = serviceStations[i];
            const nextServiceStationName = serviceStations[i + 1];

            const physicalIndexCurrent = physicalStations.indexOf(currentServiceStationName);
            const physicalIndexNext = physicalStations.indexOf(nextServiceStationName);

            if (physicalIndexCurrent !== -1 && physicalIndexNext !== -1) {
                const step = physicalIndexCurrent < physicalIndexNext ? 1 : -1;

                // iterate through the PHYSICAL segments between the current and next SERVICE stations
                for (let j = physicalIndexCurrent; j !== physicalIndexNext; j += step) {
                    const physicalStationA_name = physicalStations[j];
                    const physicalStationB_name = physicalStations[j + step];

                    const stationA = stations.find(s => s.name === physicalStationA_name);
                    const stationB = stations.find(s => s.name === physicalStationB_name);

                    if (stationA && stationB) {
                        // consistancy
                        const keyPart1 = stationA.name < stationB.name ? stationA.name : stationB.name;
                        const keyPart2 = stationA.name < stationB.name ? stationB.name : stationA.name;
                        const segmentKey = `${keyPart1}->${keyPart2}`;

                        const linesUsingSegment = segmentUsage[segmentKey] || [];
                        const numOverlappingLines = linesUsingSegment.length;
                        let offsetX = 0;
                        let offsetY = 0;

                        if (numOverlappingLines > 1) {
                            const lineEntryIndexInSegment = linesUsingSegment.findIndex(entry => entry.code === line.code);
                            if (lineEntryIndexInSegment !== -1) {
                                const offsetIndex = lineEntryIndexInSegment - (numOverlappingLines - 1) / 2;
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

                        if (j === physicalIndexCurrent) {
                            ctx.moveTo(stationA.x + offsetX, stationA.y + offsetY);
                        }
                        ctx.lineTo(stationB.x + offsetX, stationB.y + offsetY);

                        // line number labeling
                        if (panZoom.scale > 0.7) {
                            // label the segment between SERVICE stations (only once per service segment)
                            if (j === physicalIndexCurrent) {
                                const midX = (stationA.x + stationB.x) / 2 + offsetX; // approx midpoint of first PHYS seg
                                const midY = (stationA.y + stationB.y) / 2 + offsetY;
                                const angle = Math.atan2(stationB.y - stationA.y, stationB.x - stationA.x);
                                const scaledFontSize = 12 / panZoom.scale;
                                const scaledLabelOffset = -6 / panZoom.scale;

                                ctx.save();
                                ctx.translate(midX, midY);
                                ctx.rotate(angle);
                                ctx.fillStyle = isHovered ? 'darkorange' : (line.color || '#000');
                                ctx.font = `bold ${scaledFontSize}px Arial`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                ctx.fillText(i + 1, 0, scaledLabelOffset);
                                ctx.restore();
                            }
                        }
                    }
                }
            } else {
                console.warn(`Could not find physical path segment between service stations ${currentServiceStationName} and ${nextServiceStationName} for line ${line.code}`);
            }
        }
        ctx.stroke();

        // line name labeling
        if (panZoom.scale > 0.6) {
            // find midpoint based on the first and last SERV stations
            const firstServiceStation = stations.find(s => s.name === serviceStations[0]);
            const lastServiceStation = stations.find(s => s.name === serviceStations[serviceStations.length - 1]);
            if (firstServiceStation && lastServiceStation) {
                const midX = (firstServiceStation.x + lastServiceStation.x) / 2;
                const midY = (firstServiceStation.y + lastServiceStation.y) / 2;
                let totalOffsetX = 0;
                let totalOffsetY = 0;
                let labelSegmentCount = 0;

                // use PHYS path for calc
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
                                const currentOffset = (offsetIdx * lineOffsetAmount) / panZoom.scale;
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


                // label drawing
                ctx.fillStyle = isHovered ? 'orange' : (line.color || '#000');
                ctx.font = `bold ${scaledFontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top'; // Place below the line midpoint
                ctx.fillText(`${line.code} - ${line.name || ''}`, midX + avgOffsetX, midY + avgOffsetY + scaledOffset);
            }
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    // draw stations on top of lines (to see)
    stations.forEach(station => {
        drawStation(station);
    });

    // draw mouse cursor crosshair (only for mouse)
    drawPoint(mouse.x, mouse.y);
    scaleDisplay.textContent = `Scale: ${panZoom.scale.toFixed(2)}x`;
    requestAnimationFrame(update);
}

const cursorCoords = document.getElementById('cursorCoords');

// update cursor coords (only mouse)
canvas.addEventListener('mousemove', function (e) {
    if (isPanning || isPinching) {
        cursorCoords.style.display = 'none';
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panZoom.x) / panZoom.scale;
    const y = (e.clientY - rect.top - panZoom.y) / panZoom.scale;

    cursorCoords.innerText = `x: ${Math.round(x)}, y: ${Math.round(y)}`;
    cursorCoords.style.left = `${e.clientX + 10}px`;
    cursorCoords.style.top = `${e.clientY + 10}px`;
    cursorCoords.style.display = 'block';
});

canvas.addEventListener('mouseleave', function () {
    cursorCoords.style.display = 'none';
});


// click/tap handling (mobile stuff)
function handleCanvasTap(event) {
    let clickX, clickY;
    let isTouchEvent = event.type.startsWith('touch');

    if (isTouchEvent) {
        // touch
        if (!event.changedTouches || event.changedTouches.length === 0) return;
        const touch = event.changedTouches[0];
        const pos = getTouchPos(touch);
        clickX = pos.x;
        clickY = pos.y;
        // tap validation
        const distance = Math.sqrt((clickX - mouse.downX) ** 2 + (clickY - mouse.downY) ** 2);
        if (distance > 10) return;
    } else {
        const bounds = canvas.getBoundingClientRect();
        clickX = event.pageX - bounds.left - scrollX;
        clickY = event.pageY - bounds.top - scrollY;
        // click
        const distance = Math.sqrt((clickX - mouse.downX) ** 2 + (clickY - mouse.downY) ** 2);
        if (distance > 5) return;
    }


    let worldCoord = panZoom.toWorld(clickX, clickY);

    // find station where tapped (for editing)
    selectedStation = stations.find(station =>
        Math.sqrt((station.x - worldCoord.x) ** 2 + (station.y - worldCoord.y) ** 2) < (15 / panZoom.scale)
    );

    // edit station
    if (selectedStation) {
        document.getElementById('stationModalTitle').textContent = 'Edit Station';
        document.getElementById('saveStation').textContent = 'Save Changes';
        document.getElementById('deleteStation').style.display = 'block';
        document.getElementById('stationId').value = selectedStation.id;
        document.getElementById('stationName').value = selectedStation.name;
        // load existing coords into fields but allow editing
        document.getElementById('stationX').value = selectedStation.x.toFixed(0);
        document.getElementById('stationY').value = selectedStation.y.toFixed(0);
        document.getElementById('undergroundType').checked = selectedStation.location.includes("underground");
        document.getElementById('groundType').checked = selectedStation.location.includes("ground");
        document.getElementById('suspendedType').checked = selectedStation.location.includes("suspended");
        displayConnectedLines(selectedStation.name);

    } else {
        // add new station if not selecting already existing station
        document.getElementById('stationModalTitle').textContent = 'Add Station';
        document.getElementById('saveStation').textContent = 'Save Station';
        document.getElementById('deleteStation').style.display = 'none';
        document.getElementById('stationId').value = '';
        newStationWorldCoord = { x: worldCoord.x, y: worldCoord.y }; // store original click coords
        document.getElementById('stationName').value = "";
        // set initial coords from click, but allow editing
        document.getElementById('stationX').value = newStationWorldCoord.x.toFixed(0);
        document.getElementById('stationY').value = newStationWorldCoord.y.toFixed(0);
        document.getElementById('undergroundType').checked = false;
        document.getElementById('groundType').checked = false;
        document.getElementById('suspendedType').checked = false;
        stationLinesModal.style.display = 'none';
    }
    stationModal.style.display = "block";
}

// click for mouse, touch for tap
canvas.addEventListener('click', handleCanvasTap);
canvas.addEventListener('touchend', handleCanvasTap);


document.getElementById('saveStation').addEventListener('click', function (event) {
    event.preventDefault();
    const name = document.getElementById('stationName').value.trim();
    const stationId = document.getElementById('stationId').value; // Get ID
    // read coords from input fields
    const xValue = document.getElementById('stationX').value;
    const yValue = document.getElementById('stationY').value;

    if (!name) {
        alert("Station name is required.");
        return;
    }

    // check for duplicates
    if (stations.some(s => s.name === name && (stationId === '' || s.id != stationId))) {
        alert("A station with this name already exists.");
        return;
    }

    // validate coords
    const x = parseFloat(xValue);
    const y = parseFloat(yValue);
    if (isNaN(x) || isNaN(y)) {
        alert("Please enter valid numeric coordinates for X and Y.");
        return;
    }

    const newLocations = [];
    if (document.getElementById('undergroundType').checked) newLocations.push("underground");
    if (document.getElementById('groundType').checked) newLocations.push("ground");
    if (document.getElementById('suspendedType').checked) newLocations.push("suspended");

    if (newLocations.length === 0) {
        alert("Please select at least one station type.");
        return;
    }

    // edit station
    if (stationId) {
        const originalStation = stations.find(station => station.id == stationId);
        if (!originalStation) {
            alert("Error: Station being edited not found.");
            return;
        }

        const originalLocations = originalStation.location;
        const originalName = originalStation.name;

        // --- NEW VALIDATION: Check if removing a type conflicts with connected lines ---
        const connectedLines = lines.filter(line => line.stations.includes(originalName));
        const removedTypes = originalLocations.filter(type => !newLocations.includes(type));

        for (const removedType of removedTypes) {
            const conflictingLine = connectedLines.find(line => line.type === removedType);
            if (conflictingLine) {
                alert(`Cannot remove the "${removedType}" type from station "${originalName}". It is required by line "${conflictingLine.code} - ${conflictingLine.name}". Please update the line first.`);
                // Re-check the checkbox that was just unchecked to prevent the change visually
                if (removedType === 'underground') document.getElementById('undergroundType').checked = true;
                if (removedType === 'ground') document.getElementById('groundType').checked = true;
                if (removedType === 'suspended') document.getElementById('suspendedType').checked = true;
                return; // Stop the save process
            }
        }
        // --- END NEW VALIDATION ---

        // --- Update station data ---
        originalStation.name = name; // Update name (handle name change propagation below)
        originalStation.location = newLocations; // Update locations
        originalStation.x = x; // Update coords from input fields
        originalStation.y = y;

        // Update station name in all lines if it changed
        if (originalName !== name) {
            lines.forEach(line => {
                line.stations = line.stations.map(stationName =>
                    stationName === originalName ? name : stationName
                );
            });
            updateLinesUI(); // Update line list if name changed
        }

    } else {
        // add new station
        const newStation = {
            id: Date.now(),
            // use coords from input fields
            x: x,
            y: y,
            name: name,
            location: newLocations
        };
        stations.push(newStation);
    }
    update();
    updateStationStats();
    stationModal.style.display = "none";
    selectedStation = null;
    newStationWorldCoord = null;
});

document.getElementById('deleteStation').addEventListener('click', function () {
    const stationId = document.getElementById('stationId').value;
    if (!stationId) return;

    // check if the station is part of any line before deleting
    const stationToDelete = stations.find(s => s.id == stationId);
    if (!stationToDelete) return;
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

// line create/edit Logic
addLineBtn.onclick = function () {
    resetLineForm();
    document.getElementById('lineModalTitle').textContent = 'Create Line';
    document.getElementById('saveLine').textContent = 'Save Line';
    document.getElementById('deleteLine').style.display = 'none';
    createExpressServiceBtn.style.display = 'none';
    editingLineIndex = null;
    populateTrainSelect();
    lineModal.style.display = "block";
};

// reset line from after creation
function resetLineForm() {
    document.getElementById('lineIndex').value = '';
    document.getElementById('lineName').value = '';
    document.getElementById('lineCode').value = '';
    document.getElementById('lineColor').value = '#000000';
    // enable radios when resetting
    document.querySelectorAll('input[name="lineType"]').forEach(r => {
        r.checked = false;
        r.disabled = false;
    });
    plusButtonsContainer.innerHTML = '<button class="plus-button">+</button>';
    selectedValues.clear();
    document.getElementById('deleteLine').style.display = 'none';
    createExpressServiceBtn.style.display = 'none';
    assignedTrainSelect.innerHTML = '<option value="">-- Select a Train --</option>';
    trainQuantityInput.value = 0;
    trainQuantityInput.disabled = true;
    maxTrainQuantitySpan.textContent = '';
}

function fetchTrains() {
    fetch("/api/trains-get").then(response => response.json()).then(data => trains.push(data))
}
fetchTrains();

function updateTrain(id, name, type, capacity) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!csrfToken) {
        console.error('CSRF token not found in meta tag!');
        alert('An error occurred saving the data. CSRF token missing.');
        return;
    }
    fetch(`/api/trains-put/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-CSRF-TOKEN": csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ name, type, capacity }),
    })
        .then(response => {
            if (!response.ok) {
                console.error("Failed to update train. Status:", response.status, response.statusText);
                response.text().then(text => console.error("Response body:", text));
                alert(`Failed to update train: ${response.statusText}`);
            } else {
                console.log(`Train ${name} (ID: ${id}) updated successfully.`);
                let trainUpdatedLocally = false;
                for (let i = 0; i < trains.length; i++) {
                    for (let j = 0; j < trains[i].length; j++) {
                        if (trains[i][j].id === id) {
                            trains[i][j].name = name;
                            trains[i][j].type = type;
                            trains[i][j].capacity = capacity;
                            trainUpdatedLocally = true;
                            break;
                        }
                    }
                    if (trainUpdatedLocally) break;
                }
                if (trainUpdatedLocally) {
                    console.log("Local train data updated.");
                    if (lineModal.style.display === 'block' && editingLineIndex !== null) {
                       populateTrainSelect(lines[editingLineIndex]?.assignedTrain);
                    } else if (lineModal.style.display === 'block') {
                        populateTrainSelect();
                    }
                } else {
                     console.warn("Could not find train locally to update capacity.");
                }

                updateStationStats();
            }
        })
        .catch(error => {
            console.error("Network or other error updating train:", error);
            alert(`An error occurred: ${error.message}`);
        });
}

function populateTrainSelect(currentSelectedTrain) {
    console.log("Populating train select. Pre-selected train:", currentSelectedTrain);
    const selectedLineType = document.querySelector('input[name="lineType"]:checked')?.value;
    const trainToSelect = currentSelectedTrain || assignedTrainSelect.value;
    assignedTrainSelect.innerHTML = '<option value="">-- Select a Train --</option>';
    if (!selectedLineType) {
        console.log("No line type selected.");
        trainQuantityInput.value = 0;
        trainQuantityInput.disabled = true;
        maxTrainQuantitySpan.textContent = '';
        return;
    }

    console.log(`Filtering for line type: ${selectedLineType}`);
    for (let i = 0; i < trains.length; i++) {
        for (let j = 0; j < trains[i].length; j++) {
            const trainObj = trains[i][j];
            if (trainObj.type === selectedLineType) {
                const option = document.createElement('option');
                option.value = trainObj.name;
                option.textContent = `${trainObj.name} (Qty: ${trainObj.capacity})`;
                if (trainToSelect && trainObj.name === trainToSelect) {
                    console.log('Setting selected:', trainObj.name);
                    option.selected = true;
                }
                assignedTrainSelect.appendChild(option);
            }
        }
    }
    const finalSelectedTrainName = assignedTrainSelect.value;
    console.log("Final selected train in dropdown:", finalSelectedTrainName);

    if (finalSelectedTrainName) {
        let selectedTrainData = null;
        for (let i = 0; i < trains.length; i++) {
            for (let j = 0; j < trains[i].length; j++) {
                if (trains[i][j].name === finalSelectedTrainName) {
                    selectedTrainData = trains[i][j];
                    break;
                }
            }
            if (selectedTrainData) break;
        }

        console.log("Selected train data for quantity update:", selectedTrainData);

        if (selectedTrainData) {
            trainQuantityInput.disabled = false;
            trainQuantityInput.max = selectedTrainData.capacity;
            maxTrainQuantitySpan.textContent = `(Max: ${selectedTrainData.capacity})`;
            if (editingLineIndex !== null && lines[editingLineIndex] && lines[editingLineIndex].assignedTrain === finalSelectedTrainName) {
                trainQuantityInput.value = lines[editingLineIndex].trainQuantity || 0;
            } else if (!currentSelectedTrain) {
                trainQuantityInput.value = 0;
            }
            if (parseInt(trainQuantityInput.value) > selectedTrainData.capacity) {
                trainQuantityInput.value = selectedTrainData.capacity;
            }


        } else {
            console.error("Selected train name not found in data:", finalSelectedTrainName);
            trainQuantityInput.value = 0;
            trainQuantityInput.disabled = true;
            maxTrainQuantitySpan.textContent = '';
        }
    } else {
        trainQuantityInput.value = 0;
        trainQuantityInput.disabled = true;
        maxTrainQuantitySpan.textContent = '';
    }
}

document.querySelectorAll('input[name="lineType"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if (!radio.disabled) {
            populateTrainSelect(null);
        }
    });
});

assignedTrainSelect.addEventListener('change', () => {
    const newlySelectedTrainName = assignedTrainSelect.value;
    console.log("Assigned train changed to:", newlySelectedTrainName);

    if (newlySelectedTrainName) {
        let selectedTrainData = null;
        for (let i = 0; i < trains.length; i++) {
            for (let j = 0; j < trains[i].length; j++) {
                if (trains[i][j].name === newlySelectedTrainName) {
                    selectedTrainData = trains[i][j];
                    break;
                }
            }
            if (selectedTrainData) break;
        }

        console.log("Data for newly selected train:", selectedTrainData);

        if (selectedTrainData) {
            trainQuantityInput.disabled = false;
            trainQuantityInput.max = selectedTrainData.capacity;
            maxTrainQuantitySpan.textContent = `(Max: ${selectedTrainData.capacity})`;
            trainQuantityInput.value = 0;

        } else {
            console.error("Changed to a train name not found in data:", newlySelectedTrainName);
            trainQuantityInput.value = 0;
            trainQuantityInput.disabled = true;
            maxTrainQuantitySpan.textContent = '';
        }
    } else {
        trainQuantityInput.value = 0;
        trainQuantityInput.disabled = true;
        maxTrainQuantitySpan.textContent = '';
    }
});

// save line button logic
saveLineBtn.addEventListener('click', function (event) {
    event.preventDefault(); 
    const lineName = document.getElementById('lineName').value.trim(); 
    const lineCode = document.getElementById('lineCode').value.trim().toUpperCase(); 
    const lineColor = document.getElementById('lineColor').value; 
    const lineTypeRadio = document.querySelector('input[name="lineType"]:checked'); 
    let newLineType;
    if (editingLineIndex !== null && lines[editingLineIndex] && lines[editingLineIndex].originalLineCode) { 
        newLineType = lines[editingLineIndex].type;
    } else {
        newLineType = lineTypeRadio ? lineTypeRadio.value : null;
    }
    const assignedTrain = assignedTrainSelect.value;
    const trainQuantity = parseInt(trainQuantityInput.value, 10);
    const stationButtons = plusButtonsContainer.querySelectorAll('.plus-button span'); 
    const stationNames = Array.from(stationButtons).map(span => span.textContent.trim()).filter(Boolean);

    // validation
    if (!lineName || !lineCode || !newLineType || stationNames.length < 2) { 
        alert("Please fill all fields, select a type, and add at least two stations."); 
        return; 
    }

    if (lineCode.length !== 2) { 
        alert("Line Code must be exactly 2 letters."); 
        return; 
    }

    // make sure a station cannot appear twice in a row
    for (let i = 0; i < stationNames.length - 1; i++) { //
        if (stationNames[i] === stationNames[i + 1]) { //
            alert("A station cannot appear twice in a row on the same line."); //
            return; //
        }
    }

    // find train obj
    let selectedTrainObj = null; 
    if (assignedTrain) {
        for (let i = 0; i < trains.length; i++) { 
            for (let j = 0; j < trains[i].length; j++) { 
                if (trains[i][j].name === assignedTrain) { 
                    selectedTrainObj = trains[i][j]; 
                    break;
                }
            }
            if (selectedTrainObj) break; 
        }
    }

    // --- train logic ---
    let capacityToUpdate = null;
    let trainToUpdate = null;

    if (assignedTrain && trainQuantity > 0) {
        if (!selectedTrainObj) {
            alert(`Could not find data for selected train "${assignedTrain}".`); 
            return; 
        }
        if (isNaN(trainQuantity)) {
            alert("Please specify a valid train quantity.");
            return;
        }

        if (trainQuantity > selectedTrainObj.capacity) { 
            alert(`Invalid train quantity. You can only assign up to ${selectedTrainObj.capacity} of "${assignedTrain}".`); //
            return; 
        }

        // prep train update
        capacityToUpdate = selectedTrainObj.capacity - trainQuantity;
        trainToUpdate = {
            id: selectedTrainObj.id,
            name: selectedTrainObj.name,
            type: selectedTrainObj.type
        };

    } else if (assignedTrain && (isNaN(trainQuantity) || trainQuantity <= 0)) { 
        alert("Please specify a valid positive train quantity."); 
        return; 
    } else if (!assignedTrain && trainQuantity > 0) { 
        alert("Please select a train before specifying quantity."); 
        return; 
    }

    // prepare line data
    const newLineData = { 
        name: lineName, 
        code: lineCode, 
        color: lineColor, 
        type: newLineType,
        stations: stationNames, 
        assignedTrain: assignedTrain || null, 
        trainQuantity: (assignedTrain && trainQuantity > 0) ? trainQuantity : 0 
    };

    let originalLineUpdated = false; 

    // line save/update locally
    if (editingLineIndex !== null) { 
        const originalLineData = lines[editingLineIndex];
        if (!originalLineData.originalLineCode &&
            originalLineData.type !== newLineType &&
            originalLineData.stations.length > 0) { 
            alert(`Cannot change the type of line "${originalLineData.code}" from "${originalLineData.type}" to "${newLineType}" because it already has stations. Please create a new line or remove stations first.`);
            document.querySelector(`input[name="lineType"][value="${originalLineData.type}"]`).checked = true;
            return;
        }

        // edit logic
        if (originalLineData.originalLineCode) {
            newLineData.originalLineCode = originalLineData.originalLineCode;
            const originalLine = lines.find(l => l.code === newLineData.originalLineCode);
            if (originalLine) {
                if (newLineData.stations[0] !== originalLine.stations[0] ||
                    newLineData.stations[newLineData.stations.length - 1] !== originalLine.stations[originalLine.stations.length - 1]) { 
                    alert("Express line endpoints must match the original line's endpoints."); 
                    return; 
                }
                // ensure type still matches original
                if (newLineData.type !== originalLine.type) {
                    alert("Express line type must match the original line's type."); 
                    newLineData.type = originalLine.type;
                }
            } else { //
                alert(`Error: Original line ${newLineData.originalLineCode} not found. Cannot save express line.`); 
                return; //
            }

        } else {
            if (originalLineData.code !== newLineData.code) { 
                const existingIndexWithCode = lines.findIndex((line, index) => line.code === newLineData.code && index !== editingLineIndex); 
                if (existingIndexWithCode !== -1) { 
                    alert(`A line with code "${lineCode}" already exists.`); 
                    return; 
                }
            }
            originalLineUpdated = true;
        }
        lines[editingLineIndex] = newLineData;
        console.log("Edited line saved:", newLineData); 

        // update express line if OG changed ---
        if (originalLineUpdated) { 
            const updatedOriginalLine = lines[editingLineIndex]; 
            const originalCode = updatedOriginalLine.code; 
            const newStartStation = updatedOriginalLine.stations[0]; 
            const newEndStation = updatedOriginalLine.stations[updatedOriginalLine.stations.length - 1]; 

            lines.forEach((line, index) => { 
                if (line.originalLineCode === originalCode) { 
                    const currentExpressStations = [...line.stations]; 
                    let newExpressStations = []; 
                    newExpressStations.push(newStartStation); 

                    for (let i = 1; i < currentExpressStations.length - 1; i++) { 
                        const intermediateStation = currentExpressStations[i]; 
                        if (intermediateStation !== newStartStation && intermediateStation !== newEndStation && updatedOriginalLine.stations.includes(intermediateStation)) { 
                            newExpressStations.push(intermediateStation); 
                        }
                    }

                    if (newStartStation !== newEndStation) { 
                        newExpressStations.push(newEndStation);
                    }

                    lines[index].stations = newExpressStations.filter((value, idx, self) => self.indexOf(value) === idx); 
                    lines[index].type = updatedOriginalLine.type; 
                    console.log(`Updated express line "${line.code}" endpoints, type, and preserved intermediates based on original line "${originalCode}". New stations: ${lines[index].stations.join(', ')}`);
                }
            });
        }
    } else {
        if (lines.some(line => line.code === newLineData.code)) { 
            alert(`A line with code "${lineCode}" already exists.`); 
            return; 
        }
        lines.push(newLineData);
        console.log("New line added:", newLineData);
    }

    // call updateTrain only if everything else succeeded
    if (trainToUpdate && capacityToUpdate !== null) {
        console.log(`Updating train ${trainToUpdate.name} (ID: ${trainToUpdate.id}), setting capacity to ${capacityToUpdate}`);
        updateTrain(trainToUpdate.id, trainToUpdate.name, trainToUpdate.type, capacityToUpdate);
    }

    update();
    updateStationStats();
    updateLinesUI();
    lineModal.style.display = 'none';
    resetLineForm();
});

createExpressServiceBtn.addEventListener('click', function () {
    if (editingLineIndex === null) return;

    const originalLine = lines[editingLineIndex];
    expressStationsList.innerHTML = '';

    originalLine.stations.forEach(stationName => {
        const listItem = document.createElement('li');
        listItem.textContent = stationName;
        listItem.dataset.stationName = stationName;
        listItem.addEventListener('click', () => {
            listItem.classList.toggle('selected-station');
            if (stationName === originalLine.stations[0] || stationName === originalLine.stations[originalLine.stations.length - 1]) {
                listItem.classList.add('selected-station');
            }
        });
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

    const originalLine = lines[editingLineIndex];
    const startStation = originalLine.stations[0];
    const endStation = originalLine.stations[originalLine.stations.length - 1];
    if (!selectedStationNames.includes(startStation) || !selectedStationNames.includes(endStation)) {
        alert("The start and end stations of the original line must be included in the express service.");
        return;
    }


    // sort selected stations based on their order in the original line
    const sortedSelectedStations = originalLine.stations.filter(stationName => selectedStationNames.includes(stationName));


    // line code for express line
    let expressCodeBase = `${originalLine.code.charAt(0)}X`;
    let expressCode = expressCodeBase;
    let counter = 1;
    while (lines.some(line => line.code === expressCode)) {
        expressCode = `${expressCodeBase}${counter}`;
        if (expressCode.length > 2) {
            alert("Could not generate a unique 2-character code starting with " + expressCodeBase);
            return;
        }
        counter++;
    }


    const newExpressLine = {
        name: `${originalLine.name} Express`,
        code: expressCode,
        color: originalLine.color,
        type: originalLine.type,
        stations: sortedSelectedStations,
        assignedTrain: originalLine.assignedTrain, // Carry over train assignment
        trainQuantity: originalLine.trainQuantity, // Carry over quantity
        originalLineCode: originalLine.code
    };

    lines.push(newExpressLine);

    update();
    updateStationStats();
    updateLinesUI();
    expressServiceModal.style.display = 'none';
    alert(`Express line "${newExpressLine.code}" created successfully!`);
});


plusButtonsContainer.addEventListener('click', (event) => {
    const clickedButton = event.target.closest('.plus-button');
    if (!clickedButton) return;

    // check if the clicked button is the '+' button
    if (clickedButton.textContent.trim() === '+' || clickedButton.innerHTML.trim() === '+') {
        modalList.innerHTML = ''; // Clear previous list items
        const lineTypeRadio = document.querySelector('input[name="lineType"]:checked');
        const selectedLineType = lineTypeRadio ? lineTypeRadio.value : null;

        const isEditingExpress = editingLineIndex !== null && lines[editingLineIndex]?.originalLineCode;
        let originalLineStations = [];
        if (isEditingExpress) {
            const originalLine = lines.find(l => l.code === lines[editingLineIndex].originalLineCode);
            if (originalLine) {
                originalLineStations = originalLine.stations;
            } else {
                console.error("Original line not found when trying to add station to express line.");
            }
        }

        const currentStationNamesInEditor = Array.from(plusButtonsContainer.querySelectorAll('.plus-button span'))
            .map(span => span.textContent.trim());

        stations.forEach(item => {
            if (!isEditingExpress && selectedLineType && !item.location.includes(selectedLineType)) {
                return;
            }
            if (isEditingExpress && !originalLineStations.includes(item.name)) {
                return;
            }
            if (currentStationNamesInEditor.includes(item.name)) {
                return;
            }

            const listItem = document.createElement('li');
            listItem.textContent = item.name;
            listItem.dataset.stationName = item.name;

            listItem.onclick = () => {
                const currentButtons = plusButtonsContainer.querySelectorAll('.plus-button');
                const currentStationsInUI = Array.from(currentButtons)
                                             .map(btn => btn.querySelector('span')?.textContent.trim())
                                             .filter(Boolean);

                // prevent adding the same station twice in a row
                if (currentStationsInUI.length > 0 && currentStationsInUI[currentStationsInUI.length - 1] === item.name) {
                    alert("Cannot add the same station twice in a row.");
                    listModal.style.display = 'none'; // Close modal
                    return;
                }

                 // express stuff
                 if (isEditingExpress) {
                    const originalLineCode = lines[editingLineIndex].originalLineCode;
                    const originalLine = lines.find(l => l.code === originalLineCode);
                    if (!originalLine) {
                        console.error("Original line not found for express edit!");
                        listModal.style.display = 'none';
                        return;
                    }

                    const newItemName = item.name;
                    const currentStationNamesInEditorNow = Array.from(plusButtonsContainer.querySelectorAll('.plus-button span')).map(span => span.textContent.trim());
                    const potentialStations = [...currentStationNamesInEditorNow, newItemName];
                    const orderedStations = originalLine.stations.filter(stationName => potentialStations.includes(stationName));
                    const insertAtIndex = orderedStations.indexOf(newItemName);
                    const insertBeforeButton = plusButtonsContainer.children[insertAtIndex];

                    const button = createStationButtonElement(newItemName, true, originalLine.stations);
                    plusButtonsContainer.insertBefore(button, insertBeforeButton); 
                    listModal.style.display = 'none';
                    return;
                }

                // non-express stuff
                const newButton = createStationButtonElement(item.name, false);
                if (clickedButton && clickedButton.textContent.trim() === '+') {
                     clickedButton.remove();
                }
                plusButtonsContainer.appendChild(newButton);
                const newPlusButton = document.createElement('button');
                newPlusButton.classList.add('plus-button');
                newPlusButton.textContent = '+';
                plusButtonsContainer.appendChild(newPlusButton);


                listModal.style.display = 'none';
            };

            modalList.appendChild(listItem);
        });
        listModal.style.display = 'block';
    }
});

function createStationButtonElement(stationName, isExpress = false, originalLineStations = []) {
    const button = document.createElement('button');
    button.classList.add('plus-button');

    const isEndpoint = isExpress && (stationName === originalLineStations[0] || stationName === originalLineStations[originalLineStations.length - 1]);
    if (isEndpoint) {
        button.style.borderColor = '#aaa';
        button.title = "Endpoint fixed by original line";
    }

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';
    container.style.width = '100%';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = stationName;
    if (isEndpoint) {
        nameSpan.style.color = '#555';
    }

    const btnGroup = document.createElement('div');
    btnGroup.classList.add('btn-group');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '4px';

    const upBtn = document.createElement('button');
    upBtn.textContent = '↑';
    upBtn.classList.add("btn", "btn-sm", "btn-outline-success");
    upBtn.disabled = isExpress;
    upBtn.onclick = (e) => {
        e.stopPropagation();
        if (isExpress) return;
        const prev = button.previousElementSibling;
        if (prev && prev.classList.contains('plus-button') && prev.querySelector('span')) {
            plusButtonsContainer.insertBefore(button, prev);
        }
    };

    const downBtn = document.createElement('button');
    downBtn.textContent = '↓';
    downBtn.classList.add("btn", "btn-sm", "btn-outline-success");
    downBtn.disabled = isExpress;
    downBtn.onclick = (e) => {
        e.stopPropagation();
        if (isExpress) return;
        const next = button.nextElementSibling;
        if (next && next.classList.contains('plus-button') && next.querySelector('span')) {
            plusButtonsContainer.insertBefore(next, button);
        }
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.classList.add("btn", "btn-sm", "btn-outline-danger");
    deleteBtn.disabled = isEndpoint;
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (isEndpoint) return;
        button.remove();
        if (plusButtonsContainer.querySelectorAll('.plus-button span').length === 0) {
            const lastElement = plusButtonsContainer.lastElementChild;
            if (!lastElement || lastElement.textContent.trim() !== '+') {
                 const newPlusButton = document.createElement('button');
                 newPlusButton.classList.add('plus-button');
                 newPlusButton.textContent = '+';
                 plusButtonsContainer.appendChild(newPlusButton);
            }
        }
    };

    btnGroup.appendChild(upBtn);
    btnGroup.appendChild(downBtn);
    btnGroup.appendChild(deleteBtn);

    container.appendChild(nameSpan);
    container.appendChild(btnGroup);
    button.appendChild(container);

    return button;
}


function updateLinesUI() {
    const lineListElement = document.getElementById('lineListItems');
    if (!lineListElement) {
        console.error("Element with ID 'lineListItems' not found.");
        return;
    }
    lineListElement.innerHTML = '';

    lines.forEach((line, index) => {
        const lineItem = document.createElement('li');
        lineItem.classList.add('line-item');

        const label = document.createElement('span');
        label.textContent = `${line.code} - ${line.name || ''}`;
        label.style.color = line.color || 'black';
        if (line.originalLineCode) {
            label.style.fontStyle = 'italic';
            label.title = `Express service for line ${line.originalLineCode}`;
        }

        label.addEventListener('mouseenter', () => hoveredLine = line);
        label.addEventListener('mouseleave', () => hoveredLine = null);

        const openEditModal = () => {
            resetLineForm(); 
            const isExpressLine = !!line.originalLineCode;

            document.getElementById('lineModalTitle').textContent = `Edit Line: ${line.code}`;
            document.getElementById('saveLine').textContent = 'Save Changes';
            document.getElementById('deleteLine').style.display = 'inline-block';
            createExpressServiceBtn.style.display = isExpressLine ? 'none' : 'inline-block';
            editingLineIndex = index; 

            document.getElementById('lineName').value = line.name;
            document.getElementById('lineCode').value = line.code;
            document.getElementById('lineColor').value = line.color;

            document.querySelectorAll('input[name="lineType"]').forEach(r => {
                r.checked = r.value === line.type;
                r.disabled = isExpressLine;
            });

            plusButtonsContainer.innerHTML = '';
            selectedValues.clear();

            let originalLineStationsForExpress = [];
            if (isExpressLine) {
                 const originalLine = lines.find(l => l.code === line.originalLineCode);
                 originalLineStationsForExpress = originalLine ? originalLine.stations : [];
            }

            line.stations.forEach(stationName => {
                const button = createStationButtonElement(stationName, isExpressLine, originalLineStationsForExpress);
                plusButtonsContainer.appendChild(button);
            });

            const trailingPlus = document.createElement('button');
            trailingPlus.classList.add('plus-button');
            trailingPlus.textContent = '+';
            plusButtonsContainer.appendChild(trailingPlus);

            populateTrainSelect(line.assignedTrain);
            if (line.assignedTrain && line.trainQuantity > 0) {
                 trainQuantityInput.value = line.trainQuantity;
            } else {
                 trainQuantityInput.value = 0;
            }


            lineModal.style.display = 'block';
        };

        // click + touch modal
        label.addEventListener('click', openEditModal);
        label.addEventListener('touchstart', (e) => {}, { passive: true });
        label.addEventListener('touchend', (e) => {
            openEditModal();
            e.preventDefault();
        });

        const editBtn = document.createElement('button');
        editBtn.classList.add("btn", "btn-sm", "btn-outline-info"); 
        editBtn.textContent = 'Edit';
        editBtn.style.marginLeft = '8px'; 
        editBtn.onclick = (e) => {
            e.stopPropagation(); 
            openEditModal();
        };

        editBtn.addEventListener('touchend', (e) => {
            e.stopPropagation();
            openEditModal();
            e.preventDefault();
        });


        lineItem.appendChild(label);
        lineItem.appendChild(editBtn);
        lineListElement.appendChild(lineItem);
    });
}

closeModalButton.addEventListener('click', () => {
    listModal.style.display = 'none';
});

// display lines connected to a station
function displayConnectedLines(stationName) {
    const connectedLines = lines.filter(line => line.stations.includes(stationName));
    const stationLinesList = document.getElementById('stationLinesList');
    stationLinesList.innerHTML = '';

    document.getElementById('connectedStationName').textContent = stationName;

    if (connectedLines.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No lines connected.';
        stationLinesList.appendChild(listItem);
    } else {
        connectedLines.forEach(line => {
            const listItem = document.createElement('li');
            const stationIndex = line.stations.indexOf(stationName);
            const stationNumber = stationIndex !== -1 ? stationIndex + 1 : '?';
            listItem.textContent = `${line.code}${stationNumber} - ${line.name || ''} (${line.type})` + (line.assignedTrain ? ` - Train: ${line.assignedTrain} (x${line.trainQuantity || 0})` : '');
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => {
                 const lineIndexToEdit = lines.findIndex(l => l.code === line.code);
                 if (lineIndexToEdit !== -1) {
                     stationLinesModal.style.display = 'none';
                     const lineToEdit = lines[lineIndexToEdit];
                     const lineListItems = document.querySelectorAll('#lineListItems .line-item');
                     lineListItems.forEach(item => {
                         const label = item.querySelector('span');
                         const editButton = item.querySelector('button');
                         if (label && label.textContent.startsWith(lineToEdit.code)) {
                             editButton.click();
                         }
                     });
                 }
            });
            stationLinesList.appendChild(listItem);
        });
    }
    stationLinesModal.style.display = 'block';
}


// export stuff
document.getElementById('exportBtn').addEventListener('click', () => {
    const data = {
        stations: stations,
        lines: lines,
        trains: trains
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

// import stuff
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

            // validate
            if (!json || typeof json !== 'object' || !Array.isArray(json.stations) || !Array.isArray(json.lines) || !Array.isArray(json.trains)) {
                throw new Error("Invalid file format. Missing 'stations', 'lines', or 'trains' array at the top level.");
            }
            if (!json.trains.every(group => Array.isArray(group))) {
                throw new Error("Invalid 'trains' format. Expected an array of arrays.");
            }

            const flatTrains = json.trains.flat();
            const stationNameMap = new Map(json.stations.map(station => [station.name, station]));
            const trainNameMap = new Map(flatTrains.map(train => [train.name, train]));
            const lineCodeMap = new Map(json.lines.map(line => [line.code, line]));

            json.stations.forEach((station, index) => {
                if (!(typeof station === 'object' && station !== null &&
                    typeof station.id !== 'undefined' && // Assuming ID exists, adjust if not
                    typeof station.x === 'number' && typeof station.y === 'number' &&
                    typeof station.name === 'string' && station.name.trim() !== '' &&
                    Array.isArray(station.location) && station.location.length > 0 && // Must have at least one type
                    station.location.every(loc => typeof loc === 'string' && ['underground', 'ground', 'suspended'].includes(loc))
                )) {
                    throw new Error(`Invalid station data at index ${index} (Name: ${station.name || 'N/A'}). Check properties (id, x, y, name, location array with valid types).`);
                }
            });
            const stationNames = json.stations.map(station => station.name);
            if (stationNames.length !== new Set(stationNames).size) throw new Error("Duplicate station names found.");

            flatTrains.forEach((train, index) => {
                if (!(typeof train === 'object' && train !== null &&
                    typeof train.id !== 'undefined' && 
                    typeof train.name === 'string' && train.name.trim() !== '' &&
                    typeof train.type === 'string' && ['underground', 'ground', 'suspended'].includes(train.type) &&
                    typeof train.capacity === 'number' && Number.isInteger(train.capacity) && train.capacity >= 0 // Check capacity is non-negative integer
                )) {
                    throw new Error(`Invalid train data at flat index ${index} (Name: ${train.name || 'N/A'}). Check properties (id, name, type, capacity).`);
                }
            });
            const trainNames = flatTrains.map(train => train.name);
            if (trainNames.length !== new Set(trainNames).size) throw new Error("Duplicate train names found.");

            json.lines.forEach((line, index) => {
                if (!(typeof line === 'object' && line !== null &&
                    typeof line.name === 'string' && 
                    typeof line.code === 'string' && line.code.length === 2 && /^[A-Z0-9]{2}$/i.test(line.code) && 
                    typeof line.color === 'string' && /^#[0-9A-F]{6}$/i.test(line.color) && 
                    typeof line.type === 'string' && ['underground', 'ground', 'suspended'].includes(line.type) &&
                    Array.isArray(line.stations) && line.stations.length >= 2 &&
                    line.stations.every(stationName => typeof stationName === 'string') &&
                    (line.assignedTrain === null || typeof line.assignedTrain === 'undefined' || (typeof line.assignedTrain === 'string' && trainNameMap.has(line.assignedTrain))) &&
                    (typeof line.trainQuantity === 'undefined' || (typeof line.trainQuantity === 'number' && Number.isInteger(line.trainQuantity) && line.trainQuantity >= 0)) && 
                    (typeof line.originalLineCode === 'undefined' || (typeof line.originalLineCode === 'string' && lineCodeMap.has(line.originalLineCode)))
                )) {
                    throw new Error(`Invalid line data at index ${index} (Code: ${line.code || 'N/A'}). Check properties (name, code, color, type, stations array, assignedTrain, trainQuantity, originalLineCode).`);
                }
            });
            const lineCodes = json.lines.map(line => line.code);
            if (lineCodes.length !== new Set(lineCodes).size) throw new Error("Duplicate line codes found.");

            for (const line of json.lines) {
                if (!line.stations.every(stationName => stationNameMap.has(stationName))) {
                    const unknown = line.stations.find(sn => !stationNameMap.has(sn));
                    throw new Error(`Line "${line.code}" contains unknown station name: "${unknown}".`);
                }
                for (let i = 0; i < line.stations.length - 1; i++) {
                    if (line.stations[i] === line.stations[i + 1]) throw new Error(`Line "${line.code}" has consecutive duplicate station: "${line.stations[i]}".`);
                }
                if (!line.stations.every(stationName => stationNameMap.get(stationName)?.location.includes(line.type))) {
                     const incompatibleStation = line.stations.find(sn => !stationNameMap.get(sn)?.location.includes(line.type));
                    throw new Error(`Line "${line.code}" (${line.type}) contains station "${incompatibleStation}" which does not support this type.`);
                }
                if (line.assignedTrain) {
                    const assignedTrainObj = trainNameMap.get(line.assignedTrain);
                    if (!assignedTrainObj) throw new Error(`Assigned train "${line.assignedTrain}" on line "${line.code}" does not exist in the trains list.`);
                    if (assignedTrainObj.type !== line.type) throw new Error(`Assigned train "${line.assignedTrain}" (${assignedTrainObj.type}) on line "${line.code}" does not match line type (${line.type}).`);
                    if (typeof line.trainQuantity !== 'number' || line.trainQuantity < 0) throw new Error(`Invalid train quantity (${line.trainQuantity}) for train "${line.assignedTrain}" on line "${line.code}". Must be 0 or greater.`);
                } else if (line.trainQuantity > 0) {
                    throw new Error(`Train quantity (${line.trainQuantity}) specified for line "${line.code}" but no train assigned.`);
                }
                if (line.originalLineCode) {
                    const originalLine = lineCodeMap.get(line.originalLineCode);
                    if (!originalLine) throw new Error(`Express line "${line.code}" references non-existent original line "${line.originalLineCode}".`);
                    if (originalLine.originalLineCode) throw new Error(`Express line "${line.code}" cannot reference another express line "${originalLine.code}".`); // Prevent chaining express lines
                    if (!line.stations.every(stationName => originalLine.stations.includes(stationName))) {
                         const notInOriginal = line.stations.find(sn => !originalLine.stations.includes(sn));
                        throw new Error(`Express line "${line.code}" contains station "${notInOriginal}" which is not in the original line "${originalLine.code}".`);
                    }
                    if (line.stations[0] !== originalLine.stations[0] || line.stations[line.stations.length - 1] !== originalLine.stations[originalLine.stations.length - 1]) throw new Error(`Express line "${line.code}" endpoints do not match original line "${originalLine.code}".`);
                    if (line.type !== originalLine.type) throw new Error(`Express line "${line.code}" type (${line.type}) does not match original line "${originalLine.code}" type (${originalLine.type}).`);
                    let lastOriginalIndex = -1;
                    for(const stationName of line.stations) {
                        const currentOriginalIndex = originalLine.stations.indexOf(stationName);
                        if (currentOriginalIndex < lastOriginalIndex) {
                             throw new Error(`Express line "${line.code}" stations are not in the same order as the original line "${originalLine.code}".`);
                        }
                        lastOriginalIndex = currentOriginalIndex;
                    }
                }
            }
            stations = json.stations;
            lines = json.lines;
            trains = json.trains;
            update();
            updateLinesUI();
            updateStationStats();
            alert("Data imported successfully!");

        } catch (err) {
            console.error("Import failed:", err);
            alert("Import Error: " + err.message);
        } finally {
            event.target.value = null;
        }
    };
    reader.onerror = function() {
        alert("Error reading the file.");
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
