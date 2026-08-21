const mongoose=require("mongoose");
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},title:{type:String,required:true},message:{type:String,required:true},type:{type:String,default:"system"},link:{type:String,default:""},readAt:{type:Date,default:null}},{timestamps:true});
schema.index({user:1,createdAt:-1});
module.exports=mongoose.model("Notification",schema);
