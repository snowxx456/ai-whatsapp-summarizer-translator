export interface Msg {
  content: string;
  senderID: Sender;
}

export interface wsMessage {
  type: "greeting" | "from-whatsapp" | "to-whatsapp" | "register" | "ack" | "error";
  content?: string;
  msgSenderID?: Sender;
  sender: "client" | "agent" | "server";
  senderID?: string;
  recieversID?: string;
  client?: string;
}

export interface Sender {
  id: string;
  name?: string;
}

export interface AllowedSender {
  senders: Sender[];
}

export interface replySender {}
