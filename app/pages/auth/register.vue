<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title justify-center text-2xl mb-6">Register</h1>
        
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Name</span>
            </label>
            <input 
              v-model="form.name"
              type="text" 
              placeholder="Enter your name"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.name }"
              required
            />
            <div v-if="errors.name" class="label">
              <span class="label-text-alt text-error">{{ errors.name }}</span>
            </div>
          </div>

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
              placeholder="Enter your password (min. 6 characters)"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.password }"
              required
              minlength="6"
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
              {{ isLoading ? 'Creating account...' : 'Register' }}
            </button>
          </div>
        </form>

        <div class="divider">Already have an account?</div>
        
        <NuxtLink to="/login" class="btn btn-outline btn-secondary">
          Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const form = reactive({
  name: '',
  email: '',
  password: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  general: ''
})

const isLoading = ref(false)

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.general = ''
}

const { setUser } = useAuth()

const handleRegister = async () => {
  clearErrors()
  isLoading.value = true

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        password: form.password
      }
    })

    // Update the user state with the registration response
    setUser(response.user)
    
    await navigateTo('/')
  } catch (error) {
    if (error.statusCode === 400) {
      if (error.statusMessage.includes('Email already exists')) {
        errors.email = 'Email already exists'
      } else if (error.statusMessage.includes('Password must be')) {
        errors.password = error.statusMessage
      } else {
        errors.general = error.statusMessage
      }
    } else {
      errors.general = 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

definePageMeta({
  layout: false
})
</script>