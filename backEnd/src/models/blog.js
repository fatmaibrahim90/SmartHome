const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({ 
  title: { type: String, required: true, index: true, }, 
  body: { type: String, required: true, },
   image: { type: String, required: true, },
    likes: { type: Number, default: 0, }, 
    likedBy: [ { type: String, ref: "User", }, ], 
    comments: [ { type: mongoose.Schema.Types.ObjectId, ref: "Comment", }, ],
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, },
});
blogSchema.index({ userId: 1, title: 1 });

module.exports = mongoose.model("Blog", blogSchema);
