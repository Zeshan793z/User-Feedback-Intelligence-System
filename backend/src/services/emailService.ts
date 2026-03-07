import nodemailer from "nodemailer";

export const sendFeedbackEmail = async (feedback:any)=>{

const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
}

});

await transporter.sendMail({

from:process.env.EMAIL_USER,

to:process.env.TEAM_EMAIL,

subject:"New Feedback Received",

text:`
Name: ${feedback.name}

Message:
${feedback.message}

Category: ${feedback.category}
Priority: ${feedback.priority}
Sentiment: ${feedback.sentiment}
`

});

};