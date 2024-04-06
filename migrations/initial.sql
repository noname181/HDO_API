
CREATE TABLE IF NOT EXISTS `AppConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `app_version` VARCHAR(255) NULL,
    `force_update_flag` TINYINT NULL,
    `dynamic_link` VARCHAR(255) NULL,
    `popup_title` VARCHAR(255) NULL,
    `popup_body` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `AppSettings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `auto_login_enabled` BOOLEAN NOT NULL DEFAULT true,
    `notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
    `ads_enabled` BOOLEAN NOT NULL DEFAULT true,
    `app_version` VARCHAR(255) NOT NULL,
    `map_app` INTEGER NOT NULL DEFAULT 0,
    `app_display` INTEGER NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `usersNewId` BIGINT UNSIGNED NULL,
    `is_marketing` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `BankCards` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cardNo` VARCHAR(255) NOT NULL,
    `billingKey` VARCHAR(255) NULL,
    `cardBrand` VARCHAR(255) NULL,
    `cardIssuer` VARCHAR(255) NULL,
    `is_favorited` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `BannerModels` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NULL,
    `number` INTEGER NULL,
    `image` VARCHAR(255) NULL,
    `secondaryImage` JSON NULL,
    `view` INTEGER NULL DEFAULT 0,
    `bannerPosition` VARCHAR(255) NULL,
    `banner_sliding_yn` BOOLEAN NULL,
    `startdate` DATETIME(0) NOT NULL,
    `enddate` DATETIME(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `option` VARCHAR(255) NULL,
    `url` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Bookings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `b_time_in` DATETIME(0) NOT NULL,
    `b_time_out` DATETIME(0) NOT NULL,
    `b_date` DATETIME(0) NOT NULL,
    `b_status` VARCHAR(255) NOT NULL DEFAULT 'reserved',
    `scanType` TINYINT NOT NULL DEFAULT 1,
    `chargeType` TINYINT NOT NULL DEFAULT 1,
    `maxParkFee` DECIMAL(9, 1) NULL,
    `unitPrice` DECIMAL(9, 1) NULL,
    `totalPrice` DECIMAL(9, 1) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,
    `vehicleId` INTEGER UNSIGNED NULL,
    `chgs_id` INTEGER UNSIGNED NULL,
    `chg_id` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CarWashes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `car_number` INTEGER NOT NULL,
    `coupon_count` INTEGER NOT NULL DEFAULT 0,
    `price` VARCHAR(255) NULL,
    `purchase_date` DATETIME(0) NULL,
    `address` VARCHAR(255) NULL,
    `date_use` VARCHAR(255) NULL,
    `member_name` VARCHAR(255) NOT NULL,
    `is_used_service` BOOLEAN NOT NULL DEFAULT false,
    `assignment` VARCHAR(255) NULL,
    `use_where` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CategoryInquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryName` TEXT NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ChargerModelFWs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelId` INTEGER NOT NULL,
    `fwVer` VARCHAR(255) NOT NULL,
    `fwFileName` VARCHAR(255) NOT NULL,
    `fwFileUrl` VARCHAR(255) NOT NULL,
    `isLast` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ChargerModels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelCode` VARCHAR(255) NOT NULL,
    `manufacturerId` VARCHAR(255) NOT NULL,
    `modelName` VARCHAR(255) NOT NULL,
    `maxKw` INTEGER NOT NULL,
    `speedType` VARCHAR(255) NOT NULL,
    `connectorType` VARCHAR(255) NOT NULL,
    `channelCount` INTEGER NOT NULL,
    `lastFirmwareVer` VARCHAR(255) NULL,
    `pncAvailable` BOOLEAN NULL,
    `useYN` BOOLEAN NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `charger_models_model_code`(`modelCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ChargerPayments` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `car_number` VARCHAR(255) NOT NULL,
    `charge_speed` VARCHAR(255) NOT NULL,
    `charge_time` VARCHAR(255) NULL,
    `charge_pay` VARCHAR(255) NOT NULL,
    `payment_method` VARCHAR(255) NOT NULL,
    `payment_time` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ChargingStationClusters` (
    `id` CHAR(36) NOT NULL,
    `bias` DOUBLE NOT NULL,
    `zoomLevel` DOUBLE NOT NULL,
    `size` INTEGER UNSIGNED NULL,
    `point` JSON NULL,
    `center` point NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ChargingStationSettlements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stationName` VARCHAR(255) NULL,
    `stationID` VARCHAR(255) NULL,
    `chargerID` VARCHAR(255) NULL,
    `totalPowerKW` FLOAT NULL,
    `totalFee` INTEGER NULL,
    `totalChargingTime` INTEGER NULL,
    `settlementStartTime` DATETIME(0) NULL,
    `settlementEndTime` DATETIME(0) NULL,
    `result` VARCHAR(255) NULL,
    `sapStartTime` DATETIME(0) NULL,
    `sapEndTime` DATETIME(0) NULL,
    `sapResult` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ChrgOperInfos` (
    `chgs_Id` INTEGER NOT NULL AUTO_INCREMENT,
    `chgsDay` VARCHAR(10) NOT NULL,
    `chgsGubun` ENUM('STATION', 'CARWASH') NOT NULL,
    `chgsOpYN` BOOLEAN NOT NULL DEFAULT true,
    `chgsOpTime` TIME(0) NULL,
    `chgsClTime` TIME(0) NULL,
    `chgsImStTime` TIME(0) NOT NULL,
    `chgsImTrTime` TIME(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `compositeIndex`(`chgsDay`, `chgsGubun`),
    PRIMARY KEY (`chgs_Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CodeLookUps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `divCode` VARCHAR(32) NOT NULL,
    `divComment` VARCHAR(255) NULL,
    `sequence` INTEGER NULL,
    `descVal` SMALLINT NULL,
    `descInfo` VARCHAR(255) NULL,
    `isSubCode` BOOLEAN NULL DEFAULT false,
    `use` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`, `divCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Configs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `divCode` VARCHAR(255) NOT NULL,
    `divComment` VARCHAR(255) NULL,
    `cfgVal` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,

    UNIQUE INDEX `configs_div_code`(`divCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Consultations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `regNo` VARCHAR(255) NOT NULL,
    `messageId` BIGINT UNSIGNED NULL,
    `ktApiId1` VARCHAR(255) NULL,
    `ktApiId2` VARCHAR(255) NULL,
    `incomingCd` ENUM('CTP', 'APP', 'MAN') NOT NULL DEFAULT 'CTP',
    `callStartTime` DATETIME(0) NULL,
    `callEndTime` DATETIME(0) NULL,
    `csCls1` VARCHAR(255) NULL,
    `csCls2` VARCHAR(255) NULL,
    `csContent` TEXT NULL,
    `prsContent` TEXT NULL,
    `statusCd` VARCHAR(255) NOT NULL,
    `completeDate` DATETIME(0) NULL,
    `approveWho` VARCHAR(255) NULL,
    `approveAt` DATETIME(0) NULL,
    `csClass` ENUM('CHG', 'BRK', 'PAY', 'REG', 'APP', 'CAR', 'ERR', 'PNC', 'ETC') NOT NULL DEFAULT 'ETC',
    `phoneNo` VARCHAR(255) NULL,
    `transId` BIGINT UNSIGNED NULL,
    `recordFile` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `consultantId` BIGINT UNSIGNED NULL,
    `customerId` BIGINT UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `orgId` INTEGER UNSIGNED NULL,
    `chargerId` VARCHAR(255) NULL,
    `chgs_id` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `consultations_reg_no`(`regNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CouponModels` (
    `id` CHAR(36) NOT NULL,
    `number` VARCHAR(255) NULL,
    `information` VARCHAR(255) NULL,
    `member` VARCHAR(255) NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `division` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CsCallLogs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `regNo` VARCHAR(255) NULL,
    `agentId` BIGINT UNSIGNED NULL,
    `csEvent` VARCHAR(255) NULL,
    `callType` VARCHAR(255) NULL,
    `cid` VARCHAR(255) NULL,
    `uniqueId` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `csState` VARCHAR(255) NULL,
    `recordFile` VARCHAR(255) NULL,
    `extensionNumber` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CsLogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regNo` VARCHAR(255) NOT NULL,
    `messageId` BIGINT UNSIGNED NULL,
    `ktApiId1` VARCHAR(255) NULL,
    `ktApiId2` VARCHAR(255) NULL,
    `incomingCd` ENUM('CTP', 'APP', 'MAN') NOT NULL DEFAULT 'CTP',
    `callStartTime` DATETIME(0) NULL,
    `callEndTime` DATETIME(0) NULL,
    `csCls1` VARCHAR(255) NULL,
    `csCls2` VARCHAR(255) NULL,
    `csContent` TEXT NULL,
    `prsContent` TEXT NULL,
    `statusCd` VARCHAR(255) NOT NULL,
    `completeDate` DATETIME(0) NULL,
    `approveWho` VARCHAR(255) NULL,
    `approveAt` DATETIME(0) NULL,
    `csClass` ENUM('CHG', 'BRK', 'PAY', 'REG', 'APP', 'CAR', 'ERR', 'PNC', 'ETC') NOT NULL DEFAULT 'ETC',
    `hisCreatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `consultantId` BIGINT UNSIGNED NULL,
    `customerId` BIGINT UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `orgId` INTEGER UNSIGNED NULL,
    `csId` BIGINT UNSIGNED NULL,
    `phoneNo` VARCHAR(255) NULL,
    `transId` BIGINT UNSIGNED NULL,
    `recordFile` VARCHAR(255) NULL,
    `chgs_id` VARCHAR(255) NULL,

    UNIQUE INDEX `cs_logs_reg_no_seq`(`regNo`),
    UNIQUE INDEX `cs_logs_cs_id_seq`(`csId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CsMessages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phoneNo` VARCHAR(255) NULL,
    `text_message` VARCHAR(500) NULL,
    `regNo` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `csId` BIGINT UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CsScripts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scriptName` VARCHAR(255) NULL,
    `scrptContent` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `scriptType` VARCHAR(255) NULL,
    `scriptComment` VARCHAR(255) NULL,
    `scriptCategory` VARCHAR(255) NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CsStates` (
    `csLogId` VARCHAR(36) NOT NULL,
    `regNo` VARCHAR(255) NULL,
    `seq` INTEGER NULL,
    `statusCd` SMALLINT NULL,
    `prsContent` TEXT NULL,
    `completeDate` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`csLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CsTransfers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transPart` VARCHAR(255) NULL,
    `transWhom` VARCHAR(255) NULL,
    `transAt` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `csId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `EnvChargeCPOs` (
    `busiId` VARCHAR(4) NOT NULL,
    `bnm` VARCHAR(32) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`busiId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `EnvChargeStationTrans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statNm` VARCHAR(255) NOT NULL,
    `statId` VARCHAR(255) NOT NULL,
    `chgerType` VARCHAR(255) NOT NULL,
    `addr` VARCHAR(255) NOT NULL,
    `coordinate` point NULL,
    `lat` VARCHAR(255) NULL,
    `lng` VARCHAR(255) NULL,
    `busiId` VARCHAR(255) NULL,
    `bnm` VARCHAR(255) NULL,
    `maxOutput` VARCHAR(255) NULL,
    `method` VARCHAR(255) NULL,
    `parkingFree` VARCHAR(255) NULL,
    `limitYn` ENUM('N', 'Y') NULL,
    `limitDetail` VARCHAR(255) NULL,
    `note` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `EnvChargeStations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statNm` VARCHAR(255) NOT NULL,
    `statId` VARCHAR(255) NOT NULL,
    `chgerType` VARCHAR(255) NOT NULL,
    `addr` VARCHAR(255) NOT NULL,
    `coordinate` point NULL,
    `lat` VARCHAR(255) NULL,
    `lng` VARCHAR(255) NULL,
    `busiId` VARCHAR(255) NULL,
    `bnm` VARCHAR(255) NULL,
    `maxOutput` VARCHAR(255) NULL,
    `method` VARCHAR(255) NULL,
    `parkingFree` VARCHAR(255) NULL,
    `limitYn` ENUM('N', 'Y') NULL,
    `limitDetail` VARCHAR(255) NULL,
    `note` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `EnvChargerOrgs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statNm` VARCHAR(255) NOT NULL,
    `statId` VARCHAR(255) NOT NULL,
    `chgerId` VARCHAR(255) NOT NULL,
    `chgerType` VARCHAR(255) NOT NULL,
    `addr` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `lat` VARCHAR(255) NULL,
    `lng` VARCHAR(255) NULL,
    `useTime` VARCHAR(255) NOT NULL,
    `busiId` VARCHAR(255) NULL,
    `bnm` VARCHAR(255) NULL,
    `busiNm` VARCHAR(255) NULL,
    `busiCall` VARCHAR(255) NULL,
    `stat` VARCHAR(255) NOT NULL,
    `statUpdDt` VARCHAR(255) NULL,
    `lastTsdt` VARCHAR(255) NULL,
    `lastTedt` VARCHAR(255) NULL,
    `nowTsdt` VARCHAR(255) NULL,
    `output` VARCHAR(255) NULL,
    `method` VARCHAR(255) NULL,
    `kind` VARCHAR(255) NULL,
    `kindDetail` VARCHAR(255) NULL,
    `parkingFree` VARCHAR(255) NULL,
    `note` VARCHAR(255) NULL,
    `limitYn` VARCHAR(255) NULL,
    `limitDetail` VARCHAR(255) NULL,
    `delYn` VARCHAR(255) NULL,
    `delDetail` VARCHAR(255) NULL,
    `trafficYn` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `EnvChargerTrans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statNm` VARCHAR(255) NOT NULL,
    `statId` VARCHAR(255) NOT NULL,
    `chgerId` VARCHAR(255) NOT NULL,
    `chgerType` VARCHAR(255) NOT NULL,
    `addr` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `lat` VARCHAR(255) NULL,
    `lng` VARCHAR(255) NULL,
    `stat` VARCHAR(255) NOT NULL,
    `statUpdDt` VARCHAR(255) NULL,
    `nowTsdt` VARCHAR(255) NULL,
    `output` VARCHAR(255) NULL,
    `method` VARCHAR(255) NULL,
    `parkingFree` VARCHAR(255) NULL,
    `note` VARCHAR(255) NULL,
    `limitYn` ENUM('N', 'Y') NULL,
    `limitDetail` VARCHAR(255) NULL,
    `busiId` VARCHAR(255) NULL,
    `bnm` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `EnvChargers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statNm` VARCHAR(255) NOT NULL,
    `statId` VARCHAR(255) NOT NULL,
    `chgerId` VARCHAR(255) NOT NULL,
    `chgerType` VARCHAR(255) NOT NULL,
    `addr` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `lat` VARCHAR(255) NULL,
    `lng` VARCHAR(255) NULL,
    `stat` VARCHAR(255) NOT NULL,
    `statUpdDt` VARCHAR(255) NULL,
    `nowTsdt` VARCHAR(255) NULL,
    `output` VARCHAR(255) NULL,
    `method` VARCHAR(255) NULL,
    `parkingFree` VARCHAR(255) NULL,
    `note` VARCHAR(255) NULL,
    `limitYn` ENUM('N', 'Y') NULL,
    `limitDetail` VARCHAR(255) NULL,
    `busiId` VARCHAR(255) NULL,
    `bnm` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ErrorCodes` (
    `errorCode` VARCHAR(10) NOT NULL,
    `errorMsg` VARCHAR(255) NOT NULL,
    `solution` VARCHAR(1024) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,

    UNIQUE INDEX `error_codes_error_msg`(`errorMsg`),
    PRIMARY KEY (`errorCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ErrorLogs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `errorType` VARCHAR(50) NULL,
    `trackID` VARCHAR(50) NULL,
    `msg` VARCHAR(256) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Faqs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `FavoriteChargerStations` (
    `id` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,
    `chargerId` INTEGER UNSIGNED NULL,
    `nickname` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `FileToChargers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `division` ENUM('AD', 'QR', 'TM') NOT NULL DEFAULT 'AD',
    `version` VARCHAR(255) NOT NULL,
    `fileURL` VARCHAR(2048) NULL,
    `newestVersion` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `title` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `categoryName` TEXT NOT NULL,
    `comment` TEXT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Loggings` (
    `id` VARCHAR(36) NOT NULL,
    `timestamp` VARCHAR(255) NOT NULL,
    `level` VARCHAR(255) NOT NULL,
    `message` VARCHAR(255) NOT NULL,
    `info` JSON NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `NoticeModels` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` VARCHAR(255) NULL,
    `regtime` VARCHAR(255) NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `detail` VARCHAR(255) NULL,
    `imageUrl` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Orgs` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` ENUM('DEF', 'HDO', 'STT_DIR', 'STT_FRN', 'CS', 'AS', 'BIZ', 'ALLNC', 'GRP', 'RF_CARD', 'EV_DIV', 'NON', 'X1', 'A1') NOT NULL DEFAULT 'DEF',
    `fullname` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `bizRegNo` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `contactName` VARCHAR(255) NULL,
    `contactPhoneNo` VARCHAR(255) NULL,
    `contactEmail` VARCHAR(320) NULL,
    `deductType` ENUM('NONE', 'DC_PRC', 'FIXED') NOT NULL DEFAULT 'NONE',
    `discountPrice` SMALLINT NOT NULL DEFAULT 0,
    `staticUnitPrice` SMALLINT NOT NULL DEFAULT 0,
    `payMethodId` INTEGER NULL,
    `isPayLater` BOOLEAN NOT NULL DEFAULT false,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `billingDate` JSON NULL,
    `closed` BOOLEAN NOT NULL DEFAULT false,
    `area` INTEGER NULL,
    `branch` INTEGER NULL,
    `haveCarWash` CHAR(1) NOT NULL DEFAULT 'N',
    `haveCVS` CHAR(1) NOT NULL DEFAULT 'N',
    `STN_STN_SEQ` VARCHAR(255) NULL,
    `STN_STN_ID` VARCHAR(255) NULL,
    `STN_STN_GUBUN` VARCHAR(255) NULL,
    `STN_CUST_NO` VARCHAR(255) NULL,
    `STN_ASSGN_AREA_GUBUN` VARCHAR(255) NULL,
    `STN_COST_CT` VARCHAR(255) NULL,
    `STN_PAL_CT` VARCHAR(255) NULL,
    `STN_STN_SHORT_NM` VARCHAR(255) NULL,
    `erp` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `region` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `PayMethods` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `seq` INTEGER NOT NULL,
    `alias` VARCHAR(255) NOT NULL DEFAULT '카드',
    `cardNo` VARCHAR(255) NOT NULL,
    `billingKey` VARCHAR(255) NULL,
    `cardBrand` VARCHAR(255) NULL,
    `cardIssuer` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,
    `orgId` INTEGER UNSIGNED NULL,
    `usersNewId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `PaymentFailLogs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cl_id` BIGINT UNSIGNED NULL,
    `chg_id` INTEGER NULL,
    `connector_id` INTEGER NULL,
    `phone` VARCHAR(255) NULL,
    `applied_unit_price` INTEGER NULL,
    `desired_kwh` FLOAT NULL,
    `res_cd` CHAR(4) NOT NULL,
    `res_msg` VARCHAR(255) NULL,
    `cno` VARCHAR(255) NOT NULL,
    `order_no` VARCHAR(255) NOT NULL,
    `amount` INTEGER UNSIGNED NULL,
    `auth_no` VARCHAR(255) NULL,
    `tran_date` DATETIME(0) NULL,
    `card_no` VARCHAR(255) NULL,
    `issuer_cd` CHAR(3) NULL,
    `issuer_nm` VARCHAR(255) NULL,
    `acquirer_cd` CHAR(3) NULL,
    `acquirer_nm` VARCHAR(255) NULL,
    `noint` CHAR(2) NULL,
    `install_period` TINYINT NULL,
    `used_pnt` INTEGER NULL,
    `escrow_yn` ENUM('Y', 'N') NULL,
    `complex_yn` ENUM('Y', 'N') NULL,
    `stat_cd` CHAR(4) NULL,
    `stat_msg` VARCHAR(255) NULL,
    `van_tid` VARCHAR(255) NULL,
    `van_sno` CHAR(12) NULL,
    `pay_type` CHAR(2) NULL,
    `memb_id` CHAR(8) NULL,
    `noti_type` CHAR(2) NULL,
    `part_cancel_yn` ENUM('Y', 'N') NULL,
    `memb_gubun` VARCHAR(255) NULL,
    `card_gubun` ENUM('N', 'Y', 'G') NULL,
    `card_biz_gubun` ENUM('P', 'C', 'N') NULL,
    `cpon_flag` ENUM('Y', 'N') NULL,
    `cardno_hash` VARCHAR(255) NULL,
    `sub_card_cd` CHAR(3) NULL,
    `bk_pay_yn` ENUM('Y', 'N') NULL,
    `remain_pnt` INTEGER UNSIGNED NULL,
    `accrue_pnt` INTEGER UNSIGNED NULL,
    `canc_date` DATETIME(0) NULL,
    `mgr_amt` INTEGER UNSIGNED NULL,
    `mgr_card_amt` INTEGER UNSIGNED NULL,
    `mgr_cpon_amt` INTEGER UNSIGNED NULL,
    `mgr_seqno` CHAR(20) NULL,
    `mgr_req_msg` VARCHAR(255) NULL,
    `day_rem_pnt` INTEGER UNSIGNED NULL,
    `month_rem_pnt` INTEGER UNSIGNED NULL,
    `day_rem_cnt` INTEGER UNSIGNED NULL,
    `json_response` JSON NULL,
    `createdAt` DATETIME(0) NOT NULL,

    INDEX `cl_id`(`cl_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `PaymentLogs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `payStatus` ENUM('ING', 'PAID', 'UNPAID', 'REFUND') NOT NULL DEFAULT 'ING',
    `payType` ENUM('CHG', 'WASH', 'SUB_P', 'SUB_C', 'RF_ISSUE', 'NOSHOW') NOT NULL DEFAULT 'CHG',
    `kicc_pgCno` VARCHAR(255) NULL,
    `confirmPrice` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `prepaidPrice` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `cancelPrice` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `chargeFee` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `parkFee` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `payMethodDetail` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `kicc_return` JSON NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `payMethodId` INTEGER UNSIGNED NULL,
    `cl_id` BIGINT UNSIGNED NULL,
    `orgId` INTEGER UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,
    `chgs_id` INTEGER UNSIGNED NULL,
    `chg_id` INTEGER NULL,
    `bookingId` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `payment_logs_cl_id`(`cl_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `PaymentNotifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `amount` INTEGER UNSIGNED NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `res_cd` CHAR(4) NOT NULL,
    `res_msg` VARCHAR(255) NULL,
    `cno` VARCHAR(255) NOT NULL,
    `order_no` VARCHAR(255) NOT NULL,
    `auth_no` VARCHAR(255) NULL,
    `tran_date` DATETIME(0) NULL,
    `card_no` VARCHAR(255) NULL,
    `issuer_cd` CHAR(3) NULL,
    `issuer_nm` VARCHAR(255) NULL,
    `acquirer_cd` CHAR(3) NULL,
    `acquirer_nm` VARCHAR(255) NULL,
    `noint` CHAR(2) NULL,
    `install_period` TINYINT NULL,
    `used_pnt` INTEGER NULL,
    `escrow_yn` ENUM('Y', 'N') NULL,
    `complex_yn` ENUM('Y', 'N') NULL,
    `stat_cd` CHAR(4) NULL,
    `stat_msg` VARCHAR(255) NULL,
    `van_tid` VARCHAR(255) NULL,
    `van_sno` CHAR(12) NULL,
    `pay_type` CHAR(2) NULL,
    `memb_id` CHAR(8) NULL,
    `noti_type` CHAR(2) NULL,
    `part_cancel_yn` ENUM('Y', 'N') NULL,
    `memb_gubun` VARCHAR(255) NULL,
    `card_gubun` ENUM('N', 'Y', 'G') NULL,
    `card_biz_gubun` ENUM('P', 'C', 'N') NULL,
    `cpon_flag` ENUM('Y', 'N') NULL,
    `cardno_hash` VARCHAR(255) NULL,
    `sub_card_cd` CHAR(3) NULL,
    `bk_pay_yn` ENUM('Y', 'N') NULL,
    `remain_pnt` INTEGER UNSIGNED NULL,
    `accrue_pnt` INTEGER UNSIGNED NULL,
    `canc_date` DATETIME(0) NULL,
    `mgr_amt` INTEGER UNSIGNED NULL,
    `mgr_card_amt` INTEGER UNSIGNED NULL,
    `mgr_cpon_amt` INTEGER UNSIGNED NULL,
    `mgr_seqno` CHAR(20) NULL,
    `mgr_req_msg` VARCHAR(255) NULL,
    `day_rem_pnt` INTEGER UNSIGNED NULL,
    `month_rem_pnt` INTEGER UNSIGNED NULL,
    `day_rem_cnt` INTEGER UNSIGNED NULL,
    `cl_id` BIGINT UNSIGNED NULL,
    `chg_id` INTEGER NULL,
    `connector_id` INTEGER NULL,
    `phone` VARCHAR(255) NULL,
    `applied_unit_price` INTEGER NULL,
    `desired_kwh` FLOAT NULL,
    `isRetry` VARCHAR(255) NULL DEFAULT 'N',

    UNIQUE INDEX `payment_notifications_id`(`id`),
    INDEX `cl_id`(`cl_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Points` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pointType` ENUM('earn', 'spend') NOT NULL DEFAULT 'earn',
    `pointDate` DATETIME(0) NOT NULL,
    `point` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `bookingId` INTEGER UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `RFCardLists` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `rfCardNo` VARCHAR(255) NOT NULL,
    `usedYN` CHAR(1) NOT NULL DEFAULT 'N',
    `usedAt` DATETIME(0) NULL,
    `lostYN` CHAR(1) NOT NULL DEFAULT 'N',
    `lostAt` DATETIME(0) NULL,
    `expiredYN` CHAR(1) NOT NULL DEFAULT 'N',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `usersNewId` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `r_f_card_lists_rf_card_no`(`rfCardNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `RequestRefunds` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `div_code` ENUM('BROKEN', 'ETC') NOT NULL DEFAULT 'BROKEN',
    `refund_reason` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `noti_id` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,
    `orgId` BIGINT UNSIGNED NULL,
    `oriPgCno` VARCHAR(255) NULL,
    `cancelPgCno` VARCHAR(255) NULL,
    `statusCode` VARCHAR(255) NULL,
    `cancelAmount` INTEGER UNSIGNED NULL,

    INDEX `orgIdIndex`(`orgId`),
    INDEX `userIdIndex`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Reviews` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `chgs_id` INTEGER UNSIGNED NOT NULL,
    `stars` INTEGER NOT NULL,
    `images` JSON NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `number_of_reports` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Roles` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `listPermission` JSON NOT NULL,
    `readPermission` JSON NOT NULL,
    `writePermission` JSON NOT NULL,
    `deletePermission` JSON NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `mainMenu` VARCHAR(255) NOT NULL DEFAULT '대시보드',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `SAP_People` (
    `PERNR` VARCHAR(8) NOT NULL,
    `ENAME` VARCHAR(255) NULL,
    `JKW` VARCHAR(255) NULL,
    `JKW1` VARCHAR(255) NULL,
    `JKG` VARCHAR(255) NULL,
    `JKG1` VARCHAR(255) NULL,
    `EMAIL` VARCHAR(255) NULL,
    `PASSWORD` VARCHAR(255) NULL,
    `PHONE` VARCHAR(255) NULL,
    `deletedAt` DATETIME(0) NULL,
    `ORG` VARCHAR(255) NULL,
    `ORG1` VARCHAR(255) NULL,
    `PHONE2` VARCHAR(255) NULL,
    `DPT` VARCHAR(255) NULL,
    `DPT1` VARCHAR(255) NULL,

    PRIMARY KEY (`PERNR`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `SAP_Person` (
    `PERNR` VARCHAR(8) NULL,
    `ENAME` VARCHAR(60) NULL,
    `GESCH` VARCHAR(1) NULL,
    `BUKRS` VARCHAR(4) NULL,
    `ORGEH` VARCHAR(8) NULL,
    `HIRE_DATE` VARCHAR(10) NULL,
    `JKW` VARCHAR(5) NULL,
    `JKW1` VARCHAR(60) NULL,
    `JKG` VARCHAR(5) NULL,
    `JKG1` VARCHAR(20) NULL,
    `EMAIL` VARCHAR(50) NULL,
    `ZZJKC` VARCHAR(5) NULL,
    `ZJKC1` VARCHAR(20) NULL,
    `PASSWORD` VARCHAR(30) NULL,
    `PHONE` VARCHAR(16) NULL,
    `CDATE` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `MDATE` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `PK_PERNR`(`PERNR`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `SequelizeMeta` (
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `SubCodeLookUps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `divCode` VARCHAR(32) NOT NULL,
    `divComment` VARCHAR(140) NULL,
    `sequence` INTEGER NULL,
    `descVal` SMALLINT NOT NULL,
    `descInfo` VARCHAR(32) NOT NULL,
    `use` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `codeLookUpId` INTEGER NULL,
    `createdWho` VARCHAR(36) NULL,
    `updatedWho` VARCHAR(36) NULL,

    PRIMARY KEY (`id`, `divCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Terms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(255) NULL,
    `useYN` BOOLEAN NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `parentId` INTEGER NULL,
    `version` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `TermsAgrees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `termId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `targetId` TEXT NULL,
    `target` TEXT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `TransactHistoryRecords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recordType` VARCHAR(255) NULL,
    `paymentMethod` VARCHAR(255) NULL,
    `merchantId` VARCHAR(255) NULL,
    `settlementDueDate` VARCHAR(255) NULL,
    `transactionType` VARCHAR(255) NULL,
    `transactionDate` INTEGER NULL,
    `originalTransactionDate` INTEGER NULL,
    `uniqueTransactionId` INTEGER NULL,
    `merchantTransactionId` INTEGER NULL,
    `issuer` VARCHAR(255) NULL,
    `purchaser` VARCHAR(255) NULL,
    `approvalNumber` INTEGER NULL,
    `transactionAmount` BIGINT NULL,
    `pgFee` BIGINT NULL,
    `additionalFee` BIGINT NULL,
    `totalFee` BIGINT NULL,
    `VAT` BIGINT NULL,
    `settlementAmount` BIGINT NULL,
    `productName` VARCHAR(255) NULL,
    `cancellationTransactionNumber` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `TransactHistorySummaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recordType` VARCHAR(1) NULL,
    `totalRecords` BIGINT NULL,
    `totalPages` BIGINT NULL,
    `currentPage` BIGINT NULL,
    `totalApproved` BIGINT NULL,
    `totalApprovedAmount` BIGINT NULL,
    `totalCancellationCount` BIGINT NULL,
    `totalCancellationAmount` BIGINT NULL,
    `totalPointUsageCount` BIGINT NULL,
    `totalPointUsageAmount` BIGINT NULL,
    `totalPointCancellationCount` BIGINT NULL,
    `totalPointCancellationAmount` BIGINT NULL,
    `totalPointAccumulationCount` BIGINT NULL,
    `totalPointAccumulationAmount` BIGINT NULL,
    `totalPointAccumulationCancellationCount` BIGINT NULL,
    `totalPointAccumulationCancellationAmount` BIGINT NULL,
    `totalVatApproved` BIGINT NULL,
    `totalVatCanceled` BIGINT NULL,
    `totalServiceFeeApproved` BIGINT NULL,
    `totalServiceFeeCanceled` BIGINT NULL,
    `reservedField1` BIGINT NULL DEFAULT 0,
    `reservedField2` BIGINT NULL DEFAULT 0,
    `createdAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `TransactSettlementRecords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recordType` VARCHAR(255) NOT NULL,
    `paymentMethod` VARCHAR(255) NULL,
    `merchantId` VARCHAR(255) NULL,
    `settlementDueDate` VARCHAR(255) NULL,
    `transactionType` VARCHAR(255) NULL,
    `transactionDate` INTEGER NULL,
    `originalTransactionDate` INTEGER NULL,
    `uniqueTransactionId` INTEGER NULL,
    `merchantTransactionId` INTEGER NULL,
    `issuer` VARCHAR(255) NULL,
    `purchaser` VARCHAR(255) NULL,
    `approvalNumber` INTEGER NULL,
    `transactionAmount` BIGINT NULL,
    `pgFee` BIGINT NULL,
    `additionalFee` BIGINT NULL,
    `totalFee` BIGINT NULL,
    `VAT` BIGINT NULL,
    `settlementAmount` BIGINT NULL,
    `productName` VARCHAR(255) NULL,
    `cancellationTransactionNumber` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `TransactSettlementSummaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recordType` VARCHAR(255) NOT NULL,
    `totalRecords` BIGINT NULL,
    `totalPages` BIGINT NULL,
    `currentPage` BIGINT NULL,
    `totalSalesCount` BIGINT NULL,
    `totalSalesAmount` BIGINT NULL,
    `totalRefundCount` BIGINT NULL,
    `totalRefundAmount` BIGINT NULL,
    `totalCountSum` BIGINT NULL,
    `totalAmountSum` BIGINT NULL,
    `totalPGFees` BIGINT NULL,
    `totalAdditionalFees` BIGINT NULL,
    `totalFeesSum` BIGINT NULL,
    `totalVAT` BIGINT NULL,
    `totalSettlementAmount` BIGINT NULL,
    `createdAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `TroubleReports` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `troubleTitle` VARCHAR(255) NOT NULL,
    `troubleDesc` VARCHAR(255) NOT NULL,
    `mediaUrl` JSON NULL,
    `reportStatus` ENUM('REPORTED', 'ACCEPTED', 'INPROGRESS', 'COMPLETED') NOT NULL DEFAULT 'REPORTED',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `chg_id` INTEGER UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `chgs_id` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `TroubleShoots` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `troubleType` ENUM('SOFTWARE', 'HARDWARE', 'CABLE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `actionTitle` VARCHAR(255) NOT NULL,
    `actionDetails` VARCHAR(255) NOT NULL,
    `repairCost` VARCHAR(255) NULL,
    `mediaUrl` VARCHAR(2048) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `troubleReportId` INTEGER UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UPSetDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fromDate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `toDate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `upSetId` INTEGER NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `upTimeTableId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UPSets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `desc` VARCHAR(512) NOT NULL,
    `useYN` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UPTimeTableDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `baseTime` TINYINT NOT NULL,
    `price` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `upTimeTableId` INTEGER NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UPTimeTables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `desc` VARCHAR(512) NOT NULL,
    `useYN` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UnitPriceSets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unitPriceSetName` VARCHAR(255) NOT NULL,
    `unitPrice1` INTEGER NOT NULL,
    `unitPrice2` INTEGER NOT NULL,
    `unitPrice3` INTEGER NOT NULL,
    `unitPrice4` INTEGER NOT NULL,
    `unitPrice5` INTEGER NOT NULL,
    `unitPrice6` INTEGER NOT NULL,
    `unitPrice7` INTEGER NOT NULL,
    `unitPrice8` INTEGER NOT NULL,
    `unitPrice9` INTEGER NOT NULL,
    `unitPrice10` INTEGER NOT NULL,
    `unitPrice11` INTEGER NOT NULL,
    `unitPrice12` INTEGER NOT NULL,
    `unitPrice13` INTEGER NOT NULL,
    `unitPrice14` INTEGER NOT NULL,
    `unitPrice15` INTEGER NOT NULL,
    `unitPrice16` INTEGER NOT NULL,
    `unitPrice17` INTEGER NOT NULL,
    `unitPrice18` INTEGER NOT NULL,
    `unitPrice19` INTEGER NOT NULL,
    `unitPrice20` INTEGER NOT NULL,
    `unitPrice21` INTEGER NOT NULL,
    `unitPrice22` INTEGER NOT NULL,
    `unitPrice23` INTEGER NOT NULL,
    `unitPrice24` INTEGER NOT NULL,
    `registerDate` DATETIME(0) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UnitPrices` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `applyDt` DATETIME(0) NOT NULL,
    `useYN` BOOLEAN NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `t0` INTEGER UNSIGNED NOT NULL,
    `t1` INTEGER UNSIGNED NOT NULL,
    `t2` INTEGER UNSIGNED NOT NULL,
    `t3` INTEGER UNSIGNED NOT NULL,
    `t4` INTEGER UNSIGNED NOT NULL,
    `t5` INTEGER UNSIGNED NOT NULL,
    `t6` INTEGER UNSIGNED NOT NULL,
    `t7` INTEGER UNSIGNED NOT NULL,
    `t8` INTEGER UNSIGNED NOT NULL,
    `t9` INTEGER UNSIGNED NOT NULL,
    `t10` INTEGER UNSIGNED NOT NULL,
    `t11` INTEGER UNSIGNED NOT NULL,
    `t12` INTEGER UNSIGNED NOT NULL,
    `t13` INTEGER UNSIGNED NOT NULL,
    `t14` INTEGER UNSIGNED NOT NULL,
    `t15` INTEGER UNSIGNED NOT NULL,
    `t16` INTEGER UNSIGNED NOT NULL,
    `t17` INTEGER UNSIGNED NOT NULL,
    `t18` INTEGER UNSIGNED NOT NULL,
    `t19` INTEGER UNSIGNED NOT NULL,
    `t20` INTEGER UNSIGNED NOT NULL,
    `t21` INTEGER UNSIGNED NOT NULL,
    `t22` INTEGER UNSIGNED NOT NULL,
    `t23` INTEGER UNSIGNED NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UserBlocks` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_request` INTEGER NOT NULL,
    `blocked_user` INTEGER NULL,
    `reported_user` INTEGER NULL,
    `action` ENUM('REPORT_USER', 'REPORT_REVIEW', 'BLOCK_USER') NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `review_id` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UserLogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('ID_FAIL', 'PASSWORD_FAIL', 'SUCCESS', 'BLOCKED', 'INFO', 'EXCEL_DOWNLOAD', 'PRIVATE', 'DELETE', 'CREATE', 'UPDATE', 'LOGOUT', 'INQUIRY') NOT NULL DEFAULT 'SUCCESS',
    `ipAddress` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `userId` BIGINT UNSIGNED NULL,
    `failedLoginNumber` INTEGER NOT NULL DEFAULT 0,
    `note` VARCHAR(255) NULL,
    `details` VARCHAR(2048) NULL,
    `urlPage` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UserOauths` (
    `id` CHAR(36) NOT NULL,
    `oAuthId` VARCHAR(255) NOT NULL,
    `provider` ENUM('KAKAO', 'NAVER', 'GOOGLE', 'APPLE', 'BIO', '') NOT NULL DEFAULT '',
    `email` VARCHAR(320) NULL,
    `profileImage` VARCHAR(2048) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `usersNewId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UsersNews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_old` VARCHAR(255) NULL,
    `accountId` VARCHAR(255) NOT NULL,
    `dupinfo` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'SLEEP', 'BLOCK', 'RETIRED') NOT NULL DEFAULT 'ACTIVE',
    `type` ENUM('MOBILE', 'HDO', 'ORG') NOT NULL DEFAULT 'MOBILE',
    `role` ENUM('ADMIN', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    `saltRounds` VARCHAR(320) NULL,
    `hashPassword` VARCHAR(320) NULL,
    `md5Password` VARCHAR(320) NULL,
    `isRequireResetPassword` BOOLEAN NULL DEFAULT false,
    `isRequireCreateAccount` BOOLEAN NULL DEFAULT false,
    `refreshToken` VARCHAR(320) NULL,
    `dept` VARCHAR(255) NULL,
    `nfcMembershipNo` VARCHAR(255) NULL,
    `physicalCardNo` VARCHAR(255) NULL,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `pwdChgRequired` BOOLEAN NOT NULL DEFAULT false,
    `name` VARCHAR(320) NOT NULL,
    `phoneNo` VARCHAR(255) NULL,
    `email` VARCHAR(320) NULL,
    `subsDCPrice` SMALLINT UNSIGNED NULL DEFAULT 0,
    `deviceId` TEXT NULL,
    `userAgreements` JSON NULL,
    `haveUnpaid` BOOLEAN NULL DEFAULT false,
    `currentAccessDateTime` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `profileImage` VARCHAR(2048) NULL,
    `verifyEmailSendedAt` DATETIME(0) NULL,
    `resetPasswordToken` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `orgId` INTEGER UNSIGNED NULL,
    `roleId` VARCHAR(255) NULL,
    `usersNewId` INTEGER UNSIGNED NULL,
    `lastUsedMacAddr` VARCHAR(255) NULL,
    `birth` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `detailAddress` VARCHAR(255) NULL,
    `zipCode` VARCHAR(255) NULL,
    `number_of_reports` INTEGER NULL DEFAULT 0,
    `lastOnline` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `gender` VARCHAR(255) NULL,

    UNIQUE INDEX `users_news_account_id`(`accountId`),
    UNIQUE INDEX `users_news_phone_no`(`phoneNo`),
    UNIQUE INDEX `users_news_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Vehicles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `manufacturer` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `subType` VARCHAR(255) NULL,
    `year` VARCHAR(255) NOT NULL,
    `batteryCap` DECIMAL(6, 1) NOT NULL,
    `numberPlate` VARCHAR(255) NOT NULL,
    `macAddr` VARCHAR(255) NULL,
    `price` VARCHAR(255) NULL,
    `usePnC` BOOLEAN NOT NULL DEFAULT false,
    `askPnCDate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `mediaUrl` VARCHAR(2048) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `usersNewId` BIGINT UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `WebNotices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `contents` VARCHAR(255) NULL,
    `firstDate` DATETIME(0) NULL,
    `lastDate` DATETIME(0) NULL,
    `imagesUrl` JSON NULL,
    `isActive` ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `WebUserRegs` (
    `id` CHAR(36) NOT NULL,
    `accountId` VARCHAR(320) NULL,
    `status` ENUM('WAIT', 'DONE', 'RESET_PASSWORD') NOT NULL DEFAULT 'WAIT',
    `name` VARCHAR(255) NOT NULL,
    `phoneNo` VARCHAR(255) NULL,
    `role` ENUM('ADMIN', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `orgId` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `XXX-AreaBranches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sequence` INTEGER NOT NULL,
    `area` VARCHAR(32) NOT NULL,
    `areaNo` SMALLINT UNSIGNED NULL DEFAULT 1,
    `branch` VARCHAR(32) NOT NULL,
    `branchNo` SMALLINT UNSIGNED NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `XXX-BizPayMethods` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `orgId` INTEGER UNSIGNED NULL,
    `seq` INTEGER NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT true,
    `alias` VARCHAR(20) NOT NULL,
    `cardNo` VARCHAR(20) NOT NULL,
    `billingKey` VARCHAR(64) NULL,
    `cardBrand` VARCHAR(64) NULL,
    `cardIssuer` VARCHAR(64) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdWho` CHAR(36) NULL,
    `updatedWho` CHAR(36) NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `bank_total_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_day` CHAR(10) NOT NULL DEFAULT '0',
    `deposit_count` INTEGER NOT NULL DEFAULT 0,
    `deposit_amount` INTEGER NOT NULL DEFAULT 0,
    `zif_key` CHAR(20) NOT NULL DEFAULT '0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `bank_transaction_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ZIFKEY` CHAR(20) NOT NULL DEFAULT '0',
    `BUKRS` CHAR(4) NOT NULL DEFAULT '0',
    `SDODT` DATE NULL,
    `BNKCD` CHAR(3) NOT NULL DEFAULT '0',
    `SNDID` CHAR(10) NOT NULL DEFAULT '',
    `RCVID` CHAR(10) NOT NULL DEFAULT '',
    `FBBTY` CHAR(1) NOT NULL DEFAULT '0',
    `LCONO` INTEGER NOT NULL DEFAULT 0,
    `SNDDT` DATE NULL,
    `BAKNO` CHAR(15) NULL DEFAULT '0',
    `TRAGB` CHAR(2) NULL DEFAULT '0',
    `TBKCD` CHAR(3) NULL DEFAULT '0',
    `TRAMT` DECIMAL(17, 0) NULL DEFAULT 0,
    `BALSG` CHAR(1) NULL DEFAULT '0',
    `BAAMT` DECIMAL(17, 0) NULL DEFAULT 0,
    `RAMPT` CHAR(7) NULL DEFAULT '0',
    `TRANM` CHAR(16) NULL DEFAULT '0',
    `BILNO` CHAR(10) NULL DEFAULT '0',
    `OPTI1` CHAR(13) NULL DEFAULT '0',
    `OPTI2` CHAR(13) NULL DEFAULT '0',
    `OPTI3` CHAR(13) NULL DEFAULT '0',
    `CMSCD` CHAR(16) NULL DEFAULT '0',
    `JUMIN` CHAR(13) NULL DEFAULT '0',
    `VBKNO` CHAR(16) NULL DEFAULT '0',
    `KUNNR` CHAR(10) NULL DEFAULT '0',
    `TRATM` TIME(0) NULL,
    `TRADT` VARCHAR(255) NULL,
    `HBKID` CHAR(5) NULL DEFAULT '0',
    `HKTID` CHAR(5) NULL DEFAULT '0',
    `HKONT` CHAR(10) NULL DEFAULT '0',
    `SAKNR` CHAR(10) NULL DEFAULT '0',
    `IOGUB` CHAR(1) NULL DEFAULT '0',
    `POSGB` CHAR(1) NULL DEFAULT '0',
    `POSST` CHAR(1) NULL DEFAULT '0',
    `GJAHR` INTEGER NULL DEFAULT 0,
    `BELNR` CHAR(10) NULL DEFAULT '0',
    `REVBN` CHAR(10) NULL DEFAULT '0',
    `ERRTX` CHAR(73) NULL DEFAULT '0',
    `VERR1` CHAR(1) NULL DEFAULT '0',
    `VERR2` CHAR(1) NULL DEFAULT '0',
    `BENR2` CHAR(10) NULL DEFAULT '0',
    `RVBN2` CHAR(10) NULL DEFAULT '0',
    `VBLNR` CHAR(10) NULL DEFAULT '0',
    `LIFNR` CHAR(10) NULL DEFAULT '0',
    `RZAWE` CHAR(1) NULL DEFAULT '0',
    `BINO2` CHAR(10) NULL DEFAULT '0',
    `BKONT` CHAR(2) NULL DEFAULT '0',
    `EIGR1` CHAR(10) NULL DEFAULT '0',
    `IKBNO` CHAR(10) NULL DEFAULT '0',
    `IKBSQ` INTEGER NULL DEFAULT 0,
    `CTRDT` DATE NULL,
    `ODONO` INTEGER NULL DEFAULT 0,
    `SEQNO` INTEGER NULL DEFAULT 0,
    `BNKGB` CHAR(2) NULL DEFAULT '0',
    `area_id` INTEGER NULL,
    `branch_id` INTEGER NULL,
    `station_name` VARCHAR(255) NULL,
    `station_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `charger_records_tb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_day` CHAR(12) NOT NULL,
    `charger_id` INTEGER NOT NULL,
    `station_id` INTEGER NOT NULL,
    `erp_id` CHAR(8) NOT NULL DEFAULT '0',
    `daycharge_amount` FLOAT NULL,
    `dayignore_amount` FLOAT NULL DEFAULT 0,
    `org_id` INTEGER NOT NULL,
    `mall_id` CHAR(12) NOT NULL,
    `sales_amount` INTEGER NULL DEFAULT 0,
    `payment_method` CHAR(2) NOT NULL,
    `area_id` INTEGER NOT NULL DEFAULT 0,
    `branch_id` INTEGER NOT NULL DEFAULT 0,
    `station_name` VARCHAR(255) NOT NULL DEFAULT '0',
    `transaction_count` INTEGER NOT NULL DEFAULT 0,
    `cancel_count` INTEGER NOT NULL DEFAULT 0,
    `cancel_amount` INTEGER NOT NULL DEFAULT 0,
    `commission_amount` INTEGER NOT NULL DEFAULT 0,
    `deposit_amount` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `data_results_tb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_day` CHAR(12) NOT NULL DEFAULT '0',
    `data_gubun` CHAR(12) NOT NULL DEFAULT '0',
    `data_time` TIMESTAMP(0) NULL,
    `data_trial` INTEGER UNSIGNED NULL,
    `data_results` CHAR(2) NULL,
    `record_count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `envchargercpos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `busiId` VARCHAR(255) NOT NULL,
    `bnm` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `erp_requests_tb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_day` CHAR(12) NOT NULL,
    `erp_id` CHAR(10) NOT NULL,
    `payment_type` CHAR(2) NOT NULL,
    `req_type` CHAR(2) NOT NULL DEFAULT '',
    `erp_trial` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `erp_send_time` DATETIME(0) NOT NULL,
    `erp_send_result` CHAR(2) NULL,
    `erp_send_message` VARCHAR(255) NULL,
    `sent_deletion` CHAR(1) NOT NULL DEFAULT 'N',
    `check_time` DATETIME(0) NULL,
    `check_trial` INTEGER NULL,
    `erp_check_result` CHAR(2) NULL,
    `erp_check_message` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `erp_results_tb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_day` CHAR(12) NULL,
    `erp_id` VARCHAR(255) NOT NULL,
    `req_type` VARCHAR(255) NOT NULL,
    `transfer_time` DATETIME(0) NULL,
    `erp_trial` BOOLEAN NULL,
    `erp_send_result` VARCHAR(255) NULL,
    `erp_send_message` VARCHAR(255) NULL,
    `check_time` DATETIME(0) NULL,
    `check_trial` INTEGER NULL,
    `erp_check_result` VARCHAR(255) NULL,
    `erp_check_message` VARCHAR(255) NULL,

    UNIQUE INDEX `erp_results_tb_data_day_erp_id_req_type`(`data_day`, `erp_id`, `req_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `kicc_total_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sales_date` INTEGER NOT NULL,
    `record_type` VARCHAR(255) NOT NULL,
    `total_records` VARCHAR(255) NOT NULL,
    `total_page` VARCHAR(255) NOT NULL,
    `current_page` VARCHAR(255) NOT NULL,
    `transaction_count` VARCHAR(255) NOT NULL,
    `transaction_amount` VARCHAR(255) NOT NULL,
    `cancel_count` VARCHAR(255) NOT NULL,
    `cancel_amount` VARCHAR(255) NOT NULL,
    `total_count` VARCHAR(255) NOT NULL,
    `total_amount` VARCHAR(255) NOT NULL,
    `pg_commission` VARCHAR(255) NOT NULL,
    `extra_commission` VARCHAR(255) NOT NULL,
    `total_commission` VARCHAR(255) NOT NULL,
    `tax_amount` VARCHAR(255) NOT NULL,
    `adjust_amount` VARCHAR(255) NOT NULL,
    `total_kwh` VARCHAR(255) NULL,
    `ignore_kwh` FLOAT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `kicc_transaction_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `record_id` INTEGER NOT NULL,
    `record_type` VARCHAR(255) NOT NULL DEFAULT 'N',
    `payment_date` VARCHAR(255) NOT NULL,
    `payment_type` VARCHAR(255) NOT NULL,
    `payment_place` VARCHAR(255) NOT NULL,
    `deal_type` VARCHAR(255) NOT NULL,
    `deal_id` VARCHAR(255) NOT NULL DEFAULT '',
    `transaction_id` VARCHAR(255) NOT NULL DEFAULT '',
    `approval_id` VARCHAR(255) NOT NULL,
    `pay_amount` INTEGER NOT NULL DEFAULT 0,
    `org_id` VARCHAR(255) NOT NULL,
    `monthly_payment` VARCHAR(255) NULL,
    `credit_card` VARCHAR(255) NOT NULL,
    `payment_time` VARCHAR(255) NOT NULL,
    `order_person` VARCHAR(255) NULL,
    `balgup_gubun` VARCHAR(255) NULL,
    `cert_gubun` VARCHAR(255) NULL,
    `certification_id` VARCHAR(255) NULL,
    `tax_amount` INTEGER NOT NULL DEFAULT 0,
    `commission_amount` INTEGER NOT NULL DEFAULT 0,
    `business_id` VARCHAR(255) NULL,
    `goods_name` VARCHAR(255) NULL DEFAULT '0000000000',
    `cancel_id` VARCHAR(255) NULL DEFAULT '0',

    UNIQUE INDEX `kicc_transaction_records_transaction_id_deal_type_payment_time`(`transaction_id`, `deal_type`, `payment_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `messageLog` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `csId` BIGINT UNSIGNED NULL,
    `messageType` VARCHAR(255) NULL,
    `chargerId` INTEGER UNSIGNED NULL,
    `textMessage` TEXT NOT NULL,
    `phoneNo` VARCHAR(255) NULL,
    `phoneCaller` VARCHAR(255) NULL,
    `sendDt` DATETIME(0) NULL,
    `returnType` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `chagerKey`(`chargerId`),
    INDEX `csKey`(`csId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sap_evstation_tb` (
    `KUNNR` VARCHAR(255) NOT NULL,
    `NAME1` VARCHAR(255) NOT NULL,
    `VKORG` VARCHAR(255) NOT NULL,
    `VTWEG` VARCHAR(255) NOT NULL,
    `SPART` VARCHAR(255) NULL,
    `VKBUR` VARCHAR(255) NULL,
    `VKGRP` VARCHAR(255) NULL,
    `SORTL` VARCHAR(255) NULL,
    `STRAS` VARCHAR(255) NULL,
    `PSTLZ` VARCHAR(255) NULL,
    `ORT01` VARCHAR(255) NULL,
    `REGIO` VARCHAR(255) NULL,
    `TELF1` VARCHAR(255) NULL,
    `TELFX` VARCHAR(255) NULL,
    `STCD1` VARCHAR(255) NULL,
    `STCD2` VARCHAR(255) NULL,
    `STCDT` VARCHAR(255) NULL,
    `J_1KFTBUS` VARCHAR(255) NULL,
    `J_1KFTIND` VARCHAR(255) NULL,
    `J_1KFREPRE` VARCHAR(255) NULL,
    `KVGR1` VARCHAR(255) NULL,
    `KVGR2` VARCHAR(255) NULL,
    `KVGR3` VARCHAR(255) NULL,
    `VWERK` VARCHAR(255) NULL,
    `PERNR` VARCHAR(255) NULL,
    `account_number` VARCHAR(255) NULL,
    `cost_center` VARCHAR(255) NULL,
    `pr_center` VARCHAR(255) NULL,

    PRIMARY KEY (`KUNNR`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sap_oilstation_tb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stn_stn_seq` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_stn_id` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_val_end_ymd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_val_st_ymd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_stn_gubun` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_cust_no` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_stn_nm` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_stn_short_nm` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_zip_cd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_addr` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_dtl_addr` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_tel_no` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_fax_no` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_biz_no` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_boss_nm` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_biz_kind_nm` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_line_nm` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_own_styl_gubun` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_sales_st_ymd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_sales_end_ymd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_biz_aprv_ymd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_comp_gubun` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_strg_cd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_assgn_dept_cd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_assgn_area_gubun` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_rep_trans_area_gubun` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_rep_sales_ch_consti_id` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_cost_ct` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_pal_ct` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_jnsn_gubun` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_regant_id` VARCHAR(255) NULL DEFAULT '0',
    `stn_reg_date` DATETIME(0) NULL,
    `stn_upder_id` VARCHAR(255) NULL DEFAULT '0',
    `stn_upd_date` DATETIME(0) NULL,
    `stn_erp_if_gubun` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_erp_if_date` DATETIME(0) NULL,
    `stn_updn_gubun` VARCHAR(255) NULL DEFAULT '0',
    `stn_updn_date` DATETIME(0) NULL,
    `stn_erp_if_emsg` VARCHAR(255) NULL DEFAULT '0',
    `stn_erp_stn_id` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_fos_if_yn` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_ipgm_bank_cd` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_chld_acct_no` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_hc_no` VARCHAR(255) NULL DEFAULT '0',
    `stn_carbt_sale_yn` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_cls_appl_hm` VARCHAR(255) NULL DEFAULT '0',
    `stn_rep_trans_area_seq` VARCHAR(255) NULL DEFAULT '0',
    `stn_cr_jsyb` VARCHAR(255) NOT NULL DEFAULT '0',
    `stn_cr_date` VARCHAR(255) NULL DEFAULT '0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charge_connections` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `chargeAmount` INTEGER NOT NULL,
    `chargedAmount` INTEGER NOT NULL,
    `estimateTime` DATETIME(0) NULL,
    `startTime` DATETIME(0) NOT NULL,
    `endTime` DATETIME(0) NOT NULL,
    `chargeAmountKwh` INTEGER NULL,
    `chargeAmountPercent` INTEGER NULL,
    `chargeStatus` VARCHAR(255) NULL,
    `selectedTime` DATETIME(0) NULL,
    `canceledTime` DATETIME(0) NULL,
    `completedTime` DATETIME(0) NULL,
    `remainTime` INTEGER NULL,
    `regtime` DATETIME(0) NULL,
    `currentBatteryPercent` INTEGER NULL,
    `timeCharged` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `usersNewId` BIGINT UNSIGNED NULL,
    `chgs_id` INTEGER UNSIGNED NULL,
    `chg_id` INTEGER UNSIGNED NULL,
    `bookingId` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charge_local_ic_pay_phone_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `chg_id` INTEGER NULL,
    `connector_id` INTEGER NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charge_local_ic_pays` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `chg_id` INTEGER NULL,
    `ordernumber` VARCHAR(255) NULL,
    `paid_fee` INTEGER NULL,
    `connector_id` INTEGER NULL,
    `cardkey` VARCHAR(255) NULL,
    `approvalnumber` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `phone` VARCHAR(255) NULL,
    `payInfoYn` ENUM('N', 'Y') NULL DEFAULT 'N',
    `autoRefundYn` ENUM('N', 'Y') NULL DEFAULT 'N',
    `applied_unit_price` INTEGER NULL,
    `desired_kwh` FLOAT NULL,
    `pg_cno` VARCHAR(255) NULL,
    `mall_id` VARCHAR(255) NULL,
    `cl_id` BIGINT UNSIGNED NULL,

    INDEX `cl_id_index`(`cl_id`),
    INDEX `pg_cno_index`(`pg_cno`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charge_requests` (
    `cr_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `chg_id` BIGINT UNSIGNED NULL,
    `conn_id` SMALLINT UNSIGNED NULL,
    `card_id` BIGINT UNSIGNED NULL,
    `request_kwh` INTEGER NULL,
    `request_percent` INTEGER NULL,
    `request_amt` INTEGER NULL,
    `actual_calculated_amt` INTEGER NULL,
    `dummy_pay_amt` INTEGER NULL,
    `paymentResponse` JSON NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `userId` BIGINT UNSIGNED NULL,
    `request_type` ENUM('CANCEL', 'REFUND', 'PAYMENT') NULL,
    `chargingLogId` BIGINT UNSIGNED NULL,
    `pgCno` VARCHAR(255) NULL,
    `refund_amt` INTEGER NULL,

    PRIMARY KEY (`cr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charge_unit_price_item_years` (
    `cupi_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cupi_hour` INTEGER UNSIGNED NOT NULL,
    `cupi_m01` FLOAT NOT NULL DEFAULT 0,
    `cupi_m02` FLOAT NOT NULL DEFAULT 0,
    `cupi_m03` FLOAT NOT NULL DEFAULT 0,
    `cupi_m04` FLOAT NOT NULL DEFAULT 0,
    `cupi_m05` FLOAT NOT NULL DEFAULT 0,
    `cupi_m06` FLOAT NOT NULL DEFAULT 0,
    `cupi_m07` FLOAT NOT NULL DEFAULT 0,
    `cupi_m08` FLOAT NOT NULL DEFAULT 0,
    `cupi_m09` FLOAT NOT NULL DEFAULT 0,
    `cupi_m10` FLOAT NOT NULL DEFAULT 0,
    `cupi_m11` FLOAT NOT NULL DEFAULT 0,
    `cupi_m12` FLOAT NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `cup_id` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`cupi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charge_unit_price_years` (
    `cup_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cup_name` VARCHAR(100) NOT NULL,
    `cup_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cup_use_yn` CHAR(1) NOT NULL DEFAULT 'Y',
    `cup_default_yn` CHAR(1) NOT NULL DEFAULT 'N',
    `cup_base_id` INTEGER UNSIGNED NULL,
    `cup_add_percent` FLOAT NOT NULL DEFAULT 0,
    `cup_nonmember_price` INTEGER NOT NULL DEFAULT 0,
    `cup_env_price` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `chg_id` INTEGER UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`cup_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charger_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ch_insert_dt` VARCHAR(255) NOT NULL,
    `chg_id` BIGINT UNSIGNED NULL,
    `chgs_id` BIGINT UNSIGNED NULL,
    `chgs_name` VARCHAR(255) NULL,
    `ch_code` ENUM('START', 'END', 'ONLINE', 'OFFLINE', 'EMER_STOP', 'EMER_BACK', 'START_REPAIR', 'END_REPAIR', 'ERROR', 'START_BOOKING', 'END_BOOKING') NULL,
    `ch_code_nm` VARCHAR(255) NULL,
    `ch_remark` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ch_insert_dt`(`ch_insert_dt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charger_ocpp_logs` (
    `col_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `division` ENUM('AD', 'QR', 'TM', 'CD') NOT NULL DEFAULT 'AD',
    `version` VARCHAR(255) NOT NULL,
    `fileURL` VARCHAR(2048) NULL,
    `newestVersion` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `chg_id` INTEGER UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `file_id` INTEGER NULL,

    PRIMARY KEY (`col_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charger_state_logs` (
    `csl_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `csl_station_charger_id` VARCHAR(255) NOT NULL,
    `csl_channel` SMALLINT NOT NULL DEFAULT 0,
    `csl_charger_state` VARCHAR(255) NULL,
    `csl_charging_state` VARCHAR(255) NULL,
    `csl_kwh` FLOAT NULL,
    `csl_kwh_cumulative` DOUBLE NULL,
    `csl_direction` ENUM('recv', 'send', 'manual') NULL,
    `csl_json` TEXT NULL,
    `cs_temperature` FLOAT NULL,
    `csl_vendor` VARCHAR(255) NULL,
    `csl_model` VARCHAR(255) NULL,
    `csl_firmware` VARCHAR(255) NULL,
    `csl_created_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `csl_addinfo1` VARCHAR(255) NULL,
    `csl_addinfo2` VARCHAR(255) NULL,
    `csl_addinfo3` VARCHAR(255) NULL,
    `csl_event_code` INTEGER NULL,
    `csl_rssi` INTEGER NULL,
    `csl_last_ins` CHAR(255) NULL,
    `csl_mdn` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `chg_id` INTEGER UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `csl_se_code` VARCHAR(255) NULL,
    `csl_sve_code` VARCHAR(255) NULL,

    PRIMARY KEY (`csl_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charger_states` (
    `cs_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `chg_id` INTEGER UNSIGNED NULL,
    `cs_station_charger_id` VARCHAR(255) NOT NULL,
    `cs_channel` SMALLINT NOT NULL DEFAULT 1,
    `cs_charger_state` VARCHAR(255) NULL,
    `cs_charging_state` VARCHAR(255) NULL,
    `cs_kwh` FLOAT NULL,
    `cs_kwh_cumulative` DOUBLE NULL,
    `cs_temperature` FLOAT NULL,
    `cs_vendor` VARCHAR(255) NULL,
    `cs_model` VARCHAR(255) NULL,
    `cs_firmware` VARCHAR(255) NULL,
    `cs_created_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cs_last_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cs_addinfo1` VARCHAR(255) NULL,
    `cs_addinfo2` VARCHAR(255) NULL,
    `cs_addinfo3` VARCHAR(255) NULL,
    `cs_event_code` INTEGER NULL,
    `cs_rssi` INTEGER NULL,
    `cs_last_ins` CHAR(255) NULL,
    `cs_mdn` VARCHAR(255) NULL,
    `cs_cur_member` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `cs_se_code` VARCHAR(255) NULL,
    `cs_sve_code` VARCHAR(255) NULL,

    PRIMARY KEY (`cs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_chargers` (
    `chg_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `chgs_id` INTEGER UNSIGNED NOT NULL,
    `chg_channel` SMALLINT UNSIGNED NULL DEFAULT 1,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `isJam` CHAR(1) NOT NULL DEFAULT 'N',
    `chg_charger_id` VARCHAR(255) NOT NULL,
    `chg_alias` VARCHAR(255) NULL,
    `chg_sn` VARCHAR(255) NULL,
    `chg_fw_ver` VARCHAR(255) NULL,
    `chg_cell_number` VARCHAR(255) NULL,
    `usePreset` CHAR(1) NOT NULL DEFAULT 'N',
    `upSetId` INTEGER UNSIGNED NULL,
    `chg_unit_price` INTEGER UNSIGNED NULL,
    `chg_use_yn` CHAR(1) NOT NULL DEFAULT 'Y',
    `qrTransDate` DATETIME(0) NULL,
    `adTransDate` DATETIME(0) NULL,
    `tmTransDate` DATETIME(0) NULL,
    `fwTransDate` DATETIME(0) NULL,
    `adVersion` VARCHAR(255) NULL,
    `termsVersion` VARCHAR(255) NULL,
    `reservable` CHAR(1) NOT NULL DEFAULT 'N',
    `resetAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `qrcode` VARCHAR(255) NULL,
    `deletedAt` DATETIME(0) NULL,
    `chargerModelId` INTEGER NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `deeplink` VARCHAR(255) NULL,
    `mall_id` VARCHAR(255) NULL,
    `mall_id2` VARCHAR(255) NULL,
    `charger_status` VARCHAR(255) NULL,
    `cdTransDate` DATETIME(0) NULL,

    UNIQUE INDEX `compositeIndex`(`chg_charger_id`),
    UNIQUE INDEX `chg_id_chg_channel`(`chg_id`, `chg_channel`),
    PRIMARY KEY (`chg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charging_logs` (
    `cl_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cl_channel` SMALLINT UNSIGNED NOT NULL,
    `cl_order_user_no` VARCHAR(255) NOT NULL,
    `cl_order_mac_addr` VARCHAR(255) NULL,
    `cl_transaction_id` VARCHAR(255) NULL,
    `cl_start_datetime` DATETIME(0) NULL,
    `cl_end_datetime` DATETIME(0) NULL,
    `cl_unplug_datetime` DATETIME(0) NULL,
    `cl_kwh` FLOAT NULL,
    `soc` INTEGER NULL,
    `remain` INTEGER NULL,
    `useType` ENUM('CREDIT', 'RF', 'NFC', 'APP', 'PNC') NOT NULL DEFAULT 'CREDIT',
    `desired_kwh` FLOAT NULL,
    `desired_percent` INTEGER NULL,
    `appliedUnitPrice` SMALLINT UNSIGNED NULL,
    `cl_start_meter` FLOAT NULL,
    `cl_stop_meter` FLOAT NULL,
    `cl_datetime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `payMethodDetail` VARCHAR(255) NULL,
    `authAmtCharge` INTEGER UNSIGNED NULL,
    `authAmtPark` INTEGER UNSIGNED NULL,
    `authDate` DATETIME(0) NULL,
    `receivePhoneNo` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `chg_id` INTEGER UNSIGNED NULL,
    `chgs_id` INTEGER UNSIGNED NULL,
    `usersNewId` BIGINT UNSIGNED NULL,
    `pg_cno` VARCHAR(255) NULL,
    `order_no` VARCHAR(255) NULL,
    `approval_number` VARCHAR(255) NULL,
    `desired_amt` INTEGER NULL,
    `reason` VARCHAR(255) NULL,
    `chargeFee` INTEGER NULL,
    `ignored_kwh` FLOAT NULL,
    `payCompletedYn` ENUM('N', 'Y', '') NULL DEFAULT 'N',
    `afterAction` VARCHAR(255) NULL,
    `expectedAmt` INTEGER UNSIGNED NULL,
    `afterPaidAmt` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`cl_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charging_pay_fail_after_actions` (
    `aa_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cl_id` BIGINT UNSIGNED NOT NULL,
    `afterAction` VARCHAR(255) NULL,
    `costReason` VARCHAR(255) NULL,
    `costUserId` BIGINT UNSIGNED NULL,
    `paidUserId` BIGINT UNSIGNED NULL,
    `amount` INTEGER UNSIGNED NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    INDEX `cl_id`(`cl_id`),
    PRIMARY KEY (`aa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charging_pay_fail_logs` (
    `cpf_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cl_id` BIGINT UNSIGNED NOT NULL,
    `resCd` VARCHAR(255) NULL,
    `resMsg` VARCHAR(255) NULL,
    `statusCode` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    INDEX `cl_id`(`cl_id`),
    PRIMARY KEY (`cpf_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_charging_stations` (
    `chgs_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `chgs_station_id` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `chgs_name` VARCHAR(255) NOT NULL,
    `coordinate` point NULL,
    `chrgStartTime` TIME(0) NULL,
    `chrgEndTime` TIME(0) NULL,
    `washStartTime` TIME(0) NULL,
    `washEndTime` TIME(0) NULL,
    `chgs_kepco_meter_no` VARCHAR(255) NULL,
    `isUse` CHAR(1) NOT NULL DEFAULT 'Y',
    `chgs_car_wash_yn` CHAR(1) NOT NULL,
    `chgs_aff_only` JSON NULL,
    `chgs_field_desc` VARCHAR(255) NULL,
    `area_code_id` VARCHAR(255) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deletedAt` DATETIME(0) NULL,
    `orgId` INTEGER UNSIGNED NULL,
    `chgs_operator_manager_id` BIGINT UNSIGNED NULL,
    `createdWho` BIGINT UNSIGNED NULL,
    `updatedWho` BIGINT UNSIGNED NULL,
    `activeStationYN` CHAR(1) NOT NULL DEFAULT 'N',

    PRIMARY KEY (`chgs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sb_daily_amount` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mall_id` VARCHAR(255) NOT NULL,
    `calculate_date` VARCHAR(255) NOT NULL,
    `amount` BIGINT NOT NULL DEFAULT 0,

    UNIQUE INDEX `mall_id_calculate_date`(`mall_id`, `calculate_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `sys_logs_defaults` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(255) NULL,
    `message` VARCHAR(2048) NOT NULL,
    `meta` VARCHAR(2048) NULL,
    `timestamp` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
