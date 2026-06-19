import React from "react";
import {
  ShieldCheck,
  Lock,
  MessageSquare,
  FileText,
  Gavel,
  UserCheck,
} from "lucide-react";

const features = [
  {
    title: "Verified Lawyers",
    description: "All lawyers are verified for credibility and expertise.",
    icon: ShieldCheck,
  },
  {
    title: "Secure Communication",
    description: "End-to-end secure chat between client and lawyer.",
    icon: Lock,
  },
  {
    title: "Instant Chat",
    description: "Discuss your case with lawyers in real time.",
    icon: MessageSquare,
  },
  {
    title: "Document Management",
    description: "Upload and manage all legal documents safely.",
    icon: FileText,
  },
  {
    title: "Online Case Filing",
    description: "File your case digitally without paperwork.",
    icon: Gavel,
  },
  {
    title: "Trusted Platform",
    description: "Connect only with experienced legal professionals.",
    icon: UserCheck,
  },
];

const WhyChoose = () => {
  return (
    <section className="w-full my-16">
      <h2 className="text-center text-3xl font-bold text-primary">
        Why Choose LawConnect
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {features.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="p-6 border rounded-2xl bg-card hover:-translate-y-1 transition-all"
            >
              <Icon className="w-8 h-8 text-primary mb-4" />

              <h3 className="text-lg font-semibold text-primary">
                {item.title}
              </h3>

              <p className="text-muted-foreground mt-2 text-sm">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WhyChoose;
