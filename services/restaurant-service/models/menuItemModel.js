const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    restaurantID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Restaurant",
        required:[true,"Restaurant ID is required."]
    },
    name:{
        type:String,
        required:[true,"Dish name is required."],
        unique:[true,"This dish name already taken."]
    },
    description:{
        type:String,
        required:[true,"Dish description is required."]
    },
    price:{
        type:Number,
        required:[true,"Dish price is required."]
    },
    category:{
        type:String,
        required:[true,"Category is required."],
        trim:true
    },
    image:{
        type:String,
        default:""
    },
    availability:{
        type:Boolean,
        required:[true]
    }
},{timestamps:true});

const MenuItem = mongoose.model('menuItems',menuItemSchema);
module.exports = MenuItem;