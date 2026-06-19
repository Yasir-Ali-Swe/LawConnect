import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="w-full my-25">
      <div className="flex flex-col lg:flex-row items-center gap-10 bg-primary p-8 lg:px-14 rounded-2xl">
        {/* Left: Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src="/CTA.png"
            alt="LawConnect CTA"
            className="w-full max-w-md object-contain"
          />
        </div>

        {/* Right: Text */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-background">
            Need Legal Help?
          </h2>

          <p className="text-card mt-4">
            Connect with experienced lawyers, discuss your case, and get legal
            support online without visiting offices.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/lawyers-listing">
              <Button
                className="w-full sm:w-auto text-background border-2 border-background"
                variant="ghost"
              >
                Find a Lawyer
              </Button>
            </Link>

            <Link href="/registeration">
              <Button variant="outline" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
