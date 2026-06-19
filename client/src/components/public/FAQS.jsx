"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I hire a lawyer through LawConnect?",
    answer:
      "LawConnect makes it easy to connect with qualified lawyers. Simply create a client account, browse available lawyers, review their profiles, and send a proposal describing your legal issue. Lawyers can review your proposal and respond directly through the platform.",
  },
  {
    question: "Can I track the progress of my case online?",
    answer:
      "Yes. LawConnect provides real-time case tracking throughout the entire legal process. Clients can monitor case status updates, hearing schedules, notifications, documents, and important milestones from their dashboard.",
  },
  {
    question: "Are my documents and personal information secure?",
    answer:
      "Absolutely. LawConnect uses secure authentication, role-based access control, and protected document storage to ensure that your personal information and legal documents remain private and accessible only to authorized users.",
  },
  {
    question: "How will I receive updates about hearings and case activities?",
    answer:
      "LawConnect automatically notifies you whenever important events occur, such as case registration, hearing scheduling, hearing updates, judgments, status changes, or new messages. All notifications are available directly within your dashboard.",
  },
  {
    question: "Who can use LawConnect?",
    answer:
      "LawConnect is designed for multiple stakeholders in the legal process, including clients, lawyers, and administrators. Each role has a dedicated dashboard and permissions tailored to their responsibilities.",
  },
  {
    question: "Can I communicate directly with my lawyer through the platform?",
    answer:
      "Yes. LawConnect includes a secure messaging system that allows clients and lawyers to communicate directly, discuss case details, share updates, and stay connected throughout the legal process without relying on external communication tools.",
  },
];

export default function FAQSection() {
  return (
    <section className="w-full max-w-3xl mx-auto my-25">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about using LawConnect.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left cursor-pointer">
              {faq.question}
            </AccordionTrigger>

            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
