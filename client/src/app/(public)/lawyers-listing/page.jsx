"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { lawyerApi } from "@/lib/api/lawyer";
import { LawyerCard } from "@/components/public/LawyerCard";
import { SendProposalModal } from "@/components/client/SendProposalModal";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PublicLawyersPage() {
  const [search, setSearch] = useState("");
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ["publicLawyers"],
    queryFn: lawyerApi.getPublicLawyers,
  });

  const lawyers = result?.data || [];

  const filteredLawyers = lawyers.filter(
    (l) =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.city?.toLowerCase().includes(search.toLowerCase()) ||
      l.specialization?.some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const handleOpenProposal = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLawyer(null);
  };

  return (
    <div className="min-h-screen  overflow-x-hidden bg-slate-50/50 dark:bg-zinc-950">
      {/* Header / Hero Section (Simple) */}
      <div className="bg-white dark:bg-zinc-900 border-b py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Find Your Legal Expert
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with top-rated lawyers across Pakistan for specialized legal
            advice and representation.
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or practice area..."
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No lawyers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLawyers.map((lawyer) => (
              <LawyerCard
                key={lawyer._id}
                lawyer={lawyer}
                onSendProposal={handleOpenProposal}
              />
            ))}
          </div>
        )}
      </div>

      <SendProposalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lawyerId={selectedLawyer?._id}
        lawyerName={selectedLawyer?.fullName}
      />
    </div>
  );
}
