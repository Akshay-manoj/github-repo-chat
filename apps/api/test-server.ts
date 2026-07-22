import { handler } from './netlify/functions/server';

async function run() {
  try {
    const res = await handler({
      path: '/',
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: {}
    } as any, {} as any);
    console.log("SUCCESS:", res);
    process.exit(0);
  } catch(e) {
    console.error("ERROR:", e);
    process.exit(1);
  }
}
run();
