FROM node
MAINTAINER "David Jay <davidgljay@gmail.com>"
LABEL updated_at = "2015-7-25" version = .03
LABEL description = "A crawler for scanning city websites and sites about city policy for analysis."
COPY ./ /home/cityscan
EXPOSE 80
WORKDIR /home/cityscan
ENV ELASTIC_HOST = '54.85.208.63'
ENV ELASTIC_PORT = '9200'
ENV SQL_HOST = ''
ENV SQL_PORT = ''
CMD node task

