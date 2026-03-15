// The file contents for the currenft environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrlHTTP: 'http://localhost:9000/api/v1',
  apiUrlHTTPS: 'https://localhost:9000/api/v1'
};
