import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { User, Page } from "@/lib/models";
import { signUpSchema } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, username, password, displayName } = parsed.data;
    await connectDB();

    // Check for duplicates
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return NextResponse.json(
        { error: `This ${field} is already taken` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = nanoid(32);
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      email,
      username,
      passwordHash,
      displayName: displayName ?? username,
      emailVerified: process.env.REQUIRE_EMAIL_VERIFICATION !== "true",
      verificationToken,
      verificationTokenExpiry,
    });

    // Create corresponding page
    await Page.create({
      userId: user._id,
      username,
      displayName: displayName ?? username,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

    return NextResponse.json(
      { message: "Account created. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
