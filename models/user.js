const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
});

module.exports = mongoose.model("User", UserSchema);
