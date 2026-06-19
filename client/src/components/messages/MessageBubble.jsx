import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/format-date";

export default function MessageBubble({ text, sender, timestamp }) {
  const isMe = sender === "me";

  return (
    <div
      className={cn(
        "flex w-full mt-2 space-x-3 max-w-[85%] md:max-w-[70%]",
        isMe ? "ml-auto justify-end" : "",
      )}
    >
      <div
        className={cn(
          "relative px-4 py-2 rounded-lg shadow text-sm",
          isMe
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted text-foreground rounded-bl-none",
        )}
      >
        <p className="break-words whitespace-pre-wrap">{text}</p>
        {formatDisplayDate(timestamp) && (
          <span className="text-[10px] opacity-70 block text-right mt-1">
            {formatDisplayDate(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
