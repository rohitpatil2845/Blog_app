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

// Test database connection
db.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
