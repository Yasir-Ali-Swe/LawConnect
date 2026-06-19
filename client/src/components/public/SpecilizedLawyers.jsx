import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  ShieldAlert,
  Scale,
  Briefcase,
  Home,
  Receipt,
  HardHat,
  Plane,
  Lightbulb,
  Shield,
  ShoppingBag,
  Landmark,
} from "lucide-react";

const practiceAreas = [
  { icon: Users, name: "Family Lawyer" },
  { icon: ShieldAlert, name: "Criminal Lawyer" },
  { icon: Scale, name: "Civil Lawyer" },
  { icon: Briefcase, name: "Corporate Lawyer" },
  { icon: Home, name: "Property Lawyer" },
  { icon: Receipt, name: "Tax Lawyer" },
  { icon: HardHat, name: "Labor Lawyer" },
  { icon: Plane, name: "Immigration Lawyer" },
  { icon: Lightbulb, name: "IP Lawyer" },
  { icon: Shield, name: "Cybercrime Lawyer" },
  { icon: ShoppingBag, name: "Consumer Rights Lawyer" },
  { icon: Landmark, name: "Constitutional Lawyer" },
];

const SpecializedLawyers = () => {
  return (
    <div className="my-25 w-full">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-lg lg:text-xl font-semibold text-primary">
          Consult the Best Lawyers Online
        </h1>

        <Link href="/lawyers-listing">
          <Button
            variant="link"
            className="text-lg lg:text-xl font-semibold text-primary rounded-sm cursor-pointer"
          >
            View All
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-5 xl:gap-12 w-full my-4">
        {practiceAreas.map((area) => {
          const Icon = area.icon;

          return (
            <Link
              key={area.name}
              href={`/lawyers-listing`}
              className="flex flex-col items-center gap-2"
            >
              <div className="size-29 rounded-full bg-primary flex items-center justify-center hover:bg-primary/95 transition-colors">
                <Icon className="size-14 text-card" />
              </div>

              <span className="text-md text-primary text-center max-w-24 font-bold">
                {area.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SpecializedLawyers;
