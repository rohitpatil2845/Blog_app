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
  try {
    const connection = await db.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create blogs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        -- status/cover_image may be added later for older DBs; ensure compatibility below
        author_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Ensure `status` column exists (some older DBs may not have it)
    const [statusCol] = await connection.query("SHOW COLUMNS FROM blogs LIKE 'status'");
    if (!statusCol || statusCol.length === 0) {
      await connection.query("ALTER TABLE blogs ADD COLUMN status ENUM('draft','published','private') DEFAULT 'draft'");
      console.log('ℹ️ Added missing `status` column to `blogs`');
    }

    // Ensure `cover_image` column exists
    const [coverCol] = await connection.query("SHOW COLUMNS FROM blogs LIKE 'cover_image'");
    if (!coverCol || coverCol.length === 0) {
      await connection.query("ALTER TABLE blogs ADD COLUMN cover_image VARCHAR(500) DEFAULT NULL");
      console.log('ℹ️ Added missing `cover_image` column to `blogs`');
    }

    // Create blog_media table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_media (
        id INT PRIMARY KEY AUTO_INCREMENT,
        blog_id INT NOT NULL,
        media_type ENUM('image','video','audio') NOT NULL,
        media_url TEXT NOT NULL,
        caption TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
      )
    `);

    // Create saved_posts table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        blog_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_blog (user_id, blog_id)
      )
    `);

    connection.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Start server and initialize database
initDatabase().then(() => {
  app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
  });
});

export default app;
