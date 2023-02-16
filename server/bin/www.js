import serverless from 'serverless-http';

import app from '../app';

export const PORT = parseInt(process.env.PORT, 10) || 4000;

const server = serverless(app);
// const server = http.createServer(app);


// server.listen(PORT, () => {
//   process.stdout.write(`server running on port: ${PORT}\n`);
// });
export default server;