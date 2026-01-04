import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email?: string;
  passwordHash: string;
  inviteCodeUsed: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Optional field
    },
    passwordHash: {
      type: String,
      required: true,
    },
    inviteCodeUsed: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot reloads in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
