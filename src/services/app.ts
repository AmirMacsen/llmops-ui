import { ssePost } from '@/utils/request.ts'

export const debugApp = (
  appId: string,
  query: string,
  onData: (event_response: { [key: string]: any }) => void,
) => {
  return ssePost(
    `/apps/${appId}/debug`,
    {
      body: {
        query: query,
      },
    },
    onData,
  )
}
