const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: true },
  alt: { type: String, required: true },
  content: { type: String, required: true },
  published: { type: Boolean, required: true },
  date: { type: Date, default: Date.now },
});

BlogSchema.virtual("url").get(function () {
  return `/article/${this._id}`;
});

module.exports = mongoose.model("Blog", BlogSchema);
