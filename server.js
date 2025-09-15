// Minimal messaging endpoint suitable for Azure App Service
// Deploy this file (and package.json below) to Azure App Service and set the
// environment variables BOT_ID and BOT_PASSWORD.

const express = require('express');
const { BotFrameworkAdapter } = require('botbuilder');

// Optional: import your existing command handler to reuse logic
let GenericCommandHandler = null;
try {
  // prefer the project's handler if present
  GenericCommandHandler = require('../src/genericCommandHandler').GenericCommandHandler;
} catch (e) {
  // fallback: create a tiny echo handler
  GenericCommandHandler = class {
    async handleCommandReceived(context, state) {
      const text = (context.activity && context.activity.text) ? context.activity.text : 'Hello';
      return `Echo: ${text}`;
    }
  };
}

const app = express();
app.use(express.json());

const adapter = new BotFrameworkAdapter({
  appId: process.env.BOT_ID || process.env.MicrosoftAppId || '',
  appPassword: process.env.BOT_PASSWORD || process.env.MicrosoftAppPassword || '',
});

adapter.onTurnError = async (context, error) => {
  console.error('onTurnError:', error);
  await context.sendActivity('Sorry, it looks like something went wrong.');
};

const handler = new GenericCommandHandler();

app.post('/api/messages', (req, res) => {
  adapter.process(req, res, async (context) => {
    try {
      // Pass a minimal in-memory state object. For production, replace with durable state store.
      const state = {};
      if (handler && handler.handleCommandReceived) {
        const reply = await handler.handleCommandReceived(context, state);
        if (reply) await context.sendActivity(reply);
      } else {
        await context.sendActivity('No handler available');
      }
    } catch (err) {
      console.error('Handler error:', err);
      await context.sendActivity('Handler error');
    }
  });
});

// Lightweight health endpoints for deployment verification
app.get('/', (req, res) => {
  res.status(200).send('TensAI Bot is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

const port = process.env.PORT || 3978;
app.listen(port, () => console.log(`Messaging endpoint listening on ${port}`));
