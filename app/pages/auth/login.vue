<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title justify-center text-2xl mb-6">Login</h1>
        
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input 
              v-model="form.email"
              type="email" 
              placeholder="Enter your email"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.email }"
              required
            />
            <div v-if="errors.email" class="label">
              <span class="label-text-alt text-error">{{ errors.email }}</span>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input 
              v-model="form.password"
              type="password" 
              placeholder="Enter your password"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.password }"
              required
            />
            <div v-if="errors.password" class="label">
              <span class="label-text-alt text-error">{{ errors.password }}</span>
            </div>
          </div>

          <div v-if="errors.general" class="alert alert-error">
            <span>{{ errors.general }}</span>
          </div>

          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
        </form>

        <div class="divider">Don't have an account?</div>
        
        <NuxtLink to="/register" class="btn btn-outline btn-secondary">
          Register
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const isLoading = ref(false)

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  errors.general = ''
}

const handleLogin = async () => {
  clearErrors()
  isLoading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      }
    })

    await navigateTo('/')
  } catch (error) {
    if (error.statusCode === 401) {
      errors.general = 'Invalid email or password'
    } else if (error.statusCode === 400) {
      errors.general = error.statusMessage
    } else {
      errors.general = 'Login failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

definePageMeta({
  layout: false
})
</script>