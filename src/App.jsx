import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollManager from "./components/ScrollManager";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment/:token" element={<Payment />} />
        <Route path="/success/:token" element={<Success />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
