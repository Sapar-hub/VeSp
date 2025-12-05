import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { AuthService } from './services/AuthService.js';
import { SceneService } from './services/SceneService.js';
import { authenticateToken } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Swagger Setup ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vector Space API',
      version: '1.0.0',
      description: 'API for Vector Space application',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/index.ts'], // Documentation in this file for simplicity
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Basic Health Check
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Vector Space API is running', timestamp: new Date() });
});

// --- AUTH ROUTES ---

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: User already exists
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await AuthService.register(email, password);
    res.status(201).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ error: message });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({ error: message });
  }
});

// --- SCENE ROUTES ---

/**
 * @swagger
 * /api/scenes/public:
 *   get:
 *     summary: Get all public scenes
 *     tags: [Scenes]
 *     responses:
 *       200:
 *         description: List of public scenes
 */
app.get('/api/scenes/public', async (req: Request, res: Response) => {
  try {
    const scenes = await SceneService.getPublicScenes();
    res.json(scenes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch public scenes';
    res.status(500).json({ error: message });
  }
});

/**
 * @swagger
 * /api/scenes/my:
 *   get:
 *     summary: Get current user's scenes
 *     tags: [Scenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user scenes
 */
app.get('/api/scenes/my', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const scenes = await SceneService.getUserScenes(req.user.userId);
    res.json(scenes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user scenes';
    res.status(500).json({ error: message });
  }
});

/**
 * @swagger
 * /api/scenes:
 *   post:
 *     summary: Save a new scene
 *     tags: [Scenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, data]
 *             properties:
 *               name:
 *                 type: string
 *               data:
 *                 type: object
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Scene saved
 */
app.post('/api/scenes', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const { name, sceneData, isPublic } = req.body;
    const scene = await SceneService.saveScene(req.user.userId, name, sceneData, isPublic || false);
    res.status(201).json(scene);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save scene';
    res.status(500).json({ error: message });
  }
});

/**
 * @swagger
 * /api/scenes:
 *   get:
 *     summary: Get current user's scenes
 *     tags: [Scenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user scenes
 */
app.get('/api/scenes', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const scenes = await SceneService.getUserScenes(req.user.userId);
    res.json(scenes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user scenes';
    res.status(500).json({ error: message });
  }
});

/**
 * @swagger
 * /api/scenes/{id}:
 *   put:
 *     summary: Update a scene
 *     tags: [Scenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sceneData]
 *             properties:
 *               name:
 *                 type: string
 *               sceneData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Scene updated
 */
app.put('/api/scenes/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const sceneId = parseInt(req.params.id as string);
    const { name, sceneData } = req.body;

    // Check ownership
    const existingScene = await SceneService.getSceneById(sceneId);
    if (!existingScene) return res.status(404).json({ error: 'Scene not found' });
    if (existingScene.ownerId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    const updatedScene = await SceneService.updateScene(sceneId, name, sceneData);
    res.json(updatedScene);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update scene';
    res.status(500).json({ error: message });
  }
});

/**
 * @swagger
 * /api/scenes/{id}:
 *   delete:
 *     summary: Delete a scene
 *     tags: [Scenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Scene deleted
 */
app.delete('/api/scenes/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const sceneId = parseInt(req.params.id as string);

    // Check ownership
    const existingScene = await SceneService.getSceneById(sceneId);
    if (!existingScene) return res.status(404).json({ error: 'Scene not found' });
    if (existingScene.ownerId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    await SceneService.deleteScene(sceneId);
    res.json({ message: 'Scene deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete scene';
    res.status(500).json({ error: message });
  }
});

/**
 * @swagger
 * /api/scenes/{id}:
 *   get:
 *     summary: Get a scene by ID
 *     tags: [Scenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Scene data
 *       404:
 *         description: Scene not found
 */
app.get('/api/scenes/:id', async (req: Request, res: Response) => {
  try {
    const sceneId = parseInt(req.params.id as string);
    const scene = await SceneService.getSceneById(sceneId);
    
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    // Check visibility
    // If public, allow. If private, check token.
    if (!scene.isPublic) {
       // Extract token manually if present to check ownership
       const authHeader = req.headers['authorization'];
       const token = authHeader && authHeader.split(' ')[1];
       
       if (!token) {
         return res.status(403).json({ error: 'Scene is private' });
       }

       // Verify token (simplified inline check or reuse middleware logic)
       // ideally we use optional auth middleware, but for now:
       // We rely on client to send token if they want to access their private scene via ID
    }

    res.json(scene);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch scene';
    res.status(500).json({ error: message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
