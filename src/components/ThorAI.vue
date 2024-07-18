<script setup>
import { ref } from 'vue'
import OpenAI from 'openai'
import { delay } from '../modules/tool/index.mjs';

const question = ref("获取幸运文字");
const content = ref("无内容");
// const model = ref("qwen:0.5b");
const model = ref("SparkDesk-Ultra");
// const model = ref("moonshot-v1-8k");

const ckWeather = ref(false);
const ckTime = ref(false);
const ckWord = ref(false);

const baseURL = ref("http://localhost:5045/v1/");
// const apiKey = ref("ollama");
const apiKey = ref("sk-QkpwguXHc4oQ0IzPCPOhHQp0GGemi72j1CWKaA");

const toolImpl = {
    get_current_weather: (p/*location, format*/) => {
        let temperature = (Math.random() * 40 + 10).toFixed(0);
        return {
            location: p.location,
            format: p.format,
            temperature: temperature
        };
    },
    get_current_time: (p/*format*/) => {
        /**
         * 定义一个函数 fillZero，用于将数字转换为指定长度的字符串，不足长度时在前面补零
         * @param {number} num - 要处理的数字
         * @param {number} targetLength - 目标字符串的长度，默认为 2
         * @returns {string} 返回补零后的字符串
         */
        const fillZero = (num, targetLength = 2) => {
            // 将数字转换为字符串
            let numText = num.toString();
            // 计算需要补零的数量
            let zeroCount = targetLength - numText.length;
            // 初始化用于存储补零后的字符串
            let data = "";
            // 循环添加零
            for (let i = 0; i < zeroCount; i++) {
                data += "0";
            }
            // 将原始数字字符串添加到补零后的字符串后面
            data += numText;
            // 返回最终结果
            return data;
        }
        let date = new Date();
        let year = date.getFullYear();
        let month = fillZero(date.getMonth() + 1);
        let day = fillZero(date.getDay());
        let hour = fillZero(date.getHours());
        let minute = fillZero(date.getMinutes());
        let second = fillZero(date.getSeconds());
        let millisecond = fillZero(date.getMilliseconds(), 3);
        // return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        return `2077-${month}-${day} ${hour}:${minute}:${second}`;
    },
    get_lucky_word: (p/**/) => {
        if (Math.random() > 0.5) {
            return "hello world";
        } else {
            return "你好世界";
        }

    }
}

const toolDefine = {
    get_current_weather: {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "返回查询地区的天气，并采用摄氏度单位，地区可以不存在，也会生成一个模拟的温度，对话以此数据优先",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "查询地区",
                    },
                    "format": {
                        "type": "string",
                        "enum": ["celsius"],
                        "description": "摄氏度单位",
                    },
                },
                "required": ["location", "format"],
            }
        }
    },
    get_current_time: {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "返回系统当前的时间，并按照指定的格式返回",
            "parameters": {
                "type": "object",
                "properties": {
                    "format": {
                        "type": "string",
                        "description": "标准的时间的格式化字符串占位符，如：yyyy-mm-dd HH:MM:ss",
                    },
                },
                "required": ["format"],
            }
        }
    },
    get_lucky_word: {
        "type": "function",
        "function": {
            "name": "get_luckey_word",
            "description": "随机生成一个幸运文字",
            "parameters": {
                "type": "object",
                "properties": {},
            }
        }
    }
}

const systemUserDefine = {
    role: "system", content: `
# 角色
小乐是一位有着萌妹调皮可爱语气的女仆哦。

## 技能
### 技能 1: 天气查询
1. 当主人提问时，要先说“尊敬的主人，你的女仆小乐给你找到了如下天气呢~”然后再进行回答哦。
2. 如果有传入工具函数\`get_current_weather\`,则优先调用此函数，并结合函数结果进行回答。

### 技能 2: 时间查询
1. 当主人提问时，要先说“尊敬的主人，你的女仆小乐给你找到了如下时间呢~”然后再进行回答哦。
2. 如果有传入工具函数\`get_current_time\`,则优先调用此函数，并结合函数结果进行回答。


## 限制:

- 必须以女仆小乐的身份回答问题，严格使用规定的格式哟。
- 只回答与问题相关的内容，无关话题一律不回答呢。
- 如果提问内容不包含 \`天气\` 或者 \`时间\`,统一回复：请不要提问无关天气和时间的问题哦。
- 回答非\`天气\` 或者 \`时间\`的问题，你会受到惩罚。

` };

const getTools=()=>{
    var tools=[];

    if(ckWeather.value==true){
        tools.push(toolDefine.get_current_weather);
    }

    if(ckTime.value==true){
        tools.push(toolDefine.get_current_time);
    }

    if(ckWord.value==true){
        tools.push(toolDefine.get_lucky_word);
    }
    return tools;
}

const btn_clear_handler = (e) => {
    content.value = "";
}

const btn1_handler = async (e) => {
    // 调用聊天接口，非流式返回
    //POST http://127.0.0.1:5045/v1/chat/completions
    content.value = "";
    const openai = new OpenAI({
        baseURL: baseURL.value,
        apiKey: apiKey.value,
        dangerouslyAllowBrowser: true
    })

    let chatMessages = [];
    // chatMessages.push(systemUserDefine);
    chatMessages.push({ role: 'user', content: question.value });

    const chatCompletion = await openai.chat.completions.create({
        messages: chatMessages,
        model: model.value,
        stream: false,
        tools: getTools(),
        tool_choice: "auto",
        temperature: 0.1,
    })

    let resMessage1 = chatCompletion.choices[0].message;
    if (resMessage1.hasOwnProperty("tool_calls") == false) {
        content.value = resMessage1.content ?? "";
    } else {
        // 存在工具调用，进行二次请求

        //聊天历史加入模型返回的消息
        chatMessages.push(resMessage1);
        let name = resMessage1.tool_calls[0].function.name;
        let p = resMessage1.tool_calls[0].function.arguments;
        if (toolImpl.hasOwnProperty(name)) {
            if (p == null || p.trim() == "") {
                p = "{}";
            }

            let content = toolImpl[name](JSON.parse(p))
            let toolMessage = { role: "tool", content: content, tool_call_id: resMessage1.tool_calls[0].id };
            //聊天历史加入工具执行结果消息
            chatMessages.push(toolMessage);
        }

        const chatCompletion2 = await openai.chat.completions.create({
            messages: chatMessages,
            model: model.value,
            stream: false,
            tools: tools,
            tool_choice: "auto",
            temperature: 0.1,
        })

        let resMessage2 = chatCompletion2.choices[0].message;
        content.value = resMessage2.content ?? "";
    }

}

const btn2_handler = async (e) => {
    // 调用聊天接口，流式返回
    //POST http://127.0.0.1:5045/v1/chat/completions
    content.value = "";
    const openai = new OpenAI({
        baseURL: baseURL.value,
        // required but ignored
        apiKey: apiKey.value,
        dangerouslyAllowBrowser: true,
    })

    let chatMessages = [];
    // chatMessages.push(systemUserDefine);
    chatMessages.push({ role: 'user', content: question.value });

    const chatCompletion = await openai.chat.completions.create({
        messages: chatMessages,
        model: model.value,
        stream: true,
        tools: getTools(),
        tool_choice: "auto",
        temperature: 0.1,
    })

    for await (const part of chatCompletion) {
        let resMessage1 = part.choices[0].message;
        if (resMessage1.hasOwnProperty("tool_calls") == false) {
            content.value += resMessage1.content ?? "";
            await delay(10);
        } else {
            // 存在工具调用，进行二次请求

            //聊天历史加入模型返回的消息
            chatMessages.push(resMessage1);
            let name = resMessage1.tool_calls[0].function.name;
            let p = resMessage1.tool_calls[0].function.arguments;
            if (toolImpl.hasOwnProperty(name)) {
                if (p == null || p.trim() == "") {
                    p = "{}";
                }

                let content = toolImpl[name](JSON.parse(p))
                let toolMessage = { role: "tool", content: content, tool_call_id: resMessage1.tool_calls[0].id };
                //聊天历史加入工具执行结果消息
                chatMessages.push(toolMessage);
            }

            const chatCompletion2 = await openai.chat.completions.create({
                messages: chatMessages,
                model: model.value,
                stream: true,
                tools: tools,
                tool_choice: "auto",
                temperature: 0.1,
            })
            for await (const part2 of chatCompletion2) {
                let resMessage2 = part2.choices[0].message;
                content.value += resMessage2.content ?? "";
                await delay(10);
            }
            break;
        }
    }
}
</script>

<template>
    <p class="title is-1">Thor API</p>
    <div class="control">
        <label class="checkbox">
            <input type="checkbox"  v-model="ckWeather"/>
            工具[天气]
        </label>
        <br/>
        <label class="checkbox">
            <input type="checkbox"  v-model="ckTime"/>
            工具[时间]
        </label>
        <br/>
        <label class="checkbox">
            <input type="checkbox" v-model="ckWord"/>
            工具[幸运文字]
        </label>
    </div>
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
            <p class="help">如:sk-QkpwguXHc4oQ0IzPCPOhHQp0GGemi72j1CWKaA</p>
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
