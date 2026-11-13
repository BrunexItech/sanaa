"use client";

import { useEffect, useState } from "react";

export const STAFF_ROLES = ["Uploads", "Orders Desk", "Production"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type StaffProfile = { name: string; role: StaffRole };

const KEY = "ushanga_staff_profile";

export function getStaffProfile(): StaffProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StaffProfile) : null;
  } catch {
    return null;
  }
}

export function setStaffProfile(profile: StaffProfile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function clearStaffProfile() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

// Reads the profile on mount; `ready` flips true once we've checked, so
// pages can distinguish "still checking" from "confirmed signed out".
export function useStaffProfile() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(getStaffProfile());
    setReady(true);
  }, []);

  return { profile, ready };
}
