# Use the official Node.js 22 image as the base
FROM node:22

# Set the working directory inside the container to /usr/src/app (matches docker-compose volumes)
WORKDIR /usr/src/app

# Copy dependency manifest files first to leverage Docker layer caching
COPY package*.json ./

# Install Node.js dependencies defined in package.json
RUN npm install

# Copy the rest of the application source code into the image
COPY . .

# Define a default environment variable for the application port
ENV PORT=3000

# Inform Docker and tooling that the container listens on port 3000
EXPOSE 3000