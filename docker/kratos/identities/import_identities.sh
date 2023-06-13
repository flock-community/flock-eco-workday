#!/bin/bash
sleep 3

while read line; do
  curl --request POST -vvv -sL \
    --header "Content-Type: application/json" \
    --data-binary "@$line" http://kratos:4434/admin/identities
done < <(find . -type f -name "*.json")


