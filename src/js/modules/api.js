import { supabase } from './config.js';

/**
 * Camada de API para abstrair chamadas ao banco de dados
 */
export const api = {
    // Perfis de Usuários
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async getAllProfiles() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async updateProfile(userId, profileData) {
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...profileData }, { onConflict: 'id' });
        if (error) throw error;
    },

    async deleteProfile(userId) {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
        if (error) throw error;
    },

    // Dashboard e Métricas
    async getDashboardMetrics() {
        // Tenta usar RPC otimizado primeiro
        const { data, error } = await supabase.rpc('get_dashboard_metrics');
        if (error) {
            console.warn('Fallback: RPC get_dashboard_metrics falhou, buscando dados manuais...');
            return null; // Retorna null para o chamador decidir o fallback
        }
        return data;
    },

    // Planilha (Base de Dados Operacional)
    async clearPlanilha() {
        const { error } = await supabase.from('tb_planilha').delete().neq('id', -1);
        if (error && !error.message.includes('does not exist')) throw error;
    },

    async insertPlanilhaBatch(batch) {
        const { error } = await supabase.from('tb_planilha').insert(batch);
        if (error) throw error;
    },

    // Check-ins (Feed em Tempo Real)
    async getTodayCheckins(page = 0, perPage = 100, searchQuery = '') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const from = page * perPage;
        const to = from + perPage - 1;

        let query = supabase
            .from('checkins')
            .select('created_at, activity_id, client_id, task_id', { count: 'exact' })
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false });

        if (searchQuery) {
            query = query.or(`activity_id.ilike.%${searchQuery}%,client_id.ilike.%${searchQuery}%`);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;
        return { data, count };
    },

    // Colaboradores (Base Fixa)
    async getStaffList() {
        const { data, error } = await supabase
            .from('tb_colaboradores')
            .select('*')
            .order('nome', { ascending: true });
        if (error) throw error;
        return data;
    },

    async upsertStaff(staffData) {
        const { error } = await supabase
            .from('tb_colaboradores')
            .upsert(staffData, { onConflict: 'nome' });
        if (error) throw error;
    },

    async deleteStaff(nome) {
        const { error } = await supabase
            .from('tb_colaboradores')
            .delete()
            .eq('nome', nome);
        if (error) throw error;
    }
};
