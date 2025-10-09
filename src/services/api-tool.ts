//获取自定义API列表分页数据
import { get, post } from '@/utils/request.ts'
import type {
  CreateApiToolProviderRequest,
  GetApiToolProviderResponse,
  GetApiToolProvidersWithPageResponse,
  UpdateApiToolProviderRequest,
} from '@/models/api-tool.ts'
import type { BaseResponse } from '@/models/base.ts'

export const getApiToolProviderWithPage = (
  current_page: number = 1,
  page_size: number = 20,
  search_word: string = '',
) => {
  return get<GetApiToolProvidersWithPageResponse>('/api-tools', {
    params: {
      current_page,
      page_size,
      search_word,
    },
  })
}

// 校验openapi schema数据
export const validateOpenApiSchema = (schema: string) => {
  return post<BaseResponse<any>>('/api-tools/validate-openapi-schema', {
    body: {
      openapi_schema: schema,
    },
  })
}

// 创建自定义API工具提供者
export const createApiToolProvider = (request: CreateApiToolProviderRequest) => {
  return post<BaseResponse<any>>('/api-tools', { body: request })
}

// 删除自定义API工具提供者
export const deleteApiToolProvider = (provider: string) => {
  return post<BaseResponse<any>>(`/api-tools/${provider}/delete`)
}

// 更新自定义API工具提供者
export const updateApiToolProvider = (
  provider_id: string,
  request: UpdateApiToolProviderRequest,
) => {
  return post<BaseResponse<any>>(`/api-tools/${provider_id}/update`, { body: request })
}

// 查看自定义API工具提供者详情
export const getApiToolProvider = (provider_id: string) => {
  return get<BaseResponse<GetApiToolProviderResponse>>(`/api-tools/${provider_id}`)
}
