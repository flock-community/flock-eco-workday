#!/bin/sh

cd /home/ory || exit 1

echo "Deleting all relations"
keto relation-tuple delete-all --insecure-disable-transport-security --format=json --force
sleep 1
echo "Parsing all relations from zanzibar formatted rules"
keto relation-tuple parse ./zanzibar-rules.txt --format=json > ./zanzibar-rules.json
sleep 1

echo "Creating all relation tuples in keto"
keto relation-tuple create ./zanzibar-rules.json  --insecure-disable-transport-security

exit 0
