import { v4 } from "uuid";

export const idGenerator = (): string => {
  return v4();
};
