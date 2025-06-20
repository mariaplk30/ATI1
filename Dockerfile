FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    apache2 \
    python3 \
    python3-pip \
    libapache2-mod-wsgi-py3

RUN mkdir -p /var/www/ATI
COPY . /var/www/ATI
COPY apache.conf /etc/apache2/sites-available/000-default.conf

RUN chown -R www-data:www-data /var/www/ATI
RUN a2enmod wsgi

EXPOSE 8080

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
