import "./App.css";
import Navbar from "./components/Navbar";
import FrontPage from "./pages/FrontPage";
import { BrowserRouter ,Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WritersList from "./pages/Writers-List";
import RequestWriter from "./pages/RequestWriter";
import AcceptWriter from "./pages/AcceptWriter";
import WriterLogin from "./pages/WriterLogin";


function App() {
  const updates = [
    { founder: "alvin", company: "round3.xyz", content: "Hello world suckers" },
    {
      founder: "notalvin",
      company: "round4.xyz",
      content: "Hello world suckers",
    },
  ];

  const token = "asfaf";

  return (
    <BrowserRouter>
      <div className="max-w-4xl px-4 mx-auto flex flex-col gap-8">
        <div className="max-w-full max-h-screen">
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/writers" element={<WritersList />} />
          <Route path="/request" element={<RequestWriter />} />
          <Route path="/accept-request" element={<AcceptWriter />} />
          <Route path="/login" element={<WriterLogin/>} />
        </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
