#!/bin/bash

database='dev'
if [[ -n "$1" ]]; then
  database="$1"
fi

echo "Connecting to $database database"
psql -U postgres -d "huddle_$database" -h localhost -p 3003
