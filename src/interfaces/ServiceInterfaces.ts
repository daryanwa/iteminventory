export interface IWebSocket {
  sendMessage(message: string): void;
  getSocket(): WebSocket;
}

export interface IAuth {
  authenticate(username: string): void;
}
