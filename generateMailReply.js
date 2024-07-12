const EmailClient = require('./config/mailClient')
const AzureClient = require('./config/openai')
const MailClient = require('./nodeMailer')



async function generateMailReply(user, password, host) {
    const emailClient = new EmailClient(user, password, host);
    emailClient.connect();

    const azureClient = new AzureClient();
    const mailClient = new MailClient();

    await emailClient.get_unread_messages().then(async (messages) => {
        for (let i = 0; i < messages.length; i++) {

            const { id, subject, body, from } = messages[i]
            console.log(messages[i])
            const context = `
            Given below is a mail body :
            username : ${from?.name}
            subject : ${subject}
            body : ${body}

            Create appropriate category and response message
            `

            console.log("context", context)
            const res = await azureClient.getCompletion([{ "role": "user", "content": context }])

            if (!res) {
                console.log("No response generated from LLM", res)
                await emailClient.mark_as_read(id)
            }
            else {

                const parseResponse = JSON.parse(res)
                console.log("Parse response", parseResponse)
                if (parseResponse.category) {
                    await mailClient.sendMail(from.address, `Re : ${subject}`, null, parseResponse.reply)
                    console.log(`mail replied to ${from.address}`)
                }
                console.log("marking email as read", id)
                await emailClient.mark_as_read(id)
            }
        }
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = generateMailReply
