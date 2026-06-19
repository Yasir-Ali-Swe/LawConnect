"use client";
import Link from "next/link";
import React from "react";
import { Scale } from "lucide-react";
import { MobileNavbar } from "@/components/mobile-navbar";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
const Navbar = () => {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const roleRoutes = {
    client: "client",
    admin: "admin",
    clerk: "clerk",
    lawyer: "lawyer",
    court_officer: "court-officer",
  };
  console.log(pathname);
  const dashboardRoute = user ? roleRoutes[user.role] : null;
  return (
    <nav className="bg-foreground text-background ">
      <div className="flex justify-between items-center py-3 lg:py-5 px-2 lg:px-0 w-full max-w-7xl mx-auto">
        <div className="logo ">
          <Link href={"/"} className="flex items-center gap-1 cursor-pointer">
            <Scale className="size-6 lg:size-8" />
            <p className="text-lg lg:text-xl font-medium">LawConnect</p>
          </Link>
        </div>
        <div className="links">
          <ul className="hidden lg:flex items-center gap-15">
            <Link
              href={"/home"}
              className={`text-lg font-medium ${pathname === "/home" && "underline decoration-3 underline-offset-4"}`}
            >
              Home
            </Link>
            <Link
              href={"/lawyers-listing"}
              className={`text-lg font-medium ${pathname === "/lawyers-listing" && "underline decoration-3 underline-offset-4"}`}
            >
              Lawyers
            </Link>
          </ul>
        </div>
        <div className="flex lg:hidden">
          <MobileNavbar />
        </div>
        <div className="login hidden lg:flex">
          {user && dashboardRoute ? (
            <Link
              href={`/dashboard/${dashboardRoute}`}
              className="text-lg font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <Link href={"/login"} className="text-lg font-medium">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
