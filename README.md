# Blog App

A full-stack blog application with Express.js backend and React frontend.

## Backend Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blogapp
JWT_SECRET=your_secret_key
```

3. Create MySQL database:
```sql
CREATE DATABASE blogapp;
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000` and automatically create the required tables.

## Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file (optional):
```env
VITE_BACKEND_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Deployment

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Add environment variables in Render dashboard
5. Render will use the `render.yaml` configuration

### Frontend (Vercel)
1. Push your code to GitHub
2. Import project in Vercel
3. Set the root directory to `frontend`
4. Add environment variable: `VITE_BACKEND_URL=your_render_backend_url`
5. Deploy

## API Endpoints

### User Routes
- `POST /api/v1/user/signup` - Create new user
- `POST /api/v1/user/signin` - Sign in user

### Blog Routes
- `GET /api/v1/blog/bulk` - Get all blogs
- `GET /api/v1/blog/:id` - Get single blog
- `POST /api/v1/blog` - Create blog (requires auth)
- `PUT /api/v1/blog` - Update blog (requires auth)
