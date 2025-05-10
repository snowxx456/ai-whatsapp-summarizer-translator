import { Client, LocalAuth, Message, Chat } from "whatsapp-web.js";
const qrcode = require("qrcode-terminal");
import { Msg, wsMessage } from "./types/message";
import WebSocket from "ws";
import { allowedUsers, production } from "./config";
import { v4 as uuidv4 } from "uuid";
export class whatsappClient {
  private client: Client;
  private ws: WebSocket | null = null;
  private id: string;
  private agentID: string | undefined;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: "./dist",
      }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });
    this.ws = new WebSocket("ws://localhost:3001");
    this.id = uuidv4();
    this.connect();
  }
  private wsConnect() {
    this.ws?.once("open", () => {
      const message: wsMessage = {
        type: "register",
        sender: "client",
        senderID: `client-${this.id}`,
      };
      this.ws?.send(JSON.stringify(message));
    });
    this.ws?.on("message", (data: WebSocket.RawData) => {
      try {
        const msg: wsMessage = JSON.parse(data.toString());
        //console.log(msg)
        if (msg.type === "ack") {
          console.log("Agent ID to Client", msg.client);
          this.agentID = msg.client;
        }
        if (msg.type === "to-whatsapp") {
          const data: Msg = {
            content: msg.content || "",
            senderID: {
              id: msg.msgSenderID?.id || "",
              name: msg.msgSenderID?.name,
            },
          };
          this.sendMessage(data);
        }
      } catch (e) {
        console.log("Invaild message recieved:", data.toString());
      }

      //this.sendMessage(msg);
    });
    this.ws?.on("close", () => {
      console.log("WebSocket connection closed");
    });

    this.ws?.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  }
  private connect() {
    try {
      this.wsConnect();

      this.client.on("qr", (qr: string) => {
        qrcode.generate(qr, { small: true });
      });

      this.client.on("ready", () => {
        console.log("Client is ready");
      });

      this.client.on("message", async (msg: Message) => {
        const chat: Chat = await msg.getChat();

        if (!chat.isGroup) {
          const message: Msg = {
            content: msg.body,
            senderID: {
              id: msg.from,
              name: msg.author || "",
            },
          };
          if (!production) {
            const isAllowed = allowedUsers.senders.some(
              (sender) => sender.id === msg.from
            );
            if (isAllowed) {
              this.handleMessages(message);
            }
          } else {
            this.handleMessages(message);
          }
        }
      });

      this.client.initialize();
    } catch (e) {
      console.log("Error connecting to WhatsApp:", e);
      this.close();
    }
  }

  private handleMessages(message: Msg) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const data: wsMessage = {
        type: "from-whatsapp",
        content: message.content,
        msgSenderID: message.senderID,
        sender: "client",
        recieversID: this.agentID,
      };
      this.ws.send(JSON.stringify(data));
    }
  }
  private sendMessage(message: Msg) {
    this.client.sendMessage(message.senderID.id, message.content);
  }

  private close() {
    this.client.destroy();
    console.log("Client is closed");
  }
}
