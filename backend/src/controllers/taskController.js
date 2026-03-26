import mongoose from "mongoose";

import Task from "../models/Task.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedStatuses = ["Todo", "In Progress", "Done"];
const allowedPriorities = ["Low", "Medium", "High"];
const allowedSortFields = ["createdAt", "dueDate", "priority", "status", "title"];

const ensureValidTaskId = (taskId) => {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }
};

const buildTaskPayload = (body) => {
  const payload = {};

  if (body.title !== undefined) {
    payload.title = body.title;
  }
  if (body.description !== undefined) {
    payload.description = body.description;
  }
  if (body.status !== undefined) {
    payload.status = body.status;
    payload.completedAt = body.status === "Done" ? new Date() : null;
  }
  if (body.priority !== undefined) {
    payload.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    payload.dueDate = body.dueDate;
  }

  return payload;
};

const validateTaskInput = (body, isUpdate = false) => {
  if (!isUpdate || body.title !== undefined) {
    if (!body.title || String(body.title).trim().length < 2) {
      throw new ApiError(400, "Title must be at least 2 characters");
    }
  }

  if (!isUpdate || body.dueDate !== undefined) {
    if (!body.dueDate || Number.isNaN(new Date(body.dueDate).getTime())) {
      throw new ApiError(400, "A valid due date is required");
    }
  }

  if (body.status !== undefined && !allowedStatuses.includes(body.status)) {
    throw new ApiError(400, "Invalid status value");
  }

  if (body.priority !== undefined && !allowedPriorities.includes(body.priority)) {
    throw new ApiError(400, "Invalid priority value");
  }
};

const getSortStage = (sortBy, order) => {
  const sortOrder = order === "asc" ? 1 : -1;

  if (sortBy === "priority") {
    return {
      priorityRank: sortOrder,
      dueDate: 1,
      createdAt: -1,
    };
  }

  if (sortBy === "title") {
    return { title: sortOrder, createdAt: -1 };
  }

  if (sortBy === "status") {
    return { statusRank: sortOrder, dueDate: 1 };
  }

  return { [sortBy]: sortOrder, createdAt: -1 };
};

export const createTask = asyncHandler(async (req, res) => {
  validateTaskInput(req.body);

  const task = await Task.create({
    user: req.user._id,
    title: req.body.title.trim(),
    description: req.body.description?.trim() || "",
    status: req.body.status || "Todo",
    priority: req.body.priority || "Medium",
    dueDate: req.body.dueDate,
    completedAt: req.body.status === "Done" ? new Date() : null,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
});

export const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "6", 10), 1), 50);
  const skip = (page - 1) * limit;

  const status = req.query.status;
  const priority = req.query.priority;
  const search = req.query.search?.trim();
  const sortBy = allowedSortFields.includes(req.query.sortBy)
    ? req.query.sortBy
    : "dueDate";
  const order = req.query.order === "asc" ? "asc" : "desc";

  const matchStage = {
    user: new mongoose.Types.ObjectId(req.user._id),
  };

  if (status && status !== "All") {
    matchStage.status = status;
  }

  if (priority && priority !== "All") {
    matchStage.priority = priority;
  }

  if (search) {
    matchStage.title = { $regex: search, $options: "i" };
  }

  const result = await Task.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        priorityRank: {
          $switch: {
            branches: [
              { case: { $eq: ["$priority", "High"] }, then: 3 },
              { case: { $eq: ["$priority", "Medium"] }, then: 2 },
            ],
            default: 1,
          },
        },
        statusRank: {
          $switch: {
            branches: [
              { case: { $eq: ["$status", "Todo"] }, then: 1 },
              { case: { $eq: ["$status", "In Progress"] }, then: 2 },
            ],
            default: 3,
          },
        },
      },
    },
    { $sort: getSortStage(sortBy, order) },
    {
      $facet: {
        tasks: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const tasks = result[0]?.tasks || [];
  const total = result[0]?.totalCount?.[0]?.count || 0;

  res.json({
    success: true,
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  ensureValidTaskId(req.params.id);

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.json({
    success: true,
    task,
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  ensureValidTaskId(req.params.id);
  validateTaskInput(req.body, true);

  const update = buildTaskPayload(req.body);
  if (update.title) {
    update.title = update.title.trim();
  }
  if (update.description !== undefined) {
    update.description = update.description.trim();
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    update,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.json({
    success: true,
    message: "Task updated successfully",
    task,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  ensureValidTaskId(req.params.id);

  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.json({
    success: true,
    message: "Task deleted successfully",
  });
});

export const toggleTaskCompletion = asyncHandler(async (req, res) => {
  ensureValidTaskId(req.params.id);

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const nextStatus = task.status === "Done" ? "Todo" : "Done";
  task.status = nextStatus;
  task.completedAt = nextStatus === "Done" ? new Date() : null;
  await task.save();

  res.json({
    success: true,
    message: `Task marked as ${nextStatus}`,
    task,
  });
});
