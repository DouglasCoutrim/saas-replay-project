// config.js
// Configuração de variáveis de ambiente para o Serviço Processador.

import dotenv from 'dotenv';
dotenv.config();

const config = {
    // ----------------------------------------------------------------------
    // Variáveis de Ambiente do Supabase (Essenciais)
    // ----------------------------------------------------------------------
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY, // Service Role Key para acesso total.

    // ----------------------------------------------------------------------
    // Configurações do Servidor Webhook (Coolify/VPS)
    // ----------------------------------------------------------------------
    port: process.env.PORT || 3001, // Porta onde o servidor Express irá rodar
    // Secret para validar se o Webhook veio realmente do Supabase.
    webhookSecret: process.env.WEBHOOK_SECRET, 

    // ----------------------------------------------------------------------
    // Configurações de Bucket
    // ----------------------------------------------------------------------
    rawClipsBucket: 'raw-clips',
    processedClipsBucket: 'processed-clips',
    dbTableName: 'clips',
};

// Verificação de Variáveis Críticas
const requiredKeys = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'WEBHOOK_SECRET'];
requiredKeys.forEach(key => {
    if (!process.env[key]) {
        console.error(`ERRO: A variável de ambiente ${key} está faltando. Certifique-se de configurar no Coolify.`);
    }
});

export default config;
