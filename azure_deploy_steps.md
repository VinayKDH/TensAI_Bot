Azure deployment steps for TensAI Bot (tailored for the existing `deploy/` folder)

Pre-reqs: Azure CLI installed, logged in (`az login`), and you have rights to create resource groups and App Service.

1) Variables - replace values below

RESOURCE_GROUP=myTensAI_rg
LOCATION=eastus
PLAN=myTensAI_Plan
WEBAPP=tensaibot-webapp-12345   # must be unique
RUNTIME="NODE|18-lts"

2) Create resource group and plan

az group create -n $RESOURCE_GROUP -l $LOCATION
az appservice plan create -n $PLAN -g $RESOURCE_GROUP --sku B1 --is-linux

3) Create the web app

az webapp create -g $RESOURCE_GROUP -p $PLAN -n $WEBAPP --runtime $RUNTIME

4) Configure app settings (set BOT_ID and BOT_PASSWORD and other envs)

az webapp config appsettings set -g $RESOURCE_GROUP -n $WEBAPP --settings \
  BOT_ID="<your-app-id>" BOT_PASSWORD="<your-client-secret>" NODE_ENV=production \
  VITE_BASIC_URL="https://dev2.tens-ai.com" VITE_PUBLIC_API_URL="https://dev2.tens-ai.com/api/"

# Add other VITE_* envs as required by your bot here.

5) Deploy with ZIP deploy

cd <repo-root>
zip -r deploy.zip deploy
az webapp deployment source config-zip -g $RESOURCE_GROUP -n $WEBAPP --src deploy.zip

6) Optional: Configure custom domain dev2.tens-ai.com
- Map A/CNAME records in DNS to your webapp. Use `az webapp config hostname add` to add the hostname.
- Validate domain and bind TLS cert (App Service managed certificate or import a cert).

7) Update Bot Channels Registration (Azure Portal)
- Set the messaging endpoint to: https://dev2.tens-ai.com/api/messages (or https://<your-webapp>.azurewebsites.net/api/messages)

8) Logs and Troubleshooting
- Tail logs:
  az webapp log tail -g $RESOURCE_GROUP -n $WEBAPP
- Dump app settings:
  az webapp config appsettings list -g $RESOURCE_GROUP -n $WEBAPP

Notes on secrets and Key Vault
- For production, store BOT_PASSWORD in Azure Key Vault and reference it from App Service using Key Vault references in App Settings.
