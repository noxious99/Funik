import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Navbar from "./common-components/Navbar";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <div className="App box-border max-w-[2160px] flex justify-center mx-auto min-w-[360px]">
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/join_game" element={<Game />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App;
