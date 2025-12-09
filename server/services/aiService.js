const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Calls an LLM to analyze the citizen's situation and suggest schemes.
 * language: "en" | "hi" | "bn" (default "en")
 * Returns { answerText, categories[] }
 */
const generateSchemeAdvice = async (situation, location, language = "en") => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set in environment");
  }

  let languageName = "English";
  if (language === "hi") languageName = "Hindi";
  if (language === "bn") languageName = "Bengali";

  const prompt = `
You are an assistant helping citizens in India discover relevant public welfare schemes.

User location (may be generic): ${location || "Not specified"}.
User situation:
"${situation}"

RESPONSE LANGUAGE:
- Your entire response MUST be in ${languageName}.
- Do NOT mix languages except for proper nouns.

TASK:
1. Briefly restate the situation.
2. Suggest likely categories of schemes (like education, health, women empowerment, farmers, MSME, disability support, senior citizens, digital skilling, etc.).
3. For each suggested category, explain:
   - What kind of schemes usually exist.
   - What typical eligibility criteria might be.
   - What documents are often required.
   - What should the citizen do next in simple steps (e.g., visit official website, local office, etc.).
4. Include a short disclaimer that this is an AI-based guidance and the user must verify from official government sources.

Respond in clear bullet points and simple ${languageName}.
At the very end, on a separate line, list 3–5 high-level tags/categories (comma-separated) on a single line starting with:
"CATEGORIES: "
`;

  const body = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4
  };

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    body,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    }
  );

  const content = response.data.choices[0].message.content.trim();

  // Extract categories from last line starting with "CATEGORIES:"
  let categories = [];
  const lines = content.split("\n");
  const catLine = lines.find((l) => l.toUpperCase().startsWith("CATEGORIES:"));
  if (catLine) {
    const parts = catLine.split(":")[1] || "";
    categories = parts
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }

  return {
    answerText: content,
    categories
  };
};

module.exports = { generateSchemeAdvice };
