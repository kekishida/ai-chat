import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Prevent model recompilation during hot reloads in development
const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
