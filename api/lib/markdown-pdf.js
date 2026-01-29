import fs from 'fs';
import PDFDocument from 'pdfkit';
import MarkdownIt from 'markdown-it';
import axios from 'axios';

export async function markdownToPdf(markdown, outputPath) {
    const doc = new PDFDocument({
        margins: {
            top: 72,
            bottom: 72,
            left: 40,
            right: 40
        }, // 1 polegada (~2.54 cm)
        size: 'A4',
        info: {
            Title: 'GFIC - Finance Report',
            Author: 'GFIC',
        },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Parser leve de markdown
    const md = new MarkdownIt({ html: false, linkify: true, breaks: true });
    const tokens = md.parse(markdown, {});

    const lineHeight = 18;
    const maxWidth = 450;
    let cursorY = doc.y + 20;

    const addSpacing = (lines = 1) => {
        cursorY += lineHeight * lines;
        doc.moveDown(lines);
    };

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        if (t.type === 'heading_open') {
            const level = parseInt(t.tag.replace('h', ''), 10);
            const content = tokens[i + 1].content;

            doc.font('Helvetica-Bold')
                .fontSize(22 - level * 2)
                .text(content, { width: maxWidth, align: 'left' });
            addSpacing(0.8);
        }

        else if (t.type === 'paragraph_open') {
            const content = tokens[i + 1]?.content || '';
            if (!content.trim()) continue;

            doc.font('Helvetica')
                .fontSize(12)
                .text(formatInline(content), { width: maxWidth, align: 'justify' });
            addSpacing(1);
        }

        else if (t.type === 'bullet_list_open') {
            const listItems = [];
            let j = i + 1;
            while (tokens[j] && tokens[j].type !== 'bullet_list_close') {
                if (tokens[j].type === 'inline') listItems.push(tokens[j].content);
                j++;
            }

            doc.font('Helvetica').fontSize(12);
            for (const item of listItems) {
                doc.text(`• ${item}`, { width: maxWidth });
            }
            addSpacing(1);
            i = j;
        }

        else if (t.type === 'image') {
            const src = t.attrGet('src');
            try {
                const buffer = await fetchImage(src);
                const img = doc.openImage(buffer);
                const ratio = img.height / img.width;
                const displayWidth = Math.min(maxWidth, img.width);
                const displayHeight = displayWidth * ratio;
                doc.image(img, { fit: [displayWidth, displayHeight] });
                addSpacing(1);
            } catch (e) {
                doc.font('Helvetica-Oblique')
                    .fontSize(10)
                    .fillColor('gray')
                    .text(`[Imagem não carregada: ${src}]`);
                addSpacing(1);
                doc.fillColor('black');
            }
        }
    }

    // Rodapé / espaço extra
    doc.moveDown(4);

    doc.end();

    return new Promise((resolve) => {
        stream.on('finish', () => resolve(outputPath));
    });
}

// --- Utilitários ---

function formatInline(text) {
    // Negrito: **texto**
    text = text.replace(/\*\*(.*?)\*\*/g, (_, p1) => p1.toUpperCase());
    // Itálico: *texto*
    text = text.replace(/\*(.*?)\*/g, (_, p1) => `_${p1}_`);
    // Links: [texto](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
    return text;
}

async function fetchImage(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data, 'binary');
}
