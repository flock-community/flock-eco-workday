#!/bin/sh

sleep 3

while read line; do
  curl --request POST -vvv -sL \
    --fail \
    --header "Content-Type: application/json" \
    --data-binary "@$line" http://kratos:4434/admin/identities
done < <(find /tmp -type f -name "*.json")
echo $PWD
curl -vvv \
  --header "Accept: application/json" \
  http://kratos:4434/admin/identities | jq '[.[] | {"id": .id, "email": .traits.email} ] ' > /tmp/existing_identities.json
