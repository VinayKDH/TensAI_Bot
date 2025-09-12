Deploying the messaging endpoint to Azure App Service

This folder contains a minimal Node/Express app that exposes `/api/messages` for the Bot Framework.

Files:
- server.js  -> minimal endpoint using BotFrameworkAdapter and the project's GenericCommandHandler if present
- package.json -> Node dependencies and start script

Quick Azure App Service deployment (CLI)
1) Login and set subscription
   az login
   az account set --subscription "<your-subscription>"

2) Create resource group / app service plan / webapp (replace placeholders)
   az group create -n myResourceGroup -l eastus
   az appservice plan create -n myPlan -g myResourceGroup --sku B1 --is-linux
   az webapp create -g myResourceGroup -p myPlan -n my-tensaibot --runtime "NODE|18-lts"

3) Configure app settings (set the Bot ID, Bot Password, and other envs)
   az webapp config appsettings set -g myResourceGroup -n my-tensaibot --settings \
     BOT_ID="<your-app-id>" BOT_PASSWORD="<your-client-secret>" NODE_ENV=production

4) Deploy (zip deploy from repo root)
   cd ..
   zip -r deploy.zip deploy
   az webapp deployment source config-zip -g myResourceGroup -n my-tensaibot --src deploy.zip

5) After deploy, set the Bot Channels registration messaging endpoint to:
   https://my-tensaibot.azurewebsites.net/api/messages
   or if you have custom domain dev2.tens-ai.com, map DNS and use that as the messaging endpoint.

Notes
- If you want to use your `src/` code instead of the minimal handler, replace the handler require in server.js to point to your real entry (or copy src files into deploy/).
- Ensure `BOT_PASSWORD` is set as an App Setting in the App Service (do not commit secrets to git).
- If you need HTTPS with a custom domain (dev2.tens-ai.com), add a custom domain and TLS certificate to your App Service and update Azure DNS accordingly.
