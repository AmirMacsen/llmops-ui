import { get } from '@/utils/request'
import type { GeCategoriesResponse, GetBuiltinToolsResponse } from '@/models/builtin-tool.ts'

// 获取所有的分类信息
export const getCategories = () => {
  return get<GeCategoriesResponse>('/builtin-tools/categories')
}
// 获取所有内置工具列表
export const getBuiltinTools = () => {
  return get<GetBuiltinToolsResponse>('/builtin-tools')
}
