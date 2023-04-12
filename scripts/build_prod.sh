#!/bin/sh

run_cmd() {
  if [ -z "$DRY_RUN" ]; then
    eval "$@"
  else
    echo "$@"
  fi
}

run_cmd cd 'web'
run_cmd npm install
run_cmd npm run build -- --outDir '../back/public'
run_cmd cd '../back'
run_cmd npm install
