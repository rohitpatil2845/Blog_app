import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { signupInput, signInInput } from '@rohit2845/common';

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const body = req.body;
        console.log('Signup request body:', body);
        
        const validation = signupInput.safeParse(body);
        console.log('Validation result:', validation);
        
        if (!validation.success) {
            console.log('Validation errors:', validation.error);
            return res.status(400).json({
                text: "Invalid input",
                errors: validation.error.errors
            });
        }

        // Check if user already exists
        const existingUsers = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [body.email]
        );

        if (existingUsers.rows.length > 0) {
            return res.status(409).json({
                text: "User already exists with this email"
            });
        }

        // Insert new user
        const result = await db.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
            [body.email, body.password, body.name || null]
        );

        const userId = result.rows[0].id;

        const token = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET || 'rohit-blog-app'
        );

        res.json({ token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            text: "Internal server error"
        });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const body = req.body;
        console.log('Signin request body:', body);
        
        const validation = signInInput.safeParse(body);
        if (!validation.success) {
            console.log('Validation errors:', validation.error);
            return res.status(400).json({
                text: "Invalid input",
                errors: validation.error.errors
            });
        }

        const users = await db.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [body.email, body.password]
        );

        if (users.rows.length === 0) {
            return res.status(403).json({
                text: "User not found or incorrect credentials"
            });
        }

        const user = users.rows[0];
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'rohit-blog-app'
        );

        res.json({ token });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            text: "Internal server error"
        });
    }
});

// Get current user profile (protected)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        
        if (!authHeader) {
            return res.status(403).json({
                message: "You are not logged in"
            });
        }

        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET || 'rohit-blog-app');
        const userId = decoded.id;

        const users = await db.query(
            'SELECT id, email, name, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (users.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({ user: users.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error fetching user"
        });
    }
});

export default router;
