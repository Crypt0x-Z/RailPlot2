<!DOCTYPE html>
<html lang="hu">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">
    <link rel="stylesheet" href="{{ asset('style.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq"
        crossorigin="anonymous"></script>
    <title>Scalable Draggable Canvas</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
    <nav class="navbar navbar-expand-md bg-body-teritary">
        <div class="container-fluid">
            <a class="navbar-brand" href="#"><img src="logo.png" alt="" width="75px">RailPlot</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="addLineBtn">Create Line</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="exportBtn">Export</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="importBtn">Import</a>
                        <input type="file" id="importInput" accept=".json" style="display: none;">
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="clearGridBtn">Clear Grid</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="refocusBtn">Refocus</a>
                    </li>
                    <li>
                        <a class="nav-link" data-bs-toggle="offcanvas" href="#lineList" role="button"
                            aria-controls="lineList">
                            Show Lines
                        </a>
                    </li>
                    {{-- Logout Link/Form --}}
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('logout') }}" style="color: red;" onclick="event.preventDefault();
                         document.getElementById('logout-form').submit();">
                            Log Out
                        </a>

                        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                            @csrf {{-- Add CSRF token --}}
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <canvas id="canvas" width="100%" height="100%"></canvas>
    <div id="scaleDisplay">Scale: 1.00x</div>

    <div id="stationModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="stationModalTitle">Add Station</h2>
                <span class="close station-modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <form id="stationForm">
                    <input type="hidden" id="stationId">
                    <label for="stationName">Station Name:</label>
                    <input type="text" id="stationName" name="stationName">

                    <label for="stationX">X Coordinate:</label>
                    <input type="number" id="stationX" name="stationX" step="1">
                    <label for="stationY">Y Coordinate:</label>
                    <input type="number" id="stationY" name="stationY" step="1">

                    <label>Station Type:</label>
                    <div>
                        <label for="undergroundType">
                            <input type="checkbox" id="undergroundType" name="stationType" value="underground">
                            Underground
                        </label>
                    </div>
                    <div>
                        <label for="groundType">
                            <input type="checkbox" id="groundType" name="stationType" value="ground">
                            Ground
                        </label>
                    </div>
                    <div>
                        <label for="suspendedType">
                            <input type="checkbox" id="suspendedType" name="stationType" value="suspended">
                            Suspended
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" type="submit" form="stationForm" id="saveStation">Save Station</button>
                <button class="btn btn-danger" type="button" id="deleteStation" style="display:none;">Delete
                    Station</button>
            </div>
        </div>
    </div>

    <div id="addLineModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="lineModalTitle">Create Line</h2>
                <span class="close line-modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <div id="lineForm">
                    <input type="hidden" id="lineIndex">
                    <label for="lineName">Line Name:</label>
                    <input type="text" id="lineName" name="lineName">

                    <label for="lineCode">Line Code (2 letters):</label>
                    <input type="text" id="lineCode" name="lineCode" maxlength="2">

                    <label for="lineColor">Line Color:</label>
                    <input type="color" id="lineColor" name="lineColor" value="#000000">

                    <label>Line Type:</label>
                    <div>
                        <label for="undergroundLine">
                            <input type="radio" id="undergroundLine" name="lineType" value="underground">
                            Underground
                        </label>
                    </div>
                    <div>
                        <label for="groundLine">
                            <input type="radio" id="groundLine" name="lineType" value="ground">
                            Ground
                        </label>
                    </div>
                    <div>
                        <label for="suspendedLine">
                            <input type="radio" id="suspendedLine" name="lineType" value="suspended">
                            Suspended
                        </label>
                    </div>

                    <div id="trainAssignment">
                        <label for="assignedTrain">Assign Train:</label>
                        <select id="assignedTrain" name="assignedTrain">
                            <option value="">-- Select a Train --</option>
                        </select>
                        <label for="trainQuantity">Qty:</label> <input type="number" id="trainQuantity"
                            name="trainQuantity" min="0" value="0" disabled>
                        <span id="maxTrainQuantity"></span>
                    </div>

                    <div id="list-modal">
                        <div id="modal-content">
                            <ul id="modal-list"></ul>
                            <button id="close-modal-button">Close</button>
                        </div>
                    </div>

                    <label style="margin-top: 15px;">Stations:</label>
                    <div id="plus-buttons-container">
                        <button class="plus-button btn btn-success">+</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-info" type="button" id="createExpressServiceBtn" style="display:none;">Create
                    Express</button>
                <button class="btn btn-success" id="saveLine">Save Line</button>
                <button class="btn btn-danger" type="button" id="deleteLine" style="display:none;">Delete Line</button>
            </div>
        </div>
    </div>

    <div id="stationLinesModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Lines at <span id="connectedStationName"></span></h2> <span
                    class="close station-lines-modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <ul id="stationLinesList">
                </ul>
            </div>
            <div class="modal-footer">
            </div>
        </div>
    </div>

    <div id="expressServiceModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Select Express Stations</h2> <span class="close express-service-modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <p>Select stations for the express service. Endpoints are required.</p>
                <ul id="expressStationsList">
                </ul>
            </div>
            <div class="modal-footer">
                <button class="btn btn-info" id="createExpressLineBtn">Create Express Line</button>
            </div>
        </div>
    </div>

    <div id="cursorCoords" style="
    position: absolute;
    pointer-events: none;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;
    display: none; /* Hidden by default, especially for touch */
    z-index: 9999;">
    </div>

    <script src="{{ asset('main.js') }}"></script>

    <div class="offcanvas offcanvas-start" tabindex="-1" id="lineList" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasExampleLabel">Lines</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div>
                <ul id="lineListItems"></ul>
            </div>
        </div>
    </div>

    <div id="statsPanel">
        <div>
            <strong style="font-size: 15px; text-decoration: underline;">Statistics:</strong>
        </div>
        <div>
            <strong>Stations:</strong>
            <div>Total: <span id="totalStations">0</span></div>
            <div>Ground: <span id="groundStations">0</span></div>
            <div>Underground: <span id="undergroundStations">0</span></div>
            <div>Suspended: <span id="suspendedStations">0</span></div>
            <div><strong>||</strong></div>
        </div>
        <div>
            <strong>Lines:</strong>
            <div>Total: <span id="totalLines">0</span></div>
            <div>Ground: <span id="groundLines">0</span></div>
            <div>Underground: <span id="undergroundLines">0</span></div>
            <div>Suspended: <span id="suspendedLines">0</span></div>
            <div>Express: <span id="expressLinesStat">0</span></div>
            <div><strong>||</strong></div>
        </div>
        <div>
            <strong>Trains:</strong>
            <div>Total: <span id="totalTrainsStat">0</span></div>
            <div>Ground: <span id="groundTrainsStat">0</span></div>
            <div>Underground: <span id="undergroundTrainsStat">0</span></div>
            <div>Suspended: <span id="suspendedTrainsStat">0</span></div>
        </div>
    </div>

</body>

</html>