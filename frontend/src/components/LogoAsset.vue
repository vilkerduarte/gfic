<template>

    <div ref="avatarRef" class="avatar" :style="avatarStyle">
        <div ref="avatarRef" :style="avatarStyleBackground"></div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
    src: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'square'
    },
    size: {
        type: Number,
        default: 50
    }
})

const loaded = ref(false)
const avatarRef = ref(null)


const avatarStyle = computed(() => ({
    padding: loaded.value ? `4px` : '0px',
    backgroundColor: 'white',
    borderRadius: props.type == 'square' ? '10%' : `${props.size}px`,
    transition: 'padding 200ms ease'
}))

const avatarStyleBackground = computed(() => ({
    width: loaded.value ? `${props.size}px` : '0px',
    height: `${props.size}px`,
    backgroundImage: loaded.value ? `url('${props.src}')` : 'none',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'width 200ms ease'
}))

// Pré-carrega a imagem e altera o estado quando estiver pronta
const loadImage = () => {
    const img = new Image()
    img.src = props.src
    img.onload = () => {
        loaded.value = true
    }
}

watch(() => props.src, () => {
    loaded.value = false
    loadImage()
})

loadImage()
</script>

<style scoped>
.avatar {
    display: inline-block;
    overflow: hidden;
}
</style>
