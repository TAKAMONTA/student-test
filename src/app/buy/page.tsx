import { headers } from "next/headers";
import BuyPageClient from "./BuyPageClient";
import { isIosAppUserAgent } from "@/lib/ios-app";

export default async function BuyPage() {
  const headersList = await headers();
  const initialIsIosApp = isIosAppUserAgent(headersList.get("user-agent") ?? "");

  return <BuyPageClient initialIsIosApp={initialIsIosApp} />;
}
