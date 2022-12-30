#!/bin/bash

cd $(dirname "$0")
cd ..

command_exists(){
  command -v "$1" &> /dev/null
}

if ! command_exists "ncu"; then
    echo "npm-check-updates is not installed"
    npm i -g npm-check-updates
else
    echo "ncu is installed"
fi

function updateDependencies {
  echo "updating dependencies..."
  OUTPUT=`ncu -u`
  SUB='All dependencies match the latest package versions'
  if [[ "$OUTPUT" == *"$SUB"* ]]; then
    echo "$OUTPUT"
  else
    rm -rf node_modules package-lock.json dist
    npm install
  fi
}

updateDependencies &&
cd packages/extension && updateDependencies && cd ../../ &&
cd packages/extension-test && updateDependencies && cd ../../ &&
cd packages/html-preview-service && updateDependencies && cd ../../ &&
cd packages/html-preview-service-node && updateDependencies && cd ../../ &&
cd packages/html-preview-web && updateDependencies && cd ../../ &&
cd packages/injected-code && updateDependencies && cd ../../ &&
cd packages/samples && updateDependencies && cd ../../ &&
cd packages/virtual-dom && updateDependencies && cd ../../ &&

echo "Great Success!"

sleep 2