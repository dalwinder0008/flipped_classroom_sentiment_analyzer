import { GoogleGenAI, Type } from "@google/genai";

// Use a robust way to detect the API key across different environments (Vite, Express, Vercel)
let apiKey = "";
try {
  // @ts-ignore - This handles Vite's `define` replacement if it exists
  const viteDefined = process.env.GEMINI_API_KEY;
  if (viteDefined && viteDefined !== "undefined" && viteDefined !== "") {
    apiKey = viteDefined;
    console.log("GEMINI_API_KEY detected via Vite define.");
  }
} catch (e) {
  // process might not be defined in some browser environments
}

if (!apiKey) {
  apiKey = (import.meta.env?.VITE_GEMINI_API_KEY) || 
           (import.meta.env?.GEMINI_API_KEY) || 
           "";
  if (apiKey) console.log("GEMINI_API_KEY detected via import.meta.env.");
}

// Debugging: Log a masked version of the key to help the user verify it
if (apiKey) {
  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`Using Gemini API Key: ${maskedKey}`);
} else {
  console.warn("GEMINI_API_KEY is not set. Sentiment analysis will use fallback values (Neutral). Please check your .env file.");
}

// Initialize AI lazily to avoid errors if key is missing at startup
let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance && apiKey) {
    try {
      aiInstance = new GoogleGenAI({ apiKey });
      console.log("GoogleGenAI initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI:", error);
    }
  }
  return aiInstance;
}

export async function analyzeSentiment(text: string) {
  const model = "gemini-3-flash-preview";
  const ai = getAI();

  if (!ai) {
    console.error("AI not initialized. Missing API Key or initialization failed.");
    return getFallbackResult("Missing API Key");
  }
  
  console.log("Analyzing sentiment for text:", text.substring(0, 50) + "...");

  const prompt = `Analyze the sentiment and specific dimensions of the following student feedback for a flipped classroom:
  "${text}"
  
  Provide the analysis in STRICT JSON format. Do NOT include any markdown formatting or extra text.
  - sentiment: "Positive", "Negative", or "Neutral" (Be decisive: if the feedback is clearly happy or praising, it's Positive. If it's complaining or frustrated, it's Negative.)
  - confidence: a number between 0 and 1
  - keywords: an array of 3-5 key themes or words (hashtags)
  - summary: a brief 1-sentence summary of the feedback (ensure no literal newlines)
  - dimensions: an object with scores from 0 to 100 for the following (use 50 as neutral if not mentioned):
    - clarity: how clear the material was
    - engagement: how engaging the session was
    - pacing: how appropriate the speed was
    - difficulty: how challenging it was (higher = more appropriate challenge)
    - resources: quality of provided materials
    - support: availability of help`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["Positive", "Negative", "Neutral"] },
            confidence: { type: Type.NUMBER },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                clarity: { type: Type.NUMBER },
                engagement: { type: Type.NUMBER },
                pacing: { type: Type.NUMBER },
                difficulty: { type: Type.NUMBER },
                resources: { type: Type.NUMBER },
                support: { type: Type.NUMBER }
              },
              required: ["clarity", "engagement", "pacing", "difficulty", "resources", "support"]
            }
          },
          required: ["sentiment", "confidence", "keywords", "summary", "dimensions"]
        }
      }
    });

    let rawText = response.text || "";
    console.log("Raw Gemini Response:", rawText);

    if (!rawText) {
      console.error("Empty response from Gemini.");
      return getFallbackResult("Empty response from AI");
    }

    // Clean up markdown code blocks if they exist
    if (rawText.includes("```")) {
      rawText = rawText.replace(/```json\n?|```/g, "").trim();
    }

    try {
      const result = JSON.parse(rawText);
      
      // Validate the result has the required fields
      if (!result.sentiment) {
        console.warn("AI response missing sentiment field. Defaulting to Neutral.");
        result.sentiment = "Neutral";
      }
      if (typeof result.confidence !== 'number') result.confidence = 0.5;
      if (!result.dimensions) result.dimensions = getFallbackResult("").dimensions;

      console.log("Gemini Analysis Result:", result.sentiment, "Confidence:", result.confidence);
      return result;
    } catch (parseError) {
      console.error("JSON Parse Error on raw text:", parseError);
      // Attempt to fix common issues like trailing commas or unescaped newlines if necessary
      // But usually, we should just fallback
      return getFallbackResult("Invalid JSON response from AI");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return getFallbackResult(error instanceof Error ? error.message : "Unknown error");
  }
}

function getFallbackResult(errorMsg: string) {
  return {
    sentiment: "Neutral",
    confidence: 0.5,
    keywords: ["analysis-error"],
    summary: `AI Analysis unavailable: ${errorMsg}. Using Neutral fallback.`,
    dimensions: {
      clarity: 50,
      engagement: 50,
      pacing: 50,
      difficulty: 50,
      resources: 50,
      support: 50
    }
  };
}
