FROM node:20-slim

WORKDIR /app

# Install system tools needed for native node modules & health check
RUN apt-get update && apt-get install -y --no-install-recommends curl python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./

# Install dependencies for building
RUN npm install

# Copy source code
COPY . .

# Build backend and admin dashboard
ENV NODE_ENV=production
RUN npx medusa build --no-lint

ENV PORT=9000
ENV HOST=0.0.0.0

EXPOSE 9000

# Run migrations and start Medusa from .medusa/server where built assets reside
CMD ["sh", "-c", "npx medusa db:migrate && cd .medusa/server && npx medusa start -H 0.0.0.0"]
