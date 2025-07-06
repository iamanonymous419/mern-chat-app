export const getHealthStatus = () => {
  return {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};
