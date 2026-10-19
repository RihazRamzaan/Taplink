import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Page } from "@/lib/models";
import { linkSchema } from "@/lib/validation";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

// PUT /api/links/[id] — update a link
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = linkSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();
  const page = await Page.findOne({
    userId: new mongoose.Types.ObjectId(session.user.id),
  });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const link = page.links.find((l) => String(l._id) === id);
  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  Object.assign(link, parsed.data);
  await page.save();

  return NextResponse.json({ link });
}

// DELETE /api/links/[id] — remove a link
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const page = await Page.findOne({
    userId: new mongoose.Types.ObjectId(session.user.id),
  });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const before = page.links.length;
  page.links = page.links.filter((l) => String(l._id) !== id) as typeof page.links;
  if (page.links.length === before) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await page.save();
  return NextResponse.json({ message: "Link deleted" });
}
