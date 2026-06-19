import React from "react";
import { Scale, Briefcase, Users, Star } from "lucide-react";

const stats = [
  {
    title: "500+",
    description: "Verified Lawyers",
    icon: Scale,
  },
  {
    title: "2,000+",
    description: "Cases Managed",
    icon: Briefcase,
  },
  {
    title: "10,000+",
    description: "Clients Served",
    icon: Users,
  },
  {
    title: "98%",
    description: "Satisfaction Rate",
    icon: Star,
  },
];

const StatisticsSection = () => {
  return (
    <section className="w-full my-20 bg-input rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary">
          Trusted by Thousands
        </h2>
        <p className="text-muted-foreground mt-2">
          Connecting clients, lawyers, and the judiciary through a modern legal
          platform.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.description}
              className="bg-card border rounded-xl p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-background" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-primary">
                {stat.title}
              </h3>

              <p className="text-sm md:text-base text-muted-foreground mt-2">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatisticsSection;
