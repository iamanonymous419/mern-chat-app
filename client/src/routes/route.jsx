import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import Setting from '../pages/Setting.jsx';
import Signup from '../pages/Signup.jsx';
import Login from '../pages/Login.jsx';
import HomePage from '../pages/Home.jsx'; // ✅ Import Home

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> }, // ✅ Show HomePage on "/"
      { path: 'signup', element: <Signup /> },
      { path: 'login', element: <Login /> },
      { path: 'setting', element: <Setting /> },
    ],
  },
]);
