#!/bin/bash

VERSION=$(grep -o '\"version\": \"[^\"]*\"' package.json | sed 's/[^0-9a-z.-]//g' | sed 's/version//g')
LATEST="latest"

# if branch is unstable in git for circle ci
if [ -n "$CIRCLE_BRANCH" ]; then
  if [ "$CIRCLE_BRANCH" != "master" ]; then
    LATEST="$LATEST-$CIRCLE_BRANCH"
  fi
fi

echo "Pushing aseracorp/resiOS:$VERSION and aseracorp/resiOS:$LATEST"

sh build.arm64.sh

docker build \
  -t aseracorp/resiOS:$VERSION-arm64 \
  -t aseracorp/resiOS:$LATEST-arm64 \
  -f dockerfile.arm64 \
  --platform linux/arm64 \
  .

docker push aseracorp/resiOS:$VERSION-arm64
docker push aseracorp/resiOS:$LATEST-arm64