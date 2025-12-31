import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true, // Index for faster queries by conversation
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track createdAt
  }
);

// Compound index for efficient querying of messages in a conversation
MessageSchema.index({ conversationId: 1, createdAt: 1 });

// Prevent model recompilation during hot reloads in development
const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
