window.addEventListener("load", () => {

    const glossary = [{
        name: "Blinker",
        url: "https://conwaylife.com/wiki/Blinker",
        thumbnail: "https://conwaylife.com/w/images/b/b9/Blinker.gif",
        cells: [
            [0, -1],
            [0, 0],
            [0, 1]
        ]
    }, {
        name: "Glider",
        url: "https://conwaylife.com/wiki/Glider",
        thumbnail: "https://conwaylife.com/w/images/8/81/Glider.gif",
        cells: [
            [0, -1],
            [0, 1],
            [1, 0],
            [1, 1],
            [-1, 1]
        ]
    }, {
        name: "Gospel Glider Gun",
        url: "https://conwaylife.com/wiki/Gosper_glider_gun",
        thumbnail: "https://conwaylife.com/w/images/b/b6/Gosperglidergun.gif",
        cells: [
            [0, -17],
            [0, -16],
            [1, -17],
            [1, -16],
            [-1, 17],
            [-1, 18],
            [-2, 17],
            [-2, 18],
            [1, 0],
            [0, -1],
            [1, -1],
            [2, -1],
            [-1, -2],
            [3, -2],
            [1, -3],
            [-2, -4],
            [-2, -5],
            [4, -4],
            [4, -5],
            [-1, -6],
            [3, -6],
            [0, -7],
            [1, -7],
            [2, -7],
            [0, 3],
            [0, 4],
            [-1, 3],
            [-1, 4],
            [-2, 3],
            [-2, 4],
            [1, 5],
            [-3, 5],
            [1, 7],
            [2, 7],
            [-3, 7],
            [-4, 7],
        ]
    }, {
        name: "R-pentomino",
        url: "https://conwaylife.com/wiki/R-pentomino",
        thumbnail: "https://conwaylife.com/w/images/6/6e/Rpentomino.png",
        cells: [
            [0, 0],
            [0, 1],
            [1, 1],
            [-1, 1],
            [-1, 2]
        ]
    }, {
        name: "Stairstep hexomino",
        url: "https://conwaylife.com/wiki/Stairstep_hexomino",
        thumbnail: "https://conwaylife.com/w/images/8/8b/Stairstephexomino.png",
        cells: [
            [1, 1],
            [1, 0],
            [0, 0],
            [0, -1],
            [-1, -1],
            [-1, -2]
        ]
    }];

    let zoomSpeed = 1.2;
    let timeBetweenStepsMs = 100;

    function celln(i, j) {
        return `${i}_${j}`;
    }

    function ncell(s) {
        const split = s.split("_");
        return { i: parseInt(split[0]), j: parseInt(split[1]) };
    }

    const canvas = document.getElementById("canvas");
    canvas.style.cursor = "grab";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext("2d");
    context.font = "18px monospace";

    let cells = new Set();
    const camera = { pos: { x: 0.5, y: 0.5 }, scale: 20 };
    let step = 0;
    let isMouseDown = false;
    let mouseDownX = null;
    let mouseDownY = null;
    let timeOfPreviousStep = 0;
    let paused = true;
    let isShiftDown = false;

    function loadRawCells(rawCells) {
        cells = new Set();
        rawCells.forEach(cell => {
            cells.add(celln(...cell));
        });
    }

    function updateCells() {
        let newCells = new Set();
        let checked = new Set();
        let toCheck = Array.from(cells);
        while (toCheck.length > 0) {
            let cell = toCheck.pop();
            if (checked.has(cell)) {
                continue;
            }
            checked.add(cell);
            let pos = ncell(cell);
            let currentlyAlive = cells.has(cell);
            let aliveNeighbors = 0;
            [-1, 0, 1].forEach(di => {
                [-1, 0, 1].forEach(dj => {
                    if (di == 0 && dj == 0) {

                    } else {
                        let neighborCell = celln(pos.i + di, pos.j + dj);
                        let neighborIsAlive = cells.has(neighborCell);
                        if (neighborIsAlive) {
                            aliveNeighbors++;
                        }
                        if (neighborIsAlive || currentlyAlive) {
                            toCheck.push(neighborCell);
                        }
                    }
                });
            });
            if ((currentlyAlive && (aliveNeighbors == 2 || aliveNeighbors == 3)) || (!currentlyAlive && aliveNeighbors == 3)) {
                newCells.add(cell);
            }
        }
        cells = newCells;
    }

    function updateCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#000000";
        cells.forEach(cell => {
            const pos = ncell(cell);
            context.fillRect((pos.j - camera.pos.x) * camera.scale + width / 2, (pos.i - camera.pos.y) * camera.scale + height / 2, camera.scale, camera.scale);
        });
        context.fillText(`${ step }`, 8, 20);
    }

    function update() {
        let now = new Date();
        if (now - timeOfPreviousStep > timeBetweenStepsMs && !paused) {
            timeOfPreviousStep = now;
            step++;
            updateCells();
        }
        updateCanvas();
        requestAnimationFrame(update);
    }

    function clear() {
        cells = new Set();
        step = 0;
    }

    function togglePlayback() {
        paused = !paused;
        document.getElementById("button-play-pause").textContent = paused ? "▶" : "⏸";
    }

    function toggleCellFromEvent(event) {
        let mouseClickJ = Math.floor((event.clientX - width / 2) / camera.scale + camera.pos.x);
        let mouseClickI = Math.floor((event.clientY - height / 2) / camera.scale + camera.pos.y);
        let cell = celln(mouseClickI, mouseClickJ);
        if (cells.has(cell)) {
            cells.delete(cell);
        } else {
            cells.add(cell);
        }
    }

    canvas.addEventListener("mousedown", (event) => {
        isMouseDown = true;
        if (isShiftDown) {
            toggleCellFromEvent(event);
        } else {
            mouseDownX = (event.clientX - width / 2) / camera.scale;
            mouseDownY = (event.clientY - height / 2) / camera.scale;
            canvas.style.cursor = "grabbing";
        }
    });

    window.addEventListener("mousemove", (event) => {
        if (isMouseDown && !isShiftDown) {
            mouseMoveX = (event.clientX - width / 2) / camera.scale;
            mouseMoveY = (event.clientY - height / 2) / camera.scale;
            camera.pos.x += mouseDownX - mouseMoveX;
            camera.pos.y += mouseDownY - mouseMoveY;
            mouseDownX = mouseMoveX;
            mouseDownY = mouseMoveY;
        }
    });

    window.addEventListener("mouseup", (event) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        if (!isShiftDown) {
            canvas.style.cursor = "grab";
        }
    });

    window.addEventListener("wheel", (event) => {
        const newScale = (event.deltaY < 0) ? camera.scale * zoomSpeed : camera.scale / zoomSpeed;
        const offsetFactor = (1 / camera.scale - 1 / newScale);
        camera.pos.x += (event.clientX - width / 2) * offsetFactor;
        camera.pos.y += (event.clientY - height / 2) * offsetFactor;
        camera.scale = newScale;
    });

    window.addEventListener("keydown", (event) => {
        console.log(event.key);
        if (event.key == " ") {
            togglePlayback();
            canvas.focus();
        } else if (event.key == "Shift") {
            isShiftDown = true;
            canvas.style.cursor = "crosshair";
        }
        document.activeElement.blur();
    });

    window.addEventListener("keyup", (event) => {
        if (event.key == "Shift") {
            isShiftDown = false;
            canvas.style.cursor = "grab";
        }
    });

    document.getElementById("button-speed-fast").addEventListener("click", () => {
        timeBetweenStepsMs = 0;
        if (paused) togglePlayback();
    });

    document.getElementById("button-speed-medium").addEventListener("click", () => {
        timeBetweenStepsMs = 100;
        if (paused) togglePlayback();
    });

    document.getElementById("button-speed-slow").addEventListener("click", () => {
        timeBetweenStepsMs = 1000;
        if (paused) togglePlayback();
    });

    document.getElementById("button-canvas-home").addEventListener("click", () => {
        camera.pos.x = 0.5;
        camera.pos.y = 0.5;
        camera.scale = 20;
    });

    document.getElementById("button-canvas-erase").addEventListener("click", () => {
        clear();
    });

    document.getElementById("button-canvas-random").addEventListener("click", () => {
        clear();
        for (let i = -20; i <= 20; i++) {
            for (let j = -40; j <= 40; j++) {
                if (Math.random() < .3) {
                    cells.add(celln(i, j));
                }
            }
        }
    });

    document.getElementById("button-play-pause").addEventListener("click", () => {
        togglePlayback();
    });

    document.getElementById("button-next").addEventListener("click", () => {
        step++;
        updateCells();
    });

    function inflateGlossary() {
        const patternList = document.getElementById("patterns-list");
        const patternImage = document.getElementById("patterns-img");
        glossary.forEach(pattern => {
            const button = document.createElement("button");
            button.textContent = pattern.name;
            button.style.marginTop = "0.2rem";
            patternList.appendChild(button);
            button.addEventListener("click", () => {
                clear();
                loadRawCells(pattern.cells);
            });
            button.addEventListener("mouseenter", () => {
                console.log(pattern.thumbnail);
                patternImage.style.backgroundImage = `url(${ pattern.thumbnail })`;
            });
        });
    }

    inflateGlossary();
    update();

});