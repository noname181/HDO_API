FROM node:18

ENV NODE_ENV=dev

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN npm install

COPY . .

RUN ["chmod", "755", "./modules/checkplus/Linux/CPClient_linux_x64" ]

RUN npm run build

RUN npm run prod:migrate:up

EXPOSE 8080

CMD ["npm", "run", "start"]