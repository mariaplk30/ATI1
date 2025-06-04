FROM ubuntu:latest
RUN apt-get update && apt-get install -y apache2
COPY . /var/www/html/
EXPOSE 80

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]


# docker build -t reto06 .
# docker run -tid --name container-reto06 -p 8080:80 reto06