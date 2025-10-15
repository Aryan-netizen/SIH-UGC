import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();

async function matchResume(jobDescription, resumeText) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Compare the following job description and resume.
  Score the resume from 0 to 100 based on relevance.
  Job: ${jobDescription}
  Resume: ${resumeText}
  Return only the score and a short explanation.
  `;

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}

module.exports = matchResume