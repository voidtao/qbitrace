<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">网络测试</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="doTest" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">地址</span>
            </label>
            <input 
              type="text" 
              v-model="info.address"
              class="input input-bordered"
              placeholder="输入要测试的地址"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Cookie</span>
            </label>
            <input 
              type="text" 
              v-model="info.cookie"
              class="input input-bordered"
              placeholder="输入 Cookie（可选）"
            />
          </div>

          <div class="form-control">
            <button type="submit" class="btn btn-primary">执行</button>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">结果</span>
            </label>
            <textarea 
              v-model="result" 
              class="textarea textarea-bordered h-96"
              readonly
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const info = ref({
  address: '',
  cookie: ''
})
const result = ref('')

const doTest = async () => {
  try {
    const response = await fetch('/api/setting/network-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(info.value)
    })
    if (!response.ok) throw new Error('测试失败')
    const data = await response.json()
    result.value = data
  } catch (error) {
    toast.error(error.message)
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
