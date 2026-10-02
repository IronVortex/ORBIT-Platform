const mongoose = require("mongoose");

const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const PullRequestSchema = new Schema(
  {
    number: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    sourceBranch: { type: String, required: true },
    targetBranch: { type: String, required: true },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "merged", "closed"],
      default: "open",
    },

    mergedAt: { type: Date },
    closedAt: { type: Date },

    reviewers: [{ type: Schema.Types.ObjectId, ref: "User" }],

    reviews: [
      {
        reviewer: { type: Schema.Types.ObjectId, ref: "User" },
        state: {
          type: String,
          enum: ["approved", "changes_requested", "commented"],
        },
        body: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    comments: [CommentSchema],
  },
  { timestamps: true }
);

// Ensure numbers are unique per repository
PullRequestSchema.index({ repository: 1, number: 1 }, { unique: true });

const PullRequest = mongoose.model("PullRequest", PullRequestSchema);
module.exports = PullRequest;
