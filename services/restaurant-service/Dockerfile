# FROM node:22.14.0

# WORKDIR /index

# COPY package*.json ./

# RUN npm install

# COPY . .

# # Create the uploads directory if it doesn't exist
# RUN mkdir -p /uploads

# EXPOSE 5011

# CMD [ "npm", "run" ,"dev" ]

# Use an official Node.js image
FROM node:22.14.0-slim

# Set working directory inside container
WORKDIR /index

# Install dependencies
COPY services/restaurant-service/package*.json ./
RUN npm install

# Copy service code
COPY services/restaurant-service/ .

# Copy shared code
COPY shared/ /shared/

# Expose the app port
EXPOSE 5011

# Start the app
CMD ["npm", "run", "dev"]
