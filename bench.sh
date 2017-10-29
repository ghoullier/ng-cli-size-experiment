#!/bin/bash

set -e

# Create report folder
mkdir -p report

echo "[LOG] Test *ng build*"
ng build | ./build-report.js > report/ng-build.json
echo "[LOG] Test *ng build --prod*"
ng build --prod | ./build-report.js > report/ng-build--prod.json
echo "[LOG] Test *ng build --prod --build-optimizer*"
ng build --prod --build-optimizer | ./build-report.js > report/ng-build--prod--build-optimizer.json
echo "[LOG] Test *ng build --prod --build-optimizer --app=aot*"
ng build --prod --build-optimizer --app=aot | ./build-report.js > report/ng-build--prod--build-optimizer--app=aot.json
