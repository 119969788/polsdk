module.exports = {
  apps: [{
    name: 'polsdk-bot',
    script: './dist/index.js',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    // 延迟重启，避免频繁重启
    min_uptime: '10s',
    max_restarts: 10,
    // 如果程序异常退出，延迟重启
    restart_delay: 4000
  }]
};
