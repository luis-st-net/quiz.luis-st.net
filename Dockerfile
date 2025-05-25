# Build image on host:
#  docker buildx build --load --platform linux/arm64 -t quiz-web:<version> .
#  docker save -o D:\Programmieren\Docker\Images\Quiz-Website\quiz-web-<version>.tar quiz-web
#  docker load -i ./quiz-web-<version>.tar
# Build image on remote:
#  docker build -t quiz-web:<version> .
# Update the container:
#  docker stop quiz-web
#  docker rm quiz-web
#  docker run -d -p 3000:3000 --restart unless-stopped --name quiz-web quiz-web:<version>

# With docker compose:
#  docker compose up -d --build
#  docker compose down

FROM node:lts-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "start"]
