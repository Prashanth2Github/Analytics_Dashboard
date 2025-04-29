import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </Provider>
);
