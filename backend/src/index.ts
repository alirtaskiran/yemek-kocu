import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Yemek Koçu Backend'
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import recipeRoutes from './routes/recipe.routes';
import familyRoutes from './routes/family.routes';

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Yemek Koçu API',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'POST /auth/register - User registration',
      'POST /auth/login - User login',
      'GET /recipes - Get recipes',
      'POST /recipes - Create recipe',
      'GET /families - Get families',
      'POST /families - Create family'
    ]
  });
});

// Mount routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/families', familyRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      status: 404
    }
  });
});

const PORT = config.port || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Yemek Koçu Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
}); 