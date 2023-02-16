FROM node:16-alpine as client

WORKDIR /usr/app/client/
COPY package*.json ./
COPY package-lock*.json ./
RUN npm install -qy
COPY client/ ./
RUN npm run build


# Setup the server

FROM node:16-alpine

WORKDIR /usr/app/
COPY --from=client /usr/app/client/build/ ./client/build/

WORKDIR /usr/app/server/
COPY package*.json ./
COPY package-lock*.json ./
RUN npm install -qy
COPY server/ ./

ENV PORT 4000

EXPOSE 4000

CMD ["npm", "start:server"]