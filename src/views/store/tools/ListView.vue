<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getBuiltinTools, getCategories } from '@/services/builtin-tool.ts'
import { apiPrefix, typeMap } from '@/config'
import moment from 'moment'

const categories = reactive<Array<any>>([])
const providers = reactive<Array<any>>([])

const loading = ref<boolean>(false)
const category = ref<string>('all')
const search_word = ref<string>('')
const showIdx = ref<number>(-1)

const filterProviders = computed(() => {
  return providers.filter((item) => {
    // 分类的关键词是否同时匹配
    const matchCategory = category.value === 'all' || item.category === category.value
    // 插件名称是否包含搜索关键词
    const matchSearchWord =
      search_word.value === '' || item.label.toLowerCase().includes(search_word.value)
    return matchCategory && matchSearchWord
  })
})

onMounted(async () => {
  try {
    const response = await getCategories()
    categories.push(...response.data)
  } finally {
  }
})

onMounted(async () => {
  try {
    loading.value = true
    const response = await getBuiltinTools()
    providers.push(...response.data)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <a-spin :loading="loading" class="block h-full w-full">
    <div class="p-6 flex flex-col">
      <!-- 项目顶层标题+创建按钮      -->
      <div class="flex items-center justify-between mb-6">
        <!--左侧标题        -->
        <div class="flex items-center gap-2">
          <a-avatar :size="32" class="bg-blue-700">
            <icon-common :size="18"></icon-common>
          </a-avatar>
          <div class="text-lg font-medium text-gray-900">插件广场</div>
        </div>
        <a-button type="primary">创建自定义插件</a-button>
      </div>
      <!--      插件分类-->
      <div class="flex items-center justify-between mb-6">
        <!--        左侧分类-->
        <div class="flex items-center gap-2">
          <a-button
            :type="category === 'all' ? 'secondary' : 'text'"
            class="rounded-lg !text-gray-700 px-3"
            @click="category = 'all'"
            >全部
          </a-button>
          <a-button
            :type="category === item.category ? 'secondary' : 'text'"
            v-for="item in categories"
            :key="item.category"
            class="rounded-lg !text-gray-700 px-3"
            @click="category = item.category"
            >{{ item.name }}
          </a-button>
        </div>
        <!--        右侧搜索-->
        <a-input-search
          v-model="search_word"
          placeholder="请输入插件名称"
          class="w-[240px] bg-white rounded-lg border-gray-300"
        ></a-input-search>
      </div>
      <!--      底部插件列表-->
      <a-row :gutter="[20, 20]" class="flex-1">
        <!--        有数据的ui状态-->
        <a-col v-for="(provider, idx) in filterProviders" :key="provider.name" :span="6">
          <a-card hoverable class="cursor-pointer rounded-lg" @click="showIdx = idx">
            <!--            顶部提供商名称-->
            <div class="flex items-center gap-3 mb-3">
              <!--              左侧图标-->
              <a-avatar :size="40" shape="square" :style="{ backgroundColor: provider.background }"
                ><img
                  :src="`${apiPrefix}/builtin-tools/${provider.name}/icon`"
                  :alt="provider.name"
              /></a-avatar>
              <!--              右侧工具信息-->
              <div class="flex flex-col">
                <div class="text-base text-gray-900 font-bold">{{ provider.label }}</div>
                <div class="text-xs text-gray-500 line-clamp-1">
                  提供商：{{ provider.name }} · {{ provider.tools.length }} 个插件
                </div>
              </div>
            </div>
            <!--            提供商的描述信息-->
            <div class="leading-[18px] text-gray-500 h-[72px] line-clamp-4 mb-2">
              {{ provider.description }}
            </div>
            <!--          提供商的发布信息-->
            <div class="flex items-center gap-1.5">
              <a-avatar :size="18">
                <icon-user></icon-user>
              </a-avatar>
              <div class="text-xs text-gray-500">
                Amir·发布时间 {{ moment(provider.created_at).format('MM-DD HH:mm') }}
              </div>
            </div>
          </a-card>
        </a-col>
        <!--        没数据的ui状态-->
        <a-col v-if="filterProviders.length == 0" :span="24">
          <a-empty
            description="没有可用的内置插件"
            class="h-[400px] flex flex-col items-center justify-center"
          ></a-empty>
        </a-col>
      </a-row>
      <!--      卡片抽屉-->
      <a-drawer
        title="工具详情"
        :visible="showIdx != -1"
        :width="350"
        :footer="false"
        :drawer-style="{ background: '#F9FAFB' }"
        @cancel="showIdx = -1"
      >
        <!--        showIdx为-1的时候不显示-->
        <div v-if="showIdx !== -1">
          <!--            提供商名称-->
          <div class="flex items-center gap-3 mb-3">
            <!--              左侧图标-->
            <a-avatar
              :size="40"
              shape="square"
              :style="{ backgroundColor: filterProviders[showIdx].background }"
              ><img
                :src="`${apiPrefix}/builtin-tools/${filterProviders[showIdx].name}/icon`"
                :alt="filterProviders[showIdx].name"
            /></a-avatar>
            <!--              右侧工具信息-->
            <div class="flex flex-col">
              <div class="text-base text-gray-900 font-bold">
                {{ filterProviders[showIdx].label }}
              </div>
              <div class="text-xs text-gray-500 line-clamp-1">
                提供商：{{ filterProviders[showIdx].name }} ·
                {{ filterProviders[showIdx].tools.length }} 个插件
              </div>
            </div>
          </div>
          <!--            提供商的描述信息-->
          <div class="leading-[18px] text-gray-500 mb-2">
            {{ filterProviders[showIdx].description }}
          </div>
          <!--          分隔符-->
          <hr class="my-4" />
          <div class="flex flex-col gap-2">
            <div class="text-xs text-gray-500">
              包含 {{ filterProviders[showIdx].tools.length }} 个工具
            </div>
            <!--            工具列表-->
            <a-card
              v-for="tool in filterProviders[showIdx].tools"
              :key="tool.name"
              class="cursor-pointer flex flex-col rounded-xl"
            >
              <!--              工具的名称-->
              <div class="font-bold text-gray-900 mb-2">{{ tool.label }}</div>
              <!--              工具的描述-->
              <div class="text-gray-500 text-xs">{{ tool.description }}</div>
              <div v-if="tool.inputs.length > 0">
                <!--                分割符-->
                <div class="flex items-center gap-2 my-4">
                  <div class="text-xs font-bold text-gray-500">参数</div>
                  <hr class="flex-1" />
                </div>
                <!--                参数列表-->
                <div class="flex flex-col gap-4">
                  <div v-for="input in tool.inputs" :key="input.name" class="flex flex-col gap-2">
                    <!--                     参数-->
                    <div class="flex items-center gap-2 text-xs">
                      <div class="text-gray-900">{{ input.name }}</div>
                      <div class="text-gray-500">{{ typeMap[input.type] }}</div>
                      <div v-if="input.required" class="text-red-700">必填</div>
                    </div>
                    <!--                    描述信息-->
                    <div class="text-gray-500 text-xs">{{ input.description }}</div>
                  </div>
                </div>
              </div>
            </a-card>
          </div>
        </div>
      </a-drawer>
    </div>
  </a-spin>
</template>

<style scoped></style>
