import { NextResponse } from "next/server";
import { getCountryIndex } from "@/lib/countries";

// Generated once at build time and served as a static file. A failure to read the
// index fails the build rather than freezing an error response into the output.
export const dynamic = "force-static";

export async function GET() {
  const countries = await getCountryIndex();

  return NextResponse.json(countries, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
