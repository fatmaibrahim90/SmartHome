const userModel = require("../models/user");
const { search } = require("../routers/userRoute");

//******************  Update user   ************ */

async function updateUser(id, newData) {
  let userUpdated = await userModel.updateOne({ _id: id }, newData);
  return userUpdated;
}

//************************ deleteUser  *********************************** */

async function deleteUser(id) {
  let userDeleted = await userModel.deleteOne({ _id: id });
  return userDeleted;
}

// ********************** check if email exist ************************

async function check_email(email) {
  email = email.toLowerCase();
  let response = await userModel.findOne({ email: email });
  return response;
}

//********************** register   ******************************************** */

async function register(user_data) {
  user_data.email = user_data.email.toLowerCase();
  let new_user = await userModel.create(user_data);
  return new_user;
}

//********************** get user data **************************************** */

async function getUserByEmail(email) {
  email = email.toLowerCase();
  let existed_user_data = await userModel.findOne({ email: email });
  return existed_user_data;
}

//******************   get user by id ************************************* */

async function getUserByID(id) {
  let user = await userModel.findOne({ _id: id });
  return user;
}

//****************** get all user********************************************************* */
async function getAllUser() {
  let users = await userModel.find();
  return users;
}
// *************** search user************************************************************
async function searchUsers(query) {
  try {
    const users = await userModel.find({
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });
    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

//********************************* Get User Likes ******************************************************* */
async function getUserLikes(req, res) {
  const userId = req.user._id;

  try {
    const user = await userModel.findById(userId).populate("likedBlogs");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const likedBlogs = user.likedBlogs;

    res.json({ likedBlogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  updateUser,
  deleteUser,
  check_email,
  register,
  getUserByEmail,
  getUserByID,
  getAllUser,
  searchUsers,
  getUserLikes
};
