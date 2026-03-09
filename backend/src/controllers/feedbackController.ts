import Feedback from "../models/Feedback";
import { analyzeFeedback, FeedbackCategory } from "../services/llmService";
import { routeFeedbackEmail } from "../services/emailService";

export const createFeedback = async (req: any, res: any) => {
  try {
const { name, email, message } = req.body;
    // ✅ AI classification
    const ai = await analyzeFeedback(message);

    // ✅ Save feedback in MongoDB
    const feedback = await Feedback.create({
      name,
      email,
      message,
      category: ai.category,
      priority: ai.priority,
      sentiment: ai.sentiment,
    });

    // ✅ Route email to correct team
    await routeFeedbackEmail({
      ...feedback.toObject(),
      category: ai.category as FeedbackCategory,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to create feedback" });
  }
};

export const getFeedbacks = async (req: any, res: any) => {
  const { page = 1, limit = 10, search = "", category, priority } = req.query;

  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (priority) {
    query.priority = priority;
  }

  const data = await Feedback.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(data);
};

export const deleteFeedback = async (req: any, res: any) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

///If rollback needed when gmail routing to differnt mailer or service provider

// import Feedback from "../models/Feedback";
// import { analyzeFeedback } from "../services/llmService";
// import { routeFeedbackEmail } from "../services/emailService"; // ✅ use helper

// export const createFeedback = async (req: any, res: any) => {
//   try {
//     const { name, email, message } = req.body;

//     const ai = await analyzeFeedback(message);

//     const feedback = await Feedback.create({
//       name,
//       email,
//       message,
//       category: ai.category,
//       priority: ai.priority,
//       sentiment: ai.sentiment,
//     });

//     // ✅ Automatically routes to correct team email
//     await routeFeedbackEmail(feedback);

//     res.status(201).json(feedback);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to create feedback" });
//   }
// };


// export const getFeedbacks = async(req:any,res:any)=>{

// const {page=1,limit=10,search="",category,priority} = req.query;

// const query:any = {};

// if(search){
// query.$or = [
// { name: { $regex: search, $options:"i"} },
// { message: { $regex: search, $options:"i"} }
// ];
// }

// if(category){
// query.category = category;
// }

// if(priority){
// query.priority = priority;
// }

// const data = await Feedback.find(query)
// .sort({createdAt:-1})
// .skip((page-1)*limit)
// .limit(Number(limit));

// res.json(data);

// };

// export const deleteFeedback = async(req:any,res:any)=>{

// try{

// await Feedback.findByIdAndDelete(req.params.id);

// res.json({message:"Deleted"});

// }catch{

// res.status(500).json({message:"Delete failed"});

// }

// };



// Rollback if needed, this is the original feedbackController.ts before refactoring to use Prisma instead of Mongoose

// import Feedback from "../models/Feedback";
// import { analyzeFeedback } from "../services/llmService";
// import { sendFeedbackEmail } from "../services/emailService";

// export const createFeedback = async(req:any,res:any)=>{

// try{

// const {name,email,message} = req.body;

// const ai = await analyzeFeedback(message);

// const feedback = await Feedback.create({

// name,
// email,
// message,
// category:ai.category,
// priority:ai.priority,
// sentiment:ai.sentiment

// });

// await sendFeedbackEmail(feedback);

// res.status(201).json(feedback);

// }catch(error){

// res.status(500).json({message:"Failed to create feedback"});

// }

// };

// export const getFeedbacks = async(req:any,res:any)=>{

// const {page=1,limit=10,search="",category,priority} = req.query;

// const query:any = {};

// if(search){
// query.$or = [
// { name: { $regex: search, $options:"i"} },
// { message: { $regex: search, $options:"i"} }
// ];
// }

// if(category){
// query.category = category;
// }

// if(priority){
// query.priority = priority;
// }

// const data = await Feedback.find(query)
// .sort({createdAt:-1})
// .skip((page-1)*limit)
// .limit(Number(limit));

// res.json(data);

// };

// export const deleteFeedback = async(req:any,res:any)=>{

// try{

// await Feedback.findByIdAndDelete(req.params.id);

// res.json({message:"Deleted"});

// }catch{

// res.status(500).json({message:"Delete failed"});

// }

// };