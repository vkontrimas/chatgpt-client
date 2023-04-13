#!/bin/bash

database='development'
if [[ "$1" == "test" ]]; then
  database='test'
fi

echo "Connecting to $database database"
psql -U huddle -d "huddle_$database" -h localhost -p 3003
