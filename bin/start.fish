#!/usr/bin/env fish

# In Ubuntu, this would be used
# inotifywait -m -e modify -e create --format '%w' src/**/index.tex
set root (realpath (dirname (status -f))/..)
and fswatch -e modify -e modify -e create $root/src/**/*.tex | while read file
    set indexfile (dirname $file)/index.tex
    and if not test -f $indexfile
        echo "WARNING $indexfile does not exist"
        continue
    end

    and set outdir $root/out
    and set dir (dirname $file)
    and set jobname (basename $dir)
    and pushd $dir
    and echo "Working directory: $dir"
    and xelatex -interaction=nonstopmode -jobname=$jobname -output-directory=$outdir $indexfile
    popd
end
