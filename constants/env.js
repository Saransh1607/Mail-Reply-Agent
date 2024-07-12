require('dotenv').config();

const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || ""
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || ""
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || ""
const AZURE_OPENAI_VERSION = process.env.AZURE_OPENAI_VERSION || ""

const GMAIL = {

    EMAIL: process.env.GMAIL_EMAIL,
    PASSWORD: process.env.GMAIL_PASSWORD,
    HOST: process.env.GMAIL_HOST,
}
const OUTLOOK = {

    EMAIL: process.env.OUTLOOK_EMAIL,
    PASSWORD: process.env.OUTLOOK_PASSWORD,
    HOST: process.env.OUTLOOK_HOST,
}
module.exports = { AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_VERSION, GMAIL, OUTLOOK };
