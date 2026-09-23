FROM node:20-alpine

# Use a non-root user for security
# Alpine comes with a 'node' user by default
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

USER node

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY --chown=node:node src/ src/

# Create uploads directory with correct permissions
RUN mkdir -p uploads/resumes uploads/avatars

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
