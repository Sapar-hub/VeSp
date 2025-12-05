import express, {} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Basic Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Vector Space API is running', timestamp: new Date() });
});
// --- SCENE ROUTES (Placeholder) ---
// GET all public scenes
app.get('/api/scenes/public', async (req, res) => {
    try {
        const scenes = await prisma.scene.findMany({
            where: { isPublic: true },
            select: { id: true, name: true, createdAt: true, owner: { select: { email: true } } }
        });
        res.json(scenes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch scenes' });
    }
});
// Start Server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map