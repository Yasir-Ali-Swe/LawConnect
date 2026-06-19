import React from "react";
import HeroSection from "@/components/public/HeroSection";
import SpecializedLawyers from "@/components/public/SpecilizedLawyers";
import HowItsWork from "@/components/public/HowItsWork";
import StatisticsSection from "@/components/public/StatisticsSection";
import CTA from "@/components/public/CTA";
import WhyChoose from "@/components/public/WhyLawConnect";
import FAQSection from "@/components/public/FAQS";
const page = () => {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <HeroSection />
      <StatisticsSection />
      <SpecializedLawyers />
      <HowItsWork />
      <CTA />
      <WhyChoose />
      <FAQSection />
    </div>
  );
};

export default page;
