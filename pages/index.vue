<script setup>
import { transactionViewOptions } from '~/constants'
const viewSelected = ref(transactionViewOptions[1])
// accessing subabase client
const supabase = useSupabaseClient()
const isOpen = ref(false)
// loading or not
const isLoading = ref(false)

const income = computed(() => transactions.value.filter(t => t.type === 'Income'))

const expense = computed(() => transactions.value.filter(t => t.type === 'Expense'))

const incomeCount = computed(() => income.value.length)
const expenseCount = computed(() => expense.value.length)

const incomeTotal = computed(
    () => income.value.reduce((sum, transaction) => sum + transaction.amount, 0)
)

const expenseTotal = computed(
    () => expense.value.reduce((sum, transaction) => sum + transaction.amount, 0)
)

// get all the transactions for the database, also refetch transactions of delete
const fetchTransactions = async () => {
    isLoading.value = true
    try {
        const { data } = await useAsyncData('transactions', async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select()

            if (error) return []

            return data
        })

        return data.value

    } catch {

    } finally {
        isLoading.value = false
    }
}

//console.log(data) 

const transactions = ref([])


const transactionsGroupedByDate = computed(() =>{
    let grouped = {}

    for(const transaction of transactions.value) {
        // console.log(transaction)
        const date = new Date(transaction.created_at).toDateString().split('T')[0]

        if(!grouped[date]) {
            grouped[date] = []
        }

        grouped[date].push(transaction)

        // console.log(date)
    }

    return grouped 
})
// return value for the data becuase it is returning a ref value below
const refreshTransactions = async () => transactions.value = await fetchTransactions()

await refreshTransactions()

console.log(transactionsGroupedByDate.value)
</script>
<template>
    <section class="flex items-center justify-between mb-10">
        <h1 class="text-4xl font-extrabold">
            Summary
        </h1>
    <div>
        <USelectMenu v-model="viewSelected" :options="transactionViewOptions" />
    </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-10">
        <Trend color="green" title="Income" :amount="incomeTotal" :last-amount="8000" :loading="isLoading" />
        <Trend color="red" title="Expense" :amount="expenseTotal" :last-amount="5000" :loading="isLoading" />
        <Trend color="green" title="Investments" :amount="4000" :last-amount="3000" :loading="isLoading" />
        <Trend color="red" title="Savings" :amount="4100" :last-amount="6000" :loading="isLoading" />
    </section>
    <section class="flex justify-between mb-10">
        <div>
            <h2 class="text-2xl font-extrabold">Transactions</h2>
            <div class="text-gray-500 dark:text-gray-400">
            You have {{ incomeCount}} number of income and {{ expenseCount }} number of expenses this Period.
            </div>
        </div>
        <div>
            <TransactionModal v-model="isOpen"/>
            <UButton icon="i-heroicons-plus-circle" color="white" variant="solid" label="Add" @click="isOpen = true"/>
            
        </div>
    </section>

    <section v-if="!isLoading">
        <!-- <Transaction v-for="transaction in transactions" :key="transaction.id" :transaction="transaction" /> -->
        <div v-for="(transactionsOnDay, date) in transactionsGroupedByDate" :key="date" class="mb-10">
            <DailyTransactionSummary :date="date" :transactions="transactionsOnDay"/>
            <Transaction v-for="transaction in transactionsOnDay" :key="transaction.id" :transaction="transaction" @deleted="refreshTransactions()" />
        </div>
    </section>
    <section v-else>
        <USkeleton class="h-8 w-full mb-2" v-for="i in 4" key="i"/>
    </section>
</template>