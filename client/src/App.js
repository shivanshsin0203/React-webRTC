import { Routes, Route } from "react-router-dom";
import "./App.css";
import RoomPage from "./screens/Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/:email" element={<RoomPage />} />
        <Route path="/room/:email" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;