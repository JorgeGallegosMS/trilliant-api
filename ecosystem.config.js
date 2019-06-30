module.exports = {
  apps : [{
    name: 'API',
    script: './app.js',
    instances: "max",
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
    
  }],
};
