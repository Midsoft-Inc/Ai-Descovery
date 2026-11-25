# Stage 1: build the React website into dist/
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: small runtime image = Express backend + the built website
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js config.js ./
COPY api ./api
COPY lib ./lib
COPY models ./models
COPY routes ./routes
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "server.js"]
