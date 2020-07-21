const nodemailer = require("nodemailer")
const smtp = require("../config/smtp.json")

const transporter = smtp.host.length ? nodemailer.createTransport(smtp) : null

const populateProps = (str, props) => {
    let res = str
    if (props) {
        for (let key in props) {
            res = res.replace(new RegExp(`{${key}}`, 'g'))
        }
    }
    return res
}

const sendMail = (template, receiver, props) => {
    if (transporter) {
        const { text, html } = template
        const mail = {
            ...template,
            to: receiver,
            text: props ? populateProps(text, props) : text,
            html: props ? populateProps(text, props) : text,
        }

        return transporter.sendMail(mail)
    }

    return Promise.reject("stmp_service_not_configured")
}

module.exports = sendMail
