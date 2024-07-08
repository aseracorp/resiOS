#!/bin/bash

VERSION=$(grep -o '\"version\": \"[^\"]*\"' package.json | sed 's/[^0-9a-z.-]//g' | sed 's/version//g')
LATEST="latest"

# if branch is unstable in git for circle ci
if [ -n "$CIRCLE_BRANCH" ]; then
  if [ "$CIRCLE_BRANCH" != "master" ]; then
    LATEST="$LATEST-$CIRCLE_BRANCH"
  fi
fi

echo "Pushing aseracorp/resios:$VERSION and aseracorp/resios:$LATEST"

sh build.arm64.sh

docker build \
  -t aseracorp/resios:$VERSION-arm64 \
  -t aseracorp/resios:$LATEST-arm64 \
  -f dockerfile.arm64 \
  --platform linux/arm64 \
  .

docker push aseracorp/resios:$VERSION-arm64
docker push aseracorp/resios:$LATEST-arm64