export const useRedirectIfAuthenticated = async (url = '/') => {
const user = useSupabaseUser()
    
    watch(user, (user) => {
        if(user) {
            console.log(user.id, user.last_sign_in_at)
            return navigateTo('/')
        }
    }, { immediate: true }
)
return { user }
}