const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_SECRETS, TOKENS } = require('./constants');

const CLIENT_ID = GOOGLE_SECRETS.client_id;
const CLIENT_SECRET = GOOGLE_SECRETS.client_secret;
const REDIRECT_URI = 'http://localhost:8080/oauth';

class Gmail {
    constructor() {
        this.oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        this.oAuth2Client.setCredentials(TOKENS);
        this.gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
        this.messages = this.gmail.users.messages;
    }

    async getMessage(id) {
        try {
            const res = await this.messages.get({
                userId: 'me',
                id: id,
            });
            return res.data;
        } catch (err) {
            console.error('Error fetching message:', err);
            throw err;
        }
    }

    async getUnreadMessagesList(n) {
        try {
            const res = await this.messages.list({
                userId: 'me',
                q: 'is:unread',
            });
            const messages = res.data.messages;
            if (messages.length > 0) {
                let results = []
                for (let i = 0; i < n; i++) {
                    results.push(await this.getMessage(messages[i].id))
                };
                return results;
            } else {
                console.log('No unread messages found.');
                return [];
            }
        } catch (err) {
            console.error('The API returned an error:', err);
            throw err;
        }
    }
    async getMessagesList(n) {
        try {
            const res = await this.messages.list({
                userId: 'me',
            });
            const messages = res.data.messages;
            if (messages.length > 0) {
                let results = []
                for (let i = 0; i < n; i++) {
                    results.push(await this.getMessage(messages[i].id))
                };
                return results;
            } else {
                console.log('No messages found.');
                return [];
            }
        } catch (err) {
            console.error('The API returned an error:', err);
            throw err;
        }
    }

}

(async () => {
    const gmailClient = new Gmail();

    try {
        const messagesList = await gmailClient.getUnreadMessagesList(3);
        console.log('Messages List:', messagesList);
    } catch (err) {
        console.error('Error:', err);
    }
})();
