FROM node
MAINTAINER "David Jay <davidgljay@gmail.com>"
LABEL updated_at = "2015-08-02" version = .03
LABEL description = "A crawler for scanning city websites and sites about city policy for analysis."
COPY ./
WORKDIR /home/cityscan
CMD node task

