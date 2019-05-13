// This file is the pm2 process manager configuration. Run 'npm i && npm run build' first
module.exports = {
    apps: [
        {
            name: 'NIM API',
            script: './build/index.js',
            env: {
                DEBUG: 'nim:*'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
