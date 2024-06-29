# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the preferred package manager
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    else echo "Lockfile not found."; exit 1; \
    fi

# Copy the rest of the application code to the working directory
COPY . .

# Install Prisma client dependencies
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Stage 2: Serve the app with a smaller base image
FROM node:18-alpine AS runner

# Set environment variables
ENV NODE_ENV production

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY --from=base /app/package.json /app/package-lock.json* /app/yarn.lock* /app/pnpm-lock.yaml* ./

# Install only production dependencies
RUN if [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci --only=production; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --production; \
    else echo "Lockfile not found."; exit 1; \
    fi

# Copy the built app from the first stage
COPY --from=base /app/.next /app/.next
COPY --from=base /app/public /app/public
COPY --from=base /app/next.config.mjs /app/next.config.mjs

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
