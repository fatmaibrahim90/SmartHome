const express = require("express");
const route = express.Router();
const commentController = require("../controllers/commentController");


// Protected route (middleware to check authentication)
route.post("/check/:blogId/liked", async (req, res) => {
    const { userId } = req.query; // Get user ID from query parameter (optional)
    const blogId = req.params.blogId;
  
    try {
      const isLiked = await commentService.checkIfLiked(userId , blogId); // Use user ID from query param or auth middleware
      res.json({ success: true, liked: isLiked });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
  route.post("/like/:blogId/like", async (req, res) => {
    const { userId } = req.body; // Get user ID from request body
    const blogId = req.params.blogId;
  
    try {
      const response = await commentService.likeBlog(userId, blogId);
      res.json(response); // Assuming commentService.likeBlog returns a response object
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
  route.post("/unlike/:blogId/unlike", async (req, res) => {
    const { userId } = req.body; // Get user ID from request body
    const blogId = req.params.blogId;
  
    try {
      const response = await commentService.unlikeBlog(userId, blogId);
      res.json(response); // Assuming commentService.unlikeBlog returns a response object
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
//***************  get all comments by blog ID ********************************* */
route.get("/comments/:blogId", async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const comments = await commentController.getAllCommentByBlogId(blogId);
       
        console.log(comments)
        res.json({
            message: "All comments for blog",
            status: 200,
            data: comments,
            success: true,
        });
    } catch (error) {
        res.json({
            message: "Error: " + error.message,
            status: 500,
            success: false,
        });
    }
});

//************  create comment *********************************************** */
route.post("/addComment", async (req, res) => {
    try {
        const newComment = req.body;
        console.log(newComment);
        const createdComment = await commentController.createComment(newComment);
        res.json({
            message: "Comment created successfully",
            status: 201,
            data: createdComment,
            success: true,
        });
    } catch (error) {
        res.json({
            message: "Error: " + error.message,
            status: 500,
            success: false,
        });
    }
});


//***************/////************************************* */ */






route.post("/addLikes", async (req, res) => {
    const newComment = req.body;
    console.log(newComment);
   try {
        const createdComment = await commentController.createComment(newComment);
        res.json({
            message: "Comment created successfully",
            status: 201,
            data: createdComment,
            success: true,
        });
    } catch (error) {
        res.json({
            message: "Error: " + error.message,
            status: 500,
            success: false,
        });
     }
});

//**************** delete comment ********************************************** */
route.delete("/comments/:commentId", async (req, res) => {
    try {
        const commentId = req.params.commentId;
        await commentController.deleteComment(commentId);
        res.json({
            message: "Comment deleted successfully",
            status: 200,
            success: true,
        });
    } catch (error) {
        res.json({
            message: "Error: " + error.message,
            status: 500,
            success: false,
        });
    }
});





//************************************** get comment by Id************************************************** */
route.get("/:id", async (req, res) => {
    try {
        const commentId = req.params.commentId;
        let comment = await commentController.getCommentById(commentId);
        res.json({
            message: "Comment found",
            status: 200,
            data: comment,
            success: true,
        });
    } catch (error) {
        res.json({
            message: "Error: " + error.message,
            status: 500,
            success: false,
        });
    }
});





module.exports = route;
