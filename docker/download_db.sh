#!/bin/bash

SQL_URL="hdoev-aurora.cluster-cemim0okoxgy.ap-northeast-2.rds.amazonaws.com"
SQL_USER="admin"
SQL_PASSWORD='cd7Xa^b8S5%$!'
SQL_DATABASE="evcore22"
DATABASE_FILE="./data_backup.sql"

docker run --rm mysql:5-oracle mysqldump --host "${SQL_URL}" --user="${SQL_USER}" --password="${SQL_PASSWORD}" --routines "${SQL_DATABASE}" > "${DATABASE_FILE}"

# fix darned collation
sed -i 's/utf8mb4_0900_ai_ci/utf8_general_ci/g' ./data_backup.sql
