const mongoose=require("mongoose");
const schema=new mongoose.Schema({actor:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},action:{type:String,required:true},entityType:{type:String,required:true},entityId:{type:String,default:""},metadata:{type:Object,default:{}},ip:{type:String,default:""}},{timestamps:true});
schema.index({createdAt:-1});
module.exports=mongoose.model("AuditLog",schema);
