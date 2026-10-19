import mongoose, { Schema, Document, Model } from "mongoose";

// ── User ──────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Link ──────────────────────────────────────────────────────────────────────
export interface ILink {
  _id: mongoose.Types.ObjectId;
  title: string;
  url: string;
  enabled: boolean;
  order: number;
  clicks: number;
  createdAt: Date;
}

const LinkSchema = new Schema<ILink>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// ── Page ──────────────────────────────────────────────────────────────────────
export interface IPage extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  themeId: string;
  links: ILink[];
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    themeId: { type: String, default: "default" },
    links: { type: [LinkSchema], default: [] },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Models (singleton-safe for Next.js HMR) ───────────────────────────────────
export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export const Page: Model<IPage> =
  mongoose.models.Page ?? mongoose.model<IPage>("Page", PageSchema);
