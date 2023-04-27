FROM node:20-alpine AS build
COPY package.json yarn.lock huddle/
COPY web/package.json huddle/web/
COPY back/package.json huddle/back/
COPY db/package.json huddle/db/
RUN cd huddle && yarn

FROM node:20-alpine
COPY --from=build /huddle /huddle
