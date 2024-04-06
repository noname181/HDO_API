#!/bin/bash

SQL_PASSWORD="asdf"
SQL_DATABASE="evcore22"
DATABASE_FILE="./data_backup.sql"

if [ ${#DATABASE_FILE} == 0 ]; then 
    echo "database file path is not specified. please edit DATABASE_FILE in docker/$(basename $0)"
fi

docker compose --env-file ../.env.dev --file ./dev.yaml up -d

# create DB
docker exec docker-db-1 mysql --user root --password="${SQL_PASSWORD}" --execute="CREATE DATABASE IF NOT EXISTS ${SQL_DATABASE} CHARACTER SET utf8 COLLATE utf8_general_ci;"

# create DB user named admin
docker exec docker-db-1 mysql --user root --password="${SQL_PASSWORD}" --execute="CREATE USER 'admin'@'%';"
docker exec docker-db-1 mysql --user root --password="${SQL_PASSWORD}" --execute="GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' REQUIRE NONE WITH GRANT OPTION MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;"

# import DB
docker exec --interactive docker-db-1 mysql --user root --password="${SQL_PASSWORD}" ${SQL_DATABASE} < "${DATABASE_FILE}"
