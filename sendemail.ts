import sendgrid, { } from '@sendgrid/mail'

export type EmailHeader = {
    recipient: string;
    sender: string;
    subject: string;
}
export type EmailBody = {
    text: string;
    html: string;
}
export async function sendemail(header: EmailHeader,body: EmailBody) {

    sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)
    const msg = {
        to: header.recipient, // Change to your recipient
        from: header.sender, // Change to your verified sender
        subject: header.subject,
        text: body.text,
        html: body.html,
    }
    sendgrid
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
}