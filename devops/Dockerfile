# -------- Build Stage --------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only necessary files for install step
COPY package.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Install dependencies (cached)
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Build only the web app (adjust name if different)
RUN yarn nx build expense-web

# -------- Production Stage --------
FROM nginx:alpine AS runner

# Clean default Nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist/apps/expense-web /usr/share/nginx/html

# Optional: custom Nginx config
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]