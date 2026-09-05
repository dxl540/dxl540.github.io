const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const status_text = document.getElementById("status");
const upper_text = document.getElementById("introText");

const level_select = document.getElementById("levelSelect");
const previous_level = document.getElementById("previousLevel");
const next_level = document.getElementById("nextLevel");

const up_button = document.getElementById("upButton");
const down_button = document.getElementById("downButton");
const left_button = document.getElementById("leftButton");
const right_button = document.getElementById("rightButton");
const undo_button = document.getElementById("undoButton");

const tile_size = 50;
const wall_size = 5;
const tile_offset = (tile_size + wall_size) / 2;

const player_size = 36;
const player_offset = tile_offset - player_size / 2;
const font_size = player_size * 0.75;

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

    intro_text = level_data.intro_text;
    upper_text.innerHTML = intro_text;

    player_path = [[player_x, player_y, start_num]];

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
    current_text = maze[new_y][new_x];
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";

    for (let j = 0; j < height + 1; j++) {
        for (let i = 0; i < width; i++) {
            if (walls_h[j][i]) {
                ctx.fillRect(i * tile_size, j * tile_size, tile_size + wall_size, wall_size);
            }
        }
    }

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width + 1; i++) {
            if (walls_v[j][i]) {
                ctx.fillRect(i * tile_size, j * tile_size, wall_size, tile_size + wall_size);
            }
        }
    }

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            let cell_text = maze[j][i];
            if (j == target_y && i == target_x) {
                ctx.fillStyle = "blue";
                cell_text = String(target_num);
            } else {
                ctx.fillStyle = "black";
            }
            ctx.font = `${font_size * (2.0 / Math.max(2, cell_text.length))}px Arial`;
            ctx.fillText(cell_text, i * tile_size + tile_offset, j * tile_size + tile_offset);
        }
    }

    ctx.strokeStyle = "red";
    ctx.lineWidth = wall_size;
    ctx.beginPath();
    ctx.moveTo(player_path[0][0] * tile_size + tile_offset, player_path[0][1] * tile_size + tile_offset);
    for (let i = 1; i < player_path.length; i++) {
        ctx.lineTo(player_path[i][0] * tile_size + tile_offset, player_path[i][1] * tile_size + tile_offset)
    }
    ctx.stroke()

    ctx.fillStyle = "red";
    ctx.fillRect(player_x * tile_size + player_offset, player_y * tile_size + player_offset, player_size, player_size);
    ctx.fillStyle = "cyan";
    let player_text = String(player_num)
    ctx.font = `${font_size * (2.0 / Math.max(2, player_text.length))}px Arial`
    ctx.fillText(player_text, player_x * tile_size + tile_offset, player_y * tile_size + tile_offset);

    if (player_x == target_x && player_y == target_y) {
        if (player_num == target_num) {
            if (level_select.selectedIndex == 3) {
                status_text.textContent = "You're ready for the real thing!";
            } else {
                status_text.textContent = "You win!";
            }
        } else {
            status_text.textContent = `You need to finish with the target number ${target_num}. Keep trying!`;
        }
    } else {
        status_text.textContent = `Reach the top-right corner with the target number ${target_num} to win!`;
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

up_button.addEventListener("click", moveUp);
down_button.addEventListener("click", moveDown);
left_button.addEventListener("click", moveLeft);
right_button.addEventListener("click", moveRight);
undo_button.addEventListener("click", undo);

initialize_maze(0);