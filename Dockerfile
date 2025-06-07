# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
# imagem oficial com dependências do Playwright
FROM mcr.microsoft.com/playwright:v1.44.0-focal AS base 

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV="production"

# Etapa de build
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Instala dependências da aplicação
COPY package.json ./
RUN npm install

# Copia código da aplicação
COPY . .

# Instala navegadores do Playwright
RUN npx playwright install --with-deps


# Etapa final (container de produção)
FROM base

COPY --from=build /app /app

EXPOSE 3000

CMD [ "npm", "run", "start" ]