"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { authApi } from "@/lib/api";
import { setUser, clearUser, setAuthLoading } from "@/store/slices/auth-slice";

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.getMe();
        if (data.success) {
          dispatch(setUser(data.user));
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        // Silent fail for network/auth errors, user just isn't logged in
        // Only set loading to false, don't clear user (might be temporary network error)
        dispatch(setAuthLoading(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  return <>{children}</>;
}
