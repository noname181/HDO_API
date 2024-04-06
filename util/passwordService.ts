// export const hashPassword = async (password: string): Promise<string> {

import { compare, genSalt, hash } from "bcrypt";
import { IConfig } from "../config/config";

// }
export class PasswordService {
  constructor(private config: IConfig) {}

  async hash(
    password: string
  ): Promise<{ salt: string; passwordHashed: string }> {
    const saltRounds = this.config.salt;
    const salt = await genSalt(saltRounds);
    const passwordHashed = await hash(password, salt);

    return {
      salt,
      passwordHashed,
    };
  }

  async compare(password: string, passwordHashed: string): Promise<boolean> {
    return await compare(password, passwordHashed);
  }
}
