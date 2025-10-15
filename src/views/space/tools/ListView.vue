<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  createApiToolProvider,
  deleteApiToolProvider,
  getApiToolProvider,
  getApiToolProviderWithPage,
  updateApiToolProvider,
  validateOpenApiSchema,
} from '@/services/api-tool.ts'
import moment from 'moment'
import { typeMap } from '@/config'
import { useRoute } from 'vue-router'
import { Form, Message, Modal, ValidatedError } from '@arco-design/web-vue'
import type { CreateApiToolProviderRequest } from '@/models/api-tool.ts'

const providers = reactive<Array<any>>([])
const paginator = reactive<any>({
  current_page: 1,
  page_size: 20,
  total_page: 0,
  total_record: 0,
})
const loading = ref<boolean>(false)
const showIdx = ref<number>(-1)
const showUpdateModal = ref<boolean>(false)
const showUpdateModalLoading = ref(false)
const submitLoading = ref(false)
const route = useRoute()
const form = reactive<any>({
  icon: 'https://picsum.photos/400',
  name: 'TEST',
  openapi_schema: '',
  headers: [] as { key: string; value: string }[],
})
const formRef = ref<InstanceType<typeof Form>>(null)

const props = defineProps({
  createType: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(['update-create-type'])

const loadMorData = async (init: boolean = false) => {
  // 检测是否需要加载数据
  if (!init && paginator.current_page >= paginator.total_page) return

  // 加载更多数据
  try {
    const resp = await getApiToolProviderWithPage(
      paginator.current_page,
      paginator.page_size,
      String(route.query?.search_word ?? ''),
    )
    const data = resp.data
    // 更新分页
    paginator.current_page = data.paginator.current_page
    paginator.page_size = data.paginator.page_size
    paginator.total_page = data.paginator.total_page
    paginator.total_record = data.paginator.total_record

    // 判断是否存在更多数据
    if (paginator.current_page <= paginator.total_page) {
      paginator.current_page += 1
    }
    // 追加或者覆盖数据
    if (init) {
      providers.splice(0, providers.length, ...data.list)
    } else {
      providers.push(...data.list)
    }
  } finally {
    loading.value = false
  }
}

// 初始化加载数据
const initData = async () => {
  // 初始化分页器
  paginator.current_page = 1
  paginator.page_size = 20
  paginator.total_page = 0
  paginator.total_record = 0
  // 更新数据
  await loadMorData(true)
}

const handleScroll = (event: UIEvent) => {
  // 获取滚动的距离
  const { scrollTop, scrollHeight, offsetHeight } = event.target as HTMLElement
  if (scrollTop + offsetHeight >= scrollHeight - 10) {
    if (loading.value) {
      return
    }
    loadMorData()
  }
}

// 取消显示模态框
const handleCancel = () => {
  // 重置表单的数据
  if (formRef.value) {
    formRef.value.resetFields()
  }
  emits('update-create-type', '')
  showUpdateModal.value = false
}

// 打开更新模态框
const handleUpdate = async () => {
  try {
    // 获取当前显示的providerId
    showUpdateModal.value = true
    showUpdateModalLoading.value = true
    const provider_id = providers[showIdx.value]['id']
    // 根据id获取工具提供商的详情
    const response = await getApiToolProvider(provider_id)
    console.log(response)
    const data = response.data
    // 数据更新
    formRef.value.resetFields()
    form.icon = data.icon
    form.name = data.name
    form.openapi_schema = data.openapi_schema
    form.headers = data.headers
  } finally {
    showUpdateModalLoading.value = false
  }
}

// 提交表单模态窗处理器
const handleSubmit = async ({
  values,
  errors,
}: {
  values: Record<string, any>
  errors: Record<string, ValidatedError> | undefined
}) => {
  if (errors) {
    return
  }
  try {
    // 将模态窗按钮设置为加载状态
    submitLoading.value = true

    // 根据暴怒同的类型发起不同的请求
    if (props.createType === 'tool') {
      // 创建请求
      const response = await createApiToolProvider(values as CreateApiToolProviderRequest)
      Message.success(response.message)
    } else if (showUpdateModal.value === true) {
      // 更新请求
      const response = await updateApiToolProvider(
        providers[showIdx.value]['id'],
        values as CreateApiToolProviderRequest,
      )
      Message.success(response.message)
    }

    // 后续操作
    handleCancel()
    showIdx.value = -1
  } finally {
    submitLoading.value = false
  }

  await initData()
}

// 删除工具提供者处理器
const handleDelete = () => {
  // 点击后二次确认
  Modal.warning({
    title: '删除这个工具？',
    content: '删除工具不可逆，AI应用将服务访问该工具',
    hideCancel: false,
    onOk: async () => {
      try {
        // 删除请求
        const response = await deleteApiToolProvider(providers[showIdx.value]['id'])
        // 显示成功信息
        Message.success(response.message)
      } finally {
        // 关闭模态窗
        handleCancel()
        showIdx.value = -1
        // 刷新数据
        await initData()
      }
    },
  })
}

onMounted(async () => {
  await loadMorData(true)
})

watch(
  () => route.query?.search_word,
  async () => {
    await initData()
  },
)

const tools = computed(() => {
  // 解析openapi_schema数据
  try {
    const available_tools = []
    const openapi_schema = JSON.parse(form.openapi_schema)
    // 检测是否存在paths路径
    if ('paths' in openapi_schema) {
      // 循环所有的paths并提取工具
      for (const path in openapi_schema['paths']) {
        // 遍历path下的get和post方法
        for (const method in openapi_schema['paths'][path]) {
          if (['get', 'post'].includes(method)) {
            const tool = openapi_schema['paths'][path][method]
            if ('operationId' in tool && 'description' in tool) {
              available_tools.push({
                name: tool?.operationId,
                description: tool?.description,
                method: method,
                path: path,
              })
            }
          }
        }
      }
    }
    return available_tools
  } catch (e) {
    return []
  }
})
</script>

<template>
  <a-spin
    @scroll="handleScroll"
    :loading="loading"
    class="block h-full w-full scrollbar-w-none overflow-scroll"
  >
    <!--      底部插件列表-->
    <a-row :gutter="[20, 20]" class="flex-1">
      <!--        有数据的ui状态-->
      <a-col v-for="(provider, idx) in providers" :key="provider.name" :span="6">
        <a-card hoverable class="cursor-pointer rounded-lg" @click="showIdx = idx">
          <!--            顶部提供商名称-->
          <div class="flex items-center gap-3 mb-3">
            <!--              左侧图标-->
            <a-avatar :size="40" shape="square" :image-url="provider.icon"></a-avatar>
            <!--              右侧工具信息-->
            <div class="flex flex-col">
              <div class="text-base text-gray-900 font-bold">{{ provider.name }}</div>
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
              Amir·编辑时间 {{ moment(provider.created_at).format('MM-DD HH:mm') }}
            </div>
          </div>
        </a-card>
      </a-col>
      <!--        没数据的ui状态-->
      <a-col v-if="providers.length == 0" :span="24">
        <a-empty
          description="没有可用的API插件"
          class="h-[400px] flex flex-col items-center justify-center"
        ></a-empty>
      </a-col>
    </a-row>
    <!--      loading-->
    <a-row v-if="paginator.total_page >= 2">
      <!--        加载数据中-->
      <a-col v-if="paginator.current_page <= paginator.total_page" :span="24" align="center">
        <a-space class="my-4">
          <a-spin></a-spin>
          <div class="text-gray-400"></div>
        </a-space>
      </a-col>
      <!--        加载数据完成-->
      <a-col v-else :span="24" align="center">
        <div class="text-gray-400 my-4">加载完成</div>
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
          <a-avatar :size="40" shape="square" :image-url="providers[showIdx].icon"></a-avatar>
          <!--              右侧工具信息-->
          <div class="flex flex-col">
            <div class="text-base text-gray-900 font-bold">
              {{ providers[showIdx].name }}
            </div>
            <div class="text-xs text-gray-500 line-clamp-1">
              提供商：{{ providers[showIdx].name }} · {{ providers[showIdx].tools.length }} 个插件
            </div>
          </div>
        </div>
        <!--            提供商的描述信息-->
        <div class="leading-[18px] text-gray-500 mb-2">
          {{ providers[showIdx].description }}
        </div>
        <!--        编辑按钮-->
        <a-button
          :loading="showUpdateModalLoading"
          type="dashed"
          long
          class="mb-2 rounded-lg"
          @click="handleUpdate"
        >
          <template #icon>
            <icon-settings />
          </template>
          编辑工具
        </a-button>
        <!--          分隔符-->
        <hr class="my-4" />
        <div class="flex flex-col gap-2">
          <div class="text-xs text-gray-500">包含 {{ providers[showIdx].tools.length }} 个工具</div>
          <!--            工具列表-->
          <a-card
            v-for="tool in providers[showIdx].tools"
            :key="tool.name"
            class="cursor-pointer flex flex-col rounded-xl"
          >
            <!--              工具的名称-->
            <div class="font-bold text-gray-900 mb-2">{{ tool.name }}</div>
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
    <!--    新建/修改模态窗-->
    <a-modal
      :with="630"
      :visible="props.createType === 'tool' || showUpdateModal"
      hide-title
      :footer="false"
      madal-class="rounded-xl"
      @cancel="handleCancel"
    >
      <!--      顶部标题-->
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold text-gray-700">
          {{ props.createType == 'tool' ? '新建' : '编辑' }}插件
        </div>
        <a-button type="text" class="!text-gray-700" size="small" @click="handleCancel">
          <template #icon>
            <icon-close></icon-close>
          </template>
        </a-button>
      </div>
      <!--      中间表单-->
      <div class="pt-6">
        <a-form layout="vertical" ref="formRef" :model="form" @submit="handleSubmit">
          <a-form-item field="icon" hide-label :rules="[{ required: true, message: '请选择图标' }]">
            <a-upload
              v-model="form.icon"
              :limit="1"
              list-type="picture-card"
              accept="image/png, image/jpg"
              class="!w-auto mx-auto"
            ></a-upload>
          </a-form-item>
          <a-form-item
            field="name"
            label="插件名称"
            asterisk-position="end"
            :rules="[{ required: true, message: '请输入名称' }]"
          >
            <a-input
              v-model="form.name"
              placeholder="请输入插件名称"
              show-word-limit
              max-length="60"
            ></a-input>
          </a-form-item>
          <a-form-item
            field="openapi_schema"
            label="OpenAPI Schema"
            asterisk-position="end"
            :rules="[{ required: true, message: '请输入 OpenAPI Schema' }]"
          >
            <a-textarea
              v-model="form.openapi_schema"
              :auto-size="{ minRows: 4, maxRows: 8 }"
              placeholder="请输入 OpenAPI Schema"
              @blur="
                async () => {
                  if (form.openapi_schema.trim() !== '') {
                    // 请求校验openapi_schema接口
                    await validateOpenApiSchema(form.openapi_schema)
                  }
                }
              "
            ></a-textarea>
          </a-form-item>

          <a-form-item label="可用工具">
            <!--            可用工具表格-->
            <div class="rounded-lg border border-gray-200 w-full overflow-x-auto">
              <table class="w-full leading-[18px] text-xs text-gray-700 font-normal">
                <thead class="text-gray-500">
                  <tr class="border-b border-gray-200">
                    <th class="p-2 pl-3 font-medium">名称</th>
                    <th class="p-2 pl-3 font-medium w-[200px]">描述</th>
                    <th class="p-2 pl-3 font-medium">方法</th>
                    <th class="p-2 pl-3 font-medium">路径</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(tool, idx) in tools"
                    :key="idx"
                    class="border-b last:border-0 border-gray-200 text-gray-700"
                  >
                    <td class="p-2 pl-3">{{ tool.name }}</td>
                    <td class="p-2 pl-3 w-[200px]">{{ tool.description }}</td>
                    <td class="p-2 pl-3">{{ tool.method }}</td>
                    <td class="p-2 pl-3 w-[62px]">{{ tool.path }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </a-form-item>
          <a-form-item label="headers">
            <!--            请求头表单-->
            <div class="rounded-lg border border-gray-200 w-full overflow-x-auto">
              <table class="w-full leading-[18px] text-xs text-gray-700 font-normal mb-3">
                <thead class="text-gray-500">
                  <tr class="border-b border-gray-200">
                    <th class="p-2 pl-3 font-medium">Key</th>
                    <th class="p-2 pl-3 font-medium">Value</th>
                    <th class="p-2 pl-3 font-medium w-[50px]">操作</th>
                  </tr>
                </thead>
                <tbody v-if="form.headers.length > 0" class="border-b border-gray-200">
                  <tr
                    v-for="(header, idx) in form.headers"
                    :key="idx"
                    class="border-b last:border-0 border-gray-200"
                  >
                    <td class="p-2 pl-3">
                      <a-form-item :field="`headers[${idx}].key`" hide-label class="m-0">
                        <a-input v-model="header.key" placeholder="请输入请求头键名"></a-input>
                      </a-form-item>
                    </td>
                    <td class="p-2 pl-3">
                      <a-form-item :field="`headers[${idx}].value`" hide-label class="m-0">
                        <a-input v-model="header.value" placeholder="请输入请求头键值"></a-input>
                      </a-form-item>
                    </td>
                    <td class="p-2 pl-3">
                      <a-button
                        size="mini"
                        type="text"
                        class="!text-gray-700"
                        @click="form.headers.splice(idx, 1)"
                      >
                        <template #icon>
                          <icon-delete></icon-delete>
                        </template>
                      </a-button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <a-button
                size="mini"
                class="rounded ml-3 mb-3 !text-gray-700"
                @click="form.headers.push({ key: '', value: '' })"
              >
                <template #icon>
                  <icon-plus></icon-plus>
                </template>
              </a-button>
            </div>
          </a-form-item>
          <!--          底部按钮-->
          <div class="flex items-center justify-between">
            <div class="">
              <a-button
                v-if="showUpdateModal"
                class="rounded-lg !text-gray-700"
                @click="handleDelete"
                >删除
              </a-button>
            </div>
            <a-space :size="16">
              <a-button class="rounded-lg" @click="handleCancel">取消</a-button>
              <a-button type="primary" html-type="submit" class="rounded-lg">保存</a-button>
            </a-space>
          </div>
        </a-form>
      </div>
    </a-modal>
  </a-spin>
</template>

<style scoped></style>
