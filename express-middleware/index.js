import ansi from "ansi-colors";
import TejLogger from "./../index.js";

const logger = new TejLogger('HTTP Request');
const {italic, bold, blue, white, bgGreen, bgRed, whiteBright} = ansi;

async function logHttpRequest(req, res, next) {
  const startTime = new Date();
  res.on('finish', () => {
    const method = italic(whiteBright(req.method));
    const body = req.query || req.body;
    const endpoint = bold(req.url.split('?')[0].replace(/\/$/, ''));
    const statusCode = res.statusCode >= 400 ?
        bgRed(whiteBright(bold(`✖ ${res.statusCode}`))) :
        bgGreen(whiteBright(bold(`✔ ${res.statusCode}`)));

    const duration = white(`${new Date() - startTime}ms`);
    const payload = `${blue('Request')}: ${white(
        JSON.stringify(body))}`;
    const nextLine = '\n';

    logger.log(
        italic('Incoming request'),
        nextLine,
        method,
        endpoint,
        statusCode,
        duration,
        nextLine,
        payload,
    );
  });

  next();
}

export default logHttpRequest
