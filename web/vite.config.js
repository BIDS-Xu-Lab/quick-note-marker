import { fileURLToPath, URL } from 'node:url'
import * as app_config from 'config'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  const base_path = process.env.VITE_BASE_PATH || './';
  console.log(`* NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`* mode: ${mode}`);
  console.log(`* base_path: ${base_path}`);

  // read the text content from system_prompt.md and update patient_helper.SYSTEM_PROMPT
  return defineConfig({
    base: base_path,

    server: {
      host: '0.0.0.0',
      port: 8901,
      watch: {
        usePolling: true,
      },
    },

    define: {
      app_config: app_config.default,
    },

    plugins: [
      vue(),
      // vueDevTools(),
      tailwindcss(),

      Components({
        resolvers: [
          PrimeVueResolver()
        ]
      }),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },

    build: {
      target: ['es2022', 'chrome89', 'firefox89', 'safari15'],
    },
  })
}