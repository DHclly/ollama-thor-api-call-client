<script setup>
import { ref } from 'vue'
import ollama from 'ollama/browser'
import { delay } from '../modules/tool/index.mjs';

const question = ref("50字关于大海的赞美");
const content = ref("无内容");
const model = ref("qwen:0.5b");

const btn_clear_handler = (e) => {
    content.value = "";
}

const btn1_handler = async (e) => {
    // 调用聊天接口，非流式返回
    //POST http://127.0.0.1:11434/api/chat
    content.value = "";
    const response = await ollama.chat({
        model: model.value,
        messages: [
            {
                role: 'user',
                content: question.value
            }],
    })

    content.value = response.message.content;
}

const btn2_handler = async (e) => {
    // 调用聊天接口，流式返回
    //POST http://127.0.0.1:11434/api/chat
    content.value = "";
    const message = { role: 'user', content: question.value }
    const response = await ollama.chat({ model: model.value, messages: [message], stream: true })
    for await (const part of response) {
        content.value += part.message.content;
        await delay(10);
    }
}

const btn3_handler = async (e) => {
    //获取模型列表
    //GET http://127.0.0.1:11434/api/tags
    let list = await ollama.list();
    content.value = JSON.stringify(list, null, 2);
}

const btn4_handler = async (e) => {
    //获取模型信息
    //POST http://127.0.0.1:11434/api/show
    let info = await ollama.show({ model: model.value });
    content.value = JSON.stringify(info, null, 2);
}

const btn5_handler = async (e) => {
    // 调用生成接口，非流式返回
    //POST http://127.0.0.1:11434/api/generate
    content.value = "";
    const response = await ollama.generate({
        model: model.value,
        prompt: question.value,
    })

    content.value = response.response;
}

const btn6_handler = async (e) => {
    // 调用生成接口，流式返回
    //POST http://127.0.0.1:11434/api/generate
    content.value = "";
    const response = await ollama.generate({ model: model.value, prompt: question.value, stream: true })
    for await (const part of response) {
        content.value += part.response;
        await delay(10);
    }
}
</script>

<template>
    <div class="title is-1">Ollama API</div>
    <div class="buttons">
        <button class="button is-primary" type="button" @click="btn_clear_handler">清空结果</button>
        <button class="button is-info" type="button" @click="btn1_handler">调用聊天接口，非流式返回,/api/chat</button>
        <button class="button is-info" type="button" @click="btn2_handler">调用聊天接口，流式返回,/api/chat</button>
        <button class="button is-info" type="button" @click="btn3_handler">获取模型列表,/api/tags</button>
        <button class="button is-info" type="button" @click="btn4_handler">获取模型信息,/api/show</button>
        <button class="button is-info" type="button" @click="btn5_handler">调用生成接口，非流式返回,/api/generate</button>
        <button class="button is-info" type="button" @click="btn6_handler">调用生成接口，流式返回,/api/generate</button>
    </div>
    <div class="form">
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
