import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
  address?: {
    amenity?: string;
    building?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
  };
};

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "6",
    addressdetails: "1",
    // Viewbox covers UT campus + surrounding neighborhoods (West Campus, Hyde Park, etc.)
    viewbox: "-97.7600,30.2650,-97.7150,30.3050",
    bounded: "0", // prefer viewbox but don't hard-restrict
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "LonghornHousing/1.0 (UT Austin student apartment finder)",
          "Accept-Language": "en",
        },
        next: { revalidate: 300 }, // cache geocode results for 5 minutes
      }
    );

    if (!res.ok) return NextResponse.json([]);

    const data: NominatimResult[] = await res.json();

    const results = data.map((item) => {
      const parts = item.display_name.split(", ");
      // Prefer structured address fields for the display name
      const name =
        item.address?.amenity ||
        item.address?.building ||
        parts[0];
      const subtitle =
        item.address?.road ||
        item.address?.neighbourhood ||
        item.address?.suburb ||
        parts[1] ||
        item.type;

      return {
        name,
        subtitle,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
