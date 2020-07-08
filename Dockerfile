FROM ubuntu:18.04
RUN apt-get update -y
RUN TZ=America/Berlin DEBIAN_FRONTEND=noninteractive apt-get install -y texlive-xetex inotify-tools
VOLUME ["/usr/share/texlive"]
COPY ./bin/entrypoint.sh /entrypoint.sh
