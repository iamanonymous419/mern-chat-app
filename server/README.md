<!-- This is a auto generate readme through AI may contain's error  -->

# Chat Server with MongoDB - Docker Compose Setup

This project provides a containerized chat server application with MongoDB database using Docker Compose with proper network configuration for secure container communication.

## Prerequisites

- Docker installed on your system
- Docker Compose (or Docker with compose plugin)
- Docker daemon running
- pnpm package manager
- Basic understanding of Docker commands and networking

## Architecture

The setup consists of three main components:

- **Custom Docker Network**: Isolated network for secure container communication
- **MongoDB Database**: NoSQL database for storing chat data with health checks
- **Chat Server**: Node.js application with hot-reload support and health monitoring

## Deployment Options

This project supports two deployment methods:

1. **Network-First Setup** - Manual container deployment with custom network (recommended for learning Docker networking)
2. **Docker Compose Setup** - Automated deployment with compose file (recommended for development and production)

## Network-First Setup (Recommended for Learning)

### 1. Create Custom Docker Network

First, create a dedicated network for your chat application:

```bash
docker network create chat-network --driver bridge
```

Verify the network was created:

```bash
docker network ls
```

### 2. Build the Chat Server Image

Build the chat server Docker image from your Dockerfile:

```bash
docker build -t chat-server:latest .
```

### 3. Start MongoDB Container with Network

Run the MongoDB container connected to the custom network:

```bash
docker run -d \
  --name mongo \
  --network chat-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=rootpassword \
  -v mongo_data:/data/db \
  --health-cmd="mongosh --quiet --eval 'db.adminCommand(\"ping\").ok'" \
  --health-interval=10s \
  --health-timeout=5s \
  --health-retries=5 \
  --health-start-period=5s \
  mongo:latest
```

### 4. Wait for MongoDB to be Healthy

Check MongoDB health before starting the chat server:

```bash
# Wait for MongoDB to be healthy
docker exec mongo mongosh --quiet --eval 'db.adminCommand("ping")'

# Or check health status
docker inspect mongo --format='{{.State.Health.Status}}'
```

### 5. Start Chat Server Container with Network

Run the chat server container on the same network:

```bash
docker run -d \
  --name chat-server \
  --network chat-network \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://root:rootpassword@mongo:27017/chatapp?authSource=admin \
  -e PORT=3000 \
  -e JWT_SECRET=your_jwt_secret_here \
  chat-server:latest
```

### 6. Verify Network Setup

Test that both containers can communicate:

```bash
# Test connectivity from chat-server to mongo
docker exec chat-server ping mongo

# Test MongoDB connection
docker exec chat-server nc -zv mongo 27017

# Check both containers are on the same network
docker network inspect chat-network
```

### Network-First Management Commands

```bash
# View container logs
docker logs -f chat-server
docker logs -f mongo

# Stop containers
docker stop chat-server mongo

# Remove containers
docker rm chat-server mongo

# Clean up network
docker network rm chat-network

# Remove volume (⚠️ Deletes all data)
docker volume rm mongo_data
```

## Docker Compose Setup (Recommended for Development)

### Quick Start

### 1. Create External Network

First, create the external network that your containers will use:

```bash
docker network create chatnet --driver bridge
```

Verify the network was created:

```bash
docker network ls
```

### 2. Set Up Environment

Create a `.env` file in your project root for sensitive data:

```env
MONGO_ROOT_USERNAME=root
MONGO_ROOT_PASSWORD=rootpassword
JWT_SECRET=your_super_secure_jwt_secret_here
MONGODB_URI=mongodb://root:rootpassword@database:27017/chatapp?authSource=admin&retryWrites=true&w=majority
PORT=3000
```

### 3. Start All Services

Use Docker Compose to start the entire stack:

```bash
# Start all services in detached mode
docker compose up -d

# Start with rebuild (if you made changes)
docker compose up -d --build

# View real-time logs
docker compose logs -f

# View logs for specific service
docker compose logs -f server
docker compose logs -f database
```

## Docker Compose Configuration

Your `docker-compose.yml` file includes:

```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: chat-server
    ports:
      - '3000:3000'
    depends_on:
      - database
    environment:
      - MONGODB_URI=mongodb://root:rootpassword@database:27017/chatapp?authSource=admin&retryWrites=true&w=majority
      - PORT=3000
      - JWT_SECRET=your_jwt_secret_here
    volumes:
      - .:/app
    command: pnpm run start
    restart: always
    networks:
      - chatnet
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      start_period: 5s
      retries: 3

  database:
    image: mongo:latest
    container_name: mongo-server
    restart: always
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
    volumes:
      - mongo_data:/data/db
    networks:
      - chatnet
    healthcheck:
      test: ['CMD', 'mongosh', '--quiet', '--eval', "db.runCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 5s

volumes:
  mongo_data:

networks:
  chatnet:
    external: true
    driver: bridge
```

## Key Features

### Development-Friendly Setup

- **Hot Reload**: The server container mounts your source code for live development
- **Health Checks**: Both services include comprehensive health monitoring
- **External Network**: Uses pre-created network for better control and reusability
- **Persistent Storage**: MongoDB data persists across container restarts

### Health Monitoring

The setup includes health checks for both services:

- **Server Health**: HTTP endpoint check at `/api/health`
- **Database Health**: MongoDB ping command verification

## Management Commands

### Service Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove everything (including volumes)
docker compose down -v

# Restart specific service
docker compose restart server
docker compose restart database

# Scale services (if needed)
docker compose up -d --scale server=2
```

### Development Commands

```bash
# Rebuild and start (after code changes)
docker compose up -d --build

# View service status
docker compose ps

# Execute commands in running containers
docker compose exec server pnpm install
docker compose exec database mongosh -u root -p rootpassword

# Follow logs in real-time
docker compose logs -f --tail=100
```

## Network Configuration

### External Network Benefits

1. **Reusability**: Network can be shared across multiple projects
2. **Persistence**: Network survives `docker compose down`
3. **Control**: Manual network management and configuration
4. **Service Discovery**: Containers reach each other by service name

### Network Inspection

```bash
# Inspect the external network
docker network inspect chatnet

# See connected containers
docker network inspect chatnet --format='{{range .Containers}}{{.Name}} {{end}}'

# List all networks
docker network ls
```

### Docker Compose vs Network-First Comparison

| Feature               | Docker Compose                  | Network-First                |
| --------------------- | ------------------------------- | ---------------------------- |
| **Ease of Use**       | Simple one-command deployment   | Manual step-by-step setup    |
| **Development**       | Hot-reload with volume mounting | Requires rebuild for changes |
| **Learning**          | Abstracts Docker concepts       | Teaches Docker networking    |
| **Production**        | Better for CI/CD pipelines      | More granular control        |
| **Service Discovery** | Automatic with service names    | Manual network configuration |
| **Health Checks**     | Built into compose file         | Manual health monitoring     |

Choose **Docker Compose** for rapid development and production deployments.
Choose **Network-First** to understand Docker networking concepts and gain fine-grained control.

## Service Communication Testing (Both Methods)

### Test Container Connectivity

```bash
# Test if server can reach database
docker compose exec server ping database

# Test MongoDB connection from server
docker compose exec server nc -zv database 27017

# Direct MongoDB connection test
docker compose exec server mongosh mongodb://root:rootpassword@database:27017/chatapp?authSource=admin
```

### Health Check Status

```bash
# Check health status of all services
docker compose ps

# Monitor health status continuously
watch -n 5 'docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"'

# Check individual service health
docker inspect chat-server --format='{{.State.Health.Status}}'
docker inspect mongo-server --format='{{.State.Health.Status}}'
```

## Development Workflow

### Making Code Changes

Since the server container mounts your source code:

1. Make changes to your source files
2. The container will automatically restart (if using nodemon or similar)
3. No need to rebuild the container for code changes

### Installing Dependencies

```bash
# Install new dependencies
docker compose exec server pnpm install package-name

# Or stop container, modify package.json, then rebuild
docker compose down
# Edit package.json
docker compose up -d --build
```

### Database Operations

```bash
# Access MongoDB shell
docker compose exec database mongosh -u root -p rootpassword

# Run database commands
docker compose exec database mongosh -u root -p rootpassword --eval "use chatapp; db.messages.find().limit(5)"

# Import data
docker compose exec database mongoimport --username root --password rootpassword --authenticationDatabase admin --db chatapp --collection messages --file /data/messages.json
```

## Production Considerations

### Security Enhancements

1. **Remove External Ports**: Don't expose MongoDB port in production

```yaml
# Remove or comment out in production
# ports:
#   - '27017:27017'
```

2. **Use Environment Files**: Store sensitive data in `.env` files

```bash
# Create production .env file
cat > .env.production << EOF
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
MONGODB_URI=mongodb://admin:$(openssl rand -base64 32)@database:27017/chatapp?authSource=admin&retryWrites=true&w=majority
PORT=3000
EOF
```

3. **Update Health Check URLs**: Ensure your application has proper health endpoints

### Production Deployment

```bash
# Use production compose file
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or set environment for production
export NODE_ENV=production
docker compose up -d
```

## Monitoring and Maintenance

### Log Management

```bash
# View logs with timestamps
docker compose logs -f -t

# View logs for specific time range
docker compose logs --since="2024-01-01T00:00:00" --until="2024-01-02T00:00:00"

# Save logs to file
docker compose logs > application.log
```

### Resource Monitoring

```bash
# Monitor resource usage
docker stats chat-server mongo-server

# Check disk usage
docker system df

# Monitor network traffic
docker exec chat-server netstat -i
```

## Backup and Recovery

### Database Backup

```bash
# Create backup directory
mkdir -p ./backups

# Backup database
docker compose exec database mongodump \
  --username root \
  --password rootpassword \
  --authenticationDatabase admin \
  --out /backup

# Copy backup from container
docker cp mongo-server:/backup ./backups/$(date +%Y%m%d_%H%M%S)
```

### Restore Database

```bash
# Restore from backup
docker compose exec database mongorestore \
  --username root \
  --password rootpassword \
  --authenticationDatabase admin \
  /backup
```

## Troubleshooting

### Common Issues

1. **Network Already Exists Error**:

   ```bash
   # Remove existing network if needed
   docker network rm chatnet
   # Recreate network
   docker network create chatnet --driver bridge
   ```

2. **Port Already in Use**:

   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   # Kill the process or change port in compose file
   ```

3. **Health Check Failures**:

   ```bash
   # Check health check logs
   docker inspect chat-server --format='{{.State.Health}}'
   # Verify health endpoint works
   curl -f http://localhost:3000/api/health
   ```

4. **Volume Permission Issues**:
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER ./
   # Or run with user context
   docker compose exec --user $(id -u):$(id -g) server pnpm install
   ```

### Debug Commands

```bash
# Enter server container for debugging
docker compose exec server /bin/bash

# Check environment variables
docker compose exec server printenv

# Test internal connectivity
docker compose exec server ping database
docker compose exec server telnet database 27017

# Check DNS resolution
docker compose exec server nslookup database
```

## Performance Optimization

### Database Performance

Add indexes and optimize MongoDB configuration:

```bash
# Connect to MongoDB and create indexes
docker compose exec database mongosh -u root -p rootpassword --eval "
use chatapp;
db.messages.createIndex({ 'timestamp': -1 });
db.users.createIndex({ 'email': 1 }, { unique: true });
"
```

### Server Performance

Monitor and optimize your Node.js application:

```bash
# Check memory usage
docker compose exec server node -e "console.log(process.memoryUsage())"

# Monitor CPU usage
docker stats chat-server --no-stream
```

## Accessing the Application

Once all services are running and healthy:

- **Chat Server**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **MongoDB** (if port exposed): localhost:27017
- **Internal MongoDB URI**: `mongodb://root:rootpassword@database:27017/chatapp?authSource=admin`

## Cleanup

### Stop and Clean Up

```bash
# Stop services but keep volumes
docker compose down

# Stop services and remove volumes (⚠️ Deletes all data)
docker compose down -v

# Remove everything including images
docker compose down -v --rmi all

# Clean up unused Docker resources
docker system prune -f

# Remove external network (only if not used by other projects)
docker network rm chatnet
```

## Environment Variables Reference

| Variable      | Description                        | Example                                                       |
| ------------- | ---------------------------------- | ------------------------------------------------------------- |
| `MONGODB_URI` | Complete MongoDB connection string | `mongodb://root:pass@database:27017/chatapp?authSource=admin` |
| `PORT`        | Server port                        | `3000`                                                        |
| `JWT_SECRET`  | Secret for JWT token signing       | `your_secret_key`                                             |
| `NODE_ENV`    | Environment mode                   | `development` or `production`                                 |

This setup provides a robust, development-friendly environment with proper health monitoring, persistent storage, and easy service management through Docker Compose commands.
