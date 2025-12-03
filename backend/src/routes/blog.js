import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { createBlogInput, updateBlogInput } from '@rohit2845/common';

const router = express.Router();

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    
    if (!authHeader) {
        return res.status(403).json({
            message: "You are not logged in"
        });
    }

    try {
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET || 'rohit-blog-app');
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid token"
        });
    }
};

// Create a blog post (protected)
router.post('/', authMiddleware, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const body = req.body;
        
        const [result] = await connection.query(
            'INSERT INTO blogs (title, content, author_id, status, cover_image) VALUES (?, ?, ?, ?, ?)',
            [body.title, body.content, req.userId, body.status || 'draft', body.coverImage || null]
        );

        const blogId = result.insertId;

        // Insert media if provided
        if (body.media && Array.isArray(body.media)) {
            for (let i = 0; i < body.media.length; i++) {
                const media = body.media[i];
                await connection.query(
                    'INSERT INTO blog_media (blog_id, media_type, media_url, caption, display_order) VALUES (?, ?, ?, ?, ?)',
                    [blogId, media.type, media.url, media.caption || null, i]
                );
            }
        }

        await connection.commit();

        res.json({
            id: blogId,
            message: "Blog created successfully"
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({
            message: "Error creating blog"
        });
    } finally {
        connection.release();
    }
});

// Update a blog post (protected)
router.put('/', authMiddleware, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const body = req.body;
        
        const [result] = await connection.query(
            'UPDATE blogs SET title = ?, content = ?, status = ?, cover_image = ? WHERE id = ? AND author_id = ?',
            [body.title, body.content, body.status || 'draft', body.coverImage || null, body.id, req.userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Blog not found or you don't have permission to update"
            });
        }

        // Delete existing media and insert new ones
        await connection.query('DELETE FROM blog_media WHERE blog_id = ?', [body.id]);

        if (body.media && Array.isArray(body.media)) {
            for (let i = 0; i < body.media.length; i++) {
                const media = body.media[i];
                await connection.query(
                    'INSERT INTO blog_media (blog_id, media_type, media_url, caption, display_order) VALUES (?, ?, ?, ?, ?)',
                    [body.id, media.type, media.url, media.caption || null, i]
                );
            }
        }

        await connection.commit();

        res.json({
            id: body.id,
            message: "Blog updated successfully"
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({
            message: "Error updating blog"
        });
    } finally {
        connection.release();
    }
});

// Delete a blog post (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        
        const [result] = await db.query(
            'DELETE FROM blogs WHERE id = ? AND author_id = ?',
            [id, req.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Blog not found or you don't have permission to delete"
            });
        }

        res.json({
            message: "Blog deleted successfully"
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error deleting blog"
        });
    }
});

// Get user's own blogs (protected)
router.get('/user/posts', authMiddleware, async (req, res) => {
    try {
        const [blogs] = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.status,
                b.cover_image,
                b.created_at,
                b.updated_at,
                u.name as author_name
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            WHERE b.author_id = ?
            ORDER BY b.updated_at DESC
        `, [req.userId]);

        const formattedBlogs = blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            status: blog.status,
            coverImage: blog.cover_image,
            createdAt: blog.created_at,
            updatedAt: blog.updated_at,
            author: {
                name: blog.author_name
            }
        }));

        res.json({
            blogs: formattedBlogs
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error fetching user blogs"
        });
    }
});

// Get all blogs (only published)
router.get('/bulk', async (req, res) => {
    try {
        const [blogs] = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.cover_image,
                b.created_at,
                b.author_id,
                u.name as author_name
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            WHERE b.status = 'published'
            ORDER BY b.created_at DESC
        `);

        const formattedBlogs = blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            coverImage: blog.cover_image,
            createdAt: blog.created_at,
            authorId: blog.author_id,
            author: {
                name: blog.author_name
            }
        }));

        res.json({
            blogs: formattedBlogs
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error fetching blogs"
        });
    }
});

// Get a single blog by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [blogs] = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.status,
                b.cover_image,
                b.author_id,
                b.created_at,
                u.name as author_name,
                u.email as author_email
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            WHERE b.id = ?
        `, [id]);

        if (blogs.length === 0) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        // Get media for this blog
        const [media] = await db.query(`
            SELECT id, media_type, media_url, caption, display_order
            FROM blog_media
            WHERE blog_id = ?
            ORDER BY display_order ASC
        `, [id]);

        const blog = blogs[0];
        res.json({
            blog: {
                id: blog.id,
                title: blog.title,
                content: blog.content,
                status: blog.status,
                coverImage: blog.cover_image,
                authorId: blog.author_id,
                createdAt: blog.created_at,
                media: media.map(m => ({
                    id: m.id,
                    type: m.media_type,
                    url: m.media_url,
                    caption: m.caption
                })),
                author: {
                    name: blog.author_name,
                    email: blog.author_email
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(411).json({
            message: "Error while fetching"
        });
    }
});

// Save/bookmark a post (protected)
router.post('/:id/save', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        
        await db.query(
            'INSERT IGNORE INTO saved_posts (user_id, blog_id) VALUES (?, ?)',
            [req.userId, blogId]
        );

        res.json({
            message: "Post saved successfully"
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error saving post"
        });
    }
});

// Unsave/unbookmark a post (protected)
router.delete('/:id/save', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        
        await db.query(
            'DELETE FROM saved_posts WHERE user_id = ? AND blog_id = ?',
            [req.userId, blogId]
        );

        res.json({
            message: "Post unsaved successfully"
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error unsaving post"
        });
    }
});

// Get saved posts (protected)
router.get('/user/saved', authMiddleware, async (req, res) => {
    try {
        const [blogs] = await db.query(`
            SELECT 
                b.id,
                b.title,
                b.content,
                b.cover_image,
                b.created_at,
                u.name as author_name,
                sp.created_at as saved_at
            FROM saved_posts sp
            JOIN blogs b ON sp.blog_id = b.id
            JOIN users u ON b.author_id = u.id
            WHERE sp.user_id = ?
            ORDER BY sp.created_at DESC
        `, [req.userId]);

        const formattedBlogs = blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            coverImage: blog.cover_image,
            createdAt: blog.created_at,
            savedAt: blog.saved_at,
            author: {
                name: blog.author_name
            }
        }));

        res.json({
            blogs: formattedBlogs
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error fetching saved posts"
        });
    }
});

// Check if post is saved (protected)
router.get('/:id/is-saved', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        
        const [result] = await db.query(
            'SELECT id FROM saved_posts WHERE user_id = ? AND blog_id = ?',
            [req.userId, blogId]
        );

        res.json({
            isSaved: result.length > 0
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error checking saved status"
        });
    }
});

export default router;
