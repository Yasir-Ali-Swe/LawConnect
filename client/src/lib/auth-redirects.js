const roleRoutes = {
  client: "client",
  lawyer: "lawyer",
  admin: "admin",
  clerk: "clerk",
  court_officer: "court-officer",
};

export function normalizeRole(role) {
  return roleRoutes[role] || role?.replace("_", "-");
}

export function getCompleteProfilePath(role) {
  return `/dashboard/${normalizeRole(role)}/complete-profile`;
}

export function getDashboardPathForRole(role) {
  return `/dashboard/${normalizeRole(role)}`;
}

export function getPostLoginPath(user) {
  if (!user.isProfileComplete) {
    return getCompleteProfilePath(user.role);
  }

  if (user.role === "client") {
    return "/lawyers-listing";
  }

  return getDashboardPathForRole(user.role);
}
