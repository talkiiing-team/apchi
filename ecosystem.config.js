module.exports = {
  apps: [
    {
      name: 'apchi-poke',
      script: './poke/dist/index.js',
      instances: 1,
      env_production: {
        PORT: 3071,
      },
    },
  ],
}
