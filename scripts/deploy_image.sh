#!/bin/sh
docker build -t huddle .
docker tag huddle:latest 739471740344.dkr.ecr.eu-west-2.amazonaws.com/huddle:latest
docker push 739471740344.dkr.ecr.eu-west-2.amazonaws.com/huddle:latest
