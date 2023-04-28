FROM node:20-alpine
WORKDIR back

# install deps
COPY back/package.json .
COPY back/yarn.loc[k] .
RUN yarn

# copy everything else
COPY back .

# run!
CMD node main.js
