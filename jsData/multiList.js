module.exports = [
    {
        name: 'Level up multis',
        max: 100,
        async value(profileData) {
            // Caps at level 1000 (100% multi), and increases by one every ten levels.
            return Math.min(Math.floor(profileData.xp / (10 * 100)), 1000 / 10);
        }
    },
    {
        name: 'Level 69',
        async value(profileData) {
            return (Math.floor(profileData.xp / 100) === 69 ? 69 : 0) 
        }
    },
    {
        name: 'Level 420',
        async value(profileData) {
            return (Math.floor(profileData.xp / 100) === 420 ? 42 : 0)
        }
    },
    {
        name: 'Poor boost',
        async value(profileData) {
            return (profileData.coins + profileData.bank < 100000 ? 10 : 0)
        }
    }
]