import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import userRouter from './routes/user.js';
import blogRouter from './routes/blog.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Blog API is running' });
});

app.use('/api/v1/user', userRouter);
app.use('/api/v1/blog', blogRouter);

// Initialize database tables
async function initDatabase() {
  const client = await db.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create blogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        cover_image VARCHAR(500) DEFAULT NULL,
        author_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create blog_media table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_media (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL,
        media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image','video','audio')),
        media_url TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
      )
    `);

    // Create saved_posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        blog_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        UNIQUE (user_id, blog_id)
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    client.release();
  }
}

// Start server and initialize database
initDatabase().then(() => {
  app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
  });
});

export default app;
