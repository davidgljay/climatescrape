FROM node
MAINTAINER "David Jay <davidgljay@gmail.com>"
LABEL updated_at = "2015-7-26" version = .03
LABEL description = "A crawler for scanning city websites and sites about city policy for analysis."
COPY ./ /home/cityscan
EXPOSE 80
WORKDIR /home/cityscan
ENV ELASTIC_HOST =54.85.208.63
ENV ELASTIC_PORT=9200
ENV SQL_HOST =climatescrape.cibwdgfmijjb.us-east-1.rds.amazonaws.com
ENV SQL_PORT = 3306
ENV FIREBASE_URL =https://boiling-torch-581.firebaseIO.com/
RUN [ "sh", "./setvars.sh" ]
RUN ["npm", "install"]
CMD node task

