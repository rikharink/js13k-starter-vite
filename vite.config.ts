import svg from 'vite-plugin-svgo';
import { rollupPluginSpglsl } from 'spglsl';
import { advzipPlugin, ectPlugin, defaultViteBuildOptions, roadrollerPlugin } from 'js13k-vite-plugins';
import { defineConfig } from 'vite';
import glslMangle from './glsl-mangle.json';
import replace from '@rollup/plugin-replace';

const buildOptions = defaultViteBuildOptions;
buildOptions.terserOptions!.compress!['drop_console'] = true;

export default defineConfig({
  build: buildOptions,
  plugins: [
    svg({
      multipass: true,
    }),
    rollupPluginSpglsl({
      minify: true,
      mangle: true,
      mangle_global_map: glslMangle,
    }),
    {
      ...replace({
        preventAssignment: true,
        values: {
          ...glslMangle,
        },
      }),
      apply: 'build',
    },
    roadrollerPlugin(),
    ectPlugin(),
    advzipPlugin(),
  ],
});
