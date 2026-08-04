import { Response } from "express";
import Note from "../models/Note.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// ==========================
// Create Note
// ==========================
export const createNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, color, tags } = req.body;

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
    const notes = await Note.find({
      user: req.user!._id,
    }).sort({
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
    });

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
    const { title, content, color, tags, isPinned } = req.body;

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
    });

    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found",
      });
      return;
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};