#!/usr/bin/env bash

if [[ -z "$1" ]]
then
  echo "You must give a version number. eg: ./bin/build.sh 1.0.0"
else
  echo "** building validator.min.js version " $1
  ruby ./bin/minify validator.js validator.min.js $1 --force
  echo "  done!"
fi