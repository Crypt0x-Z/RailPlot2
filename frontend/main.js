const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        const mouse = { x: 0, y: 0, button: false, wheel: 0, lastX: 0, lastY: 0, drag: false, downX: 0, downY: 0 };
        const gridLimit = 64;
        const gridSize = 128;
        const scaleRate = 1.02;
        const topLeft = { x: 0, y: 0 };

        let stations = [];
        let zoomDisabled = 0; // 0: none, 1: zoom in, -1: zoom out

        function updateStationStats() {
            //  document.getElementById("stationsNum").innerText = stations.length;  No element with id stationsNum
        }

        function fetchStations() {
            //  axios.get('/api/stations')  No axios
            //  .then(response => {
            //  stations = response.data.map(station => ({
            //  id: station.id,
            //  x: station.x,
            //  y: station.y,
            //  name: station.name,
            //  location: station.location ? (Array.isArray(station.location) ? station.location : JSON.parse(station.location)) : []
            //  }));

            //   // Update station count
            //  document.getElementById("stationsNum").innerHTML = stations.length;

            //  update(); // trigger canvas update
            //  })
            //  .catch(error => console.error('Error fetching stations:', error));

            // Simulate data for now.
            stations = [
                
            ];
            update();
        }

        document.addEventListener("DOMContentLoaded", fetchStations);
        let newStationWorldCoord = null;
        let selectedStation = null;

        let lines = [];

        // document.getElementById('saveLine').addEventListener('click', function () {  No element with id saveLine
        //  const name = document.getElementById('lineName').value.trim();
        //  const code = document.getElementById('lineCode').value.trim();
        //  const color = document.getElementById('lineColor').value;
        //  const lineType = document.querySelector('input[name="lineType"]:checked');

        //  if (!name || !code || !lineType) {
        //  alert("Line name, code, and type are required.");
        //  return;
        //  }

        //  lines.push({ name: name, code: code, color: color, type: lineType.value, stations: [] });

        //  // Clear input fields after saving
        //  document.getElementById('lineName').value = '';
        //  document.getElementById('lineCode').value = '';
        //  document.getElementById('lineColor').value = '#000000';
        //  document.querySelectorAll('input[name="lineType"]').forEach(radio => radio.checked = false);

        //  // Optionally, close the dropdown after saving
        //  const dropdownButton = document.querySelector('.dropdown-toggle');
        //  if (dropdownButton.classList.contains('show')) {
        //  dropdownButton.click();
        //  }

        //  document.getElementById("linesNum").innerHTML = lines.length
        // });

        function clearGrid() {
            //  if (!confirm("Are you sure you want to delete all stations? This action cannot be undone.")) {
            //  return; // If user cancels, do nothing
            //  }

            //  axios.delete('http://127.0.0.1:8000/api/stations/clear')
            //  .then(() => {
            stations = []; // Clear the frontend array
            update(); // Refresh the canvas
            updateStationStats();
            //  document.getElementById("stationsNum").innerHTML = stations.length;
            //  })
            //  .catch(error => console.error("Error clearing grid:", error));
        }

        function mouseEvents(e) {
            const bounds = canvas.getBoundingClientRect();
            mouse.x = e.pageX - bounds.left - scrollX;
            mouse.y = e.pageY - bounds.top - scrollY;
            if (e.type === "mousedown") {
                mouse.button = true;
                mouse.downX = mouse.x;
                mouse.downY = mouse.y;
            } else if (e.type === "mouseup") {
                mouse.button = false;
            }
            if (e.type === "wheel") {
                mouse.wheel += -e.deltaY;
                e.preventDefault();
            }
        }

        ["mousedown", "mouseup", "mousemove"].forEach(name => document.addEventListener(name, mouseEvents));
        document.addEventListener("wheel", mouseEvents, { passive: false });

        const panZoom = {
            x: 0,
            y: 0,
            scale: 1,
            apply() { ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y) },
            scaleAt(x, y, sc) {
                const previousScale = this.scale;
                this.scale *= sc;
                this.scale = Math.max(0.5, Math.min(this.scale, 3)); // Limit zoom here
                const actualScaleChange = this.scale / previousScale; //calculate actual scale
                this.x = x - (x - this.x) * actualScaleChange;
                this.y = y - (y - this.y) * actualScaleChange;

                // Disable/enable zoom based on limits
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
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            for (i = 0; i < size; i += gridScale) {
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + size);
                ctx.moveTo(x, y + i);
                ctx.lineTo(x + size, y + i);
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.stroke();
        }

        function drawPoint(x, y) {
            const worldCoord = panZoom.toWorld(x, y);
            panZoom.apply();
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(worldCoord.x - 10, worldCoord.y);
            ctx.lineTo(worldCoord.x + 10, worldCoord.y);
            ctx.moveTo(worldCoord.x, worldCoord.y - 10);
            ctx.lineTo(worldCoord.x, worldCoord.y + 10);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.stroke();
        }

        function drawStation(station) {
            panZoom.apply();
            ctx.lineWidth = 2;

            // Define colors for each type
            const typeColors = {
                ground: "yellow",
                underground: "red",
                suspended: "blue"
            };

            // Extract the station's types
            const types = Array.isArray(station.location) ? station.location : [];

            if (types.length === 0) {
                return; // No types? Don't draw anything
            }

            const centerX = station.x;
            const centerY = station.y;
            const radius = 8; // Adjust ring size as needed
            const arcSize = (2 * Math.PI) / types.length; // Divide circle based on number of types

            ctx.lineWidth = 3;

            // Draw multi-colored ring around the station
            for (let i = 0; i < types.length; i++) {
                const startAngle = i * arcSize;
                const endAngle = (i + 1) * arcSize;

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.strokeStyle = typeColors[types[i]] || "black"; // Default to black if unknown type
                ctx.stroke();
            }

            // Draw center dot
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Display station name
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(station.name, centerX, centerY + 20);

            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }


        var w = canvas.width;
        var h = canvas.height;

        function update() {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1;
            if (w !== innerWidth || h !== innerHeight) {
                w = canvas.width = innerWidth;
                h = canvas.height = innerHeight - 50;
            } else {
                ctx.clearRect(0, 0, w, h);
            }
            if (mouse.wheel !== 0) {
                let scale = 1;
                scale = mouse.wheel < 0 ? 1 / scaleRate : scaleRate;
                // Only allow zoom if not disabled
                if (zoomDisabled === 0 || (zoomDisabled === 1 && mouse.wheel < 0) || (zoomDisabled === -1 && mouse.wheel > 0)) {
                    panZoom.scaleAt(mouse.x, mouse.y, scale);
                }
                mouse.wheel *= 0.8;
                if (Math.abs(mouse.wheel) < 1) {
                    mouse.wheel = 0;
                }
            }
            if (mouse.button) {
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
            drawGrid(gridSize, true);
            drawPoint(mouse.x, mouse.y);

            stations.forEach(station => {
                drawStation(station);
            });

            requestAnimationFrame(update);
        }

        canvas.addEventListener('click', function (event) {
            const distance = Math.sqrt((mouse.x - mouse.downX) ** 2 + (mouse.y - mouse.downY) ** 2);
            if (distance > 5) return;

            //  Ensure worldCoord is always defined before use
            let worldCoord = panZoom.toWorld(event.offsetX, event.offsetY);

            selectedStation = stations.find(station =>
                Math.sqrt((station.x - worldCoord.x) ** 2 + (station.y - worldCoord.y) ** 2) < 10
            );

            if (selectedStation) {
                try {
                    selectedStation.location = Array.isArray(selectedStation.location)
                        ? selectedStation.location
                        : JSON.parse(selectedStation.location || "[]");
                } catch (error) {
                    console.error("Error parsing station location:", error);
                    selectedStation.location = [];
                }

                // document.getElementById('modalTitle').textContent = "Edit Station";
                // document.getElementById('stationName').value = selectedStation.name;

                // // Set checkboxes correctly
                // document.getElementById('undergroundType').checked = selectedStation.location.includes("underground");
                // document.getElementById('groundType').checked = selectedStation.location.includes("ground");
                // document.getElementById('suspendedType').checked = selectedStation.location.includes("suspended");

                // document.getElementById('deleteStation').style.display = 'block'; // Show delete button
                console.log("Edit", selectedStation)
            } else {
                //  No station was clicked, so prepare to add a new one
                newStationWorldCoord = { x: worldCoord.x, y: worldCoord.y }; //  Ensure worldCoord is always used correctly

                // document.getElementById('modalTitle').textContent = "Add Station";
                // document.getElementById('stationName').value = "";

                // // Reset all checkboxes
                // document.getElementById('undergroundType').checked = false;
                // document.getElementById('groundType').checked = false;
                // document.getElementById('suspendedType').checked = false;

                // document.getElementById('deleteStation').style.display = 'none'; // Hide delete button
                console.log("Add", newStationWorldCoord)
            }

            // var stationModal = new bootstrap.Modal(document.getElementById('stationModal'));
            // stationModal.show();
        });