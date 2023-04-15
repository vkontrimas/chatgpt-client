#!/bin/sh

run_cmd() {
  echo "\$ $@"
  if [ -z "$DRY_RUN" ]; then
    eval "$@"
  fi
}

run_cmd cd 'web'
# we need to install vite to build, hence the include
run_cmd npm install --include dev
run_cmd npm run build -- --outDir '../back/public'
run_cmd rm -rf node_modules/
run_cmd cd '../db'
run_cmd npm install --include dev
run_cmd npx sequelize-cli db:migrate
run_cmd rm -rf node_modules/
run_cmd cd '../back'
run_cmd npm install
