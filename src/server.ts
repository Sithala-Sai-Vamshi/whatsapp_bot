import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import './workers/message.queue.js';

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'WhatsApp AI bot server started');
});
