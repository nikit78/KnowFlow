import { Response } from "express";
import Note from "../models/Note.js";
import SearchHistory from "../models/SearchHistory.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// ==========================
// Create Note
// ==========================
export const createNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      content,
      color,
      tags,
      collectionId,
    } = req.body;

    if (!title) {
      res.status(400).json({
        success: false,
        message: "Title is required",
      });
      return;
    }

    const note = await Note.create({
      title,
      content,
      color,
      tags,
      collectionId: collectionId || null,
      user: req.user!._id,
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get All Notes
// ==========================
export const getNotes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {
      user: req.user!._id,
      isDeleted: false,
    };

    if (req.query.collectionId) {
      filter.collectionId = req.query.collectionId;
    }

    const notes = await Note.find(filter)
      .populate("collectionId", "name icon color")
      .sort({
        isPinned: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Search Notes (MongoDB Text Search)
// ==========================
export const searchNotes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const query = (req.query.q as string)?.trim();

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    // ==========================
// Save Search History
// ==========================
await SearchHistory.findOneAndUpdate(
  {
    user: req.user!._id,
    query,
  },
  {
    query,
    user: req.user!._id,
    updatedAt: new Date(),
  },
  {
    upsert: true,
    returnDocument: "after",
    setDefaultsOnInsert: true,
  }
);


    const filter: Record<string, unknown> = {
      user: req.user!._id,
      isDeleted: false,
      $text: {
        $search: query,
      },
    };

    if (req.query.collectionId) {
      filter.collectionId = req.query.collectionId;
    }

    const notes = await Note.find(
      filter,
      {
        score: {
          $meta: "textScore",
        },
      }
    )
      .populate("collectionId", "name icon color")
      .sort({
        score: {
          $meta: "textScore",
        },
        isPinned: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ==========================
// Get Trash Notes
// ==========================
export const getTrashNotes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const notes = await Note.find({
      user: req.user!._id,
      isDeleted: true,
    })
      .populate("collectionId", "name icon color")
      .sort({
        deletedAt: -1,
      });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Restore Note
// ==========================
export const restoreNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: true,
    });

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found in trash",
      });
      return;
    }

    note.isDeleted = false;
    note.deletedAt = null;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note restored successfully",
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Permanent Delete Note
// ==========================
export const permanentDeleteNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOne({
  _id: req.params.id,
  user: req.user!._id,
  isDeleted: true,
});
    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found in trash",
      });
      return;
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note permanently deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ==========================
// Get Single Note
// ==========================
export const getNoteById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user!._id,
    }).populate("collectionId", "name icon color");

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Update Note
// ==========================
export const updateNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      content,
      color,
      tags,
      isPinned,
      collectionId,
    } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found",
      });
      return;
    }

    note.title = title ?? note.title;
    note.content = content ?? note.content;
    note.color = color ?? note.color;
    note.tags = tags ?? note.tags;
    note.isPinned = isPinned ?? note.isPinned;

    if (collectionId !== undefined) {
      note.collectionId = collectionId;
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Delete Note
// ==========================
export const deleteNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    });

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found",
      });
      return;
    }

    note.isDeleted = true;
    note.deletedAt = new Date();

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note moved to trash successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Pin / Unpin Note
// ==========================
export const togglePinNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found",
      });
      return;
    }

    note.isPinned = !note.isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note pin status updated",
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Toggle Favorite
// ==========================
export const toggleFavoriteNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("Favorite ID:", req.params.id);
    console.log("User ID:", req.user!._id.toString());

    const note = await Note.findOne({
  _id: req.params.id,
  user: req.user!._id,
  isDeleted: false,
});

    console.log("Found Note:", note);

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found",
      });
      return;
    }

    note.isFavorite = !note.isFavorite;

    await note.save();

    res.status(200).json({
      success: true,
      message: note.isFavorite
        ? "Note added to favorites"
        : "Note removed from favorites",
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Recent Searches
// ==========================
export const getRecentSearches = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const searches = await SearchHistory.find({
      user: req.user!._id,
    })
      .sort({
        updatedAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      count: searches.length,
      searches,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Search Suggestions
// ==========================
export const getSearchSuggestions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const query = (req.query.q as string)?.trim();

    if (!query) {
      res.status(200).json({
        success: true,
        suggestions: [],
      });
      return;
    }

    const suggestions = await SearchHistory.find({
      user: req.user!._id,
      query: {
        $regex: "^" + query,
        $options: "i",
      },
    })
      .sort({
        updatedAt: -1,
      })
      .limit(5)
      .select("query");

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};