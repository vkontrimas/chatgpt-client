FROM node:20-alpine AS build
WORKDIR /huddle
COPY package.json yarn.lock ./
COPY web/package.json ./web/
COPY back/package.json ./back/
COPY db/package.json ./db/
RUN yarn
COPY . .

FROM node:20-alpine
COPY --from=build /huddle /huddle
