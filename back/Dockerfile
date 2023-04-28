FROM node:20-alpine
WORKDIR back

# install deps
COPY package.json .
COPY yarn.loc[k] .
RUN yarn

# copy everything else
COPY . .

# run!
CMD node main.js
