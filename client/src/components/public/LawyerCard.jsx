"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";
import { toast } from "sonner";

export function LawyerCard({ lawyer, onSendProposal }) {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const isClient = user?.role === "client";

  const messageMutation = useMutation({
    mutationFn: messagesApi.initiateConversation,
    onSuccess: (data) => {
      router.push(
        `/dashboard/client/messages?conversationId=${data.conversationId}`,
      );
    },
    onError: (err) => {
      toast.error("Failed to start conversation");
    },
  });

  const handleSendMessage = () => {
    messageMutation.mutate(lawyer._id);
  };

  return (
    <Card className="w-full max-w-[350px] mx-auto bg-[#231E39] text-[#B3B8CD] overflow-hidden border-none shadow-xl rounded-xl relative  items-center flex flex-col">
      {/* Avatar */}
      <div className="rounded-full bg-gradient-to-tr from-[#03e9f4] to-[#e91e63] w-[130px] h-[130px] flex items-center justify-center">
        <div className="bg-[#231E39]  rounded-full w-full h-full flex items-center justify-center">
          <Avatar className="w-full h-full border-2 border-[#231E39]">
            <AvatarImage src={lawyer.profileImageUrl} alt={lawyer.fullName} />
            <AvatarFallback className="text-2xl font-bold bg-[#1f1a36] text-white">
              {lawyer.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="flex flex-col items-center text-center p-0 w-full px-6">
        <h3 className="font-bold text-xl text-white">{lawyer.fullName}</h3>

        <div className="flex items-center text-xs uppercase tracking-wider my-2">
          {lawyer.city && <span className="mr-1">{lawyer.city},</span>}
          {lawyer.province}
        </div>

        {lawyer.bio && (
          <p className="text-sm leading-relaxed font-light h-[60px] overflow-hidden">
            {lawyer.bio.split(" ").slice(0, 15).join(" ")}
            {lawyer.bio.split(" ").length > 15 ? "..." : ""}
          </p>
        )}

        <div className="flex gap-4 w-full justify-center">
          {isClient ? (
            <>
              <Button
                className="bg-[#03BFCB] hover:bg-[#02a9b4] text-[#231E39] font-semibold rounded-md px-6 flex-1 max-w-[120px]"
                onClick={handleSendMessage}
                disabled={messageMutation.isPending}
              >
                Message
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border border-[#03BFCB] text-[#03BFCB] hover:bg-[#03BFCB] hover:text-[#231E39] font-semibold rounded-md px-6 flex-1 max-w-[120px]"
                onClick={() => onSendProposal(lawyer)}
              >
                Proposal
              </Button>
            </>
          ) : (
            <div className="w-full text-center text-xs text-[#B3B8CD]/70 py-2 border border-[#B3B8CD]/20 rounded">
              Login as a client to contact lawyer
            </div>
          )}
        </div>
      </CardContent>

      <div className="bg-[#1F1A36] w-full px-6 py-4 mt-auto">
        <h6 className="uppercase text-xs font-bold tracking-wider mb-3 text-white">
          Practice Areas
        </h6>
        <div className="flex flex-wrap gap-2">
          {lawyer.specialization?.length > 0 ? (
            lawyer.specialization.slice(0, 4).map((spec) => (
              <span
                key={spec}
                className="border border-[#2D2747] text-xs px-2 py-1 rounded text-[#B3B8CD]"
              >
                {spec}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              General Practice
            </span>
          )}
          {lawyer.specialization?.length > 4 && (
            <span className="border border-[#2D2747] text-xs px-2 py-1 rounded text-[#B3B8CD]">
              +{lawyer.specialization.length - 4}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
