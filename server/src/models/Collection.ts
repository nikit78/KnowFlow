import mongoose, { Document, Schema } from "mongoose";

export interface ICollection extends Document {
  name: string;
  description: string;
  icon: string;
  color: string;
  user: mongoose.Types.ObjectId;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    icon: {
      type: String,
      default: "📁",
    },

    color: {
      type: String,
      default: "#6366F1",
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Collection = mongoose.model<ICollection>(
  "Collection",
  collectionSchema
);

export default Collection;