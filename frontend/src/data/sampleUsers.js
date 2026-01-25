export const sampleUserData = {
  avatarId: "default_robot",
  avatarUrl: "https://res.cloudinary.com/dg3eusrdy/image/upload/v1769142541/bswcav4x7hos7uetectu.jpg",
  battleStats: {
    losses: 0,
    mmr: 1000,
    rankTier: "Unranked",
    totalMatches: 0,
    wins: 0
  },
  birthday: "2003-05-09T16:12:00.000Z",
  createdAt: "2026-01-18T16:12:33.115Z",
  displayName: "john mark navajas",
  email: "dyeemraker @gmail.com",
  firstName: "john mark",
  friendRequests: {
    incoming: [],
    outgoing: []
  },
  friends: [],
  gamertag: "merce666",
  gender: "m",
  grade: "12",
  inventory: {
    doubleXp: 999999996,
    freeze: 999999979,
    hints: 999999987
  },
  isOnline: true,
  lastName: "navajas",
  notifications: [],
  progression: {
    adventure: {
      arithmeticTower: {
        completedLevels: Array.from({length: 21}, (_, i) => i + 1),
        highestLevelUnlocked: 21,
        stars: Object.fromEntries(Array.from({length: 20}, (_, i) => [i + 1, 3])),
        unlocked: false
      },
      debuggingDungeon: {
          completedLevels: [1],
          highestLevelUnlocked: 1,
          stars: {},
          unlocked: false
      },
      javascriptLab: {
          completedLevels: Array.from({length: 11}, (_, i) => i + 1),
          highestLevelUnlocked: 11,
          stars: Object.fromEntries(Array.from({length: 10}, (_, i) => [i + 1, 3])),
          unlocked: false
      },
      loopCanyon: {
          completedLevels: Array.from({length: 11}, (_, i) => i + 1),
          highestLevelUnlocked: 11,
          stars: Object.fromEntries(Array.from({length: 10}, (_, i) => [i + 1, 3])),
          unlocked: false
      },
      syntaxValley: {
          completedLevels: Array.from({length: 42}, (_, i) => i + 1),
          highestLevelUnlocked: 42,
          stars: Object.fromEntries(Array.from({length: 41}, (_, i) => [i + 1, i % 3 === 0 ? 2 : 3])), // Simulated variation
          unlocked: true
      },
    },
    debugMode: {
        completedLevels: Array.from({length: 20}, (_, i) => i + 1),
        highScore: 0,
        highestLevelUnlocked: 20,
        stars: {15: 3, 16: 3, 17: 3, 18: 3, 19: 3}
    }
  },
  sandbox: {
    lastEdited: "2026-01-21T15:57:45.716Z",
    savedSnippets: []
  },
  role: "student",
  section: "A",
  stats: {
    coins: 1000008568,
    currentStreak: 0,
    currentXP: 31230,
    highestStreak: 0,
    lastLogin: "2026-01-18T16:12:33.115Z",
    totalSandboxTime: 84,
    totalXP: 0,
    uid: "A53Kzzrp7ZURREb7S8zVqrn29Pn2"
  },
  wallet: {
    gems: 0,
    points: 17309
  }
};
