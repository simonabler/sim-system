import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.APP_ENV,
  name: process.env.APP_NAME,
  url: process.env.APP_URL,
  port: process.env.APP_PORT,
  jwt_secret: process.env.APP_JWT_SECRET,
  jwt_expires: process.env.APP_JWT_EXPIRES,
  pdf_slip_path: process.env.APP_PDF_SLIP_PATH,
  pdf_bill_path: process.env.APP_PDF_BILL_PATH,
  printer: process.env.APP_PRINTER,

}));
