import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Auth from "./pages/Auth";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Navbar from "./common-components/Navbar";
import NotFound from "./pages/NotFound";
import AuthProvider from "./auth/AuthProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/join_game" element={<Game />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/u/:username" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="py-6 text-center text-xs text-muted-foreground">
            Made for wasting time, responsibly.
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;
