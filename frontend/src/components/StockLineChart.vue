<template>
  <div
    class="relative w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800
           p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.15),0_20px_50px_rgba(0,0,0,0.6)]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-white text-lg font-semibold tracking-wide">
          Evolução do Preço
        </h2>
        <p class="text-slate-400 text-xs">
          Data • Fech. • Volume • Abert. • Máx. • Mín.
        </p>
      </div>

      <div class="text-right">
        <div class="text-2xl font-bold text-cyan-400">
          {{ last.close }}
        </div>
        <div class="text-xs text-slate-400">
          Último fechamento
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="relative h-72 overflow-hidden">
      <canvas
        ref="canvas"
        class="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        @mousemove="onPointerMove"
        @mouseleave="onPointerLeave"
        @touchstart.prevent="onTouchMove"
        @touchmove.prevent="onTouchMove"
        @touchend="onPointerLeave"
      />

      <!-- Tooltip -->
      <div
        v-if="hoverIndex !== null"
        ref="tooltip"
        class="absolute z-10 rounded-xl bg-black/90 backdrop-blur
               border border-white/10 p-3 text-xs text-white shadow-xl
               max-w-[220px]"
        :style="tooltipStyle"
      >
        <div class="font-semibold text-cyan-400 mb-1">
          {{ data[hoverIndex].date }}
        </div>

        <div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span class="text-slate-400">Fech.</span>
          <span>{{ data[hoverIndex].close }}</span>

          <span class="text-slate-400">Abert.</span>
          <span>{{ data[hoverIndex].open }}</span>

          <span class="text-slate-400">Máx.</span>
          <span>{{ data[hoverIndex].high }}</span>

          <span class="text-slate-400">Mín.</span>
          <span>{{ data[hoverIndex].low }}</span>

          <span class="text-slate-400 col-span-2 mt-1">
            Vol: {{ data[hoverIndex].volume }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'

const props = defineProps({
  data: { type: Array, required: true }
})

const canvas = ref(null)
const tooltip = ref(null)
const hoverIndex = ref(null)
const tooltipStyle = ref({})

const padding = { top: 24, bottom: 32, left: 48, right: 24 }

const last = computed(() => props.data[0])
const parsePrice = v => Number(v.replace('$', ''))

function draw() {
  const c = canvas.value
  if (!c) return

  const dpr = window.devicePixelRatio || 1
  const width = c.clientWidth
  const height = c.clientHeight

  c.width = width * dpr
  c.height = height * dpr

  const g = c.getContext('2d')
  g.setTransform(dpr, 0, 0, dpr, 0, 0)

  const prices = props.data.map(d => parsePrice(d.close))
  const max = Math.max(...prices)
  const min = Math.min(...prices)

  g.clearRect(0, 0, width, height)

  // Grid
  g.strokeStyle = 'rgba(148,163,184,0.15)'
  g.setLineDash([4, 6])
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (i * (height - padding.top - padding.bottom)) / 4
    g.beginPath()
    g.moveTo(padding.left, y)
    g.lineTo(width - padding.right, y)
    g.stroke()
  }
  g.setLineDash([])

  const stepX = (width - padding.left - padding.right) / (prices.length - 1)

  // Área
  g.beginPath()
  prices.forEach((p, i) => {
    const x = padding.left + i * stepX
    const y =
      padding.top +
      ((max - p) / (max - min)) *
        (height - padding.top - padding.bottom)
    i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)
  })
  g.lineTo(padding.left + (prices.length - 1) * stepX, height - padding.bottom)
  g.lineTo(padding.left, height - padding.bottom)
  g.closePath()

  const fill = g.createLinearGradient(0, padding.top, 0, height - padding.bottom)
  fill.addColorStop(0, 'rgba(56,189,248,0.35)')
  fill.addColorStop(1, 'rgba(56,189,248,0)')
  g.fillStyle = fill
  g.fill()

  // Linha
  g.beginPath()
  prices.forEach((p, i) => {
    const x = padding.left + i * stepX
    const y =
      padding.top +
      ((max - p) / (max - min)) *
        (height - padding.top - padding.bottom)
    i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)
  })
  g.strokeStyle = '#38bdf8'
  g.lineWidth = 2.5
  g.shadowColor = '#38bdf8'
  g.shadowBlur = 10
  g.stroke()
  g.shadowBlur = 0

  // Crosshair
  if (hoverIndex.value !== null) {
    const x = padding.left + hoverIndex.value * stepX
    g.setLineDash([4, 6])
    g.beginPath()
    g.moveTo(x, padding.top)
    g.lineTo(x, height - padding.bottom)
    g.strokeStyle = 'rgba(148,163,184,0.6)'
    g.stroke()
    g.setLineDash([])
  }
}

function updateHover(clientX) {
  const rect = canvas.value.getBoundingClientRect()
  const x = clientX - rect.left
  const stepX =
    (rect.width - padding.left - padding.right) /
    (props.data.length - 1)

  const index = Math.round((x - padding.left) / stepX)
  if (index < 0 || index >= props.data.length) {
    hoverIndex.value = null
    draw()
    return
  }

  hoverIndex.value = index
  draw()

  nextTick(() => {
    if (!tooltip.value) return

    const tooltipWidth = tooltip.value.offsetWidth
    const chartWidth = rect.width
    const anchorX = padding.left + index * stepX

    const placeRight = anchorX + tooltipWidth + 16 < chartWidth

    tooltipStyle.value = {
      top: '12px',
      left: placeRight
        ? `${anchorX + 12}px`
        : `${anchorX - tooltipWidth - 12}px`
    }
  })
}

function onPointerMove(e) {
  updateHover(e.clientX)
}

function onTouchMove(e) {
  if (e.touches && e.touches[0]) {
    updateHover(e.touches[0].clientX)
  }
}

function onPointerLeave() {
  hoverIndex.value = null
  draw()
}

onMounted(draw)
watch(() => props.data, draw, { deep: true })
</script>
