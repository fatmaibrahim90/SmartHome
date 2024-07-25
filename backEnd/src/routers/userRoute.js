const userController = require("../controllers/userController");
const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("../shared/auth");
const fs = require("fs");
let secret= fs.readFileSync("secret.key");
const blogModel =require ("../models/blog")

const userModel = require("../models/user");

//************* register **************************************************** */

route.post("/register", async function (req, res) {
  console.log(req.body);
  if (
    req.body.fullname == "" ||
    req.body.email == "" ||
    req.body.password == "" ||
    req.body.phoneNumber == "" ||
    req.body.address == "" ||
    req.body.nationalId == ""
  ) {
    res.json({
      message: "Error : you should insert valid values",
      status: 400,
      data: req.body,
      success: false,
    });
  } else {
    let exist = await userController.check_email(req.body.email);
    if (exist) {
      res.json({
        message: "email aready exist",
        status: 400,
        data: exist,
        success: false,
      });
    } else {
     
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword
      let new_user = await userController.register(req.body);
      res.json({
        message: "Successfull regestration go to sign in",
        status: 200,
        data: new_user,
        success: true,
      });
    }
  }
});

//***************************** login ***************************************************** */

route.post("/login", async function (req, res) {
  const user = await userController.getUserByEmail(req.body.email);

  if (!user) {
    res.json({
      massage: "you are not an user",
      status: 401,
      data: req.body,
      success: false,
    });
  } else {
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isValidPassword) {
     const token = jwt.sign({ user }, secret, (secret, { expiresIn: '1h' } ) )
        res.json({
          message: "Login Successfully",
          status: 200,
          success: true,

          data: { user: user, token: token },

        });
    } else {
      res.json({
        message: "Error:invalid credentials , password incorrect",
        status: 401,
        data: req.body,
        success: false,
      });
    }
  }
});

// ****************** update User ************************************************** */

route.put("/update/:id", verifyToken, async function (req, res) {
  jwt.verify(req.token, secret, async (err, data) => {
    if (err) {
      res.json({
        message: "Error:invalid credentials , on token found",
        status: 401,
        data: req.token,
        success: false,
      });
    } else {
      // let id = data.user._id;
      console.log(req.body);
      console.log(req.params.id);
      let user = await userController.updateUser(req.params.id, req.body,data);
      if (user) {
        res.json({
          message: "user updated successfully",
          status: 200,
          data: user,
          success: true,
        });
      } else {
        res.json({
          message: "Error:user not found",
          status: 400,
          data: user,
          success: false,
        });
      }
    }
  });
});

//******************** delete user ***************************************** */
route.delete("/delete/:id", verifyToken, async function (req, res) {
  jwt.verify(req.token, secret, async (err, data) => {
    if (err) {
      res.json({
        message: "Error:invalid credentials , on token found",
        status: 401,
        data: req.token,
        success: false,
      });
    } else {
      let id = data.user._id;
      let user = await userController.deleteUser(req.params.id);
      if (user.deletedCount>0) {
        res.json({
          message: "user deleted successfully",
          status: 200,
          data: user,
          success: true,
        });
      } else {
        res.json({
          message: "Error:user not found",
          status: 400,
          data: user,
          success: false,
        });
      }
    }
  });
});

//*********************** get all user******************************************************* */
route.get("/getAll", async function (req, res) {
  const user = await userController.getAllUser();
  res.json({
    message:"all users",
    status:200,
    data:user,
    success:true

  })
})
//********************************* get user by id ******************************************** */
route.get("/getById/:id", async function (req, res) {
  let exist=await userController.check_email(req.params.id);
  if(exist){
    let data=await userController.getUserById(req.params.id);
    res.json({
      message:"user found",
      status:200,
      data:data,
      success:true
    })
  }else{
    res.json({
      message:"user not found",
      status:400,
      success:false,
    })

  }
})

//************************* get user by gmail*************************************** */
route.get("/getByEmail/:email", async function (req, res) {
  let exist=await userController.check_email(req.params.email);
  if(exist){
    let data=await userController.getUserByEmail(req.params.email);
    res.json({
      message:"user found",
      status:200,
      data:data,
      success:true
    })
  }else{
    res.json({
      message:"user not found",
      status:400,
      success:false,
    })

  }

})

//************************** search user  ************************************************** */

route.get('/search/:query', async (req, res) => {
  const query = req.params.query;
  try {
    const users = await userController.searchUsers(query); 
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

//*********************************  Get User Likes ******************************************************* */

// route.get('getlikeuser/:id', async (req, res) => {
//   const { userId } = req.params;
//   console.log(userId);

//   try {
//     const likedBlogs = await blogModel.find({ likedBy: userId });

//     res.json({ likedBlogs });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });




route.post("/wishlist/toggle", verifyToken, async (req, res) => {


  jwt.verify(req.token, secret, async (err, data) => {

    if (err) {
      res.json({
        message: "Error:invalid credentials , on token found",
        status: 401,
        data: req.token,
        success: false,
      });
    } else {
      const blogId = req.body._id;
      const userId = req.body.userId;
        console.log(userId);

      try {
        const user = await userModel.findById(userId);
        const blog = await blogModel.findById(blogId);
        if (!user) {
          return res.json({ message: "User not found", status: 400, data: null, success: false,});}

        const existingItem = user.wishLike.find((item) => item._id.toString() === req.body._id);

        if (existingItem) {
          // Item already exists, remove it
          user.wishLike = user.wishLike.filter((item) => item._id.toString() !== req.body._id);
          const blog = await blogModel.findByIdAndUpdate(blogId, {
            $pull: { likedBy: userId },
          });
          const message = "Item removed from wishLike";
            console.log(message);
        } else {// Item doesn't exist, add it
          user.wishLike.push(req.body);
          blog.likedBy.push(req.body.userId);

          
          const message = "Item added to wishLike";
          console.log(message);
        }

        await user.save();
        await blog.save();
        res.json({ message, status: 200, data: user.wishLike, success: true });
      } catch (error) {
        console.error(error);
        res.json({
          message: "Error updating wishLike",
          status: 500,
          data: null,
          success: false,
        });
      }
    }
  });
});


//get all wish list items for user
route.get("/wishlist", verifyToken, async function (req, res) {
  jwt.verify(req.token, secret, async (err, data) => {
    if (err) {
      res.json({ message: "Error:invalid credentials , on token found", status: 401, data: req.token, success: false,});
    } else {const userId = data.user._id;
      try {
        const user = await userModel.findById(userId).populate("wishLike"); // Populate blogs
        console.log(user)
        if (!user) {return res.json({message: "User not found",status: 400,data: null,success: false,});}
        res.json({ message: "All user wishlist", status: 200, data: user.wishLike, success: true });
      } catch (error) {
        console.error(error);
        res.json({
          message: "Error fetching wishlist",
          status: 500,
          data: null,
          success: false,
        });
      }
    }
  });
});

//get all wish list items for user
route.delete("/wishlist/empty", verifyToken, async function (req, res) {
  jwt.verify(req.token, secret, async (err, data) => {
    if (err) {
      res.json({
        message: "Error:invalid credentials , on token found",
        status: 401,
        data: req.token,
        success: false,
      });
    } else {
      let id = data.user._id;
      userModel
        .findById(id)
        .then((user) => {
          user.wishlist = []
          user.save()
          res.json({
            message: "all user wish list",
            status: 200,
            data: user.wishlist,
            success: true,
          });
        })
        .catch((err) => {
          res.json({
            message: "user not found",
            status: 400,
            data: null,
            success: false,
          });
        });
    }
  });
});


module.exports=route;