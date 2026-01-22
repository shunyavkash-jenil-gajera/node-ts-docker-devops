import express from 'express';
import { PORT } from './config/environment.config.js';
import { SendResponse } from './handlers/responce.handler.js';
import { globalErrorHandler } from './handlers/globleError.handler.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(express.json())

app.get('/', (_, res) => {
  SendResponse(res, 200, true, `Hello from Jenil's Node.js + TS DevOps Project! 🚀`);
});

app.use('/auth', authRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
  });
}

app.use(globalErrorHandler);
console.log("Welcome 2FA Authentication System");

export default app