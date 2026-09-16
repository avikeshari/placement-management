const mongoose=require("mongoose");
const schema=new mongoose.Schema({title:{type:String,required:true,trim:true},description:{type:String,default:""},type:{type:String,enum:["career_fair","career_event","workshop","company_session"],default:"career_event"},startAt:{type:Date,required:true},endAt:{type:Date,required:true},location:{type:String,default:""},meetingUrl:{type:String,default:""},companies:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],attendees:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],capacity:{type:Number,min:1,default:100},status:{type:String,enum:["draft","published","closed"],default:"published"}},{timestamps:true});
schema.index({startAt:1,status:1});
module.exports=mongoose.model("Event",schema);
