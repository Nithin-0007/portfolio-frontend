import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json<ApiResponse>({ success: false, error: message }, { status });
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { session: null, userId: null, error: err("Unauthorized", 401) };
  }
  return { session, userId: session.user.id as string, error: null };
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, userId: null, error: err("Unauthorized", 401) };
  }
  return { session, userId: session.user.id as string, error: null };
}
