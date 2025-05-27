import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import signRoutes from './routes/signRoutes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(helmet()); // Заголовки безпеки
app.use(express.json({ limit: '50mb' })); // JSON-limiter
app.use('/api/sign', signRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));