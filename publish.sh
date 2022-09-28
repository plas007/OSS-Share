#!/bin/sh
echo $(rm -rf "../../node/myServer-koa/public/oss")
echo $(cp -r "./dist/" "../../node/myServer-koa/public/oss")
