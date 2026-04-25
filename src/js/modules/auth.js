import { supabase, supabaseLib, SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { api } from './api.js';

export const auth = {
    currentUser: null,
    currentProfile: null,

    async checkSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) return null;
        
        if (session) {
            this.currentUser = session.user;
            this.currentProfile = await api.getProfile(session.user.id);
            return { session, profile: this.currentProfile };
        }
        
        this.currentUser = null;
        this.currentProfile = null;
        return null;
    },

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async logout() {
        await supabase.auth.signOut();
        this.currentUser = null;
        this.currentProfile = null;
    },

    // Permissões
    isAdmin() {
        const role = this.currentProfile?.role;
        return role === 'admin' || role === 'master';
    },

    isMaster() {
        return this.currentProfile?.role === 'master';
    },

    /**
     * Função global para validar acesso administrativo
     * @returns {boolean}
     */
    requireAdmin() {
        if (!this.isAdmin()) {
            console.warn('Acesso negado: Requer privilégios de administrador.');
            return false;
        }
        return true;
    },

    // Cadastro de novo usuário (usando cliente temporário)
    async createNewUser(email, password, full_name, role) {
        const tempClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false }
        });

        const { data: authData, error: authError } = await tempClient.auth.signUp({
            email,
            password
        });

        if (authError) throw authError;

        if (authData.user) {
            await api.updateProfile(authData.user.id, {
                full_name,
                role,
                email
            });
            return authData.user;
        }
    }
};

// Expor para compatibilidade temporária se necessário
window.auth = auth;
