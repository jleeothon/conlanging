#!/usr/bin/env fish

ls *.md texts/*.md grammar/*.md word-list/*.md | xargs -n 300 npx prettier --write --parser markdown --prose-wrap always
