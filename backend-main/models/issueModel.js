const mongoose = require("mongoose");

const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const IssueSchema = new Schema(
  {
    number: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    labels: [{ type: String }],

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    comments: [CommentSchema],

    closedAt: { type: Date },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
  },
  { timestamps: true }
);

IssueSchema.index({ repository: 1, number: 1 }, { unique: true });

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;