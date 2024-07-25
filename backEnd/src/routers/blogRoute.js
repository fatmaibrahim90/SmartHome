const express = require("express");
const route = express.Router();
const blogController = require("../controllers/blogController");
const blogModel = require("../models/blog");

const multer = require("multer");
const blog = require("../models/blog");
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/images");
  },
  filename: (req, file, cb) => {
    // cb(null, `${file.fieldname}-${Date.now()}.jpg`)
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const multerFilter = function (req, file, cb) {
  if (file.mimetype.split("/")[0] == "image") {
    cb(null, true);
  } else {
    cb(new Error("Not image"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//******* get all blog*************************************************** */

route.get("/allBlog", async (req, res) => {
  const blogs = await blogController.getAllBlog();
  res.json({
    message: "all blog",
    status: 200,
    data: blogs,
    success: true,
  });
});

//***************  get all blog by id********************************* */

route.get("/allBlog/:id", async (req, res) => {
  let exist = await blogController.isBlogExist(req.params.id);
  if (exist) {
    let data = await blogController.getBlogByID(req.params.id);

    res.json({
      massage: "get blog by id",
      status: 200,
      data: data,
      success: true,
    });
  } else {
    res.json({
      message: "blog not found",
      status: 404,
      success: false,
    });
  }
});

//*************************get all blog by title ********************************************* */

route.get("/getBlogByTitle/:title", async (req, res) => {
  let exist = await blogController.isBlogExist(req.params.title);
  if (exist) {
    let data = await blogController.getBlogByTitle(req.params.title);

    res.json({
      massage: "get blog by title",
      status: 200,
      data: data,
      success: true,
    });
  } else {
    res.json({
      message: "blog not found",
      status: 404,
      success: false,
    });
  }
});

// routes/blogRoutes.js

// Import necessary modules and controllers

// Route for searching blog by title

//************************* get all blog by author******************************************* */

route.get("/allBlog/:author", async (req, res) => {
  let exist = await blogController.isBlogExist(req.params.author);
  if (exist) {
    let data = await blogController.getBlogByAuthor(req.params.author);

    res.json({
      massage: "get blog by author",
      status: 200,
      data: data,
      success: true,
    });
  } else {
    res.json({
      message: "blog not found",
      status: 404,
      success: false,
    });
  }
});

//********************************* add blog****************************************** */

route.post("/addBlog", upload.single("image"), async (req, res) => {
  let img;
  if (!req.file) {
    img = "http://localhost:8000/default.png";
  } else {
    img = await blogController.getImageBlog(req.file);
  }
  console.log(req.file);
  console.log(req.body);
  console.log(req.body.likedBy)
  console.log(req.body.likes)
  console.log(req.body.comments)
  let blog = new blogModel({
    title: req.body.title,
    body: req.body.body,
    image: img,
    userId: req.body.userId,
    likedBy: req.body.userId,
    likes:req.body.likes,
    comments:req.body.comments,

  });
  try {
    blog = await blog.save();
    res.json({
      message: "blog added",
      status: 200,
      data: blog,
      success: true,
    });
  } catch (error) {
    res.json({
      message: "error",
      status: 401,
      data: null,
      success: false,
    });
  }
});

//****************************** edit blog ************************************** */

route.put("/editBlog/:id", upload.single("image"), async (req, res) => {
  let existBlog = await blogController.isBlogExist(req.params.id);
  if (!existBlog) {
    res.json({
      message: "blog not found",
      status: 404,
      success: false,
    });
  } else {
    let img;
    if (!req.file) {
      img = existBlog.image;
    } else {
      img = await blogController.getImageBlog(req.file);
    }

    try {
      blogModel.findById(req.params.id).then((blog) => {
        blog.title = req.body.title;
        blog.body = req.body.body;
        blog.image = img;
        blog.save();
      });
      res.json({
        message: "blog updated",
        status: 200,
        success: true,
      });
    } catch (error) {
      res.json({
        message: "error",
        status: 401,
        success: false,
      });
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
});

//****************** delete blog ******************************************** */

route.delete("/deleteBlog/:id", async (req, res) => {
  const { id } = req.params;

  blogModel
    .findByIdAndDelete(id)
    .then((blog) => {
      res.json({
        message: "blog deleted",
        status: 200,
        success: true,
      });
    })
    .catch((error) => {
      res.json({
        message: "error",
        status: 401,
        success: false,
      });
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
      return;
    });
});

//******************** Like a Blog  ************************************************************ */

route.get("/likeBlog/:id", async (req, res) => {
  console.log(req);
  const  blogId  = req.params;
  const userId = req.user._id;
  try {
    const existingLike = await blogModel.findOne({
      _id: blogId,
      likedBy: userId,
    });

    if (existingLike) {
      return res.status(400).json({ message: "You already liked this blog" });
    }

    const blog = await blogModel.findByIdAndUpdate(
      blogId,
      { $addToSet: { likedBy: userId } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//**************************unlike blog *************************************************************** */

route.delete("/unlike/:id/unlike", async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  try {
    const blog = await blogModel.findByIdAndUpdate(
      blogId,
      { $pull: { likedBy: userId } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog unliked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = route;
