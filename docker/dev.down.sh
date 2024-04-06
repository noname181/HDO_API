#!/bin/bash

docker compose --env-file ../.env.dev --file ./dev.yaml down
