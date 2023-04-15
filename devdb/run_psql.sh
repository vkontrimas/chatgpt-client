#!/bin/bash

source back/.env

if [[ "$1" == "prod" ]]; then
  if [[ -n "$HUDDLE_PROD_DATABASE_URL" ]]; then
    echo "Connecting to prod database"
    echo "==========================="
    psql $HUDDLE_PROD_DATABASE_URL
  else
    echo "HUDDLE_PROD_DATABASE_URL undefined! export it or add it to back/.env!"
  fi
else 
  db_username='postgres'
  db_name='huddle_dev'
  db_hostname='localhost'
  db_port=3003
  db_pass='huddle'
  db_name='huddle_dev'

  if [[ -n "$1" ]]; then
    db_name="huddle_$1"
  fi
  
  echo "Connecting to ($db_name@$db_hostname) database..."
  echo "================================================="
  PGPASSWORD="$db_pass" psql -U $db_username -d $db_name -h $db_hostname -p $db_port
fi

