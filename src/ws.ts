import WebSocket from "ws";
import { wsMessage } from "./types/message";
export const wss = new WebSocket.Server({ port: 3001 });

const clients = new Map<string, WebSocket>();
const agents = new Map<string, WebSocket>();
const clientList: string[] = [];
const agentList: string[] = [];

wss.on("connection", (ws) => {
  ws.on("message", (data: WebSocket.RawData) => {
    const msg: wsMessage = JSON.parse(data.toString());
    if (msg.type === "register" && msg.senderID) {
      if (msg.sender === "client") {
        clients.set(msg.senderID, ws);
        try {
          if (agentList.length !== 0) {
            const ackClient: wsMessage = {
              type: "ack",
              sender: "server",
              client: agentList[0],
            };
            ws.send(JSON.stringify(ackClient));
            const ackagent: wsMessage = {
              type: "ack",
              sender: "server",
              client: msg.senderID,
            };
            const targetAgentSocket = agents.get(agentList[0]);
            if (
              targetAgentSocket &&
              targetAgentSocket.readyState === WebSocket.OPEN
            ) {
              targetAgentSocket.send(JSON.stringify(ackagent));
            }
            agentList.shift();
          } else {
            clientList.push(msg.senderID);
          }
        } catch (e) {
          clientList.push(msg.senderID);
        }
        //console.log(clientList);
      }
      if (msg.sender === "agent") {
        agents.set(msg.senderID, ws);
        try {
          if (clientList.length !== 0) {
            const ackAgent: wsMessage = {
              type: "ack",
              sender: "server",
              client: clientList[0],
            };
            ws.send(JSON.stringify(ackAgent));
            const ackClient: wsMessage = {
              type: "ack",
              sender: "server",
              client: msg.senderID,
            };
            const targetClientSocket = clients.get(clientList[0]);
            if (
              targetClientSocket &&
              targetClientSocket.readyState === WebSocket.OPEN
            ) {
              targetClientSocket.send(JSON.stringify(ackClient));
            }
            clientList.shift();
          } else {
            agentList.push(msg.senderID);
          }
        } catch (e) {
          agentList.push(msg.senderID);
        }
      }
    }
    if (msg.type === "from-whatsapp") {
      //console.log(msg);
      const agentID = msg.recieversID || "";
      try {
        if (agentID === "") {
          const message: wsMessage = {
            type: "error",
            sender: "server",
            content: "Reciever ID required",
          };
          ws.send(JSON.stringify(message));
        } else {
          const targetAgentSocket = agents.get(agentID);
          if (
            targetAgentSocket &&
            targetAgentSocket.readyState === WebSocket.OPEN
          ) {
            const message: wsMessage = {
              type: "from-whatsapp",
              sender: "server",
              content: msg.content,
              msgSenderID: msg.msgSenderID,
            };
            targetAgentSocket.send(JSON.stringify(message));
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (msg.type === "to-whatsapp") {
      const clientID = msg.recieversID || "";
      try {
        if (clientID === "") {
          const message: wsMessage = {
            type: "error",
            sender: "server",
            content: "Reciever ID required",
          };
          ws.send(JSON.stringify(message));
        } else {
          const targetClientSocket = clients.get(clientID);
          if (
            targetClientSocket &&
            targetClientSocket.readyState === WebSocket.OPEN
          ) {
            const message: wsMessage = {
              type: "to-whatsapp",
              sender: "server",
              content: msg.content,
              msgSenderID: msg.msgSenderID,
            };
            targetClientSocket.send(JSON.stringify(message));
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
});
