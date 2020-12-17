#!/usr/bin/env fish

git ls-files '*.md' | xargs -n 300 npx prettier --write --parser markdown --prose-wrap always
