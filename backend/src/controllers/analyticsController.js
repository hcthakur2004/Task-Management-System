import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getTaskAnalytics = asyncHandler(async (req, res) => {
  const [summary] = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", "Done"] }, 1, 0],
          },
        },
        pendingTasks: {
          $sum: {
            $cond: [{ $ne: ["$status", "Done"] }, 1, 0],
          },
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$status", "Done"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const [byStatus, byPriority] = await Promise.all([
    Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalTasks = summary?.totalTasks || 0;
  const completedTasks = summary?.completedTasks || 0;

  res.json({
    success: true,
    analytics: {
      totalTasks,
      completedTasks,
      pendingTasks: summary?.pendingTasks || 0,
      overdueTasks: summary?.overdueTasks || 0,
      completionPercentage: totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      byStatus,
      byPriority,
    },
  });
});
