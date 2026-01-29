import fs from 'fs';

export function writeHTML(template='',obj={}) {
    for (var x in obj) {
        template = template.replaceAll('{%' + x + '%}', obj[x]);
    }
    return template;
}

const URL = process.env.FRONTEND_URL;

export const TEMPLATE_DEFAULT = writeHTML(fs.readFileSync('assets/html/emails/template.html', 'utf-8'),{
    url:URL
});
export const TEMPLATE_RECOVERY = writeHTML(TEMPLATE_DEFAULT,{
    url:URL,
    content:fs.readFileSync('assets/html/emails/recovery.html', 'utf-8')
});

export const TEMPLATE_WELCOME = writeHTML(TEMPLATE_DEFAULT,{
    content:writeHTML(fs.readFileSync('assets/html/emails/welcome.html', 'utf-8'),{url:URL})
});

export const TEMPLATE_REPORT_READY = writeHTML(TEMPLATE_DEFAULT,{
    content:writeHTML(fs.readFileSync('assets/html/emails/report.html', 'utf-8'),{url:URL})
});