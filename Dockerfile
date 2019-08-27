FROM nginx:1.15.12-alpine
COPY ./dist/ /usr/share/nginx/html
COPY ./robots.txt /usr/share/nginx/html/robots.txt
COPY ./nginx/default.conf /etc/nginx/conf.d/