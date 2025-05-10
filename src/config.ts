import { AllowedSender } from "./types/message";
require("dotenv").config();

export const apiKey: string = process.env.GEMINI_API_KEY ?? "";

export const allowedUsers: AllowedSender = {
  senders: [{ id: "", name: "" }],
};

export const production: boolean = true;

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
];

export const isValidLanguage = (input: string) =>
  SUPPORTED_LANGUAGES.some(
    (lang) =>
      lang.code === input.toLowerCase() ||
      lang.name.toLowerCase() === input.toLowerCase()
  );
