import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import QueryProvider from "./providers/query-provider.tsx";
import { RootErrorBoundary } from "./components/layout/root-error-boundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <QueryProvider>
        <App />
      </QueryProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
