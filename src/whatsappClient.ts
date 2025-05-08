import { Client, LocalAuth, Message, Chat } from "whatsapp-web.js";
const qrcode = require("qrcode-terminal");
import { Msg, AllowedSender } from "./types/message";
import { channel } from "diagnostics_channel";

const senders: AllowedSender = {
  senders: [{ id: "917016792201@c.us", name: "Me Myself and I" }],
};

export class whatsappClient {
  private client: Client;

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
  }

  public connect() {
    this.client.on("qr", (qr: string) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      console.log("Client is ready");
    });

    this.client.on("message_create", async (msg: Message) => {
      const chat: Chat = await msg.getChat();
      const isAllowed = senders.senders.some(
        (sender) => sender.id === msg.from
      );
      if (!chat.isGroup && isAllowed) {
        const message: Msg = {
          content: msg.body,
          senderID: {
            id: msg.from,
            name: msg.author,
          },
        };
        console.log(message);
        this.handleMessages(message);
      }
    });

    this.client.initialize();
  }

  private handleMessages(message: Msg) {
    const msg = message.content;
    if (msg === "ping") {
      const reply: Msg = {
        content: "pong",
        senderID: { id: message.senderID.id, name: message.senderID.name },
      };
      this.sendMessage(reply)
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
