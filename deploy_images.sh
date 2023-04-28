#!/bin/sh
docker build -t huddle_back -f back.dockerfile .
docker tag huddle_back:latest 739471740344.dkr.ecr.eu-west-2.amazonaws.com/huddle_back:latest
docker push 739471740344.dkr.ecr.eu-west-2.amazonaws.com/huddle_back:latest

docker build -t huddle_www -f www.dockerfile .
docker tag huddle_www:latest 739471740344.dkr.ecr.eu-west-2.amazonaws.com/huddle_www:latest
docker push 739471740344.dkr.ecr.eu-west-2.amazonaws.com/huddle_www:latest
