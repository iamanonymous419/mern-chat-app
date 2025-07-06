<!-- This is a auto generate readme through AI may contain's error  -->

# Chat Client with Vite - Docker Compose Setup

This project provides a containerized chat client application using Vite with Docker Compose, designed to work seamlessly with the chat server and MongoDB database in a secure containerized environment.

## Prerequisites

- Docker installed on your system
- Docker Compose (or Docker with compose plugin)
- Docker daemon running
- pnpm package manager
- Node.js 18+ for local development
- Basic understanding of Docker commands and networking

## Architecture

The client setup consists of:

- **Vite Development Server**: Fast frontend build tool with HMR (Hot Module Replacement)
- **Multi-stage Docker Build**: Optimized production builds with separate build and runtime stages
- **Network Integration**: Seamless communication with chat server and database
- **Production-ready Serving**: Vite preview server for production-like testing

## Client Features

- **Modern Build Pipeline**: Vite for fast development and optimized production builds
- **Hot Module Replacement**: Instant updates during development
- **Production Preview**: Vite preview server for testing production builds
- **Security**: Non-root user execution in production container
- **Health Monitoring**: Integration with Docker Compose health checks

## Deployment Options

This project supports two deployment methods:

1. **Standalone Client Setup** - Manual container deployment (recommended for learning)
2. **Full Stack Docker Compose** - Automated deployment with server and database (recommended for development)

## Standalone Client Setup

### 1. Create Custom Docker Network

Create or use the existing chat network:

```bash
# Create network if it doesn't exist
docker network create chatnet --driver bridge

# Verify network exists
docker network ls | grep chatnet
```

### 2. Build the Client Image

Build the client Docker image using the multi-stage Dockerfile:

```bash
# Build the client image
docker build -t chat-client:latest .

# Verify the image was created
docker images | grep chat-client
```

### 3. Run Client Container

Start the client container connected to the chat network:

```bash
docker run -d \
  --name chat-client \
  --network chatnet \
  -p 4173:4173 \
  -e VITE_URL=http://server:3000 \
  chat-client:latest
```

### 4. Verify Client Setup

Test the client application:

```bash
# Check if client is running
docker ps | grep chat-client

# View client logs
docker logs -f chat-client

# Test client accessibility
curl -f http://localhost:4173

# Check network connectivity to server
docker exec chat-client ping server
```

### Standalone Management Commands

```bash
# View client logs
docker logs -f chat-client

# Stop client container
docker stop chat-client

# Remove client container
docker rm chat-client

# Restart client with new build
docker stop chat-client && docker rm chat-client
docker build -t chat-client:latest .
docker run -d --name chat-client --network chatnet -p 4173:4173 -e VITE_URL=http://server:3000 chat-client:latest
```

## Full Stack Docker Compose Setup (Recommended)

### 1. Project Structure

Ensure your project structure matches this layout:

```
project-root/
├── docker-compose.yml
├── server/
│   ├── Dockerfile
│   ├── package.json
│   └── ... (server files)
├── client/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── ... (client files)
└── README.md
```

### 2. Create External Network

Create the external network for all services:

```bash
docker network create chatnet --driver bridge
```

### 3. Environment Configuration

Create a `.env` file in your project root:

```env
# Server Configuration
MONGO_ROOT_USERNAME=root
MONGO_ROOT_PASSWORD=rootpassword
JWT_SECRET=YWpka2ZhamtmamRrYUAhIyFAIyFAI0AhNDMyNDIzNDIhJEAjamFrZmhkYWpmaGFqZGgzNDg5NDgwMzQ4MjMkISQjISRmCg==
MONGODB_URI=mongodb://root:rootpassword@database:27017/chatapp?authSource=admin&retryWrites=true&w=majority

# Client Configuration
VITE_URL=http://server:3000
VITE_API_URL=http://localhost:3000

# Ports
SERVER_PORT=3000
CLIENT_PORT=4173
DB_PORT=27017
```

### 4. Start All Services

Use Docker Compose to start the entire stack:

```bash
# Start all services (server, database, client)
docker compose up -d

# Start with rebuild (after code changes)
docker compose up -d --build

# Start only client and its dependencies
docker compose up -d client

# View real-time logs for all services
docker compose logs -f

# View logs for specific services
docker compose logs -f client
docker compose logs -f server
```

## Docker Compose Configuration

Your `docker-compose.yml` includes the client service:

```yaml
version: '3.8'

services:
  client:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: chat-client
    ports:
      - '4173:4173'
    depends_on:
      - server
    environment:
      VITE_URL: http://server:3000
    restart: always
    networks:
      - chatnet
    command: ['vite', 'preview', '--host']
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4173']
      interval: 30s
      timeout: 10s
      start_period: 10s
      retries: 3

  # ... other services (server, database)
```

## Client-Specific Features

### Multi-Stage Docker Build

The client uses a multi-stage build for optimization:

1. **Build Stage**: Installs dependencies and builds the application
2. **Production Stage**: Creates lightweight runtime image with only necessary files

### Development vs Production

```bash
# Development mode (with hot reload)
docker compose -f docker-compose.dev.yml up -d

# Production mode (optimized build)
docker compose up -d
```

### Environment Variables

The client supports these environment variables:

| Variable       | Description             | Default                 |
| -------------- | ----------------------- | ----------------------- |
| `VITE_URL`     | Backend server URL      | `http://server:3000`    |
| `VITE_API_URL` | API endpoint URL        | `http://localhost:3000` |
| `VITE_WS_URL`  | WebSocket server URL    | `ws://localhost:3000`   |
| `PORT`         | Client application port | `4173`                  |

## Development Workflow

### Making Client Changes

For development with hot reload:

```bash
# Create development compose file
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  client:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: chat-client-dev
    ports:
      - '5173:5173'
    depends_on:
      - server
    environment:
      VITE_URL: http://server:3000
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - chatnet
    command: ["pnpm", "run", "dev", "--host"]

networks:
  chatnet:
    external: true
EOF

# Start development environment
docker compose -f docker-compose.dev.yml up -d client
```

### Installing Dependencies

```bash
# Install new dependencies
docker compose exec client pnpm install package-name

# Or rebuild after updating package.json
docker compose up -d --build client
```

### Build and Test

```bash
# Build production version
docker compose exec client pnpm run build

# Test production build locally
docker compose exec client pnpm run preview

# Lint code
docker compose exec client pnpm run lint

# Run tests
docker compose exec client pnpm run test
```

## Client Management Commands

### Service Management

```bash
# Start only client service
docker compose up -d client

# Stop client service
docker compose stop client

# Restart client service
docker compose restart client

# Scale client service (if needed)
docker compose up -d --scale client=2

# Remove client service
docker compose rm -f client
```

### Development Commands

```bash
# Rebuild client after code changes
docker compose up -d --build client

# View client service status
docker compose ps client

# Execute commands in client container
docker compose exec client pnpm install
docker compose exec client pnpm run build
docker compose exec client pnpm run lint

# Access client container shell
docker compose exec client /bin/sh
```

## Client Health Monitoring

### Health Check Configuration

The client includes health checks to monitor application status:

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:4173']
  interval: 30s
  timeout: 10s
  start_period: 10s
  retries: 3
```

### Monitoring Commands

```bash
# Check client health status
docker compose ps client

# Inspect client health details
docker inspect chat-client --format='{{.State.Health.Status}}'

# Monitor health continuously
watch -n 5 'docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"'

# View health check logs
docker inspect chat-client --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

## Client Network Configuration

### Service Communication

The client communicates with the server through the shared network:

```bash
# Test connectivity to server
docker compose exec client ping server

# Test HTTP connection to server
docker compose exec client curl -f http://server:3000/api/health

# Check network configuration
docker network inspect chatnet
```

### Port Configuration

| Service  | Internal Port | External Port | Description         |
| -------- | ------------- | ------------- | ------------------- |
| Client   | 4173          | 4173          | Vite preview server |
| Server   | 3000          | 3000          | Chat server API     |
| Database | 27017         | 27017         | MongoDB database    |

## Production Considerations

### Security Enhancements

1. **Non-root User**: Client runs as non-root user in production
2. **Minimal Image**: Uses Alpine Linux for smaller attack surface
3. **Network Isolation**: Containers communicate through private network

### Performance Optimization

```bash
# Optimize Vite build
docker compose exec client pnpm run build -- --minify

# Analyze bundle size
docker compose exec client pnpm run build -- --analyze

# Check build output
docker compose exec client ls -la dist/
```

### Production Deployment

```bash
# Build production images
docker compose build --no-cache

# Deploy to production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify deployment
curl -f http://localhost:4173
```

## Client-Specific Troubleshooting

### Common Issues

1. **Client Can't Connect to Server**:

   ```bash
   # Check network connectivity
   docker compose exec client ping server

   # Verify server is running
   docker compose ps server

   # Check environment variables
   docker compose exec client printenv | grep VITE
   ```

2. **Build Failures**:

   ```bash
   # Check build logs
   docker compose logs client

   # Verify package.json
   docker compose exec client cat package.json

   # Clean build
   docker compose exec client rm -rf dist node_modules
   docker compose exec client pnpm install
   ```

3. **Port Conflicts**:

   ```bash
   # Check port usage
   sudo netstat -tulpn | grep :4173

   # Change port in compose file
   # ports:
   #   - '4174:4173'
   ```

### Debug Commands

```bash
# Enter client container for debugging
docker compose exec client /bin/sh

# Check client build
docker compose exec client ls -la dist/

# Test client directly
docker compose exec client curl -f http://localhost:4173

# Check environment
docker compose exec client printenv
```

## Accessing the Client Application

Once the client service is running and healthy:

- **Client Application**: http://localhost:4173
- **Development Mode**: http://localhost:5173 (if using dev compose file)
- **Health Check**: Available through Docker health monitoring

## Client Cleanup

### Stop Client Service

```bash
# Stop client only
docker compose stop client

# Remove client container
docker compose rm -f client

# Remove client image
docker rmi chat-client:latest
```

### Complete Cleanup

```bash
# Stop all services
docker compose down

# Remove all containers and volumes
docker compose down -v

# Remove all images
docker compose down -v --rmi all

# Clean unused resources
docker system prune -f
```

## Development Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host",
    "lint": "eslint . --ext .vue,.js,.jsx,.ts,.tsx",
    "docker:build": "docker build -t chat-client:latest .",
    "docker:run": "docker run -d --name chat-client --network chatnet -p 4173:4173 -e VITE_URL=http://server:3000 chat-client:latest",
    "docker:dev": "docker compose -f docker-compose.dev.yml up -d client",
    "docker:prod": "docker compose up -d client"
  }
}
```

## Integration with Server

### API Communication

The client communicates with the server through:

```javascript
// Example environment configuration
const API_BASE_URL = import.meta.env.VITE_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// HTTP requests
fetch(`${API_BASE_URL}/api/messages`)
  .then((response) => response.json())
  .then((data) => console.log(data));

// WebSocket connection
const socket = new WebSocket(WS_URL);
```

### Environment Variables in Client

```bash
# Set environment variables for client
docker compose exec client printenv | grep VITE

# Update environment variables
docker compose up -d client --env-file .env.production
```

This setup provides a comprehensive, production-ready client application that integrates seamlessly with your chat server and database, with proper health monitoring, security considerations, and development-friendly features.
