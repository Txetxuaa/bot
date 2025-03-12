require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const http = require('http'); // Añadimos el módulo HTTP

// Configura el cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Variables de entorno
const AZURE_KEY = process.env.AZURE_KEY; // Clave de Azure Translator
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT; // Endpoint de Azure Translator
const AZURE_REGION = process.env.AZURE_REGION; // Región de Azure (opcional)

// Mensaje de confirmación cuando el bot se conecta
client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

// Función para detectar el idioma del texto
async function detectLanguage(text) {
  try {
    const response = await axios.post(
      `${AZURE_ENDPOINT}/detect?api-version=3.0`,
      [{ text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Ocp-Apim-Subscription-Region': AZURE_REGION, // Solo si tu recurso requiere región
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data[0].language; // Devuelve el código del idioma detectado (ej: "es", "it")
  } catch (error) {
    console.error('Error detectando idioma:', error.response?.data || error.message);
    return null;
  }
}

// Función para traducir texto usando Azure Translator
async function translateText(text, toLang) {
  try {
    const response = await axios.post(
      `${AZURE_ENDPOINT}/translate?api-version=3.0&to=${toLang}`,
      [{ text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Ocp-Apim-Subscription-Region': AZURE_REGION, // Solo si tu recurso requiere región
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data[0].translations[0].text;
  } catch (error) {
    console.error('Error traduciendo:', error.response?.data || error.message);
    return null;
  }
}

// Evento para traducir mensajes
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignorar mensajes de otros bots

  const text = message.content;
  let translatedText = null;
  let flag = '';

  // Detectar el idioma del mensaje
  const detectedLanguage = await detectLanguage(text);

  if (detectedLanguage === 'es') { // Si el mensaje está en español
    translatedText = await translateText(text, 'it'); // Traducir a italiano
    flag = '🇮🇹'; // Bandera de Italia
  } else if (detectedLanguage === 'it') { // Si el mensaje está en italiano
    translatedText = await translateText(text, 'es'); // Traducir a español
    flag = '🇪🇸'; // Bandera de España
  }

  // Enviar la traducción al canal
  if (translatedText) {
    message.channel.send(`${flag} ${translatedText}`);
  }
});

// Iniciar el bot
client.login(process.env.DISCORD_TOKEN);

// Servidor HTTP simple para evitar que Render marque el servicio como fallido
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot de Discord en funcionamiento\n');
});

server.listen(3000, () => {
  console.log('Servidor HTTP escuchando en el puerto 3000');
});
