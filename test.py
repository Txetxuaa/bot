const AZURE_KEY = process.env.AUShnctxLah3UehAGybcY0Grkrq1J0jGFFqoXiCyBG3wTNn7979kJQQJ99BBAC5RqLJXJ3w3AAAbACOGRBnG;
const AZURE_ENDPOINT = process.env.https://api.cognitive.microsofttranslator.com/; // Asegúrate de que el endpoint sea correcto
const AZURE_REGION = process.env.westeurope; // Región de Azure (opcional)

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