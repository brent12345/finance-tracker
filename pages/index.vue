<script setup>
import { transactionViewOptions } from '~/constants'

const user = useSupabaseUser()

const viewSelected = ref(user.value.user_metadata?.transaction_view ?? transactionViewOptions[0])
// accessing subabase client

const isOpen = ref(false)

const {current, previous} = useSelectedTimePeriod(viewSelected)

const { pending, refresh, transactions: {
    incomeCount,
    expenseCount,
    incomeTotal,
    expenseTotal,
    grouped: {
        byDate
    }
}} = useFetchTransactions(current)
await refresh()

const { refresh: refreshPrevious, transactions: {
    incomeTotal: previousIncomeTotal,
    expenseTotal: previousExpenseTotal
}} = useFetchTransactions(previous)

await refreshPrevious()

// console.log(transactionsGroupedByDate.value)
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
        <Trend color="green" title="Income" :amount="incomeTotal" :last-amount="previousIncomeTotal" :loading="pending" />
        <Trend color="red" title="Expense" :amount="expenseTotal" :last-amount="previousExpenseTotal" :loading="pending" />
        <Trend color="green" title="Investments" :amount="4000" :last-amount="3000" :loading="pending" />
        <Trend color="red" title="Savings" :amount="4100" :last-amount="6000" :loading="pending" />
    </section>
    <section class="flex justify-between mb-10">
        <div>
            <h2 class="text-2xl font-extrabold">Transactions</h2>
            <div class="text-gray-500 dark:text-gray-400">
            You have {{ incomeCount}} number of income and {{ expenseCount }} number of expenses this Period.
            </div>
        </div>
        <div>
            <TransactionModal v-model="isOpen" @saved="refreshTransactions()"/>
            <UButton icon="i-heroicons-plus-circle" color="white" variant="solid" label="Add" @click="isOpen = true"/>
            
        </div>
    </section>

    <section v-if="!pending">
        <!-- <Transaction v-for="transaction in transactions" :key="transaction.id" :transaction="transaction" /> -->
        <div v-for="(transactionsOnDay, date) in byDate" :key="date" class="mb-10">
            <DailyTransactionSummary :date="date" :transactions="transactionsOnDay"/>
            <Transaction v-for="transaction in transactionsOnDay" :key="transaction.id" :transaction="transaction" @deleted="refresh()" @edited="refresh()" />
        </div>
    </section>
    <section v-else>
        <USkeleton class="h-8 w-full mb-2" v-for="i in 4" key="i"/>
    </section>
</template>