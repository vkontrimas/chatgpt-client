#!/bin/sh

run_cmd() {
  echo $ "$@"
  if [ -z "$DRY_RUN" ]; then
    eval "$@"
  fi
}

update_index_html_hash() {
  local hash=$(git --no-pager log --format=%h -n 1)
  echo '> update index.html commit hash to' $hash
  if [ -z "$DRY_RUN" ]; then
    sed -i -e "s#\(<div id=\"root-version-tag\">\)latest#\1$hash#" web/index.html
  fi
}

update_index_html_hash
run_cmd cd 'web'
# we need to install vite to build, hence the include
run_cmd npm install --include dev
run_cmd npm run build -- --outDir '../back/public'
run_cmd rm -rf node_modules/
run_cmd cd '../db'
run_cmd npm install --include dev
run_cmd npx sequelize-cli db:migrate
run_cmd cd '../back'
run_cmd npm install
