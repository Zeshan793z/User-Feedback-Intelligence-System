import Feedback from "../models/Feedback";

export const getAnalytics = async(req:any,res:any)=>{

const sentiment = await Feedback.aggregate([
{$group:{_id:"$sentiment",count:{$sum:1}}}
]);

const category = await Feedback.aggregate([
{$group:{_id:"$category",count:{$sum:1}}}
]);

const priority = await Feedback.aggregate([
{$group:{_id:"$priority",count:{$sum:1}}}
]);

res.json({
sentiment,
category,
priority
});

};