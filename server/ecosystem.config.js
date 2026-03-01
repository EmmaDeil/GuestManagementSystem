module.exports = {
  apps: [{
    name: 'guest-management-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
    
    // Logging options
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Environment-specific settings
    env: {
      NODE_ENV: 'development'
    }
  }]
};
