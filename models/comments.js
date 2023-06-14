const mongoose = require("mongoose");

const Schema = mongoose.Schema;

CommentSchema = new Schema({
  blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

CommentSchema.virtual("url").get(function () {
  return `/article/comment/${this._id}`;
});

module.exports = mongoose.model("Comment", CommentSchema);
