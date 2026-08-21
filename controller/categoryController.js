import { Event } from "../models/eventModel.js";
import category from "../models/categoryModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

async function getAllCategories(req, res, next) {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const allCategories = await category.find().limit(limit).skip(skip);
  if (!allCategories) {
    return res
      .status(404)
      .json({ status: httpStatusText.ERROR, message: "Categories not found" });
  }
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { allCategories } });
}

async function addCategory(req, res, next) {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "All fields are required",
    });
  }
  const createCategory = await category.create({
    name,
    description,
  });
  return res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { createCategory } });
}

async function singleCategory(req, res, next) {
  const singleCategory = await category.findById(req.params.id);
  if (!singleCategory) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "This category is not found",
    });
  }
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { singleCategory } });
}

async function deleteCategory(req, res, next) {
  const events = await Event.findOne({
    category: req.params.id,
  });

  if (events) {
    return res.status(409).json({
      status: httpStatusText.FAIL,
      message: "Cannot delete category because it is used by events",
    });
  }
  const deleteCategory = await category.findByIdAndDelete(req.params.id);
  if (!deleteCategory) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "This category is not found",
    });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: `Category of name ${deleteCategory.name} is deleted successfully`,
  });
}

async function updateCategory(req, res, next) {
  const { name, description } = req.body;
  const oneCategory = await category.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    },
  );
  if (!oneCategory) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "Category is not found" });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: `Category of name ${oneCategory.name} is updated successfully`,
    data: {
      oneCategory,
    },
  });
}

export default {
  getAllCategories: asyncWrapper(getAllCategories),
  addCategory: asyncWrapper(addCategory),
  singleCategory: asyncWrapper(singleCategory),
  deleteCategory: asyncWrapper(deleteCategory),
  updateCategory: asyncWrapper(updateCategory),
};
