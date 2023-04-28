FROM node:20-alpine AS build
WORKDIR web
# Install deps
COPY package.json ./
COPY yarn.loc[k] ./
RUN yarn

# Copy everything
COPY . .

# Build frontend
RUN yarn build

FROM nginx
COPY --from=build web/dist /usr/share/nginx/html
