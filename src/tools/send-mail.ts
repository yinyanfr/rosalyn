import nodemailer from "nodemailer"
import smtp from "../config/smtp.json"

const transporter = smtp.host.length ? nodemailer.createTransport(smtp) : null

const populateProps = (str: string, props: { [x: string]: any }) => {
    let res = str
    if (props) {
        for (let key in props) {
            res = res.replace(new RegExp(`{${key}}`, 'g'), props[key])
        }
    }
    return res
}

const sendMail = (template: { [x: string]: any }, receiver: string, props: { [x: string]: any }) => {
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

export default sendMail
