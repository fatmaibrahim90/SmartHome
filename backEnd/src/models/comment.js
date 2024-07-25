const mongoose=require('mongoose');


//schema comments

const commentSchema=mongoose.Schema({
    blogId:{ type:mongoose.Schema.Types.ObjectId, ref:'Blog', required:true, index:true,
    },
    comment:{ type:String, required:true

    },
    userId:{ type:mongoose.Schema.Types.ObjectId, ref:'User', required:true

    },
    createdAt:{type:Date,default:Date.now
    }
})

commentSchema.index({ blogId: 1 }, { unique: false })

module.exports=mongoose.model('Comment',commentSchema)  