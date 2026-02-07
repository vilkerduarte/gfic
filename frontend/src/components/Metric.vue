<!-- components/Metric.vue -->
<template>
  <div class="bg-slate-900 border border-slate-700 rounded p-3">
    <p class="text-xs text-slate-400">{{ label }}</p>
    <p class="text-lg font-semibold">
      {{ value ?? '-' }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number]
})
</script>
