const express=require("express");
const app=express();
const mongoose=require("mongoose");
const initData =require("./data.js");
const Listing=require("../models/listing.js");



const MONGO_URL="mongodb://127.0.0.1:27017/Assignment";

main()
.then((res)=>{
    console.log("connected to DB");
})
.catch((err)=>
{
    console.log(err);
})

async function main()
{
    await mongoose.connect(MONGO_URL);
}

const initDB=async()=>
{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"66a3a660cd893108a17be1a9"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialize");
};
initDB();

