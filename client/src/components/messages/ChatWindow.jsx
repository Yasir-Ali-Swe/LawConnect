"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useEffect, useRef, useState } from "react";

export default function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onBack,
  isLoading,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/5 p-8 text-center h-full">
        <div className="bg-muted p-4 rounded-full mb-4">
          <span className="text-4xl">👋</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Welcome to your Messages</h3>
        <p className="text-muted-foreground max-w-sm">
          Select a conversation from the left to start chatting securely with
          your clients.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/5 h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <p className="mt-2 text-muted-foreground text-sm">
          Loading messages...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/5">
      {/* Header */}
      <div className="p-3 border-b bg-background flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Avatar>
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback>
                {conversation.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conversation.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
            )}
          </div>
          <div className="min-w-0">
            <h3
              className="font-semibold text-sm truncate"
              title={conversation.name}
            >
              {conversation.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {conversation.online ? "Online" : "Last seen recently"}
            </p>
          </div>
        </div>
        <div className="flex items-center text-muted-foreground"></div>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/20"
      >
        {/* Date separator example */}
        <div className="flex justify-center my-4">
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
            Today
          </span>
        </div>

        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              sender={msg.sender}
              timestamp={msg.timestamp}
            />
          ))
        )}
      </div>
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
