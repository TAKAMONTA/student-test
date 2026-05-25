import { NextResponse } from "next/server";

export async function GET() {
  const teamId = process.env["APPLE_TEAM_ID"];
  const bundleId = process.env["APPLE_BUNDLE_ID"];

  if (!teamId || !bundleId) {
    return NextResponse.json({ error: "Apple app association is not configured" }, { status: 500 });
  }

  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${teamId}.${bundleId}`],
            components: [
              {
                "/": "/api/auth/verify*",
                comment: "Open email magic links in the iOS app",
              },
            ],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
