<template>
    <div>
        <button @click="generatePdf">Gerar PDF</button>
        <div class="">
            <iframe ref="iframe" class="w-[210mm] h-[297mm] scale-[0.5] fixed left-[-500%] top-0 bg-white origin-top"
                src="/generate_report.html"></iframe>
        </div>

    </div>
</template>

<script setup>
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import html2pdf from 'html2pdf.js'
import { onMounted, ref } from 'vue'


const markdownText = ref(`# Documento Exemplo

Este é um **exemplo completo** de geração de PDF a partir de Markdown.

## Seções

1. Conversão Markdown → HTML
2. Renderização em Iframe Isolado
3. Exportação PDF via html2pdf.js

---

> Este documento possui **cabeçalho, rodapé e tema claro fixo.**
`)

const iframe = ref(null)
onMounted(async () => {
    let md = await fetch(`/teste.md`);
    if (md.ok) {
        md = await md.text();
        if (md) {
            markdownText.value = md;
        }
    }
})

async function generatePdf() {

    const file = await unified()
        .use(remarkParse)
        .use(remarkHtml)
        .process(markdownText.value)
    let html = String(file)
    html = html.split('<hr>').map(a => `<section>${a}</section>`).join('');

    const iframeWindow = iframe.value?.contentWindow;
    iframeWindow.gerarPdf(html);
}
</script>
