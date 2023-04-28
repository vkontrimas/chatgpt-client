FROM node AS build_frontend

WORKDIR web
# Install deps
COPY web/package.json ./
COPY web/yarn.loc[k] ./
RUN yarn

# Copy everything
COPY web .

# Build frontend
RUN yarn build

FROM nginx
COPY --from=build_frontend web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

