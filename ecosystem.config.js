module.exports = {
  apps: [
    {
      name: 'nova-backend',
      cwd: './server',
      script: 'npm',
      args: 'run dev',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'nova-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
