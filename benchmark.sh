#!/bin/bash

set -e

CLI_VERSION=1.5.0-rc.6

VERSIONS=(
  4.0
  4.1
  4.2
  4.3
  4.4
)

echo "[LOG] Use @angular/cli@$CLI_VERSION"

npm i @angular/cli@$CLI_VERSION > /dev/null

for version in ${VERSIONS[@]}
do
  output=report/$CLI_VERSION/$version/
  mkdir -p $output
  echo ""
  echo "[LOG] Benchmark for @angular/{*}@$version"
  npm i @angular/{animations,common,compiler,core,forms,http,platform-browser,platform-browser-dynamic,router,compiler-cli,language-service}@$version > /dev/null
  echo "[RUN] ng build"
  ng build | ./build-report.js > $output/ng-build.json
  echo "[RUN] ng build --prod"
  ng build --prod | ./build-report.js > $output/ng-build--prod.json
  echo "[RUN] ng build --prod --build-optimizer"
  ng build --prod --build-optimizer | ./build-report.js > $output/ng-build--prod--build-optimizer.json
  echo "[RUN] ng build --prod --build-optimizer --app=aot"
  ng build --prod --build-optimizer --app=aot | ./build-report.js > $output/ng-build--prod--build-optimizer--app=aot.json
done
