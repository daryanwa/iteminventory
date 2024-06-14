import React, { useEffect, useState } from "react";
import "../../index.css";
import { Auth, WebsocketService } from "../../services/websocketService";

function MainComponent() {
  const [messages, setMessages] = useState<
    { username: string; text: string }[]
  >([]);
  const [username, setUsername] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const websocket = new WebsocketService();
  const authy = new Auth(websocket);

  useEffect(() => {
    const socket = websocket.getSocket();
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
    const message = { username, text: input };
    websocket.sendMessage(JSON.stringify(message));
    setInput("");
  };

  console.log(messages);

  return (
    <div>
      <input
        className="ml-10 mt-10 border rounded-md focus:outline-none flex"
        type="text"
        placeholder="Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="ml-10 mt-4 mr-4 mb-4  border rounded-md focus:outline-none"
      />
      <button onClick={sendMessage}>Send</button>

      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <span className="text text-blue-950  mr-2">{msg.username}:</span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainComponent;
