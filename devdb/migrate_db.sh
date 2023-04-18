#!/bin/bash

cd ../db
npm install
npx sequelize-cli db:migrate
NODE_ENV=test npx sequelize-cli db:migrate
