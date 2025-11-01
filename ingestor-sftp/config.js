// config.js
// Configuração de variáveis de ambiente para o Serviço Ingestor SFTP.
import dotenv from 'dotenv';
dotenv.config();

const config = {
    // ----------------------------------------------------------------------
    // Variáveis de Ambiente do Supabase (Essenciais)
    // ----------------------------------------------------------------------
    // OBS: Usar a SERVICE ROLE KEY permite que o RLS seja ignorado para o backend.
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY, 

    // ----------------------------------------------------------------------
    // Configurações do Servidor SFTP
    // ----------------------------------------------------------------------
    host: '0.0.0.0',
    port: process.env.SFTP_PORT || 2222, // Porta padrão para o serviço SFTP
    // Credenciais para a conexão SFTP
    sftpUsername: process.env.SFTP_USERNAME,
    sftpPassword: process.env.SFTP_PASSWORD,

    // ----------------------------------------------------------------------
    // Configurações de Bucket e DB
    // ----------------------------------------------------------------------
    rawClipsBucket: 'raw-clips',
    dbTableName: 'clips',
};

// Validação de Chaves Críticas
const requiredKeys = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SFTP_USERNAME', 'SFTP_PASSWORD'];
requiredKeys.forEach(key => {
    if (!process.env[key]) {
        console.error(`ERRO: A variável de ambiente ${key} está faltando. Certifique-se de configurar no Coolify.`);
    }
});

export default config;
