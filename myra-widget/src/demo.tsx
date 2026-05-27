import React from "react";
import ReactDOM from "react-dom/client";
import MyraChatWidget from "./components/MyraChatWidget";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MyraChatWidget
      apiBaseUrl="http://localhost:5173"
      chatServiceUrl="/api/chat"
      leadServiceUrl="/api/leads"
      tenantId="vthumma"
      apiKey="vthumma-myra-api-key-2024"
      assistantName="Myra"
      brandColor="#2563eb"
    />
  </React.StrictMode>
);
