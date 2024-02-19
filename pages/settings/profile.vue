<script setup>
import {z} from 'zod'
const pending = ref(false)


const subabase = useSupabaseClient()
const user = useSupabaseUser()

const {toastSuccess, toastError} = useAppToast()

const state = ref({
    name: user.value.user_metadata?.full_name,
    email: user.value.email
})

const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email()
})

const saveProfile = async () => {
    pending.value = true

    try {
        const data ={
            data: {
                full_name: state.value.name
            }
        }

        if (state.value.email != user.value.email) {
            data.email = state.value.email
        }
        console.log(data)
        const {error} = await subabase.auth.updateUser(data)
        if (error) throw error

        toastSuccess({
            title: 'Profile Updated',
            description: 'Your profile has been updated'
        })
    } catch (error) 
    { toastError({
        title: 'Profile Error',
        description: error.message
    })
       
    } finally {
        pending.value = false
    }
}

</script>
<template>
    <ClientOnly>
    <UForm :state="state" :schema="schema" @submit="saveProfile">
        
        <UFormGroup class="mb-4" label="Full Name" name="name">
            <UInput v-model="state.name" />
        </UFormGroup>
        <UFormGroup class="mb-4" label="Enter Email" name="email" help="You will recieve on both the old and the new addresses if you enter your email">
            <UInput v-model="state.email" />
        </UFormGroup>
        
        <UButton type="submit" color="black" variant="solid" label="Save" :loading="pending"/>
    
    </UForm>
</ClientOnly>
</template>