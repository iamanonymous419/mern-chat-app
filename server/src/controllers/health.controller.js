import { getHealthStatus } from '../services/health.service.js';

export const healthCheck = (_req, res) => {
  const health = getHealthStatus();
  res.status(200).json(health);
};
