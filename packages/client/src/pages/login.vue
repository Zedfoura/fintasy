<!--
  @author: adibarra (Alec Ibarra), Mariptime (Akshay), Zedfoura (Tinatsei Chingaya), Antigravity
  @description: Tactical fintech/cyberpunk authentication portal for Stock Royale & Fintasy platform
-->
<script setup lang="ts">
import {
  NAlert,
  NButton,
  NCard,
  NCheckbox,
  NInput,
  NTabPane,
  NTabs,
  NTag,
} from 'naive-ui'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const state = useStateStore()
const fintasy = useAPI()

const activeTab = useStorage<'login' | 'register' | 'guest'>('login-active-tab', 'login')
const rememberMe = useStorage('login-remember-me', false)
const username = useStorage('login-username', '')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)
const capsLockActive = ref(false)

useHead({
  title: `${t('pages.login.title')} • Fintasy`,
})

// Check caps lock status on key events
function checkCapsLock(event: any) {
  if (!event)
    return
  if (typeof event.getModifierState === 'function')
    capsLockActive.value = Boolean(event.getModifierState('CapsLock') || event.modifierCapsLock)
  else if (event.modifierCapsLock !== undefined)
    capsLockActive.value = Boolean(event.modifierCapsLock)
}

function clearCapsLock() {
  capsLockActive.value = false
}

function onLoginPasswordKeydown(event: KeyboardEvent) {
  checkCapsLock(event)
  if (event.key === 'Enter')
    handleLogin()
}

function onRegisterPasswordKeydown(event: KeyboardEvent) {
  checkCapsLock(event)
  if (event.key === 'Enter')
    handleRegister()
}

// Redirect on authenticated state once async loading settles
watch(() => [fintasy.authenticated.value, isLoading.value], () => {
  if (fintasy.authenticated.value && !isLoading.value) {
    const destination = (route.query.redirect as string) || '/dashboard'
    router.push(destination)
  }
}, { immediate: true })

async function handleLogin() {
  error.value = ''
  if (!username.value.trim() || !password.value) {
    error.value = t('pages.login.missing-credentials')
    return
  }

  isLoading.value = true
  try {
    const res = await fintasy.login({
      username: username.value.trim(),
      password: password.value,
    })

    switch (res.code) {
      case 404:
        error.value = t('pages.login.no-account-found')
        break
      case 403:
        error.value = t('pages.login.invalid-credentials')
        break
      case 200:
        if (!rememberMe.value)
          username.value = ''
        if ('data' in res && res.data)
          state.user.uuid = res.data.owner
        break
      default:
        error.value = t('pages.login.unknown-error')
        break
    }
  }
  catch {
    error.value = t('pages.login.unknown-error')
  }
  finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  if (!email.value.trim() || !username.value.trim() || !password.value) {
    error.value = t('pages.login.missing-credentials')
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = t('pages.login.password-mismatch')
    return
  }

  isLoading.value = true
  try {
    const createUser = await fintasy.createUser({
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value,
    })

    switch (createUser.code) {
      case 400:
        error.value = t('pages.login.invalid-registration')
        break
      case 409:
        error.value = t('pages.login.unique-taken')
        break
      case 200:
        // Automatically sign in upon successful registration
        await handleLogin()
        return
      default:
        error.value = t('pages.login.unknown-error')
        break
    }
  }
  catch {
    error.value = t('pages.login.unknown-error')
  }
  finally {
    isLoading.value = false
  }
}

async function handleGuestLogin() {
  error.value = ''
  isLoading.value = true
  try {
    const res = await state.loginAsGuest()
    if (res.code !== 200)
      error.value = t('pages.login.unknown-error')
  }
  catch {
    error.value = t('pages.login.unknown-error')
  }
  finally {
    isLoading.value = false
  }
}

function onTabChange(tab: 'login' | 'register' | 'guest') {
  activeTab.value = tab
  error.value = ''
  capsLockActive.value = false
  if (tab === 'register')
    confirmPassword.value = ''
}
</script>

<template>
  <div class="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
    <!-- Cyberpunk Terminal Outer Card -->
    <NCard
      class="max-w-[480px] w-full border border-[#1f2438] bg-[#0c0d14]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      size="large"
    >
      <!-- Header HUD -->
      <div class="mb-6 flex flex-col items-center text-center">
        <div class="mb-2 flex items-center gap-2">
          <span class="h-2 w-2 animate-ping rounded-full bg-[#00e676]" />
          <NTag size="small" type="success" :bordered="false" class="tracking-widest font-mono uppercase">
            LIVE TICK ENGINE
          </NTag>
        </div>
        <h1 class="text-2xl text-white font-black tracking-wider font-mono">
          STOCK ROYALE
        </h1>
        <p class="text-xs text-[#00e5ff] tracking-widest font-mono uppercase">
          {{ t('pages.login.terminal-access') }}
        </p>
      </div>

      <!-- Mode Selector Tabs -->
      <NTabs
        :value="activeTab"
        type="segment"
        animated
        class="mb-6"
        @update:value="onTabChange as any"
      >
        <NTabPane name="login" :tab="t('pages.login.operator-login')" />
        <NTabPane name="register" :tab="t('pages.login.enlist-trader')" />
        <NTabPane name="guest" :tab="t('pages.login.quick-play')" />
      </NTabs>

      <!-- Error Feedback Banner -->
      <NAlert
        v-if="error"
        type="error"
        closable
        class="mb-4 text-xs font-mono"
        @close="error = ''"
      >
        {{ error }}
      </NAlert>

      <!-- Caps Lock Warning -->
      <NAlert
        v-if="capsLockActive"
        type="warning"
        class="mb-4 text-xs font-mono"
      >
        <div class="flex items-center gap-2">
          <span class="font-bold">⚠️</span>
          <span>{{ t('pages.login.caps-lock-warning') }}</span>
        </div>
      </NAlert>

      <!-- 1. SIGN IN FORM -->
      <div v-if="activeTab === 'login'" class="space-y-4">
        <div>
          <label class="mb-1 block text-xs text-gray-400 tracking-wider font-mono uppercase">
            {{ t('pages.login.username') }}
          </label>
          <NInput
            v-model:value="username"
            :placeholder="t('pages.login.username')"
            :maxlength="20"
            size="large"
            autocomplete="username"
            class="font-mono"
            @keydown.enter="handleLogin"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs text-gray-400 tracking-wider font-mono uppercase">
            {{ t('pages.login.password') }}
          </label>
          <NInput
            v-model:value="password"
            type="password"
            show-password-on="click"
            :placeholder="t('pages.login.password')"
            size="large"
            autocomplete="current-password"
            class="font-mono"
            @keydown="onLoginPasswordKeydown"
            @keyup="checkCapsLock"
            @blur="clearCapsLock"
          />
        </div>

        <div class="flex items-center justify-between py-1">
          <NCheckbox v-model:checked="rememberMe">
            <span class="text-xs text-gray-400 font-mono">
              {{ t('pages.login.remember-me') }}
            </span>
          </NCheckbox>
        </div>

        <NButton
          type="primary"
          size="large"
          block
          :loading="isLoading"
          class="h-12 text-sm font-bold tracking-wider font-mono uppercase"
          @click="handleLogin"
        >
          {{ t('pages.login.sign-in') }}
        </NButton>
      </div>

      <!-- 2. REGISTER FORM -->
      <div v-else-if="activeTab === 'register'" class="space-y-4">
        <div>
          <label class="mb-1 block text-xs text-gray-400 tracking-wider font-mono uppercase">
            {{ t('pages.login.email') }}
          </label>
          <NInput
            v-model:value="email"
            :placeholder="t('pages.login.email')"
            size="large"
            autocomplete="email"
            class="font-mono"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs text-gray-400 tracking-wider font-mono uppercase">
            {{ t('pages.login.username') }}
          </label>
          <NInput
            v-model:value="username"
            :placeholder="t('pages.login.username')"
            :maxlength="20"
            :status="username.length >= 3 || username.length === 0 ? undefined : 'error'"
            size="large"
            autocomplete="username"
            class="font-mono"
          />
          <p class="mt-1 text-[11px] text-gray-400 font-mono">
            {{ t('pages.login.username-requirements') }}
          </p>
        </div>

        <div>
          <label class="mb-1 block text-xs text-gray-400 tracking-wider font-mono uppercase">
            {{ t('pages.login.password') }}
          </label>
          <NInput
            v-model:value="password"
            type="password"
            show-password-on="click"
            :placeholder="t('pages.login.password')"
            :status="password.length >= 6 || password.length === 0 ? undefined : 'error'"
            size="large"
            autocomplete="new-password"
            class="font-mono"
            @keydown="onRegisterPasswordKeydown"
            @keyup="checkCapsLock"
            @blur="clearCapsLock"
          />
          <p class="mt-1 text-[11px] text-gray-400 font-mono">
            {{ t('pages.login.password-requirements') }}
          </p>
        </div>

        <div>
          <label class="mb-1 block text-xs text-gray-400 tracking-wider font-mono uppercase">
            {{ t('pages.login.confirm') }}
          </label>
          <NInput
            v-model:value="confirmPassword"
            type="password"
            show-password-on="click"
            :placeholder="t('pages.login.confirm-password')"
            :status="password && confirmPassword ? (password === confirmPassword ? 'success' : 'error') : undefined"
            size="large"
            autocomplete="new-password"
            class="font-mono"
            @keydown="onRegisterPasswordKeydown"
            @keyup="checkCapsLock"
            @blur="clearCapsLock"
          />
        </div>

        <NButton
          type="primary"
          size="large"
          block
          :loading="isLoading"
          class="h-12 text-sm font-bold tracking-wider font-mono uppercase"
          @click="handleRegister"
        >
          {{ t('pages.login.create-account') }}
        </NButton>
      </div>

      <!-- 3. GUEST QUICK-PLAY DEMO -->
      <div v-else-if="activeTab === 'guest'" class="space-y-4">
        <div class="border border-[#00e676]/30 rounded-lg bg-[#00e676]/5 p-4 text-center">
          <div class="mb-1 text-sm text-white font-bold tracking-wide font-mono">
            {{ t('pages.login.quick-play-title') }}
          </div>
          <div class="mb-3 text-xs text-gray-400 font-mono">
            {{ t('pages.login.quick-play-desc') }}
          </div>
          <NTag type="success" size="large" class="font-bold tracking-widest font-mono">
            💰 $15,000.00 STARTING POT
          </NTag>
        </div>

        <NButton
          type="success"
          size="large"
          block
          :loading="isLoading"
          class="h-12 text-sm font-bold tracking-wider font-mono uppercase"
          @click="handleGuestLogin"
        >
          ⚡ {{ t('pages.login.deploy-guest') }}
        </NButton>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
:deep(.n-tabs-rail) {
  background-color: #121526 !important;
}
:deep(.n-tabs-tab) {
  font-family: monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>

<route lang="yaml">
meta:
  layout: home
</route>
