#!/bin/bash

set -e

CLI_VERSION=1.4.0

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
  echo ""
  echo "[LOG] Benchmark for @angular/{*}@$version"
  npm i @angular/{animations,common,compiler,core,forms,http,platform-browser,platform-browser-dynamic,router,compiler-cli,language-service}@$version > /dev/null
  echo "[LOG] Generate report in output directory"
  output=report/$CLI_VERSION/$version/
  mkdir -p $output
  echo "[LOG] Test *ng build*"
  ng build | ./build-report.js > $output/ng-build.json
  echo "[LOG] Test *ng build --prod*"
  ng build --prod | ./build-report.js > $output/ng-build--prod.json
  echo "[LOG] Test *ng build --prod --build-optimizer*"
  ng build --prod --build-optimizer | ./build-report.js > $output/ng-build--prod--build-optimizer.json
  echo "[LOG] Test *ng build --prod --build-optimizer --app=aot*"
  ng build --prod --build-optimizer --app=aot | ./build-report.js > $output/ng-build--prod--build-optimizer--app=aot.json
done
