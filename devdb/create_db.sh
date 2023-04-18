#!/bin/bash

cd ../db/
npm install
npx sequelize-cli db:create
NODE_ENV=test npx sequelize-cli db:create
