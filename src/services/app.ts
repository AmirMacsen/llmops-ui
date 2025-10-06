import { post } from '@/utils/request.ts'
import type { DebugAppResponse } from '@/models/app.ts'

export const debugApp = (appId: string, query: string) => {
  return post<DebugAppResponse>(`/apps/${appId}/debug`, {
    body: {
      query: query,
    },
  })
}
