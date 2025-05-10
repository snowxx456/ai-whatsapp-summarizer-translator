import WebSocket from "ws";
import { wsMessage } from "./types/message";
import { v4 as uuidv4 } from "uuid";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tools } from "./tools";
import { apiKey } from "./config";

export class AIClient {
  private ws: WebSocket | null = null;
  private id: string;
  private agentExecutor: AgentExecutor | null = null;
  private clientID: string | undefined;

  constructor() {
    this.id = uuidv4();
    this.initializeConnection();
    this.initializeAgent().catch(console.error);
  }

  private async initializeAgent(): Promise<void> {
    try {
      const llm = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0.3,
        apiKey: apiKey,
        maxOutputTokens: 1024,
      });

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are a text processing assistant. Rules:
        1. For translation requests, use exact language codes (en/es/fr etc.)
        2. For summaries, use when text is long
        3. Combine tools when needed (summarize first, then translate)
        4. Never add extra text - just return processed content`,
        ],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
      ]);

      const agent = await createToolCallingAgent({
        llm,
        tools,
        prompt,
      });

      this.agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
        handleParsingErrors: (error) => {
          console.log("Parser error:", error);
          return "Sorry, I didn't understand that. Please try again.";
        },
      });
    } catch (error) {
      console.error("Agent initialization failed:", error);
      throw error;
    }
  }

  private async processMessage(message: string): Promise<string> {
    if (!this.agentExecutor) {
      return "Agent is initializing, please try again shortly.";
    }

    try {
      const result = await this.agentExecutor.invoke({
        input: message,
      });
      return result.output;
    } catch (error) {
      console.error("Processing error:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  private initializeConnection() {
    this.ws = new WebSocket("ws://localhost:3001");

    this.ws.on("open", () => {
      const message: wsMessage = {
        type: "register",
        sender: "agent",
        senderID: `agent-${this.id}`,
      };
      this.ws?.send(JSON.stringify(message));
    });

    this.ws.on("message", async (data: WebSocket.RawData) => {
      try {
        const msg: wsMessage = JSON.parse(data.toString());

        if (msg.type === "ack") {
          this.clientID = msg.client;
          console.log("Registered client:", this.clientID);
        }

        if (msg.type === "from-whatsapp" && msg.content) {
          console.log("Received query:", msg.content);
          const rawResponse = await this.processMessage(msg.content);
          console.log("Raw response got:", rawResponse);

          try {
            let finalContent: string;
            if (
              rawResponse.trim().startsWith("{") ||
              rawResponse.includes("```json")
            ) {
              const cleanedResponse = rawResponse
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

              const responseObj = JSON.parse(cleanedResponse);
              finalContent = responseObj.summary;
            } else {
              finalContent = rawResponse;
            }

            const responseMsg: wsMessage = {
              type: "to-whatsapp",
              sender: "agent",
              recieversID: this.clientID,
              content: finalContent,
              msgSenderID: msg.msgSenderID,
            };

            this.ws?.send(JSON.stringify(responseMsg));
          } catch (error) {
            console.error("Error processing response:", error);
            const fallbackMsg: wsMessage = {
              type: "to-whatsapp",
              sender: "agent",
              recieversID: this.clientID,
              content: rawResponse,
              msgSenderID: msg.msgSenderID,
            };
            this.ws?.send(JSON.stringify(fallbackMsg));
          }
        }
      } catch (error) {
        console.error("Message handling error:", error);
      }
    });

    this.ws.on("close", () => {
      console.log("Connection closed");
      this.agentExecutor = null;
    });

    this.ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }
}
