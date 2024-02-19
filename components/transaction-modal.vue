<script setup>
import { z } from 'zod'
 const props = defineProps({
        modelValue: Boolean,
        transaction: {
            type: Object,
            required: false
        }
    })
const isEditing = computed(() => !!props.transaction)
const emit = defineEmits(['update:modelValue', 'saved'])

const defaultSchema = z.object({
    created_at: z.string(),
    description: z.string().optional(),
    amount: z.number().positive('Amount needs to be more then zero')
})

const incomeSchema = z.object({
    type: z.literal('Income')
})

const expenseSchema = z.object({
    type: z.literal('Expense'),
    category: z.enum(categories)
})

const investmentSchema = z.object({
    type: z.literal('Investment')
})

const savingsSchema = z.object({
    type: z.literal('Saving')
})

const schema = z.intersection(
    z.discriminatedUnion('type', [ incomeSchema, expenseSchema, investmentSchema, savingsSchema ]),
    defaultSchema
)

const form = ref()
const isLoading = ref(false)
const subabase = useSupabaseClient()
const { toastSuccess, toastError } = useAppToast()

const save = async () => {
    if (form.value.errors.length) return
    isLoading.value = true
    // store into the supabase
    try {
        const { error} = await subabase.from('transactions')
        .upsert({...state.value, id: props.transaction?.id})

        if (!error) {
            toastSuccess({
                'title': 'Transaction Saved'
            })
            isOpen.value = false
            emit('saved')
            return
        }
        if (error) throw error
    } catch (e) {
        toastError({
            title: 'Transaction not saved',
            description: e.message,
        })
    } finally {
        isLoading.value = false
    }
}

const initialState = isEditing.value ? {
    type: props.transaction.type,
    amount: props.transaction.amount,
    created_at: props.transaction.created_at.split('T')[0],
    description: props.transaction.description,
    category: props.transaction.category
} : {
    type: undefined,
    amount: 0,
    created_at: undefined,
    description: undefined,
    category: undefined
}

const state = ref({...initialState})

const resetForm = () => {
    Object.assign(state.value, initialState)
    form.value.clear()
}

const isOpen = computed({
        get: () => props.modelValue,
        set: (value) =>  {
            if(!value) resetForm()
            emit('update:modelValue', value)
        }
})

import { categories, types } from '~/constants'

</script>

<template>
     <UModal v-model="isOpen">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                    {{ isEditing ? 'Edit' : 'Add' }}Add New Transaction
            </template>
            <UForm :state="state" :schema="schema" ref="form" @submit="save">
                <UFormGroup label="Transaction Type" :required="true" name="type" class="mb-4">
                    <USelect :disabled="isEditing" placeholder="Select a Transaction Type" :options="types" v-model="state.type" />
                </UFormGroup>

                <UFormGroup label="Amount" :required="true" name="amount" class="mb-4">
                    <UInput type="number" placeholder="Amount" v-model="state.amount"/>
                </UFormGroup>

                <UFormGroup label="Transaction Date" :required="true" name="created_at" class="mb-4">
                    <UInput type="date" icon="i-heroicons-calendar-days-20-solid" v-model="state.created_at"/>
                </UFormGroup>

                <UFormGroup label="Description" hint="Optional" name="description" class="mb-4">
                    <UInput placeholder="Add a Description" v-model="state.description"/>
                </UFormGroup>

                <UFormGroup label="Category" :required="true" name="category" class="mb-4">
                    <USelect placeholder="Pick a Category" :options="categories" v-model="state.category"/>
                </UFormGroup>

                <UButton type="submit" color="black" variant="solid" label="Save" :loading="isLoading" />
            </UForm>
      </UCard>
    </UModal>
</template>