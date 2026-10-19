import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Page } from "@/lib/models";
import mongoose from "mongoose";

type Params = { params: Promise<{ linkId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { linkId } = await params;

  await connectDB();
  const page = await Page.findOne({ "links._id": new mongoose.Types.ObjectId(linkId) });
  if (!page) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  const link = page.links.find((l) => String(l._id) === linkId);
  if (!link || !link.enabled) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  // Increment click counter (fire-and-forget)
  Page.updateOne(
    { "links._id": new mongoose.Types.ObjectId(linkId) },
    { $inc: { "links.$.clicks": 1 } }
  ).catch(console.error);

  return NextResponse.redirect(link.url, { status: 302 });
}
