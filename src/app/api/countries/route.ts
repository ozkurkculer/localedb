import { NextResponse } from "next/server";
import { getCountryIndex } from "@/lib/countries";

export async function GET() {
  try {
    const countries = await getCountryIndex();

    return NextResponse.json(countries, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
