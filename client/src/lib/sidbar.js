// src/lib/sidebar.js
import { clientSidebarItems } from "@/config/sidebar/client";
import { lawyerSidebarItems } from "@/config/sidebar/lawyer";
import { clerkSidebarItems } from "@/config/sidebar/clerk";
import { courtOfficerSidebarItems } from "@/config/sidebar/court-officer";
import { adminSidebarItems } from "@/config/sidebar/admin";

export const getSidebarItemsByRole = (role) => {
  switch (role) {
    case "client":
      return clientSidebarItems;
    case "lawyer":
      return lawyerSidebarItems;
    case "clerk":
      return clerkSidebarItems;
    case "court_officer":
      return courtOfficerSidebarItems;
    case "courtOfficer": // Fallback for legacy camelCase
      return courtOfficerSidebarItems;
    case "admin":
      return adminSidebarItems;
    default:
      return [];
  }
};
