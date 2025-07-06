import {
  signup,
  logout as signout,
  login,
  getAuthenticatedUser,
} from '../services/auth.service.js';

export const sign = async (req, res) => {
  const { name, password, username } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const { token, message } = await signup(name, username, password);

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // MS
      httpOnly: true, // prevent XSS attacks cross-site scripting attacks
      sameSite: 'strict', // CSRF attacks cross-site request forgery attacks
    });
    return res.status(200).json({
      message,
    });
  } catch (error) {
    console.error('Error in signup controller', error.message);
    return res.status(400).json({ message: 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 0,
    });

    const response = await signout();

    return res.status(200).json(response);
  } catch (error) {
    console.error(`Error in logout controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Signout failed',
      error: error.message,
    });
  }
};

export const loginRoute = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login request received:', req.body);

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const { message, token } = await login(username, password);
    console.log('Login response:', token);
    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // MS
      httpOnly: true, // prevent XSS attacks cross-site scripting attacks
      sameSite: 'strict', // CSRF attacks cross-site request forgery attacks
    });

    res.status(200).json({ message });
  } catch (error) {
    console.error('Error in login controller:', error.message);

    res.status(500).json({ message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in checkAuth controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
