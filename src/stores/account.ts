import { defineStore } from 'pinia'
import { ref } from 'vue'

const initAccount = {
  name: 'account',
  email: 'email',
  avatar: 'avatar',
}

export const useAccountStore = defineStore('account', () => {
  // 定义数据
  const account = ref({ ...initAccount })

  function update(params: any) {
    Object.assign(account.value, params)
  }

  function clear() {
    account.value = { ...initAccount }
  }

  return { account, update, clear }
})
