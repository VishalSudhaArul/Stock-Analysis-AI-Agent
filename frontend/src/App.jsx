import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import SharedReport from "./pages/SharedReport";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports/:shareId" element={<SharedReport />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;