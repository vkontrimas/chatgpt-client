#!/bin/bash

files='web/package.json back/package.json'

if [[ $# -eq 0 || "$1" == "-h" || "$1" == "--help"  ]]; then
  echo 'Usage: bump.sh <new version> [tag name]'
  echo "Updates version in $files"
  echo "Then creates a git tag with [tag name] if given or 'v<version>' if not"
  exit 0
fi

new_version="$1"
tag_name="${2:-v$new_version}"

function run_cmd() {
  echo '$ '$@
  $@
}

run_cmd sed -i -e "s/\(\"version\".*:\s*\)\".*\"\(.*\)/\1\"$new_version\"\2/" $files
run_cmd git tag $tag_name
echo "Don't forget to push with --tags to push the new tag to remote!"
run_cmd git status --short --branch
