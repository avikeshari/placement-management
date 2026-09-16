const mongoose = require("mongoose");
const savedSearchSchema = new mongoose.Schema({ user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true}, name:{type:String,required:true,trim:true,maxlength:100}, query:{type:Object,default:{}}, alertsEnabled:{type:Boolean,default:true} },{timestamps:true});
module.exports=mongoose.model("SavedSearch",savedSearchSchema);
