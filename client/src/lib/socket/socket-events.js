export const SOCKET_EVENTS = {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",

    // Message Events
    MESSAGE_SEND: "message:send",
    MESSAGE_RECEIVE: "message:receive",

    // Conversation Events
    CONVERSATION_JOIN: "conversation:join",
    CONVERSATION_LEAVE: "conversation:leave",
    TYPING: "conversation:typing",
    STOP_TYPING: "conversation:stop_typing",
};
