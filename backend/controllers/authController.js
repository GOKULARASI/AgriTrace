const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, location, phone } = req.body;

        // Check existing user
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword, role, location, phone }])
            .select()
            .single();

        if (error) throw error;

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
