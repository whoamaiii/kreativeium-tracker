const mockLogs = [
    {
        id: 'mock1',
        timestamp: new Date('2024-07-01T08:00:00Z').toISOString(),
        mood: 5, // 1-5 scale, 5 is great
        energy: 4, // 1-5 scale, 4 is energetic
        notes: "Feeling pretty good today, excited for the new project.",
        tags: ["work", "project", "morning"],
        sleep: 7.5,
        activities: ["coding", "meeting"]
    },
    {
        id: 'mock2',
        timestamp: new Date('2024-07-01T14:30:00Z').toISOString(),
        mood: 3,
        energy: 2,
        notes: "Afternoon slump. Had a heavy lunch.",
        tags: ["work", "afternoon", "tired"],
        sleep: 7.5, // Assuming sleep is for the previous night
        activities: ["debugging", "email"]
    },
    {
        id: 'mock3',
        timestamp: new Date('2024-07-02T09:15:00Z').toISOString(),
        mood: 4,
        energy: 5,
        notes: "Productive morning, got a lot done. Good coffee helped!",
        tags: ["work", "morning", "productive"],
        sleep: 8,
        activities: ["planning", "writing"]
    },
    {
        id: 'mock4',
        timestamp: new Date('2024-07-02T17:00:00Z').toISOString(),
        mood: 2,
        energy: 1,
        notes: "Feeling a bit stressed about the deadline.",
        tags: ["work", "evening", "stress"],
        sleep: 8,
        activities: ["review", "testing"]
    },
    {
        id: 'mock5',
        timestamp: new Date('2024-07-03T11:00:00Z').toISOString(),
        mood: 5,
        energy: 4,
        notes: "Great workout session, feeling refreshed.",
        tags: ["personal", "health", "morning"],
        sleep: 6.5,
        activities: ["gym", "reading"]
    },
    {
        id: 'mock6',
        timestamp: new Date('2024-07-03T16:00:00Z').toISOString(),
        mood: 3,
        energy: 3,
        notes: "Quiet afternoon. Read a book.",
        tags: ["personal", "relax", "afternoon"],
        sleep: 6.5,
        activities: ["reading"]
    },
    {
        id: 'mock7',
        timestamp: new Date('2024-07-04T08:30:00Z').toISOString(),
        mood: 4,
        energy: 3,
        notes: "Holiday today! Planning a hike.",
        tags: ["personal", "holiday", "morning"],
        sleep: 7,
        activities: ["planning"]
    },
    {
        id: 'mock8',
        timestamp: new Date('2024-07-04T15:00:00Z').toISOString(),
        mood: 5,
        energy: 5,
        notes: "Amazing hike, beautiful views.",
        tags: ["personal", "holiday", "exercise", "afternoon"],
        sleep: 7,
        activities: ["hiking"]
    },
    {
        id: 'mock9',
        timestamp: new Date('2024-07-05T10:00:00Z').toISOString(),
        mood: 3,
        energy: 2,
        notes: "Back to work. Feeling a bit slow after the holiday.",
        tags: ["work", "morning"],
        sleep: 7,
        activities: ["emails", "catch-up"]
    },
    {
        id: 'mock10',
        timestamp: new Date('2024-07-05T18:00:00Z').toISOString(),
        mood: 4,
        energy: 3,
        notes: "Finished the week. Looking forward to the weekend.",
        tags: ["work", "evening", "relief"],
        sleep: 7,
        activities: ["wrap-up"]
    }
];

// export { mockLogs };
export { mockLogs };

// If not using modules, it will be globally available on the window object
// (e.g., window.mockLogs or simply mockLogs in other scripts loaded after this one) 