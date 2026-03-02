import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY!,
  temperature: 0
});

export const analyzeFeedback = async (message: string) => {
  const prompt = `
Return STRICT JSON:
{
  "category": "...",
  "priority": "low|medium|high",
  "sentiment": "positive|neutral|negative",
  "team": "..."
}

Feedback: ${message}
`;

  const response = await model.invoke(prompt);

  return JSON.parse(response.content as string);
};