export const mockConversations = [
    {
        id: 1,
        name: "John Doe",
        avatar: "https://github.com/shadcn.png",
        lastMessage: "Can we reschedule our meeting?",
        timestamp: "10:30 AM",
        unread: 2,
        online: true,
    },
    {
        id: 2,
        name: "Jane Smith",
        avatar: "https://ui.shadcn.com/avatars/02.png",
        lastMessage: "I have sent the documents.",
        timestamp: "Yesterday",
        unread: 0,
        online: false,
    },
    {
        id: 3,
        name: "Michael Brown",
        avatar: "https://ui.shadcn.com/avatars/03.png",
        lastMessage: "Thanks for the update.",
        timestamp: "Yesterday",
        unread: 0,
        online: true,
    },
    {
        id: 4,
        name: "Sarah Wilson",
        avatar: "https://ui.shadcn.com/avatars/04.png",
        lastMessage: "Please review the proposal.",
        timestamp: "Mon",
        unread: 1,
        online: false,
    },
];

export const mockMessages = {
    1: [
        { id: 1, text: "Hi, I have a question about my case.", sender: "user", timestamp: "10:00 AM" },
        { id: 2, text: "Sure, go ahead.", sender: "me", timestamp: "10:05 AM" },
        { id: 3, text: "Can we reschedule our meeting?", sender: "user", timestamp: "10:30 AM" },
    ],
    2: [
        { id: 1, text: "Please send the required documents.", sender: "me", timestamp: "Yesterday" },
        { id: 2, text: "I have sent the documents.", sender: "user", timestamp: "Yesterday" },
    ],
    3: [
        { id: 1, text: "Hearing scheduled for next week.", sender: "me", timestamp: "Yesterday" },
        { id: 2, text: "Thanks for the update.", sender: "user", timestamp: "Yesterday" },
    ],
    4: [
        { id: 1, text: "Here is the new proposal.", sender: "user", timestamp: "Mon" },
        { id: 2, text: "Please review the proposal.", sender: "user", timestamp: "Mon" },
    ]
};
