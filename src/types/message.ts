export interface Msg {
  content: string;
  senderID: Sender;
}

export interface Sender {
  id: string;
  name: string | undefined;
}

export interface AllowedSender {
  senders: Sender[];
}

export interface replySender{
    
}