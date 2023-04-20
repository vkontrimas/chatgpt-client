#!/bin/sh
heroku config:set HUDDLE_COMMIT_HASH="$(git --no-pager log --format=%h -n 1)"
git push heroku main
