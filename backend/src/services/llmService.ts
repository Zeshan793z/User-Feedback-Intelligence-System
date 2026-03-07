import { GoogleGenerativeAI } from "@google/generative-ai";
import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const analyzeFeedback = async (message:string)=>{

try{

const model = genAI.getGenerativeModel({model:"gemini-pro"});

const prompt = `
Analyze the following feedback.

Return JSON ONLY:

{
"category":"",
"priority":"",
"sentiment":""
}

Feedback:
${message}
`;

const result = await model.generateContent(prompt);

const text = result.response.text();

return JSON.parse(text);

}catch(error){

console.log("LLM failed. Using fallback");

return fallbackAnalyzer(message);

}

};