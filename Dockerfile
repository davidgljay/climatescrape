FROM node
MAINTAINER "David Jay <davidgljay@gmail.com>"
LABEL updated_at = "2015-08-12" version = .04
LABEL description = "A crawler for scanning city websites and sites about city policy for analysis."
RUN apt-get update
COPY ./ /home/cityscan
WORKDIR /home/cityscan
RUN npm install
CMD node task

