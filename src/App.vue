<script setup>
import OllamaAI from './components/OllamaAI.vue'
import OpenAI from './components/OpenAI.vue'
import ThorAI from './components/ThorAI.vue'
import { ref } from 'vue'

const currentPanel = ref("ollama");

</script>

<template>
  <div class="container is-fluid">
    <section class="hero is-info">
      <div class="hero-body">
        <p class="title">Ollama API & Thor Gateway</p>
        <p class="subtitle">基于 Ollama API 的调用和代理调用测试</p>
      </div>
    </section>
    <div class="tabs is-centered">
      <ul>
        <li :class="{ 'is-active': currentPanel == `ollama` }" @click="currentPanel = `ollama`"><a>Ollama API</a></li>
        <li :class="{ 'is-active': currentPanel == `openai` }" @click="currentPanel = `openai`"><a>OpenAI API</a></li>
        <li :class="{ 'is-active': currentPanel == `thor` }" @click="currentPanel = `thor`"><a>Thor API</a></li>
      </ul>
    </div>
    <div class="" v-show="currentPanel == `ollama`">
      <OllamaAI />
    </div>
    <div class="" v-show="currentPanel == `openai`">
      <OpenAI />
    </div>
    <div class="" v-show="currentPanel == `thor`">
      <ThorAI />
    </div>
    <footer class="footer">
      <div class="content has-text-centered">
        <p> Ollama API & Thor Gateway </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.buttons {
  margin-top: 1rem;
}
</style>
