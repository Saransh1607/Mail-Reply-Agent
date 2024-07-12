
const Imap = require('imap');
const { simpleParser } = require('mailparser');


class EmailClient {
    constructor(user, password, host) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        this.imapConfig = {
            user: user,
            password: password,
            host: host,
            port: 993,
            tls: true,
        }
        this.imap = new Imap(this.imapConfig);
    }

    connect() {
        this.imap.connect();
    }

    get_unread_messages(k) {
        return new Promise((resolve, reject) => {
            this.imap.once('ready', () => {
                this.imap.openBox('INBOX', false, (err, box) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    this.imap.search(['UNSEEN'], (err, results) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (results.length === 0) {
                            resolve([]); // No unread messages found, resolve with empty array
                            return;
                        }

                        let messageIndexes;
                        if (k) messageIndexes = results.slice(-k);
                        else messageIndexes = results

                        const f = this.imap.fetch(messageIndexes, { bodies: '' });

                        const messages = [];
                        f.on('message', (msg) => {
                            const message = {};
                            msg.on('body', (stream) => {
                                simpleParser(stream, (err, parsed) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    if (typeof parsed === 'string') {
                                        parsed = JSON.parse(parsed);
                                    }
                                    
                                    message.from = parsed.from.value[0];
                                    message.subject = parsed.subject;
                                    message.body = parsed.text;
                                    message.date = parsed.date;

                                    if (parsed.textAsHtml) {
                                        message.html = parsed.textAsHtml;
                                    }
                                });
                            });

                            msg.once('attributes', (attrs) => {
                                message.id = attrs.uid;
                            });

                            msg.once('end', () => {
                                messages.push(message); // Collect message after all data is populated
                            });
                        });

                        f.once('error', (err) => {
                            reject(err);
                        });

                        f.once('end', () => {
                            // Resolve with all collected messages
                            resolve(messages);
                        });
                    });
                });
            });

            this.imap.once('error', (err) => {
                reject(err);
            });

            // Start the connection
        });
    }

    async mark_as_read(id) {
        return new Promise((resolve, reject) => {
            this.imap.addFlags(id, ['\\Seen'], (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve('Marked as read!');
            });
        });
    }
}



module.exports = EmailClient