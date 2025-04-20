<template>
  <div class="min-h-screen flex">
    <!-- 侧边栏 -->
    <div class="hidden md:block w-64 bg-base-200">
      <div class="h-full flex flex-col">
        <div class="p-4">
          <div class="flex items-center cursor-pointer" @click="gotoWiki">
            <img src="/assets/images/logo.svg" class="w-8 h-8" alt="logo"/>
            <span class="text-xl font-bold ml-2">qbitrace</span>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <ul class="menu p-4">
            <template v-for="item in menu" :key="item.path">
              <li v-if="!item.hidden && !item.sub">
                <a 
                  :class="{ 'active': selectedKeys.includes(item.path) }"
                  @click="goto(item.path)"
                >
                  <i class="w-8">
                    <fa-icon :icon="item.icon"/>
                  </i>
                  {{ item.title }}
                </a>
              </li>
              
              <li v-if="!item.hidden && item.sub">
                <details :open="openKeys.includes(item.path)">
                  <summary>
                    <i class="w-8">
                      <fa-icon :icon="item.icon"/>
                    </i>
                    {{ item.title }}
                  </summary>
                  <ul>
                    <li 
                      v-for="subItem in item.sub" 
                      :key="subItem.path"
                      v-if="!subItem.hidden"
                    >
                      <a 
                        :class="{ 'active': selectedKeys.includes(subItem.path) }"
                        @click="goto(subItem.path)"
                      >
                        <i class="w-8">
                          <fa-icon :icon="subItem.icon"/>
                        </i>
                        {{ subItem.title }}
                      </a>
                    </li>
                  </ul>
                </details>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>

    <!-- 移动端抽屉 -->
    <div class="drawer md:hidden">
      <input id="drawer" type="checkbox" class="drawer-toggle" v-model="visible"/>
      <div class="drawer-content">
        <div class="navbar bg-base-100">
          <div class="flex-none">
            <label for="drawer" class="btn btn-square btn-ghost">
              <fa-icon :icon="['fas', 'bars']"/>
            </label>
          </div>
          <div class="flex-1">
            <div class="flex items-center">
              <img src="/assets/images/logo.svg" class="w-8 h-8" alt="logo"/>
              <span class="text-xl font-bold ml-2">qbitrace</span>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-side">
        <label for="drawer" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 min-h-full bg-base-200">
          <div class="p-4">
            <div class="flex items-center cursor-pointer" @click="gotoWiki">
              <img src="/assets/images/logo.svg" class="w-8 h-8" alt="logo"/>
              <span class="text-xl font-bold ml-2">qbitrace</span>
            </div>
          </div>
          
          <template v-for="item in menu" :key="item.path">
            <li v-if="!item.hidden && !item.sub">
              <a 
                :class="{ 'active': selectedKeys.includes(item.path) }"
                @click="goto(item.path); visible = false"
              >
                <i class="w-8">
                  <fa-icon :icon="item.icon"/>
                </i>
                {{ item.title }}
              </a>
            </li>
            
            <li v-if="!item.hidden && item.sub">
              <details :open="openKeys.includes(item.path)">
                <summary>
                  <i class="w-8">
                    <fa-icon :icon="item.icon"/>
                  </i>
                  {{ item.title }}
                </summary>
                <ul>
                  <li 
                    v-for="subItem in item.sub" 
                    :key="subItem.path"
                    v-if="!subItem.hidden"
                  >
                    <a 
                      :class="{ 'active': selectedKeys.includes(subItem.path) }"
                      @click="goto(subItem.path); visible = false"
                    >
                      <i class="w-8">
                        <fa-icon :icon="subItem.icon"/>
                      </i>
                      {{ subItem.title }}
                    </a>
                  </li>
                </ul>
              </details>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-y-auto">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const selectedKeys = ref([])
const openKeys = ref([])
const visible = ref(false)
const menu = ref([])

const goto = (to) => {
  router.push(to)
  setTimeout(() => {
    selectedKeys.value = [route.path]
    const keys = []
    for (const item of menu.value.filter(item => item.sub)) {
      if (route.path.startsWith(item.path)) {
        keys.push(item.path)
      }
    }
    openKeys.value = keys
  }, 100)
}

const gotoWiki = () => {
  window.open('https://wiki.vertex-app.top')
}

onMounted(async () => {
  selectedKeys.value = [route.path]
  try {
    const response = await fetch('/api/user')
    const data = await response.json()
    toast.success('欢迎回来')
    menu.value = data.menu
    const keys = []
    for (const item of menu.value.filter(item => item.sub)) {
      if (route.path.startsWith(item.path)) {
        keys.push(item.path)
      }
    }
    openKeys.value = keys
  } catch (error) {
    toast.error(error.message)
  }
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>