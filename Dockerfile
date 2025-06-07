# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM mcr.microsoft.com/playwright:v1.52.0-noble AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app
ENV NODE_ENV="production"

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python3

COPY package.json ./
RUN npm install

COPY . .

RUN npx playwright install --with-deps

FROM base
COPY --from=build /app /app

EXPOSE 3000
CMD ["npm", "run", "start"]
