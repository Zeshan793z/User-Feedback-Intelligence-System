import Feedback from "../models/Feedback";
import { analyzeFeedback } from "../services/llmService";
import { sendFeedbackEmail } from "../services/emailService";

export const createFeedback = async(req:any,res:any)=>{

try{

const {name,email,message} = req.body;

const ai = await analyzeFeedback(message);

const feedback = await Feedback.create({

name,
email,
message,
category:ai.category,
priority:ai.priority,
sentiment:ai.sentiment

});

await sendFeedbackEmail(feedback);

res.status(201).json(feedback);

}catch(error){

res.status(500).json({message:"Failed to create feedback"});

}

};

export const getFeedbacks = async(req:any,res:any)=>{

const {page=1,limit=10,search="",category,priority} = req.query;

const query:any = {};

if(search){
query.$or = [
{ name: { $regex: search, $options:"i"} },
{ message: { $regex: search, $options:"i"} }
];
}

if(category){
query.category = category;
}

if(priority){
query.priority = priority;
}

const data = await Feedback.find(query)
.sort({createdAt:-1})
.skip((page-1)*limit)
.limit(Number(limit));

res.json(data);

};

export const deleteFeedback = async(req:any,res:any)=>{

try{

await Feedback.findByIdAndDelete(req.params.id);

res.json({message:"Deleted"});

}catch{

res.status(500).json({message:"Delete failed"});

}

};