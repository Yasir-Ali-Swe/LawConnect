"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { authApi } from "@/lib/api";
import { setUser, clearUser, setAuthLoading } from "@/store/slices/auth-slice";

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const data = await authApi.getMe();
        if (cancelled) return;

        if (data.success) {
          dispatch(setUser(data.user));
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        if (cancelled) return;

        if (error.response?.status === 401) {
          dispatch(clearUser());
        } else {
          dispatch(setAuthLoading(false));
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return <>{children}</>;
}
