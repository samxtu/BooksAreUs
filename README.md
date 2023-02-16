# BooksAreUs

## A Library management app

Books are us is a web app that allow users access to books from their internet devices.
It is a virtual library that users can view and read their favorite books using any device that can connect with the internet.
BooksAreUs exposes RESTful API endpoints that anyone can use to utilise the resources.

### Built With

* [NodeJS](https://nodejs.org/en/) - A JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.
* [PostgreSQL](https://www.postgresql.org/) - A powerful, open source object-relational database system.
* [Sequelize](http://docs.sequelizejs.com/) - A promise-based ORM for Node.js v4 and up. It supports the dialects PostgreSQL, MySQL, SQLite and MSSQL and features solid transaction support, relations, read replication and more.
* [ExpressJS](http://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js.
* [Reactjs](https://reactjs.org/) - A declarative component-based JavaScript library for building user interfaces
* [Material UI](https://mui.com) - A simple, customizable, and accessible library of React components. 

#### Getting Started

```markdown
# Clone your fork of this repository

# Ensure docker is installed in your OS

# Switch to project directory
cd booksareus

# Set up environment variables
Fill the missing fields in .env.example and change it to .env

# Set up and run all containers
docker-compose up --build

<!-- # Run database migrations on the database container
npm run migrate:dev -->

<!-- # Start the app
- In development mode, run the following from two separate terminal windows/tabs
npm run start:client
npm run start:dev -->

<!-- # Dockerized app not tested for now just npm install and run start:server and start:client on different console tabs, untill I work on testing the dockerized app -->

navigate to http://localhost:8081 in your browser

- For production build, run:
npm run build
then
npm run start
```

#### Features

* Authentication is via [**JSON Web Tokens**](https://jwt.io/)
* Login/Sign up to gain access to routes
* A library of books from different categories
* Ability to read books repeatedly
* Track your reading history
* Admin access to add and modify book details

#### API Documentation

* <https://booksareus.netlify.app/api-docs>

#### License

This project is published under the MIT License. Ckeck the License.md for details.
