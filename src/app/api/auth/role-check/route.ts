import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Called every 30s by the RoleChangeWatcher to detect role changes made by admin
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ role: null, status: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { role: true, status: true },
  });

  return NextResponse.json({
    role: user?.role ?? null,
    status: user?.status ?? null,
  });
}
