import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Refresh token is disabled. Session authentication is used.",
      errors: {},
      data: null,
      meta: null,
    },
    { status: 410 },
  );
}
