<template>
  <div class="px-3 md:px-12 py-8">
    <ClassicToolbar />
    <!-- <iframe src="https://s.tradingview.com/widgetembed/?symbol=NASDAQ:AAPL&theme=dark&transparent=1" class="w-full" height="400" frameborder="0"></iframe> -->
    
    <div ref="tradingviewContainer" class="tradingview-widget-container"></div>
    <div ref="tradingviewContainer2" class="tradingview-widget-container"></div>

    <div class="rounded-md p-2 bg-black/10 border border-gray-800 mb-8">
      <div class="py-2 flex gap-2 items-center justify-start">
        <img src="/icons/brazil.svg" alt="" class="w-14 pl-4">
        <h2 class="text-[17pt] md:text-[23pt]">Mais Negociados no Brasil</h2>
      </div>
      <AssetGrid :assets="MOST_ACTIVE_BR" />
    </div>
    <div class="rounded-md p-2 bg-black/10 border border-gray-800">
      <div class="flex gap-2 items-center justify-start">
        <img src="/icons/world.svg" alt="" class="w-18">
        <h2 class="text-[17pt] md:text-[23pt]">Mais Negociados no Mundo</h2>
      </div>
      <AssetGrid :assets="MOST_ACTIVE" />
    </div>
  </div>
</template>
<script setup>
import AssetGrid from '@/components/AssetGrid.vue'
import API from '@/utils/api';
import { onMounted, ref } from 'vue';
import ClassicToolbar from '@/components/ClassicToolbar.vue';



const tradingviewContainer = ref(null)
const tradingviewContainer2 = ref(null)
const MOST_ACTIVE = ref([]);
const MOST_ACTIVE_BR = ref([]);
onMounted(() => {
  API.getHomeList().then((assets) => {
    MOST_ACTIVE.value = assets;
  })
  API.getHomeList('br').then((assets) => {
    MOST_ACTIVE_BR.value = assets;
  })
})
onMounted(() => {
  const container = tradingviewContainer.value
  const container2 = tradingviewContainer2.value

  // Cria o elemento de widget principal
  const widgetWrapper = document.createElement("div");
  widgetWrapper.className = "tradingview-widget-container__widget";
  container.appendChild(widgetWrapper);

  

  // Cria o script
  const script = [document.createElement("script"),document.createElement("script")];
  script[0].type = "text/javascript";
  script[1].type = "text/javascript";
  script[0].src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
  script[1].src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script[0].async = true;
  script[1].async = true;

  // Adiciona o conteúdo JSON do widget
  script[0].innerHTML = JSON.stringify({
    symbols: [
      { proName: "NASDAQ:AAPL", title: "" },
      { proName: "TVC:GOLD", title: "" },
      { proName: "NASDAQ:TSLA", title: "" },
      { proName: "BMFBOVESPA:PETR4", title: "" },
      { proName: "NASDAQ:NVDA", title: "" },
      { proName: "NASDAQ:AMD", title: "" },
      { proName: "NASDAQ:MSFT", title: "" },
    ],
    colorTheme: "dark",
    locale: "pt-br",
    largeChartUrl: "",
    isTransparent: true,
    showSymbolLogo: true,
    displayMode: "adaptive",
  });
  script[1].innerHTML = JSON.stringify({
    height:400,
    "allow_symbol_change": true,
    "calendar": false,
    "details": false,
    "hide_side_toolbar": false,
    "hide_top_toolbar": false,
    "hide_legend": false,
    "hide_volume": false,
    "hotlist": false,
    "interval": "D",
    "locale": "pt-br",
    "save_image": true,
    "style": "1",
    "symbol": "NASDAQ:AAPL",
    "theme": "dark",
    "timezone": "Etc/UTC",
    "backgroundColor": "rgba(15, 15, 15, 0)",
    "gridColor": "rgba(242, 242, 242, 0.06)",
    "watchlist": [],
    "withdateranges": false,
    "compareSymbols": [],
    "studies": [],
    "autosize": true
  });
  container.appendChild(script[1]);
  container2.appendChild(script[0]);
})
</script>