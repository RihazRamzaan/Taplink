import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Page } from "@/lib/models";
import { linkSchema } from "@/lib/validation";
import mongoose from "mongoose";

async function getPage(userId: string) {
  return Page.findOne({ userId: new mongoose.Types.ObjectId(userId) });
}

// GET /api/links — fetch all links for the authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const page = await getPage(session.user.id);
  if (!page) return NextResponse.json({ links: [] });

  const sorted = [...page.links].sort((a, b) => a.order - b.order);
  return NextResponse.json({ links: sorted });
}

// POST /api/links — add a new link
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();
  const page = await getPage(session.user.id);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  if (page.links.length >= 100) {
    return NextResponse.json({ error: "Maximum 100 links per page" }, { status: 400 });
  }

  const maxOrder = page.links.reduce((max, l) => Math.max(max, l.order), -1);
  const newLink = {
    _id: new mongoose.Types.ObjectId(),
    ...parsed.data,
    order: maxOrder + 1,
    clicks: 0,
    createdAt: new Date(),
  };

  page.links.push(newLink);
  await page.save();

  return NextResponse.json({ link: newLink }, { status: 201 });
}

// PATCH /api/links — reorder links
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderedIds } = await req.json() as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  await connectDB();
  const page = await getPage(session.user.id);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  orderedIds.forEach((id, index) => {
    const link = page.links.find((l) => String(l._id) === id);
    if (link) link.order = index;
  });

  await page.save();
  return NextResponse.json({ message: "Order updated" });
}
