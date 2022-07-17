FROM jarredsumner/bun:edge

WORKDIR /usr/src/app

COPY . .

COPY package*.json ./

RUN bun install

RUN npm run build

#COPY --chown=node:node  /usr/src/app/ /usr/src/app/

#USER node

EXPOSE 3000

CMD [ "bun", "run", "start" ]
