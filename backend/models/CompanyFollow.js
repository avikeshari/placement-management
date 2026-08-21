const mongoose=require("mongoose");
const schema=new mongoose.Schema({student:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},company:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true}},{timestamps:true});
schema.index({student:1,company:1},{unique:true});
module.exports=mongoose.model("CompanyFollow",schema);
