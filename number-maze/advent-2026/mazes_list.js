const levels = [
    {
        id: "day0",
        title: "In Prod",
        intro_text: `Welcome to the <b>2026 Number Mazes Advent Calendar!</b>
        This is a collection of 25 number mazes which will release throughout December.
        
        Quick rules refresher: <b>arrow keys/WASD/drag</b> to move the red square.
        The red square has a <b>number</b>. Passing through an operation will <b>apply</b> it to your number.
        Reach the <b>top-right</b> square with the target number in blue to win!
        More detailed rules and some easier puzzles can be found <a href=https://dxl540.github.io/number-maze>here</a>.
        
        Every day from December 1-25, a new puzzle will release here at <b>midnight Pacific time</b>.
        Don't worry, the timer only counts when you're on the page, so you won't have to stay up.
        These puzzles will start off fairly easy but increase in difficulty throughout the month.
        Below is a sample puzzle! (Rest assured, the actual puzzles will start off easier than this.)
        
        I might be interested in having some people testsolve these puzzles before they go live.
        If you're interested in testsolving, DM me on Discord!
        (To prevent too many testsolvers, I'm limiting it to people who know my Discord username.)`,
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
    }];