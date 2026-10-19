import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User, Page } from "@/lib/models";
import { profileSchema } from "@/lib/validation";
import { saveAvatar, deleteFile } from "@/lib/storage";
import mongoose from "mongoose";

const patchSchema = profileSchema.extend({
  themeId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const [user, page] = await Promise.all([
    User.findById(userId).select("-passwordHash"),
    Page.findOne({ userId }),
  ]);

  return NextResponse.json({ user, page });
}

// PATCH /api/profile — update display name, bio, theme, publish state
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const { displayName, bio, themeId, isPublished } = parsed.data;

  const [user, page] = await Promise.all([
    User.findById(userId),
    Page.findOne({ userId }),
  ]);

  if (!user || !page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (displayName !== undefined) { user.displayName = displayName; page.displayName = displayName; }
  if (bio !== undefined) { user.bio = bio; page.bio = bio; }
  if (themeId !== undefined) page.themeId = themeId;
  if (isPublished !== undefined) page.isPublished = isPublished;

  await Promise.all([user.save(), page.save()]);
  return NextResponse.json({ message: "Profile updated" });
}

// POST /api/profile — avatar upload
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const [user, page] = await Promise.all([
    User.findById(userId),
    Page.findOne({ userId }),
  ]);

  if (!user || !page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete old avatar
  if (user.avatarUrl) await deleteFile(user.avatarUrl);

  const url = await saveAvatar(file);
  user.avatarUrl = url;
  page.avatarUrl = url;
  await Promise.all([user.save(), page.save()]);

  return NextResponse.json({ avatarUrl: url });
}
