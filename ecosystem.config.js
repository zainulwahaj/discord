// PM2 should use ecosystem.config.cjs in this ESM project.
const config = {
  apps: [
    {
      name: 'discord-gemini-bot',
      script: 'src/index.js',
      interpreter: 'node',
      watch: false,
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
    },
  ],
};

export default config;
