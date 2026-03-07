export const fallbackAnalyzer = (message:string)=>{

const msg = message.toLowerCase();

let sentiment="neutral";
let priority="medium";
let category="general";

if(msg.includes("bug") || msg.includes("error")){
category="bug";
priority="high";
sentiment="negative";
}

if(msg.includes("feature")){
category="feature";
priority="low";
}

if(msg.includes("great") || msg.includes("good")){
sentiment="positive";
}

return{
category,
priority,
sentiment
};

};