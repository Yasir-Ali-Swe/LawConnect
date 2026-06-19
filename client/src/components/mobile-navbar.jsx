"use client";
import { Button } from "@/components/ui/button";
import { Menu, Scale } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const roleRoutes = {
    client: "client",
    admin: "admin",
    clerk: "clerk",
    lawyer: "lawyer",
    court_officer: "court-officer",
  };

  const dashboardRoute = user ? roleRoutes[user.role] : null;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon-lg" variant="ghost">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>
            <Link href={"/"} className="flex items-center gap-1 cursor-pointer">
              <Scale size={30} />
              <p className="text-xl font-medium">LawConnect</p>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="links">
          <ul className="flex flex-col gap-4 pl-5">
            <Link
              href={"/home"}
              className="text-lg font-medium"
              onClick={() => setOpen(false)}
            >
              <li>Home</li>
            </Link>
            <Link
              href={"/lawyers-listing"}
              className="text-lg font-medium"
              onClick={() => setOpen(false)}
            >
              <li>Lawyers</li>
            </Link>
            {user && dashboardRoute ? (
              <Link
                href={`/dashboard/${dashboardRoute}`}
                className="text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={"/login"}
                className="text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
