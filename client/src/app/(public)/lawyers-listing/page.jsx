"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { lawyerApi } from "@/lib/api/lawyer";
import { LawyerCard } from "@/components/public/LawyerCard";
import { SendProposalModal } from "@/components/client/SendProposalModal";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";

const PRACTICE_AREAS = [
  "Civil Law",
  "Criminal Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Tax Law",
  "Labor Law",
  "Cyber Law",
  "Constitutional Law",
  "Intellectual Property",
];

export default function PublicLawyersPage() {
  const [cityInput, setCityInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState([]);

  // Debounced states for inputs
  const [debouncedCity, setDebouncedCity] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCity(cityInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [cityInput]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(nameInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [nameInput]);

  const { data: result, isLoading } = useQuery({
    queryKey: [
      "publicLawyers",
      {
        city: debouncedCity,
        name: debouncedName,
        practiceAreas: selectedPracticeAreas,
      },
    ],
    queryFn: () =>
      lawyerApi.getPublicLawyers({
        city: debouncedCity,
        name: debouncedName,
        practiceAreas: selectedPracticeAreas,
      }),
  });

  const lawyers = result?.data || [];

  const handleOpenProposal = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLawyer(null);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50/50 dark:bg-zinc-950">
      {/* Header / Hero Section with filters */}
      <div className="bg-white dark:bg-zinc-900 border-b py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Find Your Legal Expert
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with top-rated lawyers across Pakistan for specialized legal
            advice and representation.
          </p>

          <div className="max-w-4xl mx-auto text-left bg-slate-50/30 dark:bg-zinc-950/20 p-6 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* City Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  City
                </label>
                <Input
                  placeholder="Search by city"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Lawyer Name Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Lawyer Name
                </label>
                <Input
                  placeholder="Search by lawyer name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Practice Area Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Practice Areas
                </label>
                <MultiSelect
                  options={PRACTICE_AREAS}
                  selectedValues={selectedPracticeAreas}
                  onChange={setSelectedPracticeAreas}
                  placeholder="Select practice areas"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No lawyers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lawyers.map((lawyer) => (
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
