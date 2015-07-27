FROM node
MAINTAINER "David Jay <davidgljay@gmail.com>"
LABEL updated_at = "2015-7-26" version = .03
LABEL description = "A crawler for scanning city websites and sites about city policy for analysis."
COPY ./ /home/cityscan
EXPOSE 80
WORKDIR /home/cityscan
RUN [ "sh", "./setvars.sh" ]
RUN ["npm", "install"]
CMD node task

