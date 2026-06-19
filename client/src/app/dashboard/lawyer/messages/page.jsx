"use client";

import MessagesLayout from "@/components/messages/MessagesLayout";

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-6rem)] sm:h-150 md:h-[calc(100vh-5rem)] py-6 max-w-7xl mx-auto w-full">
      <h2 className="text-3xl font-bold tracking-tight mb-4 px-1">Messages</h2>
      <MessagesLayout />
    </div>
  );
}
