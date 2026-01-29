import { TEMPLATE_WELCOME, TEMPLATE_REPORT_READY, TEMPLATE_RECOVERY, writeHTML } from './emails.js'
import smtp from './du-smtp.js'

const notifyEmail = {}

notifyEmail.welcome = (name, email) => {
  const html = writeHTML(TEMPLATE_WELCOME, {
    title: `Seja Bem-vindo(a) ao GFIC, ${name}!`,
    name
  })
  return smtp.sendMail({
    to: email,
    subject: `Seja Bem-vindo(a) ao GFIC, ${name}!`,
    html
  })
}

notifyEmail.reportReady = (symbol, label, email) => {
  const html = writeHTML(TEMPLATE_REPORT_READY, {
    title: 'Relatorio gerado com sucesso!',
    asset: `${symbol} - ${label}`
  })
  return smtp.sendMail({
    to: email,
    subject: 'Relatorio gerado com sucesso!',
    html
  })
}

notifyEmail.recovery = (email, token) => {
  const link = `${process.env.FRONTEND_URL || ''}/recovery?token=${token}`
  const html = writeHTML(TEMPLATE_RECOVERY, {
    title: 'Recuperacao de Conta',
    link
  })
  return smtp.sendMail({
    to: email,
    subject: 'Recuperacao de Conta',
    html,
    text: `Para recuperar sua conta, acesse: ${link}`
  })
}

export default notifyEmail