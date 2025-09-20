# FROM node:22.14.0

# WORKDIR /index

# COPY package*.json ./

# RUN npm install

# COPY . .


# EXPOSE 5031

# CMD [ "npm", "run", "dev" ]


FROM node:22.14.0-slim
# Set working directory inside container
WORKDIR /index

# Install module-alias first (important!)
COPY services/delivery-service/package*.json ./
RUN npm install

# Copy order-service code
COPY services/delivery-service/ . 

# Copy shared code separately (important!)
COPY shared/ /shared/

# Expose the port your service runs on
EXPOSE 5031

# Start the app
CMD ["npm", "run", "dev"]
