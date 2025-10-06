<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { debugApp } from '@/services/app.ts'
import { useRoute } from 'vue-router'

// 定义消息类型接口
interface MessageItem {
  role: 'human' | 'assistant'
  content: string
}

const query = ref('')
const messages = ref<MessageItem[]>([]) // 这里添加了类型定义
const isLoading = ref(false)
const route = useRoute()

const clearMessages = () => {
  messages.value = []
}

const send = async () => {
  if (query.value.trim() === '') {
    return
  }

  if (isLoading.value) {
    Message.warning('请稍后，模型正在处理中')
    return
  }

  const humanQuery = query.value.trim()

  messages.value.push({
    role: 'human',
    content: humanQuery,
  })

  try {
    isLoading.value = true
    // 发起请求
    const response = await debugApp(route.params.app_id as string, humanQuery)
    const content = response.data.content

    messages.value.push({
      role: 'assistant',
      content: content,
    })
    query.value = ''
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen">
    <header class="h-[74px] bg-gray-100 border-b border-gray-200 px-4">顶部导航</header>
    <div class="flex flex-row h-[calc(100vh-74px)]">
      <div class="w-2/3 bg-gray-50 h-full">
        <header class="flex items-center h-16 border-b border-gray-200 px-7 text-xl text-gray-700">
          应用编排
        </header>
        <div class="flex flex-row h-[calc(100%-64px)]">
          <div class="flex-1 border-r border-gray-200 p-6">人设与回复逻辑</div>
          <div class="flex-1 p-6">应用能力</div>
        </div>
      </div>
      <div class="flex flex-col w-1/3 bg-white h-full">
        <header
          class="flex flex-shrink-0 items-center h-16 px-4 text-xl bg-white border-b border-gray-200 shadow-sm"
        >
          调试预览
        </header>
        <!-- 调试对话 -->
        <div class="h-full min-h-0 px-6 py-7 overflow-x-hidden overflow-y-scroll scrollbar-w-none">
          <!--消息列表 -->
          <div class="flex flex-row gap-2 mb-6" v-for="message in messages" :key="message.content">
            <a-avatar
              v-if="message.role == 'human'"
              class="flex-shrink-0"
              :style="{ backgroundColor: '#3370ff' }"
              :size="30"
              >A
            </a-avatar>

            <a-avatar
              v-if="message.role == 'assistant'"
              class="flex-shrink-0"
              :style="{ backgroundColor: '#00d0b6' }"
              :size="30"
            >
              <icon-apps />
            </a-avatar>

            <div class="flex flex-col gap-2">
              <div class="font-semibold text-gray-700">
                {{ message.role == 'human' ? 'Amir' : 'GPT' }}
              </div>

              <div
                v-if="message.role == 'human'"
                class="max-w-max bg-blue-700 text-white border border-blue-800 px-4 py-3 rounded-2xl leading-5"
              >
                {{ message.content }}
              </div>

              <div
                v-else
                class="max-w-max bg-gray-100 text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl leading-5"
              >
                {{ message.content }}
              </div>
            </div>
          </div>

          <!--没有数据时显示-->
          <div
            v-if="messages.length == 0"
            class="mt-[200px] flex items-center justify-center gap-2"
          >
            <a-avatar :size="70" :style="{ backgroundColor: '#00d0b6' }">
              <icon-apps></icon-apps>
            </a-avatar>
            <div class="text-2xl font-semibold text-gray-900">ChatGPT聊天机器人</div>
          </div>
          <!-- ai loading -->
          <div v-if="isLoading" class="flex flex-row gap-2 mb-6">
            <a-avatar class="flex-shrink-0" :style="{ backgroundColor: '#00d0b6' }" :size="30">
              <icon-apps />
            </a-avatar>
            <div class="flex flex-col gap-2">
              <div class="font-semibold text-gray-700">Amir</div>
              <div
                class="max-w-max bg-gray-100 text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl leading-5"
              >
                <icon-loading />
              </div>
            </div>
          </div>
        </div>

        <!-- 调试对话输入框 -->
        <div class="w-full flex-shrink-0 flex flex-col">
          <!--顶部输入框-->
          <div class="px-6 flex items-center gap-4">
            <!-- 清除按钮 -->
            <a-button type="text" class="flex-shrink-0" shape="circle" @click="clearMessages">
              <template #icon>
                <icon-empty size="16" :style="{ color: '#374151' }"></icon-empty>
              </template>
            </a-button>
            <!-- 输出框组件 -->
            <div
              class="h-[50px] flex items-center gap-2 px-4 flex-1 border border-gray-200 rounded-full"
            >
              <input type="text" class="flex-1 outline-0" v-model="query" />
              <!--清除-->
              <a-button type="text" shape="circle">
                <template #icon>
                  <icon-plus-circle size="16" :style="{ color: '#374151' }"></icon-plus-circle>
                </template>
              </a-button>
              <!-- 发送 -->
              <a-button type="text" shape="circle" @click="send">
                <template #icon>
                  <icon-send size="16" :style="{ color: '#1d4ed8' }"></icon-send>
                </template>
              </a-button>
            </div>
          </div>
          <!-- 底部提示文字-->
          <div class="text-center text-gray-500 text-xs py-4">
            内容由AI生成，无法保证真实准确，仅供参考。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
