import nodemailer from "nodemailer";

// ✅ Define feedback categories
export type FeedbackCategory =
  | "billing"
  | "bug"
  | "feature"
  | "performance"
  | "general"
  | "complain"
  | "complements";

// ✅ Category → Team mapping
const TEAM_MAP: Record<FeedbackCategory, string> = {
  billing: "zeshanahmed7793@gmail.com",
  bug: "zeshanahmed7793@gmail.com",
  feature: "zeshanahmed7793@gmail.com",
  performance: "zeshanahmed7793@gmail.com",
  general: "zeshanahmed7793@gmail.com",
  complain: "zeshanahmed7793@gmail.com",
  complements: "zeshanahmed7793@gmail.com",
};

export const sendFeedbackEmail = async (feedback: any, teamEmail: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!, // ✅ non-null assertion
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER!,
    to: teamEmail,
    subject: `[${feedback.priority?.toUpperCase()}] New Feedback Received`,
    text: `
Name: ${feedback.name}

Message:
${feedback.message}

Category: ${feedback.category}
Priority: ${feedback.priority}
Sentiment: ${feedback.sentiment}
    `,
  });
};

// ✅ Helper to route feedback to the right team
export const routeFeedbackEmail = async (feedback: {
  category: FeedbackCategory;
}) => {
  const teamEmail = TEAM_MAP[feedback.category] || process.env.TEAM_EMAIL!;
  await sendFeedbackEmail(feedback, teamEmail);
};

///If rollback needed when gmail routing to differnt mailer or service provider

// import nodemailer from "nodemailer";

// // Define feedback categories for gmail routing if using production grade remove this
// type FeedbackCategory = "billing" | "bug" | "feature" | "performance"
// | "general" | "complain" | "complements";

// // Category → Team mapping
// // const TEAM_MAP: Record<string, string> = {
// //   billing: "billing@company.com",
// //   bug: "engineering@company.com",
// //   feature: "product@company.com",
// //   performance: "engineering@company.com",
// //   general: "support@company.com",
// // };

// const TEAM_MAP = {
//   billing: "zeshanahmed793@gmail.com",
//   bug: "zeshanahmed793@gmail.com",
//   feature: "zeshanahmed793@gmail.com",
//   performance: "zeshanahmed793@gmail.com",
//   general: "zeshanahmed793@gmail.com",
//   complain: "zeshanahmed793@gmail.com",
//   complements: "zeshanahmed793@gmail.com"
// };

// export const sendFeedbackEmail = async (feedback: any, teamEmail: string) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER!, // ✅ non-null assertion
//       pass: process.env.EMAIL_PASS!,
//     },
//   });

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER!,
//     to: teamEmail,
//     subject: `[${feedback.priority.toUpperCase()}] New Feedback Received`,
//     text: `
// Name: ${feedback.name}

// Message:
// ${feedback.message}

// Category: ${feedback.category}
// Priority: ${feedback.priority}
// Sentiment: ${feedback.sentiment}
//     `,
//   });
// };

// // Helper to route feedback to the right team
// export const routeFeedbackEmail = async (feedback: { category: FeedbackCategory }) => {
//   const teamEmail = TEAM_MAP[feedback.category] || process.env.TEAM_EMAIL!;
//   await sendFeedbackEmail(feedback, teamEmail);
// };

///If rollback needed

// import nodemailer from "nodemailer";

// export const sendFeedbackEmail = async (feedback:any)=>{

// const transporter = nodemailer.createTransport({

// service:"gmail",

// auth:{
// user:process.env.EMAIL_USER,
// pass:process.env.EMAIL_PASS
// }

// });

// await transporter.sendMail({

// from:process.env.EMAIL_USER,

// to:process.env.TEAM_EMAIL,

// subject:"New Feedback Received",

// text:`
// Name: ${feedback.name}

// Message:
// ${feedback.message}

// Category: ${feedback.category}
// Priority: ${feedback.priority}
// Sentiment: ${feedback.sentiment}
// `

// });

// };
