const commentModel=require('../models/comment')
const userModel = require("../models/user");
const blogModel = require("../models/blog");
const { ObjectId } = require("mongodb");


async function likeBlog(userId, blogId) {
  try {
    const user = await userModel.findByIdAndUpdate(userId, {
      $addToSet: { wishList: blogId }, // Add blog ID to user's wishlist (avoids duplicates)
    });
    const blog = await blogModel.findByIdAndUpdate(blogId, {
      $inc: { likes: 1 }, // Increment likes count
      $push: { likedBy: userId }, // Add user ID to blog's likedBy array
    });

    if (!user || !blog) {
      throw new Error("User or blog not found");
    }

    return { success: true, message: "Blog liked successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
}

async function unlikeBlog(userId, blogId) {
  try {
    const user = await userModel.findByIdAndUpdate(userId, {
      $pull: { wishList: blogId }, // Remove blog ID from user's wishlist
    });
    const blog = await blogModel.findByIdAndUpdate(blogId, {
      $inc: { likes: -1 }, // Decrement likes count (if greater than 0)
      $pull: { likedBy: userId }, // Remove user ID from blog's likedBy array
    });

    if (!user || !blog) {
      throw new Error("User or blog not found");
    }

    return { success: true, message: "Blog unliked successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
}



async function checkIfLiked(userId, blogId) {
  try {
    const convertedUserId = ObjectId(userId); // Convert user ID to ObjectId
    const convertedBlogId = ObjectId(blogId); // Convert blog ID to ObjectId
    const blog = await blogModel.findOne({
      _id: convertedBlogId, // Use your field name for blog ID
      "likedBy.user_id": convertedUserId, // Check "likedBy" array for user ID
    });
    return !!blog; // Return true if a blog with the user ID in "likedBy" is found, false otherwise
  } catch (error) {
    console.error(error);
    throw new Error("Failed to check like status");
  }
}


//************  create comment *********************************************** */

async function createComment(comment){
    let createComment=await commentModel.create(comment);
    return createComment;

}



//**************** delete comment ********************************************** */

async function deleteComment(id){
    let deleteBlog=await commentModel.deleteOne({_id:id});
    return deleteBlog;
}


//*************** get all comment by blog id************************************************** */

async function getAllCommentByBlogId(id){
    let allComment=await commentModel.find({blogId:id})    
      .populate({ path: "userId", select: "fullName" })
      .exec();
      console.log(allComment)
      return allComment; 
      
}
//**************************************** get comment by Id************************************************************ */
async function getCommentById(id){
    let comment=await commentModel.findOne({_id:id});
    return comment;
}



module.exports={deleteComment,createComment,getAllCommentByBlogId,getCommentById,likeBlog,unlikeBlog,checkIfLiked}
