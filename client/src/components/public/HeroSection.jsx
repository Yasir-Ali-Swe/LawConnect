import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const HomeHeroSection = ({
  Img = "/img8.png",
  title = "LawConnect",
  tagline = "One platform connecting lawyers, clients & the judiciary",
  description = "LawConnect connects clients, lawyers, and courts on one platform to manage legal services, cases, and communication online.",
  showCTA = true,
}) => {
  return (
    <div className="w-full rounded-xl overflow-hidden my-2 flex flex-col md:flex-row border bg-card shadow-md">
      {/* Left Content */}
      <div className="w-full my-2 md:my-0 md:w-1/2 px-6 py-6 flex flex-col justify-center space-y-4 order-2 md:order-1">
        <div className="inline-flex items-center mx-auto md:mx-0 space-x-2 bg-primary px-3 py-1 rounded-2xl w-max">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          <span className="text-chart-4 text-sm font-semibold">
            Streamlining the Justice System
          </span>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">
            {title}
          </h1>
          <p className="text-lg lg:text-xl font-semibold text-chart-2 mt-1">
            {tagline}
          </p>
        </div>

        <p className="text-center md:text-left text-primary font-medium">
          {description}
        </p>

        {showCTA && (
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-3 mx-auto md:mx-0">
            <Link href="/lawyers-listing" className="w-full sm:w-auto">
              <Button className="rounded-2xl w-full sm:w-auto">
                Find a Lawyer
              </Button>
            </Link>
            <Link href="/registeration" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="rounded-2xl w-full sm:w-auto"
              >
                Join LawConnect
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Right Image */}
      <div className="w-full md:w-1/2 relative min-h-[260px] md:min-h-[420px] flex justify-center items-center order-1 md:order-2">
        <Image
          src={Img}
          alt="LawConnect"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};

export default HomeHeroSection;
