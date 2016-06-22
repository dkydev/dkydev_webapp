#!/bin/bash
ssh -i ../key2.pem ubuntu@dkydev.com << EOF
 sudo /etc/init.d/node-app stop
 sudo rm -rf /home/dkydev_com/webapp/*
EOF

rsync -Pav -e 'ssh -i ../key.pem' ./* ubuntu@dkydev.com:/home/dkydev_com/webapp

ssh -i ../key2.pem ubuntu@dkydev.com << EOF
  sudo /etc/init.d/node-app start
EOF