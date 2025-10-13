FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY build/web-mobile-production-us ./
COPY Docker/nginx.conf /etc/nginx/nginx.conf

RUN chmod -R 755 /usr/share/nginx/html && \
  chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

