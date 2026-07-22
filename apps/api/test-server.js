const { handler } = require('./netlify/functions/server');

async function run() {
  try {
    const res = await handler({
      path: '/',
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: {}
    }, {});
    console.log("SUCCESS:", res);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
