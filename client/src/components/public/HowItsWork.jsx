import React from "react";
import {
  ShieldCheck,
  Search,
  MessageSquare,
  FileUp,
  Scale,
  Gavel,
} from "lucide-react";
const howItWorks = [
  {
    id: 1,
    title: "Create Account",
    description: "Sign up securely to access legal services anytime, anywhere.",
    icon: <ShieldCheck size={32} />,
  },
  {
    id: 2,
    title: "Find a Lawyer",
    description:
      "Browse verified lawyers by practice area and choose the right legal expert for your case.",
    icon: <Search size={32} />,
  },
  {
    id: 3,
    title: "Chat with Lawyer",
    description:
      "Discuss your legal issue, ask questions, and get professional guidance in real time.",
    icon: <MessageSquare size={32} />,
  },
  {
    id: 4,
    title: "Upload Documents",
    description:
      "Securely upload contracts, evidence, and other case-related documents.",
    icon: <FileUp size={32} />,
  },
  {
    id: 5,
    title: "File a Case",
    description:
      "Your lawyer will prepare your case and submit it to the appropriate court for hearings and further legal proceedings.",
    icon: <Scale size={32} />,
  },
  {
    id: 6,
    title: "Track & Attend Hearings",
    description:
      "Receive updates, track case progress, and participate in online hearings when required.",
    icon: <Gavel size={32} />,
  },
];
const HowItsWork = () => {
  return (
    <div className="my-25 w-full bg-input rounded-2xl p-8">
      <h1 className="text-center text-primary font-semibold text-3xl">
        How LawConnect Works
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {howItWorks.map((step) => (
          <div
            key={step.id}
            className="flex flex-col items-center text-center p-4 border bg-background hover:-translate-y-2 rounded-2xl transition-all duration-300"
          >
            {step.icon}

            <h3 className="text-lg font-black text-primary mt-4 mb-2">
              {step.title}
            </h3>

            <p className="text-primay font-medium">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItsWork;
