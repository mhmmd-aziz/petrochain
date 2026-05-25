const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Mock login for admin
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { id: 'admin1', username: 'Administrator Pertamina', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      return res.json({
        success: true,
        data: { token, user: { username: 'admin', role: 'admin' } },
        message: 'Login successful'
      });
    }

    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid credentials'
    });
  } catch (error) {
    next(error);
  }
};
