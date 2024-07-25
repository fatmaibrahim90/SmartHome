const blogModel = require("../models/blog");

//**********************  update blog  ******************************************* */

async function updateBlog(id, newData) {
  let updateBlog = await blogModel.updateOne({ _id: id }, newData);
  return updateBlog;
}

//******************** check if blog is exist ************************************** */
async function isBlogExist(id) {
  let response = await blogModel.findById(id);
  return response;
}

//********************** delete blog **************************************** */

async function deleteBlog(id) {
  let deleteBlog = await blogModel.deleteOne({ _id: id });
  return deleteBlog;
}

//******************** create blog ************************************* */

async function createBlog(blog) {
  let createBlog = await blogModel.create(blog);
  return createBlog;
}
async function getImageBlog(file) {
  let pathLink = "http://localhost:8000/" + file.filename;
  return pathLink;
}

//******************* get blog data**************************** */
//*********************get all blog  *********************************** */

async function getAllBlog() {
  let allBlog = await blogModel.find()
      .populate({ path: "comments", select: " createdAt" })
      .populate({ path: "likedBy", select: "fullName" })
      .exec();
  return allBlog;
}

//****************** get blog by id ************************************* */

async function getBlogByID(id) {
  let blogById = await blogModel.findOne({ _id: id });
  return blogById;
}

//******************* get blog by title ************************************* */

async function getBlogByTitle(title) {
  let blogByTitle = await blogModel.find({
    title: { $regex: title, $options: "i" },
  });
  return blogByTitle;
}

//****************** get blog by author ************************************* */

async function getBlogByAuthor(userId) {
  let blogByUerId = await blogModel.find({ userId: userId });
  return blogByUerId;
}

//******************* like blog ************************************************************* */

async function likeBlog(req, res) {
  const { blogId } = req.params;
  const userId = req.user._id;

  try {
    const blog = await blogModel.findByIdAndUpdate(blogId, {
      $addToSet: { likedBy: userId },
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
//**************************** unlike ****************************************************** */

async function unlikeBlog(req, res) {
  const { blogId } = req.params;
  const userId = req.user._id;

  try {
    const blog = await blogModel.findByIdAndUpdate(blogId, {
      $pull: { likedBy: userId },
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog unlike successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//************************** Get Likes on a Blog ************************************************************* */

async function getBlogLikes(req, res) {
  const { blogId } = req.params;

  try {
    const blog = await blogModel.findById(blogId).populate("likedBy");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const likesCount = blog.likedBy.length;

    res.json({ likes: likesCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//******************************get user likes ******************************************************************************* */

async function getUserLikes(req, res) {
  const userId = req.user._id;

  try {
    const likedBlogs = await blogModel.find({ likedBy: userId });

    res.json({ likedBlogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  updateBlog,
  deleteBlog,
  createBlog,
  getAllBlog,
  getBlogByID,
  getBlogByTitle,
  getBlogByAuthor,
  getImageBlog,
  isBlogExist,
  likeBlog,
  unlikeBlog,
  getBlogLikes,
  getUserLikes,
};
