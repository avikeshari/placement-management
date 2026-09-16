const mongoose=require("mongoose");
const schema=new mongoose.Schema({company:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},student:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},note:{type:String,required:true,maxlength:3000},label:{type:String,default:""}},{timestamps:true});
schema.index({company:1,student:1,createdAt:-1});
module.exports=mongoose.model("CandidateNote",schema);
