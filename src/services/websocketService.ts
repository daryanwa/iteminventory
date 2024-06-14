import { IWebSocket, IAuth } from "../interfaces/ServiceInterfaces";

export class WebsocketService implements IWebSocket {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket("ws://localhost:8080");
    this.socket.onopen = () => {
      console.log("Connected to WebSocket");
    };
    this.socket.onmessage = (event) => {
      console.log(`Receive ${event.data}`);
    };
    this.socket.onclose = () => {
      console.log("Disconected from WebSocket");
    };
  }

  sendMessage(message: string) {
    this.socket.send(message);
  }
  getSocket() {
    return this.socket;
  }
}

export class Auth implements IAuth {
  private username: string | null = null;
  private webSocket: IWebSocket;

  constructor(webSocket: IWebSocket) {
    this.webSocket = webSocket;
  }

  authenticate(username: string) {
    this.username = username;
    this.webSocket.sendMessage(JSON.stringify({ type: "auth", username }));
  }
}
