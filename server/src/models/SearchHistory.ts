import mongoose, { Document, Schema } from "mongoose";

export interface ISearchHistory extends Document {
  query: string;
  user: mongoose.Types.ObjectId;
}

const searchHistorySchema = new Schema<ISearchHistory>(
  {
    query: {
      type: String,
      required: true,
      trim: true,
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

// Prevent duplicate history entries
searchHistorySchema.index(
  { user: 1, query: 1 },
  { unique: true }
);

const SearchHistory = mongoose.model<ISearchHistory>(
  "SearchHistory",
  searchHistorySchema
);

export default SearchHistory;