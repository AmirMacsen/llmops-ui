// 获取自定义API插件响应结果
import type { BasePaginatorResponse } from '@/models/base.ts'

export type GetApiToolProvidersWithPageResponse = BasePaginatorResponse<{
  id: string
  name: string
  icon: string
  description: string
  headers: Array<any>
  tools: Array<any>
  created_at: number
}>

// 新增自定义api插件
export type CreateApiToolProviderRequest = {
  name: string
  icon: string
  headers: Array<any>
  openapi_schema: string
}

// 更新自定义api插件
export type UpdateApiToolProviderRequest = {
  name: string
  icon: string
  headers: Array<any>
  openapi_schema: string
}

// 获取自定义api插件
export type GetApiToolProviderResponse = {
  id: string
  name: string
  icon: string
  openapi_schema: string
  headers: Array<any>
  created_at: number
}
