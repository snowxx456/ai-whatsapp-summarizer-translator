// tools.ts
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiKey } from "./config";

const genAI = new GoogleGenerativeAI(apiKey);

export const summarizeTool = new DynamicStructuredTool({
  name: "summarize",
  description: "Summarizes a paragraph into a few lines",
  schema: z.object({
    text: z.string().describe("The paragraph to summarize"),
  }),
  async func({ text }: { text: string }) {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
    const result = await model.generateContent(
      `Summarize this text concisely:\n\n${text}`
    );
    return result.response.text();
  },
});

export const translateTool = new DynamicStructuredTool({
  name: "translate",
  description: "Translates text into a specific language",
  schema: z.object({
    text: z.string().describe("The text to translate"),
    targetLang: z.string().describe("The target language code (e.g., fr, es)"),
  }),
  async func({ text, targetLang }) {
    try {
      if (!text?.trim()) throw new Error("No text provided for translation");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent(
        `Translate to ${targetLang}:\n\n${text}`
      );

      return result.response.text();
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error(`Translation failed: ${(error as Error).message}`);
    }
  },
});

export const tools = [summarizeTool, translateTool];
