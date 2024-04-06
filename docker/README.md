# README

We've failed but someone must document it.

## Description

This directory contains docker compose files for ease of developing.

## Prerequisites

### Docker binaries

Versions might not have to match

* Docker
  * Docker version 24.0.5
* Docker Compose
  * Docker Compose version 2.20.3

### Edit script files

You must edit script and `.env` files

#### `download_db.sh`

This script is used to download whole DB from running AWS instance.

```bash
SQL_URL="hdoev-aurora.cluster-cemim0okoxgy.ap-northeast-2.rds.amazonaws.com"
SQL_USER="admin"
SQL_PASSWORD='cd7Xa^b8S5%$!'
SQL_DATABASE="evcore22"
DATABASE_FILE="./data_backup.sql"
```

* `SQL_URL`: AWS DB address
* `SQL_USER`: AWS DB user name
* `SQL_PASSWORD`: AWS DB user password
* `SQL_DATABASE`: DB name to download
* `DATABASE_FILE`: Downloaded filename, this must be matched to one in `dev.up.sh`

If you can't access DB since it's in isolated EKS pod, you can still execute this command using `kubectl exec` and copy dumped file using `kubectl cp`

**Note**: Someone messed up with DB permission and dumping SQL file spits out some errors, but it does work anyway ¯\\\_(ツ)\_/¯.

```
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces
```

To be clear, this script runs below command

```bash
docker run --rm mysql:5-oracle mysqldump --host "${SQL_URL}" --user="${SQL_USER}" --password="${SQL_PASSWORD}" --routines "${SQL_DATABASE}" > "${DATABASE_FILE}"
```

Which runs following command in docker container installed with `mysql`

```bash
mysqldump --host "${SQL_URL}" --user="${SQL_USER}" --password="${SQL_PASSWORD}" --routines "${SQL_DATABASE}" > "${DATABASE_FILE}"
```

And runs sed to modify stored procedure connection, this prevents collation error when importing it into DB.

```bash
# fix darned collation
sed -i 's/utf8mb4_0900_ai_ci/utf8_general_ci/g' ./data_backup.sql
```

Linux wins another round FTW 🍷

#### `dev.up.sh`

This script is used to setup local development docker containers and initialize DB.

```bash
SQL_PASSWORD="asdf"
SQL_DATABASE="evcore22"
DATABASE_FILE="./data_backup.sql"
```

* `SQL_PASSWORD`: Password of `root` user of dev DB
  * It must match to the password specified in `.env.dev` or `.env.prod`.

* `SQL_DATABASE`: DB name which will be used in dev DB
  * It must match to the DB name downloaded using `download_db.sh`
  * It does not mean `.sql` filename! It's name of DB, e.g. `evcore22` and it should match to specified value as `SQL_DATABASE` in `.env` file.

* `DATABASE_FILE`: This must match to `DATABASE_FILE` in `download_db.sh`

## Usage

### 1. Import DB from AWS instance

```bash
# must be in `docker` directory
./download_db.sh
```

### 2. Create and run development containers

```bash
# must be in `docker` directory
./dev.up.sh
```

As for now, MySQL container initialized with backed up DB is running on `127.0.0.1:3306`, and MyPHPAdmin is running on port `http://127.0.0.1:8081`.

If docker host running on remote machine, you can edit `dev.yaml` to expose it.

```diff
diff --git a/docker/dev.yaml b/docker/dev.yaml
index 268b9d5..472770b 100644
--- a/docker/dev.yaml
+++ b/docker/dev.yaml
@@ -21,7 +21,7 @@ services:
     networks:
       - hdoev
     ports:
-      - 127.0.0.1:8081:80
+      - 192.168.0.130:8081:80
     environment:
       - MYSQL_ROOT_PASSWORD=${SQL_PASSWORD}
     depends_on:
```

### 2-1 Launch HDOEV API Total server

You can begin API server dev cycle now, or launch API and run local instance of web admin page.

1. Edit `.env.dev`, especially,

   * `SQL_USER`, `SQL_PASSWORD`, `SQL_DATABASE`, `SQL_HOST`, `SQL_PORT`
   * `EASYPAY_RETURN_URL`, hostname part must points to itself like `https://127.0.0.1:8080/v1/paymethod/register`

2. Build

   ```bash
   npm run build
   ```

3. Configure and run

   ```bash
   export NODE_ENV=dev
   # I don't actually know what this does
   # export API_MODE=...
   node ./index.js
   ```

Repeating modify, build, run is the development cycle of this service.

### 2-2 Launch HDOEV Web Admin

1. Launch HDOEV API Total server as stated in section **2-1**.

2. Edit `.env` and `src/apis/api.helpers.ts` file to point local instance of API server.

   ```diff
   diff --git a/.env b/.env
   index b8a95080..a420bbc9 100644
   --- a/.env
   +++ b/.env
   @@ -1,6 +1,6 @@
    REACT_APP_AUTH_REGION=ap-northeast-2
    REACT_APP_AUTH_USER_POOL_ID=ap-northeast-2_ITCOGAXVX
    REACT_APP_AUTH_USER_POOL_WEB_CLIENT_ID=29anu8ldbn5p9ni41d39ikktl7
   -REACT_APP_API_URL=https://api.abc7979.net
   +REACT_APP_API_URL=http://127.0.0.1:8080
    # REACT_APP_AUTH_COOKIE_STORAGE_DOMAIN=localhost
    REACT_APP_NAVER_MAP_ClIENT_ID=rb3urd3wxy
   diff --git a/src/apis/api.helpers.ts b/src/apis/api.helpers.ts
   index 6e36b4be..38bb9ae0 100644
   --- a/src/apis/api.helpers.ts
   +++ b/src/apis/api.helpers.ts
   @@ -4,22 +4,7 @@ let defaultApiAddress: string;
    
    const hostname = window.location.hostname;
    
   -if (
   -  // hostname === 'celmeety.com' ||
   -  // hostname === 'www.celmeety.com' ||
   -  // hostname === 'dev.celmeety.com' ||
   -  // hostname === 'man.celmeety.com' ||
   -  // hostname === 'dev.man.celmeety.com' ||
   -  hostname === 'localhost' ||
   -  hostname === '127.0.0.1'
   -) {
   -  defaultApiAddress = 'https://api.abc7979.net';
   -  // 'http://localhost:8080';
   -} else {
   -  defaultApiAddress = 'https://api.abc7979.net';
   -}
   -
   -export const defaultUrl = defaultApiAddress;
   +export const defaultUrl = 'http://127.0.0.1:8080';
    
    // export const refreshToken = async () => {
    //   return await new Promise(async (resolve, reject) => {
   ```

3. Run react web server

   ```bash
   npm run start
   ```

### 3. Stop and remove development containers

This script nukes and remove MySQL and MyPHPAdmin containers.

```bash
./dev.down.sh
```
