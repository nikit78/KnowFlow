import { Response } from "express";
import Collection from "../models/Collection.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// ==========================
// Create Collection
// ==========================
export const createCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "Collection name is required",
      });
      return;
    }

    const collection = await Collection.create({
      name,
      description,
      icon,
      color,
      user: req.user!._id,
    });

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      collection,
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
// Get All Collections
// ==========================
export const getCollections = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const collections = await Collection.find({
      user: req.user!._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: collections.length,
      collections,
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
// Update Collection
// ==========================
export const updateCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, icon, color } = req.body;

    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Collection not found",
      });
      return;
    }

    collection.name = name ?? collection.name;
    collection.description = description ?? collection.description;
    collection.icon = icon ?? collection.icon;
    collection.color = color ?? collection.color;

    await collection.save();

    res.status(200).json({
      success: true,
      message: "Collection updated successfully",
      collection,
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
// Delete Collection
// ==========================
export const deleteCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Collection not found",
      });
      return;
    }

    await collection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};