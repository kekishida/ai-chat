import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInviteCode extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  isUsed: boolean;
  usedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InviteCodeSchema = new Schema<IInviteCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      required: true,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient unused code queries
InviteCodeSchema.index({ isUsed: 1, expiresAt: 1 });

// Prevent model recompilation during hot reloads in development
const InviteCode: Model<IInviteCode> =
  mongoose.models.InviteCode || mongoose.model<IInviteCode>('InviteCode', InviteCodeSchema);

export default InviteCode;
