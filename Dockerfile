FROM node:20-alpine AS build
WORKDIR huddle
COPY . .
# Update hash watermark to current git commit 
RUN apk add git
RUN sed -i -e "s#\(<div id=\"root-version-tag\">\)latest#\1$(git rev-parse --short HEAD)#" web/index.html
RUN yarn
RUN yarn workspace web run build
RUN cp -rf web/dist/* back/public/

FROM node:20-alpine
WORKDIR huddle
COPY --from=build huddle/node_modules/ node_modules/
COPY --from=build huddle/back/ back/
CMD cd back && node main.js
