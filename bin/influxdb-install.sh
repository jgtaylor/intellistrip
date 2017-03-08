#!/bin/bash

# very dirty! ultra basic steps to get it running.

wget https://dl.influxdata.com/influxdb/releases/influxdb-1.2.0_linux_armhf.tar.gz
tar xvfz influxdb-1.2.0_linux_armhf.tar.gz

useradd -d /var/lib/influxdb -U -M -r -s /bin/bash influxdb
cp -rp influxdb-1.2.0-1/usr/* /usr/
cp -rp influxdb-1.2.0-1/etc/* /etc/
cp -rp influxdb-1.2.0-1/var/* /var/
chown -R influxdb:influxdb /var/lib/influxdb

# Add service for reboot
cp /usr/lib/influxdb/scripts/influxdb.service /lib/systemd/service/
systemctl enable influxdb.service
systemctl start influxdb.service
systemctl status influxdb.service

