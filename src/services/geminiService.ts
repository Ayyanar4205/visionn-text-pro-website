import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function recognizeImage(base64Image: string, prompt: string = "Extract all text from this image. If it's handwriting, transcribe it accurately. Return only the text content.") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(",")[1],
            },
          },
          { text: prompt },
        ],
      },
    });

    return response.text || "No text recognized.";
  } catch (error) {
    console.error("Recognition error:", error);
    return "Error recognizing text.";
  }
}
