const model = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
import * as fs from 'fs';
import { configuration } from '../../config/config';
import { UploadService } from '../uploadService/uploadService';

export const dailyLog = async (previousDate: string) => {
  try {
    const logData = await model.UserLogs.findAll({
      where: {
        createdAt: { [Op.like]: `%${previousDate}%` },
      },
    });
    const filePath = `./logger/${previousDate}.json`;

    await Promise.all(
      logData.map(async (record: any) => {
        await fs.appendFileSync(filePath, JSON.stringify(record.dataValues) + '\n', 'utf-8');
      })
    );
  } catch (error) {
    console.log('error: ', error);
  }
};

export const uploadLogFile = async (previousDate: string) => {
  try {
    const config = configuration();
    const uploadService = new UploadService(config);
    await uploadService.uploadLogFile(previousDate)
  } catch (error) {
    console.log('error: ', error);
  }
};
