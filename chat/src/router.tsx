import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.tsx';
import ChatPage from './pages/chatPage/chatPage.tsx';
import PrivateRoute from './PrivateRoute.tsx';
import "./index.css";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;