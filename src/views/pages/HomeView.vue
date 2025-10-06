<script setup lang="ts">
import { useCounterStore } from '@/stores/counter.ts'
import { useAccountStore } from '@/stores/account.ts'

const counterStore = useCounterStore()
const accountStore = useAccountStore()

const updateAccount = () => {
  accountStore.update({ name: 'amir' })
}
</script>
<template>
  <p>这里是主页</p>
  <p>username: {{ accountStore.account.name }}</p>
  <p>email: {{ accountStore.account.email }}</p>
  <a-button type="primary" @click="updateAccount">更新用户</a-button>
  <p>count: {{ counterStore.count }}</p>
  <p>double: {{ counterStore.doubleCount }}</p>
  <a-button type="primary" @click="counterStore.increment()">数值+1</a-button>
</template>

<style scoped></style>
