FROM docker.io/library/nginx:1.31.9-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY index.html /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/
COPY static/ /usr/share/nginx/html/static/
COPY scripts/ /usr/share/nginx/html/scripts/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

