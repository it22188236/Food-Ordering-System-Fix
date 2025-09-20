# FROM node:22.14.0

# WORKDIR /index

# COPY package*.json ./


# RUN npm install

# COPY . .

# EXPOSE 5021

# CMD [ "npm", "run", "dev" ]

# Use an official Node.js image
FROM node:22.14.0-slim

# Set working directory inside container
WORKDIR /index

# Install dependencies
COPY services/notification-service/package*.json ./
RUN npm install

# Copy service code
COPY services/notification-service/ .

# Copy shared code
COPY shared/ /shared/

# Expose the app port
EXPOSE 5051

# Start the app
CMD ["npm", "run", "dev"]
