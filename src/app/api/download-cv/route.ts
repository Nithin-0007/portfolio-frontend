import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  try {
    // Fetch cvUrl from DB
    const user = await prisma.user.findUnique({
      where: { username },
      include: { aboutContent: { select: { cvUrl: true }, take: 1 } },
    });

    const cvUrl = user?.aboutContent?.[0]?.cvUrl;
    if (!cvUrl) {
      return NextResponse.json({ error: "No CV found for this user" }, { status: 404 });
    }

    // Proxy-fetch the file from Cloudinary (server-to-server, no CORS issues)
    const fileRes = await fetch(cvUrl);
    if (!fileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch CV file" }, { status: 502 });
    }

    const contentType = fileRes.headers.get("content-type") || "application/pdf";
    const buffer = await fileRes.arrayBuffer();

    // Determine filename
    const urlPath = new URL(cvUrl).pathname;
    const rawName = urlPath.split("/").pop() || "CV";
    const ext = rawName.includes(".") ? rawName.split(".").pop() : "pdf";
    const fileName = `${user?.name?.replace(/\s+/g, "_") || "CV"}_CV.${ext}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[/api/download-cv]", error?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
