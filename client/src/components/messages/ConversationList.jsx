"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // Will assume this exists or use className overflow if not
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";
import { formatDisplayDate } from "@/lib/format-date";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  className,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            className="pl-8 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Fallback to simple scrollable div if ScrollArea is missing/problematic */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations found.
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors w-full border-b last:border-0",
                  selectedId === conversation.id && "bg-muted",
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={conversation.avatar}
                      alt={conversation.name}
                    />
                    <AvatarFallback>
                      {conversation.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold truncate">
                      {conversation.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {formatDisplayDate(conversation.timestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate w-full pr-2">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shrink-0">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
