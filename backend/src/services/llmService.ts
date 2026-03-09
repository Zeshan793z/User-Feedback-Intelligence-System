import { GoogleGenerativeAI } from "@google/generative-ai";
import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

// ✅ Keep category type consistent with emailService.ts
export type FeedbackCategory =
  | "billing"
  | "bug"
  | "feature"
  | "performance"
  | "general"
  | "complain"
  | "complements";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const analyzeFeedback = async (
  message: string,
): Promise<{
  category: FeedbackCategory;
  priority: string;
  sentiment: string;
}> => {
  try {
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // ✅ Rule-based prompt
    const prompt = `
You are an AI that classifies customer feedback.

Return ONLY a JSON object with: category, sentiment, priority.

Rules:

Categories:
- billing → payment, refund, subscription, invoice issues
- bug → crashes, errors, not working, freeze, hang, failure
- feature → feature requests
- performance → slow, lag, delay
- general → everything else
- complain → explicit complaints
- complements → praise or compliments

Sentiment:
- positive → praise or satisfaction
- neutral → informational or unclear
- negative → complaints, failures, problems, crashes, errors

Priority:
- high → crashes, payment failures, major bugs, errors, freezes
- medium → functional issues that affect usage but are not critical
- low → suggestions, minor problems, compliments

Special Rules:
- If feedback contains words like "crash", "error", "freeze", "hang", "not working", "failure" → ALWAYS classify as:
  { "category": "bug", "sentiment": "negative", "priority": "high" }
- If feedback contains "payment failed", "refund issue", "billing error" → ALWAYS classify as:
  { "category": "billing", "sentiment": "negative", "priority": "high" }

Feedback:
"${message}"

Return JSON ONLY, no extra text.
Example:
{
  "category":"bug",
  "sentiment":"negative",
  "priority":"high"
}
`;

const result = await model.generateContent(prompt);
const text = result.response.text();

// 🔎 Log raw AI output before cleaning/validation
console.log("AI raw output:", text);

const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("Invalid AI output");

const parsed: any = JSON.parse(jsonMatch[0]);

// 🔎 Log parsed JSON before applying allowed values
console.log("AI parsed JSON:", parsed);

    // ✅ Allowed values
    const allowedCategories: FeedbackCategory[] = [
      "billing",
      "bug",
      "feature",
      "performance",
      "general",
      "complain",
      "complements",
    ];
    const allowedPriority = ["low", "medium", "high"];
    const allowedSentiment = ["positive", "neutral", "negative"];

    // ✅ Runtime validation with safe defaults
    let category: FeedbackCategory = allowedCategories.includes(
      parsed.category as FeedbackCategory,
    )
      ? (parsed.category as FeedbackCategory)
      : "general";

    let priority: string = allowedPriority.includes(parsed.priority)
      ? parsed.priority
      : "medium";

    let sentiment: string = allowedSentiment.includes(parsed.sentiment)
      ? parsed.sentiment
      : "neutral";

    // ✅ Keyword override for critical cases
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("payment failed")) {
      category = "billing";
      priority = "high";
      sentiment = "negative";
    }
    if (
      lowerMsg.includes("crash") ||
      lowerMsg.includes("error") ||
      lowerMsg.includes("not working")
    ) {
      return { category: "bug", sentiment: "negative", priority: "high" };
    }

    return { category, priority, sentiment };
  } catch (error) {
    console.error("LLM failed. Using fallback:", error);
    return fallbackAnalyzer(message);
  }
};



///If rollback needed when gmail routing to differnt mailer or service provider

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// export const analyzeFeedback = async (message: string) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     const prompt = `
// You are a feedback classification AI.

// Classify the feedback using ONLY these categories:

// Categories:
// billing
// bug
// feature
// performance
// general
// complain
// complements

// Priority:
// low
// medium
// high

// Sentiment:
// positive
// neutral
// negative

// Return JSON ONLY:

// {
// "category":"",
// "priority":"",
// "sentiment":""
// }

// Feedback:
// ${message}
// `;

//     const result = await model.generateContent(prompt);

//     const text = result.response.text();

//     const cleaned = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     const data = JSON.parse(cleaned);

//     const allowedCategories = [
//       "billing",
//       "bug",
//       "feature",
//       "performance",
//       "general",
//     ];
//     const allowedPriority = ["low", "medium", "high"];
//     const allowedSentiment = ["positive", "neutral", "negative"];

//     if (
//       !allowedCategories.includes(data.category) ||
//       !allowedPriority.includes(data.priority) ||
//       !allowedSentiment.includes(data.sentiment)
//     ) {
//       throw new Error("Invalid AI output");
//     }

//     return data;
//   } catch (error) {
//     console.log("LLM failed. Using fallback");

//     return fallbackAnalyzer(message);
//   }
// };

// Rollback if needed, this is the original llmService.ts before refactoring to use Prisma instead of Mongoose
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// export const analyzeFeedback = async (message:string)=>{

// try{

// const model = genAI.getGenerativeModel({model:"gemini-pro"});

// const prompt = `
// Analyze the following feedback.

// Return JSON ONLY:

// {
// "category":"",
// "priority":"",
// "sentiment":""
// }

// Feedback:
// ${message}
// `;

// const result = await model.generateContent(prompt);

// const text = result.response.text();

// const cleaned = text.replace(/```json|```/g,"").trim();
// return JSON.parse(cleaned);

// }catch(error){

// console.log("LLM failed. Using fallback");

// return fallbackAnalyzer(message);

// }

// };
