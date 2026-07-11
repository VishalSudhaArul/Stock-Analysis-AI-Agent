// import dotenv from "dotenv";
// dotenv.config();

// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// async function main() {
//   try {
//     const models = await ai.models.list();

//     for await (const model of models) {
//       console.log(model.name);
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }

// main();


import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Say hello in one sentence.",
    });

    console.log(response.text);
  } catch (err) {
    console.error(err);
  }
}

test();