const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const { existsSync } = require('fs');

// Only include compiled migration assets if the typeorm dist output already exists
const migrationsInput = join(__dirname, '../../dist/typeorm/apps/server/src/migrations');
const migrationAsset = existsSync(migrationsInput)
  ? [{
      glob: '**/*.js',
      input: migrationsInput,
      output: 'migrations',
    }]
  : [];

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/server'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  resolve: {
    alias: {
      src: join(__dirname, 'src'),
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [
        './src/assets',
        ...migrationAsset,
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};
