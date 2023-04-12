#!/bin/sh

run_cmd() {
  if [ -z "$DRY_RUN" ]; then
    eval "$@"
  else
    echo "$@"
  fi
}

run_cmd cd 'web'
# we need to install vite to build 
run_cmd npm install --save-dev 
run_cmd npm run build -- --outDir '../back/public'
run_cmd rm -rf node_modules/
run_cmd cd '../back'
run_cmd npm install
