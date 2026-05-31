"use client";

import { useEffect } from "react";
import { identifyUser } from "@/lib/analytics";

export default function PostHogIdentify({ userId }: { userId: string }) {
  useEffect(() => {
    identifyUser(userId);
  }, [userId]);
  return null;
}
