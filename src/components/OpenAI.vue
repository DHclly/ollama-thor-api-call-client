<script setup>
import { ref } from 'vue'
import OpenAI from 'openai'
import { delay } from '../modules/tool/index.mjs';

const question = ref("50字关于大海的赞美");
const content = ref("无内容");
const model = ref("qwen:0.5b");
const baseURL = ref("http://localhost:11434/v1/");
const apiKey = ref("ollama");

const btn_clear_handler = (e) => {
    content.value = "";
}

const btn1_handler = async (e) => {
    // 调用聊天接口，非流式返回
    //POST http://127.0.0.1:11434/v1/chat/completions
    content.value = "";
    const openai = new OpenAI({
        baseURL: baseURL.value,
        // required but ignored
        apiKey: apiKey.value,
        dangerouslyAllowBrowser: true
    })

    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: question.value }],
        model: model.value,
        stream: false,
    })
    content.value = chatCompletion.choices[0].message.content;
}

const btn2_handler = async (e) => {
    // 调用聊天接口，流式返回
    //POST http://127.0.0.1:11434/v1/chat/completions
    content.value = "";
    const openai = new OpenAI({
        baseURL: baseURL.value,
        // required but ignored
        apiKey: apiKey.value,
        dangerouslyAllowBrowser: true,
    })

    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: question.value }],
        model: model.value,
        stream: true,
        temperature: 0.8
    })

    for await (const part of chatCompletion) {
        content.value += part.choices[0].delta.content;
        await delay(10);
    }
}
</script>

<template>
    <div class="title is-1">OpenAI API</div>
    <div class="buttons">
        <button class="button is-primary" type="button" @click="btn_clear_handler">清空结果</button>
        <button class="button is-info" type="button" @click="btn1_handler">调用聊天接口，非流式返回,/v1/chat/completions</button>
        <button class="button is-info" type="button" @click="btn2_handler">调用聊天接口，流式返回,/v1/chat/completions</button>
    </div>
    <div class="form">
        <div class="field">
            <label class="label">Base Url：</label>
            <div class="control">
                <input class="input" type="text" placeholder="请输入base url" v-model="baseURL">
            </div>
        </div>
        <div class="field">
            <label class="label">API Key：</label>
            <div class="control">
                <input class="input" type="text" placeholder="请输入API Key" v-model="apiKey">
            </div>
        </div>
        <div class="field">
            <label class="label">模型名：</label>
            <div class="control">
                <input class="input" type="text" placeholder="请输入模型名称" v-model="model">
            </div>
            <p class="help">如:qwen:0.5b</p>
        </div>
        <div class="field">
            <label class="label">问题：</label>
            <div class="control">
                <input class="input" type="text" placeholder="请输入问题" v-model="question">
            </div>
            <p class="help">如:写一首关于太阳的诗歌</p>
        </div>
        <div class="field">
            <label class="label">回答：</label>
            <div class="control">
                <textarea class="textarea" rows="10" placeholder="回答" v-model="content"></textarea>
            </div>
        </div>
    </div>
</template>

<style scoped>
.buttons {
    align-content: space-between;
}
</style>
