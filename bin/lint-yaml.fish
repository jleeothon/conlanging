#!/usr/bin/env fish

git ls-files '*.yaml' | xargs -n 300 npx prettier --write --parser yaml --prose-wrap always
