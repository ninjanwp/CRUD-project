// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { email, password, role, is_active } = req.body;
    
    // Add validation here
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const newUser = await User.create({
      email,
      password, // Make sure to hash this password before saving
      role: role || 'user',
      is_active: is_active ?? true
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
}); 