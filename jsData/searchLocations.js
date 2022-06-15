module.exports = [
    { 
        name: 'car', 
        minMax: [
            200,
            500
        ], 
        chance: [0.6, 0.1], 
        success: "The idiot in the car gave you {.MON}!", 
        fail: "You tried to unlock the car, but found that it was locked. Oh no, the car owner has spotted you, run!",
        die: 'There was a child in the car, and he threw the lollipop at you so hard that it stabbed right through your eye, ouch.',
        items: [
            { name: 'lamborghini', chance: 0.3 },
        ]
    },

    { 
        name: 'dumpster', 
        minMax: [
            1000,
            2000
        ], 
        chance: [0.9, 0], 
        success: "You found {.MON} in the dumpster, it stinks", 
        fail: "A napkin stuck to your face, so you couldn't search for money.",
        items: [
            { name: 'diamond', chance: 0.1 },
            { name: 'banknote', chance: 0.02 },
            { name: 'hotdog', chance: 0.05 },
            { name: 'air', chance: 0.007 },
        ]
    },

    { 
        name: 'street', 
        minMax: [
            1000,
            3000
        ], 
        chance: [0.5, 0.2], 
        success: "You found {.MON}, congratulations on risking your life and profiting from it.", 
        fail: "You almost got hit by a car, let's not search for money today.",
        die: 'You looked left and right, then crossed the street. But you forgot to look down and fell down into a sewer, where you banged your head against a pipe. Oof.',
        items: [
            { name: 'lamborghini', chance: 0.2 },
        ]
    },

    { 
        name: 'sewer', 
        minMax: [
            500,
            1500
        ], 
        chance: [0.9, 0.05], 
        success: "You got {.MON} in the sewer, now take a shower", 
        fail: "You searched through the sewer at night without a flashlight, so you couldn\'t get any coins.",
        die: "You fell down and hit your head on a pipe.",
        items: [
            { name: 'diamond', chance: 0.05 },
            { name: 'banknote', chance: 0.03 },
        ]
    },

    { 
        name: 'who asked', 
        minMax: [
            3000,
            6000
        ], 
        chance: [0.99, 0], 
        success: "Holy shit someone actually asked! Here, the one who asked wanted you to have {.MON}.", 
        fail: "Nobody asked, RIP",
        items: [
            { name: 'friend', chance: 0.005 }
        ],
    },

    { 
        name: 'pit', 
        minMax: [
            4000,
            8000
        ], 
        chance: [0.5, 0.2], 
        success: "You jumped in the pit and found {.MON}! How are you going to get out?", 
        fail: "You jumped in the pit and landed on some bones. You screamed and ran away, what a coward.",
        die: "You jumped down in the pit, just to find out that it was a leaf trap, and you fell through, 500 miles down into the Earth's core. You died before you got to the lava.",
        items: [
            { name: 'sword', chance: 0.16 },
            { name: 'banknote', chance: 0.02 },
        ]
    },

    { 
        name: 'grass', 
        minMax: [
            1000,
            1500
        ], 
        chance: [0.9, 0.05], 
        success: "You touched grass and found {.MON}.", 
        fail: "A dog shat on your hand, gross. No coins for u",
        die: 'Angry Bee summoned an infinite amount of bees to sting you. Don\'t trespass on his ground.',
        items: [
            { name: 'exoticberry', chance: 0.1 },
        ]
    },

    { 
        name: 'tree', 
        minMax: [
            500,
            2000
        ], 
        chance: [0.8, 0.1], 
        success: "You found {.MON}, why were you even looking in a tree?", 
        fail: "You tried to search through the trees, but the squirrels already found all the coins.",
        die: 'You climbed up, got scared by a squirrel, and fell down the tree. You hit your head and died.',
        items: [
            { name: 'exoticberry', chance: 0.07 },
        ]
    },

    { 
        name: 'vacuum', 
        minMax: [
            500,
            1000
        ], 
        chance: [0.6, 0], 
        success: "You found {.MON}, guess it doesn't suck!", 
        fail: "Your vacuum cleaner was too strong and broke the coins, wtf?",
        items: [
            { name: 'air', chance: 0.01 },
        ]
    },

    { 
        name: 'bank', 
        minMax: [
            500,
            1000
        ], 
        chance: [0.2 , 0.1], 
        success: "Ayo you robbed a bank and got {.MON}? Sick!", 
        fail: "You tried to rob a bank but someone robbed it before you, RIP",
        die: 'Someone else was robbing the bank. They didn\'t like the weird look you were giving them, so they shot you and you died.',
        items: [
            { name: 'banknote', chance: 0.01 },
        ]
    },

    { 
        name: 'school', 
        minMax: [
            300,
            3000
        ], 
        chance: [0.5, 0.2], 
        success: "You looked under your classmates' desks and found {.MON} stuck to a piece of gum, wtf?", 
        fail: "You found some old gum under the tables, but no coins :(", 
        die: 'Your teacher caught you searching his desk for money, so he took out his whip and whipped you to death.',
        items: [
            { name: 'friend', chance: 0.002 },
        ]
    },

    { 
        name: 'pocket', 
        minMax: [
            500,
            2000
        ], 
        chance: [1, 0], 
        success: "You found {.MON} in your pocket, now it's in your wallet.", 
        fail: "HOW DID YOU NOT FIND MONEY IN YOUR POCKET?"
    },

    { 
        name: 'fast food store', 
        minMax: [
            1000,
            6500
        ], 
        chance: [0.6, 0.1],
        success: "The chef looked at you and threw you {.MON}, now you can buy a snack!", 
        fail: "The chef screamed at you, telling you to go away. Go somewhere else to eat lol", 
        die: 'The chef threw a hot dog at you so hard, it slapped you into Brazil.',
        items: [
            { name: 'hotdog', chance: 0.2 },
        ]
    },

    {
        name: 'mcdonalds',
        minMax: [
            4000,
            5000,
        ],
        chance: [0.6, 0.1],
        success: 'You connected to McDonald\'s wifi and got {.MON}!',
        fail: 'You ordered a burger and ate it. Nothing happened lol',
        die: 'Turns out the McDonald\'s wifi was so bad it killed your phone. It killed you as well, oof.',
        items: [
            { name: 'mcdonaldsrouter', chance: 0.005 }
        ]
    },
]