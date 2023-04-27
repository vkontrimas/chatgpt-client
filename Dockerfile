FROM node:20-alpine AS build
WORKDIR /huddle
COPY package.json yarn.lock ./
COPY web/package.json ./web/
COPY back/package.json ./back/
RUN yarn
COPY web/ web/
COPY back/ back/

FROM node:20-alpine
COPY --from=build /huddle /huddle
