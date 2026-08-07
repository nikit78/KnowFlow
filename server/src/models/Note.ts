import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  tags: string[];

  user: mongoose.Types.ObjectId;

 collectionId?: mongoose.Types.ObjectId;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#ffffff",
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: String,
      },
    ],

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================
    // Collection Relationship
    // ==========================
    collectionId: {
  type: Schema.Types.ObjectId,
  ref: "Collection",
  default: null,
},
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model<INote>("Note", noteSchema);

export default Note;