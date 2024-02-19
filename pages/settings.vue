<script setup>
// const val = ref(0)

// setInterval(() => val.value += 1, 1000)
    const links = [
        {
            label: 'Profile',
            to: '/settings/profile'
        },
        {
            label: 'Avatar',
            to: '/settings/avatar'
        },
        {
            label: 'Settings',
            to: '/settings/settings'
        }
    ]
</script>
<template>
    <div class="grid grid-cols-8 gap-8">
        <UVerticalNavigation :links="links" class="col-span-2" />
        <div class="col-span-6">
            <!-- <div>{{ val }}</div> -->
            <NuxtPage />
        </div>
    </div>
</template>