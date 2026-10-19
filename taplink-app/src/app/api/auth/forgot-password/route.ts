import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { resetPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email });

    // Always return success to avoid user enumeration
    if (user) {
      const token = nanoid(32);
      user.resetToken = token;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();
      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (err) {
        console.error("Failed to send reset email:", err);
      }
    }

    return NextResponse.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
