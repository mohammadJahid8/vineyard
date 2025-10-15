import { NextRequest, NextResponse } from "next/server";

// export const revalidate = 60 * 60 * 24; // cache 24h on the server
export const revalidate = 60; // cache 1m on the server

function bad(msg: string, code = 400) {
  return new NextResponse(msg, { status: code });
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const name = searchParams.get("name") || "";
  const type = searchParams.get("type") || "";

  let keyword = "";
  if (type === "vineyard") {
    keyword = `${name} ${type} winery vineyard`;
  } else {
    keyword = `${name} lunch restaurant`;
  }

  if (!lat || !lng) return bad("lat & lng required");
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return bad("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY missing", 500);

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const locBias = `circle:500@${lat},${lng}`; // 500m bias around point

  // --- Step 1: Find Place from Text (name, biased by coords)
  // We ask for photos immediately to avoid a second call when possible.
  const findFields = "place_id,name,geometry,types,photos";
  const findUrl =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${encodeURIComponent(name)}` +
    `&inputtype=textquery` +
    `&fields=${encodeURIComponent(findFields)}` +
    `&locationbias=${encodeURIComponent(locBias)}` +
    `&key=${key}`;

  const findRes = await fetch(findUrl, { next: { revalidate } }).then(r => r.json());

  let candidate = findRes?.candidates?.[0];

  // Optional: if the top candidate’s name is very off, try a stricter nearby search
  if (candidate && name) {
    const nA = normalize(candidate.name || "");
    const nB = normalize(name);
    const looseMatch = nA.includes(nB) || nB.includes(nA);
    if (!looseMatch) candidate = null;
  }

  // --- Step 2: If Find Place failed or weak, try Nearby Search with keywords
  if (!candidate) {
    const nearbyUrl =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lng}` +
      `&radius=600` +
      `&keyword=${encodeURIComponent(keyword)}` +
      `&key=${key}`;
    const nearby = await fetch(nearbyUrl, { next: { revalidate } }).then(r => r.json());
    candidate = nearby?.results?.[0] || null;
  }

  // --- Step 3: If we have a Place with photos, stream the best photo
  if (candidate?.photos?.length) {
    const photoRef = candidate.photos[0].photo_reference;
    const photoUrl =
      `https://maps.googleapis.com/maps/api/place/photo` +
      `?maxwidth=800&photo_reference=${encodeURIComponent(photoRef)}&key=${key}`;
    const img = await fetch(photoUrl, { next: { revalidate } });
    console.log("image", img)
    if (img.ok) {
      return new NextResponse(img.body, {
        status: 200,
        headers: {
          "Content-Type": img.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": `public, max-age=${60 * 60}, s-maxage=${60 * 60 * 24}`,
        },
      });
    }
  }

  // --- Step 4: Fallback to Street View (no satellite)
  // First check if a panorama exists (metadata) near the point
  const svMetaUrl =
    `https://maps.googleapis.com/maps/api/streetview/metadata` +
    `?location=${lat},${lng}&source=outdoor&key=${key}`;
  const meta = await fetch(svMetaUrl, { next: { revalidate } }).then(r => r.json());
  console.log('🚀 ~ GET ~ meta:', meta)

  if (meta?.status === "OK") {
    const size = "800x600";
    const svUrl =
      `https://maps.googleapis.com/maps/api/streetview` +
      `?size=${size}&location=${lat},${lng}&pitch=0&fov=90&source=outdoor&key=${key}`;
    const sv = await fetch(svUrl, { next: { revalidate } });
    if (sv.ok) {
      return new NextResponse(sv.body, {
        status: 200,
        headers: {
          "Content-Type": sv.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": `public, max-age=${60 * 60}, s-maxage=${60 * 60 * 24}`,
        },
      });
    }
  }

  // --- Final fallback: a neutral placeholder (never satellite)
  return bad("No photo found for this vineyard", 404);
}
