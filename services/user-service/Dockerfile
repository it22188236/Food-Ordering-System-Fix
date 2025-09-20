# FROM node:22.14.0

# WORKDIR /index.js

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 5001

# CMD [ "npm", "run", "dev" ]

# Use an official Node.js image
FROM node:22.14.0-slim

# Set working directory inside container
WORKDIR /index

# Install dependencies
COPY services/user-service/package*.json ./

RUN npm install

# Copy service code
COPY services/user-service/ .

# Copy shared code
# COPY shared/ /shared/

# Expose the app port
EXPOSE 5001

# Start the app
CMD ["npm", "run", "dev"]


