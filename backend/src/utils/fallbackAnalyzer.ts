import { FeedbackCategory } from "../services/llmService";

export const fallbackAnalyzer = (
  message: string
): { category: FeedbackCategory; priority: string; sentiment: string } => {
  const msg = message.toLowerCase();

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  let priority: "low" | "medium" | "high" = "medium";
  let category: FeedbackCategory = "general";
  // Bug detection
  if (
    msg.includes("crash") ||
    msg.includes("error") ||
    msg.includes("not working") ||
    msg.includes("freeze")
  ) {
    return {
      category: "bug",
      sentiment: "negative",
      priority: "high",
    };
  }

  // Billing detection
  if (
    msg.includes("payment") ||
    msg.includes("refund") ||
    msg.includes("billing")
  ) {
    return {
      category: "billing",
      sentiment: "negative",
      priority: "high",
    };
  }

  // Feature request
  if (msg.includes("feature") || msg.includes("add")) {
    return {
      category: "feature",
      sentiment: "neutral",
      priority: "low",
    };
  }

  return {
    category: "general",
    sentiment: "neutral",
    priority: "medium",
  };
};
///If rollback needed when gmail routing to differnt mailer or service provider

// export const fallbackAnalyzer = (message:string)=>{

// const msg = message.toLowerCase();

// let sentiment="neutral";
// let priority="medium";
// let category="general";

// if(msg.includes("bug") || msg.includes("error")){
// category="bug";
// priority="high";
// sentiment="negative";
// }

// if(msg.includes("feature")){
// category="feature";
// priority="low";
// }

// if(msg.includes("great") || msg.includes("good")){
// sentiment="positive";
// }

// return{
// category,
// priority,
// sentiment
// };

// };