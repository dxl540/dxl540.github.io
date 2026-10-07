id = "id"
title = "title"
intro_text = "intro_text"
maze = "maze"
walls_h = "walls_h"
walls_v = "walls_v"
start_num = "start_num"
target_num = "target_num"

levels = [
    {
        id: "todo",
        title: "In Prod",
        intro_text: "a",
        maze: [
            ["x5", "", "+1", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["x3", "", "x5", "", "+1", "", ""],
            ["", "", "", "", "", "", ""],
            ["x3", "", "x3", "", "x5", "", "+1"],
            ["", "", "", "", "", "", ""],
            ["", "", "x3", "", "x3", "", "x5"]
        ],
        walls_h: [
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 1, 1, 0, 1, 0, 0],
            [0, 0, 1, 0, 1, 1, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1]
        ],
        walls_v: [
            [1, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1],
            [1, 1, 0, 0, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 0, 0, 1, 1],
            [1, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 1, 0, 0, 0, 0, 1]
        ],
        start_num: 1,
        target_num: 2026
    }]

for level in levels:
    tt = level[title]
    mz = level[maze]
    wh = level[walls_h]
    wv = level[walls_v]
    sn = level[start_num]
    tn = level[target_num]

    seen = {}

    def updateNum(curr_num, text):
        new_num = curr_num
        if text:
            oper_num = int(text[1:])
            if text[0] == "+":
                new_num += oper_num
            elif text[0] == "-":
                new_num -= oper_num
            elif text[0] == "x":
                new_num *= oper_num
            elif text[0] == "/":
                new_num /= oper_num
        return new_num

    dirs = ((0, 1, "d"), (1, 0, "r"), (0, -1, "u"), (-1, 0, "l"))
    h = len(mz)
    w = len(mz[0])
    tx = w-1
    ty = 0

    def search(x, y, path, pathname, curr_num, target_num, validation = (lambda x: True)):
        # print(pathname)
        if x == tx and y == ty:
            seen[curr_num] = seen.get(curr_num, []) + [pathname]
            if abs(curr_num - target_num) < 1e-10:
                yield pathname
            return
        for dx, dy, dname in dirs:
            nx = x + dx
            ny = y + dy
            if dx == 0:
                wall = wh[y+max(dy, 0)][x]
            else:
                wall = wv[y][x+max(dx,0)]
            if (not wall) and (nx, ny) not in path:
                new_num = updateNum(curr_num, mz[ny][nx])
                if validation(new_num):
                    yield from search(nx, ny, path + ((nx, ny),), pathname + dname, new_num, target_num, validation)

    print(tt)
    # if tt in {"Limbo", "Hide and Go Greek", "Freeform", "Fragmented", "Partitioned", "Collatz's Nightmare", "All for Naught"}:
    if False:
        print("skipped")
        print()
        continue
    sols = list(search(0, h-1, ((0, h-1),), "", sn, tn))

    for sol in sols:
        print(sol)

    # for final in seen:
    #     if len(seen[final]) <= 5:
    #         print(final, len(seen[final]), len(seen[final][0]), seen[final][0])

    print()