import { AIClient } from "./aiFunctionCalling";
import { whatsappClient } from "./whatsappClient";
import "./ws";

try {
  const client = new whatsappClient();
  const agent = new AIClient();
} catch (error) {
  console.log(error);
}
