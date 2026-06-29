"use client"
import React, { useState, useEffect, useRef } from 'react';
import { SidebarSeparator, SidebarTrigger } from './ui/sidebar';
import { useSelector, useDispatch } from "react-redux";
import { clearUser, setUser } from "@/store/slices/auth-slice";
import { authApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const DasboardNavbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { role, user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync profile details by querying auth user data.
  // This helps fetch updated details (like profileImageUrl) after bootstrap or profile change.
  const { data: authData } = useQuery({
    queryKey: ["authUser"],
    queryFn: authApi.getMe,
    enabled: !!user,
  });

  useEffect(() => {
    if (authData?.user) {
      dispatch(setUser(authData.user));
    }
  }, [authData, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed, but clearing session");
    } finally {
      dispatch(clearUser());
      router.push("/login");
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getUrlRole = (role) => {
    if (role === "court_officer") return "court-officer";
    return role;
  };

  const urlRole = getUrlRole(role || "");

  const IGNORED_SEGMENTS = new Set([
    "client",
    "lawyer",
    "clerk",
    "court-officer",
    "admin"
  ]);

  const getSegmentLabel = (segment, parentSegment) => {
    const isId = /^[0-9a-fA-F]{24}$/.test(segment);
    if (isId) {
      if (parentSegment === "cases" || parentSegment === "case") {
        return "Case Details";
      }
      if (parentSegment === "courts") {
        return "Court Details";
      }
      if (parentSegment === "clerks") {
        return "Clerk Details";
      }
      if (parentSegment === "court-officers") {
        return "Court Officer Details";
      }
      return "Details";
    }

    if (segment === "new") {
      if (parentSegment === "cases" || parentSegment === "case") {
        return "New Case";
      }
      return "New";
    }

    const staticMap = {
      dashboard: "Dashboard",
      cases: "Cases",
      case: "Cases",
      profile: "Profile",
      messages: "Messages",
      proposals: "Proposals",
      notifications: "Notifications",
      clerks: "Clerks",
      "court-officers": "Court Officers",
      courts: "Courts",
      users: "Users",
      "complete-profile": "Complete Profile",
      "court-officer": "Court Officer",
    };

    if (staticMap[segment]) {
      return staticMap[segment];
    }

    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    const segments = pathname.split("/").filter(Boolean);

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isRoleSegment = IGNORED_SEGMENTS.has(segment);

      if (isRoleSegment) {
        continue;
      }

      if (segment === "dashboard") {
        breadcrumbs.push({
          label: "Dashboard",
          url: `/dashboard/${urlRole}`,
          isLast: false,
        });
        continue;
      }

      const parentSegment = i > 0 ? segments[i - 1] : null;
      const label = getSegmentLabel(segment, parentSegment);
      const linkPath = "/" + segments.slice(0, i + 1).join("/");

      breadcrumbs.push({
        label,
        url: linkPath,
        isLast: false,
      });
    }

    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isLast = true;
    }
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="w-full bg-background">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section: SidebarTrigger + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="[&>svg]:!size-5 hover:bg-accent hover:text-accent-foreground rounded-md h-8 w-8 cursor-pointer shrink-0" />
          <div className="h-4 w-[1px] bg-border shrink-0 hidden sm:block" />
          <div className="flex items-center py-1">
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap gap-1 sm:gap-1.5">
                {breadcrumbs.map((item) => (
                  <React.Fragment key={item.url}>
                    <BreadcrumbItem>
                      {item.isLast ? (
                        <BreadcrumbPage className="max-w-[120px] sm:max-w-[200px] md:max-w-none truncate inline-block align-bottom font-medium text-foreground text-sm">
                          {item.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild className="max-w-[80px] sm:max-w-[150px] truncate inline-block align-bottom text-sm">
                          <Link href={item.url}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!item.isLast && <BreadcrumbSeparator className="text-muted-foreground/60 [&>svg]:size-3 shrink-0" />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Right Section: Avatar + Dropdown Menu */}
        <div className="flex items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full transition-all"
            >
              <Avatar className="h-8 w-8 hover:opacity-90 transition-opacity cursor-pointer border border-border">
                {user?.profileImageUrl && (
                  <AvatarImage
                    src={user.profileImageUrl}
                    alt={user?.fullName || "User Avatar"}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md transition-all focus:outline-none z-50 animate-in fade-in duration-100 slide-in-from-top-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
                  <div className="font-medium text-foreground truncate">
                    {user?.fullName || "User"}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {user?.email || ""}
                  </div>
                </div>

                <Link
                  href={`/dashboard/${urlRole}/profile`}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:text-red-400 cursor-pointer transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <SidebarSeparator className="mx-0" />
    </div>
  );
};

export default DasboardNavbar;