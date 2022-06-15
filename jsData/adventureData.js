module.exports = [
    {
        name: 'testerrealm',
        adventureName: 'Tester Realm',
        description: 'Encounter the testers for this bot!',
        color: 'BLUE',
        items: [
            { name: 'sword', multi: 5 },
            { name: 'bar_iron', multi: 5 },
            { name: 'exoticberry', multi: 5 },
            { name: 'stone', multi: 3 },
            { name: 'hotdog', multi: 3 },
            { name: 'diamond', multi: 1 },
        ],
        stages: [
            { 
                description: 'You spotted Angry Bee tending to a beehive. Your stomach grumbles from hunger.',
                choices: [
                    { 
                        description: 'Steal honey', chances: [
                            { chance: 0.2, description: 'You stole the honey and sold it, getting you ⏣ 400,000, wtf?', add: { type: 'coin', amount: 400000 } },
                            { chance: 0.7, description: 'Angry Bee spotted you and swung his beehive at you. You ran away like a coward.', loss: [1,0,0] },
                            { chance: 0.1, description: 'You looked inside Angry Bee\'s hive and the bees swarmed you and stung you, oof', loss: [0,1,0] }
                        ]
                    },
                    {
                        description: 'Run away', chances: [
                            { chance: 0.9, description: 'You ran away, nothing happened lol' },
                            { chance: 0.1, description: 'As you ran away, you tripped on a bee stinger and got stung to death.', loss: [0,1,0] },
                        ]
                    },
                ]
            },
            {
                description: 'Nezuko Ackerman is furiously typing away at his computer, wonder what he\'s doing.',
                choices: [
                    {
                        description: 'Look at his screen', chances: [
                            { chance: 0.2, description: 'You gave him an idea to post a ridiculous trade ad on a Dank Memer trading server, so he gave you ⏣ 10,000.', add: { type: 'coin', amount: 10000 } },
                            { chance: 0.7, description: '\'Mind your own business, jerk\'', loss: [0.5,0,0] },
                            { chance: 0.1, description: 'You surprised Nezuko so much that spilt his piping hot cup of coffee all over you.', loss: [0.5,0,0.1] },
                        ]
                    },
                    {
                        description: 'Creep away', chances: [
                            { chance: 1, description: 'You crept away from his room just as he screamed and died from fall damage in Minecraft. Lol what a noob' }
                        ]
                    }
                ]
            },
            {
                description: 'Chill is hosting a giant giveaway! Let\'s join it!',
                choices: [
                    {
                        description: 'Join the giveaway', chances: [
                            { chance: 0.3, description: 'You won the giveaway and got some jade!', add: { type: 'item', name: 'jade' } },
                            { chance: 0.69, description: 'You didn\'t win the giveaway, rip' },
                            { chance: 0.01, description: 'WOAH! You won the grand prize for the giveaway, and got a friend!', add: { type: 'item', name: 'friend' } }
                        ]
                    },
                    {
                        description: 'Don\'t join the giveaway', chances: [
                            { chance: 1, description: 'You watch as Jem wins giveaway after giveaway after giveaway... is he hacking???' }
                        ]
                    },
                    {
                        description: 'Bribe', chances: [
                            { chance: 0.95, description: 'After losing the giveaway, you try to bribe chill to give you the prize. He gets angry and bans you from his server.', loss: [1,0,0] },
                            { chance: 0.05, description: 'You bribed chill and he gave you the grand prize!', add: { type: 'item', name: 'friend' } }
                        ]
                    }
                ]
            },
            {
                description: 'You find _DarkNova and D4RKN355 snoring on their gaming chairs after playing on Hypixel for ten straight hours now, what do you do?',
                choices: [
                    {
                        description: 'Search their pockets', chances: [
                            { chance: 0.5, description: 'You pickpocketed them and found ⏣ 50,000, didn\'t know they were that rich lol', add: { type: 'coin', amount: 50000 } },
                            { chance: 0.5, description: 'Your hand got stuck in their pocket and woke them up. They\'re so grumpy that they clobber you with their gaming chairs, instantly killing you.', loss: [0,1,0] }
                        ]
                    },
                    {
                        description: 'Steal _DarkNova\'s Minecraft account', chances: [
                            { chance: 0.99, description: 'Having trained for this his entire life, _DarkNova immediately wakes up and slams you to the ground. Never mess with his Minecraft account.', loss: [0,1,0] },
                            { chance: 0.01, description: '_DarkNova usually would have killed you by now, but somehow he slept through it. Maybe someone gave him sleeping pills. You found ⏣ 5,000,000 in the account!', add: { type: 'coin', amount: 5000000 } }
                        ]
                    },
                    {
                        description: 'Tell D4RKN355 he\'s short', chances: [
                            { chance: 0.9, description: 'D4RKN355 wakes up, and kills you with emotional damage.', loss: [0,1,0] },
                            { chance: 0.1, description: 'D4RKN355 cries and gives you ⏣ 2,300,000 to go away, lez goooo', add: { type: 'coin', amount: 2300000 } }
                        ]
                    }
                ]
            },
            {
                description: 'Khio\'s in his room programming his Arduino bot. You see a pile of cash under his desk.',
                choices: [
                    {
                        description: 'Sneak in', chances: [
                            { chance: 0.2, description: 'Khio\'s so focused on making his Arduino bot that he didn\'t notice that you stole ⏣ 1,030,000.', add: { type: 'coin', amount: 1030000 } },
                            { chance: 0.8, description: 'He screams and drops his burning hot solder on your head, ouch.', loss: [0,1,0] }
                        ]
                    },
                    {
                        description: 'Ask', chances: [
                            { chance: 0.5, description: 'You walk over to his desk and asks how his Arduino bot is doing. He\'s so focused on making it and mumbles some answers to your questions, while you steal ⏣ 500,000 from under his desk.', add: { type: 'coin', amount: 500000 } },
                            { chance: 0.5, description: '\'Go away, I\'m trying to make this LED thing work here\'' }
                        ]
                    },
                    {
                        description: 'Attack', chances: [
                            { chance: 0.7, description: '\'AAAAAAAAAA\', he yells as he swings his solder over to you and slices you right in half.', loss: [0,1,0] },
                            { chance: 0.3, description: 'Khio looks over and sees you pointing your pencil menancingly at his neck. You manage to grab ⏣ 650,000 from under his desk.', add: { type: 'coin', amount: 650000 } }
                        ]
                    }
                ]
            },
            {
                description: 'You\'re about to take a dip inside the swimming pool, but you spot IanJames426 swimming. He\'s so fast, you could have mistaken him for a dolphin.',
                choices: [
                    {
                        description: 'Talk to him', chances: [
                            { chance: 0.5, description: '\'Social anxiety!\'', loss: [0.5,0,0] },
                            { chance: 0.5, description: '\'My wallet\'s over there, you can find ⏣ 45,000 in there\'', add: { type: 'coin', amount: 45000 } }
                        ]
                    },
                    {
                        description: 'Race him', chances: [
                            { chance: 0.95, description: 'He bets ⏣ 3,400,000 that he wins you in a swimming race. He wins, by 69 meters.', loss: [1,0,0] },
                            { chance: 0.05, description: 'He bets ⏣ 3,400,000 that he wins you in a swimming race, but he somehow pulls a muscle during the race and loses.', add: { type: 'coin', amount: 3400000 } }
                        ]
                    },
                ]
            }
        ],
        neutral: [
            `Zohn's making some really cool art of this cartoon, let's not bother him now`,
            `N35 squints an eye and throws a dart at the dartboard, hitting bullseye immediately. You want to play, but you have more important things to do.`,
            `You hear a furious Drone tapping at his keyboard, and see that he's playing Tetris. You watch him send three All Clears in 30 seconds, woah! Anyways, gotta go.`,
            `What's that on adasba's screen? Oh wow, he's got his Desmos fractal generator up and running, kinda looks cool. Oh no, he's coming back, run!`,
            `You hear some chuckling from MathEnthusiast314's room. You hear that he's mumbling something about Rubix cubes, the Mandelbrot, and the determinants of a matrix.`
        ]
    }
]