const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const status_text = document.getElementById("status");
const time_text = document.getElementById("timeText");
const upper_text = document.getElementById("introText");

const dark_button = document.getElementById("darkModeButton");
let dark_mode = false;
let colors = {
    background: "white",
    wall: "black",
    target: "blue"
};

const hide_controls_button = document.getElementById("hideControlsButton");
const controls = document.getElementById("controls")
let controls_hidden = false;
if (localStorage.getItem("controlsHidden") === "true") {
    controls_hidden = true;
    controls.classList.toggle("hidden");
    hide_controls_button.textContent = "Show D-pad";
}

let levelTimes;
let levelSolved;
let lastTimestamp = Date.now();
if (localStorage.getItem("levelTimes") === null || localStorage.getItem("levelSolved") === null) {
    levelTimes = Array(levels.length).fill(0);
    levelSolved = Array(levels.length).fill(0);
    localStorage.setItem("levelTimes", levelTimes);
    localStorage.setItem("levelSolved", levelSolved);
} else {
    levelTimes = localStorage.getItem("levelTimes").split(",").map(Number);
    levelSolved = localStorage.getItem("levelSolved").split(",").map(Number);
    if (levelTimes.length !== levels.length) {
        levelTimes = Array(levels.length).fill(0);
    }
    if (levelSolved.length !== levels.length) {
        levelSolved = Array(levels.length).fill(false);
    }
}

function show_time(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);

    const ss = seconds % 60;
    const ss_string = String(ss).padStart(2, "0");
    const minutes = Math.floor(seconds / 60);

    const mm = minutes % 60;
    const mm_string = String(mm).padStart(2, "0");
    const hh = Math.floor(minutes / 60);

    if (hh == 0) {
        return `${mm}:${ss_string}`;
    } else {
        return `${hh}:${mm_string}:${ss_string}`;
    }
}

setInterval(function () {
    const currentTimestamp = Date.now();
    const elapsed = currentTimestamp - lastTimestamp;

    if (!levelSolved[level_select.value]) {
        levelTimes[level_select.value] += elapsed
        time_text.textContent = `Time elapsed: ${show_time(levelTimes[level_select.value])}`;
    }

    lastTimestamp = currentTimestamp;
    localStorage.setItem("levelTimes", levelTimes);
}, 250);

let mouse_down = false;
let scratch_work = new Set();
let last_mouse_x = -1;
let last_mouse_y = -1;
let draw_mode = 0;

const level_select = document.getElementById("levelSelect");
const previous_level = document.getElementById("previousLevel");
const next_level = document.getElementById("nextLevel");
const reset_level = document.getElementById("resetLevel");

const up_button = document.getElementById("upButton");
const down_button = document.getElementById("downButton");
const left_button = document.getElementById("leftButton");
const right_button = document.getElementById("rightButton");
const undo_button = document.getElementById("undoButton");

const tile_size = 50;
const wall_size = 5;
const wall_length = tile_size + wall_size
const tile_offset = wall_length / 2;
const half_wall_size = wall_size / 2;

const player_size = 36;
const player_offset = tile_offset - player_size / 2;
const font_size = player_size * 0.75;

const player_num_rounder = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

const status_num_rounder = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 10
});

for (let i = 0; i < levels.length; i++) {
    const option = document.createElement("option");

    option.value = i;
    option.textContent = levels[i].title;

    level_select.appendChild(option);
}

let maze;
let height;
let width;
let target_x;
let target_y;
let walls_h;
let walls_v;
let start_num;
let target_num;
let player_x;
let player_y;
let player_num;
let intro_text;
let player_path;

function initialize_maze(level_number) {
    let level_data = levels[level_number];

    maze = level_data.maze;
    height = maze.length;
    width = maze[0].length;
    target_x = width - 1;
    target_y = 0;

    canvas.width = width * tile_size + wall_size;
    canvas.height = width * tile_size + wall_size;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    walls_h = level_data.walls_h;
    walls_v = level_data.walls_v;

    start_num = level_data.start_num;
    target_num = level_data.target_num;

    player_x = 0;
    player_y = height - 1;
    player_num = start_num;

    if (level_select.selectedIndex === 0 && dark_mode) {
        intro_text = level_data.alt_intro_text;
    } else {
        intro_text = level_data.intro_text;
    }
    upper_text.innerHTML = intro_text;

    player_path = [[player_x, player_y, start_num]];

    if (levelSolved[level_select.value]) {
        time_text.textContent = `Solved in ${show_time(levelTimes[level_select.value])}!`;
    } else {
        time_text.textContent = `Time elapsed: ${show_time(levelTimes[level_select.value])}`;
    }

    mouse_down = false;
    scratch_work = new Set();
    last_mouse_x = -1;
    last_mouse_y = -1;
    draw_mode = 0;

    draw();
}

function avoidsPath(new_x, new_y) {
    for (let i = 0; i < player_path.length; i++) {
        if (player_path[i][0] == new_x && player_path[i][1] == new_y) {
            return false
        }
    }
    return true
}

function updateNum(old_num, new_x, new_y) {
    const current_text = maze[new_y][new_x];
    let new_num = old_num;
    if (current_text.length > 0) {
        oper_num = parseInt(current_text.slice(1), 10);
        if (current_text[0] == '+') {
            new_num = old_num + oper_num;
        } else if (current_text[0] == '-') {
            new_num = old_num - oper_num;
        } else if (current_text[0] == 'x') {
            new_num = old_num * oper_num;
        } else if (current_text[0] == '/') {
            new_num = old_num / oper_num;
        }
    }
    player_path.push([new_x, new_y, new_num]);
    return new_num;
}

function reverseNum(old_num, new_x, new_y) {
    const current_text = maze[new_y][new_x];
    let new_num = old_num;
    if (current_text.length > 0) {
        oper_num = parseInt(current_text.slice(1), 10);
        if (current_text[0] == '+') {
            new_num = old_num - oper_num;
        } else if (current_text[0] == '-') {
            new_num = old_num + oper_num;
        } else if (current_text[0] == 'x') {
            new_num = old_num / oper_num;
        } else if (current_text[0] == '/') {
            new_num = old_num * oper_num;
        }
    }
    return new_num;
}

function scratchNeighbors(endpoint_x, endpoint_y) {
    const up_neighbor = `${endpoint_x},${endpoint_y - 1},${endpoint_x},${endpoint_y}`;
    const down_neighbor = `${endpoint_x},${endpoint_y},${endpoint_x},${endpoint_y + 1}`;
    const left_neighbor = `${endpoint_x - 1},${endpoint_y},${endpoint_x},${endpoint_y}`;
    const right_neighbor = `${endpoint_x},${endpoint_y},${endpoint_x + 1},${endpoint_y}`;
    return [
        [up_neighbor, endpoint_x, endpoint_y - 1],
        [down_neighbor, endpoint_x, endpoint_y + 1],
        [left_neighbor, endpoint_x - 1, endpoint_y],
        [right_neighbor, endpoint_x + 1, endpoint_y]
    ];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.wall;

    for (let j = 0; j < height + 1; j++) {
        for (let i = 0; i < width; i++) {
            if (walls_h[j][i]) {
                ctx.fillRect(i * tile_size, j * tile_size, wall_length, wall_size);
            }
        }
    }

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width + 1; i++) {
            if (walls_v[j][i]) {
                ctx.fillRect(i * tile_size, j * tile_size, wall_size, wall_length);
            }
        }
    }

    ctx.strokeStyle = "lightgreen";
    for (const entry of scratch_work) {
        const coords = entry.split(",").map(Number);
        ctx.beginPath();
        ctx.moveTo(coords[0] * tile_size + tile_offset, coords[1] * tile_size + tile_offset);
        ctx.lineTo(coords[2] * tile_size + tile_offset, coords[3] * tile_size + tile_offset);
        ctx.stroke();
    }

    ctx.strokeStyle = "red";
    ctx.lineWidth = wall_size;
    ctx.beginPath();
    ctx.moveTo(player_path[0][0] * tile_size + tile_offset, player_path[0][1] * tile_size + tile_offset);
    for (let i = 1; i < player_path.length; i++) {
        ctx.lineTo(player_path[i][0] * tile_size + tile_offset, player_path[i][1] * tile_size + tile_offset)
    }
    ctx.stroke()

    ctx.fillStyle = "green";
    let neighbors = 1;
    let last_line = "";
    let new_line = "";
    let current_x = target_x;
    let current_y = target_y;
    let current_num = target_num;
    while (neighbors === 1) {
        current_num = reverseNum(current_num, current_x, current_y);
        neighbors = 0;
        for (const entry of scratchNeighbors(current_x, current_y)) {
            line = entry[0];
            if (line !== last_line && scratch_work.has(line)) {
                neighbors++;
                new_line = line;
                current_x = entry[1];
                current_y = entry[2];
            }
        }
        last_line = new_line;
        if (neighbors === 0 && maze[current_y][current_x] === ""
            && (current_x !== player_x || current_y != player_y)
            && (current_x !== target_x || current_y != target_y)) {
            let rounded_current_num = 0.0 + Number(current_num.toFixed(10));
            const current_text = player_num_rounder.format(rounded_current_num);
            ctx.font = `${font_size * (2.0 / Math.max(2, current_text.length))}px Arial`
            ctx.fillText(current_text, current_x * tile_size + tile_offset, current_y * tile_size + tile_offset);
        }
    }

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            let cell_text = maze[j][i];
            if (j == target_y && i == target_x) {
                ctx.fillStyle = colors.target;
                cell_text = String(target_num);
            } else {
                ctx.fillStyle = colors.wall;
            }
            ctx.font = `${font_size * (2.0 / Math.max(2, cell_text.length))}px Arial`;
            ctx.fillText(cell_text, i * tile_size + tile_offset, j * tile_size + tile_offset);
        }
    }

    ctx.fillStyle = "red";
    ctx.fillRect(player_x * tile_size + player_offset, player_y * tile_size + player_offset, player_size, player_size);
    ctx.fillStyle = "cyan";
    let rounded_num = 0.0 + Number(player_num.toFixed(10));
    let player_text = player_num_rounder.format(rounded_num);
    ctx.font = `${font_size * (2.0 / Math.max(2, player_text.length))}px Arial`
    ctx.fillText(player_text, player_x * tile_size + tile_offset, player_y * tile_size + tile_offset);

    let status_num = status_num_rounder.format(rounded_num);
    if (player_x == target_x && player_y == target_y) {
        if (rounded_num == target_num) {
            if (level_select.value === 3) {
                status_text.textContent = "You're ready for the real thing!";
            } else {
                status_text.textContent = "You win!";
            }
            levelSolved[level_select.value] = 1;
            localStorage.setItem("levelSolved", levelSolved);
            time_text.textContent = `Solved in ${show_time(levelTimes[level_select.value])}!`;
        } else {
            status_text.innerHTML = `You need to finish with the target number <span style="color: ${colors.target};">${target_num}</span>. Keep trying! (Current number: <span style="color: red">${status_num}</span>)`;
        }
    } else {
        status_text.innerHTML = `Reach the top-right corner with the target number <span style="color: ${colors.target};">${target_num}</span> to win! (Current number: <span style="color: red">${status_num}</span>)`;
    }
}

function undo() {
    if (player_path.length > 1) {
        player_path.pop();
        last_point = player_path[player_path.length - 1];
        player_x = last_point[0];
        player_y = last_point[1];
        player_num = last_point[2];
        draw();
    }
}

function moveUp() {
    if (!walls_h[player_y][player_x] && avoidsPath(player_x, player_y - 1)) {
        player_y--;
        player_num = updateNum(player_num, player_x, player_y);
        draw();
    } else if (player_path.length > 1) {
        last_move = player_path[player_path.length - 2];
        if (last_move[0] == player_x && last_move[1] == player_y - 1) {
            undo();
        }
    }
}

function moveDown() {
    if (!walls_h[player_y + 1][player_x] && avoidsPath(player_x, player_y + 1)) {
        player_y++;
        player_num = updateNum(player_num, player_x, player_y);
        draw();
    } else if (player_path.length > 1) {
        last_move = player_path[player_path.length - 2];
        if (last_move[0] == player_x && last_move[1] == player_y + 1) {
            undo();
        }
    }
}

function moveLeft() {
    if (!walls_v[player_y][player_x] && avoidsPath(player_x - 1, player_y)) {
        player_x--;
        player_num = updateNum(player_num, player_x, player_y);
        draw();
    } else if (player_path.length > 1) {
        last_move = player_path[player_path.length - 2];
        if (last_move[0] == player_x - 1 && last_move[1] == player_y) {
            undo();
        }
    }
}

function moveRight() {
    if (!walls_v[player_y][player_x + 1] && avoidsPath(player_x + 1, player_y)) {
        player_x++;
        player_num = updateNum(player_num, player_x, player_y);
        draw();
    } else if (player_path.length > 1) {
        last_move = player_path[player_path.length - 2];
        if (last_move[0] == player_x + 1 && last_move[1] == player_y) {
            undo();
        }
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key == "ArrowUp" || event.key == "w") {
        moveUp();
    } else if (event.key == "ArrowDown" || event.key == "s") {
        moveDown();
    } else if (event.key == "ArrowLeft" || event.key == "a") {
        moveLeft();
    } else if (event.key == "ArrowRight" || event.key == "d") {
        moveRight();
    } else if (event.key == "z") {
        undo();
    } else if (event.key == "r") {
        level_select.dispatchEvent(new Event("change"));
    } else if (event.key == "n") {
        previous_level.dispatchEvent(new Event("click"));
    } else if (event.key == "m") {
        next_level.dispatchEvent(new Event("click"));
    }
});

level_select.addEventListener("change", function () {
    initialize_maze(Number(level_select.value));
    level_select.blur();
});

previous_level.addEventListener("click", function () {
    if (level_select.selectedIndex > 0) {
        level_select.selectedIndex--;
        level_select.dispatchEvent(new Event("change"));
    }
});

next_level.addEventListener("click", function () {
    if (level_select.selectedIndex < levels.length - 1) {
        level_select.selectedIndex++;
        level_select.dispatchEvent(new Event("change"));
    }
});

reset_level.addEventListener("click", function () {
    level_select.dispatchEvent(new Event("change"));
});

up_button.addEventListener("click", moveUp);
down_button.addEventListener("click", moveDown);
left_button.addEventListener("click", moveLeft);
right_button.addEventListener("click", moveRight);
undo_button.addEventListener("click", undo);

dark_button.addEventListener("click", function () {
    dark = document.body.classList.toggle("dark");
    if (dark_mode) {
        dark_mode = false;
        colors.background = "white";
        colors.wall = "black";
        colors.target = "blue";
        dark_button.textContent = "Dark mode";
        if (level_select.selectedIndex === 0) {
            upper_text.innerHTML = levels[0].intro_text;
        }
    } else {
        dark_mode = true;
        colors.background = "black";
        colors.wall = "white";
        colors.target = "cyan";
        dark_button.textContent = "Light mode";
        if (level_select.selectedIndex === 0) {
            upper_text.innerHTML = levels[0].alt_intro_text;
        }
    }
    localStorage.setItem("darkMode", dark);
    draw();
});

hide_controls_button.addEventListener("click", function () {
    controls_hidden = !controls_hidden;
    controls.classList.toggle("hidden");
    localStorage.setItem("controlsHidden", controls_hidden);
    if (controls_hidden) {
        hide_controls_button.textContent = "Show D-pad";
    } else {
        hide_controls_button.textContent = "Hide D-pad";
    }
});

canvas.addEventListener("pointerdown", function (event) {
    mouse_down = true;
    canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointerup", function (event) {
    mouse_down = false;
    draw_mode = 0;
    last_mouse_x = -1;
    last_mouse_y = -1;
    canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener("pointercancel", function (event) {
    mouse_down = false;
    draw_mode = 0;
    last_mouse_x = -1;
    last_mouse_y = -1;
});

canvas.addEventListener("pointermove", function (event) {
    if (mouse_down) {
        const rect = canvas.getBoundingClientRect();

        const unclipped_mouse_x = Math.floor((event.clientX - rect.left - half_wall_size) / tile_size);
        const mouse_x = Math.min(width - 1, Math.max(0, unclipped_mouse_x));
        const unclipped_mouse_y = Math.floor((event.clientY - rect.top - half_wall_size) / tile_size);
        const mouse_y = Math.min(width - 1, Math.max(0, unclipped_mouse_y));

        const mouse_x_delta = mouse_x - last_mouse_x;
        const mouse_y_delta = mouse_y - last_mouse_y;

        let drawn_line = "";
        if (mouse_x_delta === 0 && mouse_y_delta === -1) {
            if (last_mouse_x === player_x && last_mouse_y === player_y && draw_mode % 2 === 0) {
                draw_mode = 2;
                moveUp();
            } else if (!walls_h[last_mouse_y][mouse_x]) {
                drawn_line = `${mouse_x},${mouse_y},${last_mouse_x},${last_mouse_y}`;
            }
        } else if (mouse_x_delta === 0 && mouse_y_delta === 1) {
            if (last_mouse_x === player_x && last_mouse_y === player_y && draw_mode % 2 === 0) {
                draw_mode = 2;
                moveDown();
            } else if (!walls_h[mouse_y][mouse_x]) {
                drawn_line = `${last_mouse_x},${last_mouse_y},${mouse_x},${mouse_y}`;
            }
        } else if (mouse_x_delta === -1 && mouse_y_delta === 0) {
            if (last_mouse_x === player_x && last_mouse_y === player_y && draw_mode % 2 === 0) {
                draw_mode = 2;
                moveLeft();
            } else if (!walls_v[mouse_y][last_mouse_x]) {
                drawn_line = `${mouse_x},${mouse_y},${last_mouse_x},${last_mouse_y}`;
            }
        } else if (mouse_x_delta === 1 && mouse_y_delta === 0) {
            if (last_mouse_x === player_x && last_mouse_y === player_y && draw_mode % 2 === 0) {
                draw_mode = 2;
                moveRight();
            } else if (!walls_v[mouse_y][mouse_x]) {
                drawn_line = `${last_mouse_x},${last_mouse_y},${mouse_x},${mouse_y}`;
            }
        }

        if (drawn_line !== "") {
            if (draw_mode === 0) {
                draw_mode = scratch_work.has(drawn_line) ? -1 : 1;
            }
            if (draw_mode === 1) {
                scratch_work.add(drawn_line);
            } else if (draw_mode === -1) {
                scratch_work.delete(drawn_line);
            }
        }

        last_mouse_x = mouse_x;
        last_mouse_y = mouse_y;

        draw();
    }
});

initialize_maze(0);

if (localStorage.getItem("darkMode") === "true") {
    dark_button.dispatchEvent(new Event("click"));
}