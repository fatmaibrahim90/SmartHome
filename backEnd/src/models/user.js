const mongoose = require("mongoose");
const userSchema = new mongoose.Schema( { fullName: { type: String, required: true, minlength: 2, maxLength: 30, },
   email: { type: String, required: true, validate: { validator: (v) => { let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; return pattern.test(v); }, message: "Please fill a valid email address", }, unique: true, index: true, },
   password: { type: String, required: true, minlength: [12, "Password must be at least 12 characters long"], maxlength: [128, "Password must be less than 128 characters long"], },
   phoneNumber: { type: String, required: true, maxlength: 11, validate: { validator: (v) => { return /^[0-9]{11}$/.test(v); }, }, },
   joineDate: { type: Date, default: Date.now, }, 
   nationalId: { type: String, maxlength: 14, index: true, },
    wishLike: { type: Array, default: [],ref: "Blog" },
     likedBlogs: [ { type: mongoose.Schema.Types.ObjectId, ref: "Blog", }, ],
    role: { type: String, enum: ["admin", "user"], default: "user", },
     address: { type: String, required: true, }, }, { versionKey: false, strict: false }
);

module.exports = mongoose.model("User", userSchema);
