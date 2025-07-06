// server.js
import 'dotenv/config';
import process from 'node:process';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import app from './src/app.js'; // ✅ import from app.js
import { initSocket } from './src/lib/socket.lib.js'; // ✅ initializes socket.io with express

const PORT = process.env.PORT || 8000;
const cpus = availableParallelism();

const startServer = async () => {
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    console.log(`Setting up ${cpus} workers...`);

    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(
        `Worker ${worker.process.pid} died. Signal: ${signal}. Code: ${code}`
      );
      console.log('Starting a new worker...');
      cluster.fork();
    });
  } else {
    const server = initSocket(app);
    server.listen(PORT, () => {
      console.log(`Worker ${process.pid} started on http://localhost:${PORT}`);
    });
  }
};

startServer();
