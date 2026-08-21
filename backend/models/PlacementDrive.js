const mongoose = require('mongoose');
const placementDriveSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  description:{type:String,default:''},
  startAt:{type:Date,required:true},
  endAt:{type:Date,required:true},
  status:{type:String,enum:['planned','open','closed'],default:'planned',index:true},
  companies:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
  participants:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
  location:{type:String,default:''}
},{timestamps:true});
placementDriveSchema.index({startAt:1,status:1});
module.exports=mongoose.model('PlacementDrive',placementDriveSchema);
