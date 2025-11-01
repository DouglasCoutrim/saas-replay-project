// processor.js
// Servidor Express que recebe o Webhook do Supabase e gerencia o processamento.

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import config from './config.js';
import path from 'path';

// Cliente Supabase usando a SERVICE ROLE KEY
const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey,
    { auth: { persistSession: false } }
);

const app = express();

// Configuração do Express para receber JSON
app.use(express.json());

// ----------------------------------------------------------------------
// ROTA PRINCIPAL DO WEBHOOK
// ----------------------------------------------------------------------
app.post('/webhook/new-clip', async (req, res) => {
    console.log('[WEBHOOK] Requisição recebida.');

    // 1. Validação da Chave Secreta
    const secret = req.headers['x-supabase-trigger-secret'];
    if (secret !== config.webhookSecret) {
        console.warn('[WEBHOOK] Segredo inválido. Rejeitando requisição.');
        return res.status(401).send({ error: 'Unauthorized: Invalid secret.' });
    }

    // 2. Extração dos Dados do Evento
    const payload = req.body;
    
    if (payload.event.type !== 'INSERT' || payload.table !== config.dbTableName) {
        console.log('[WEBHOOK] Tipo de evento não suportado, ignorando.');
        return res.status(200).send({ message: 'Event type ignored.' });
    }

    const clipRecord = payload.record;
    const clipId = clipRecord.id;
    const filename = clipRecord.filename;
    
    // Responde ao Webhook imediatamente para evitar timeout no Supabase
    res.status(202).send({ message: `Processing started for clip ${clipId}` });

    try {
        // --- 3. Atualiza o status para PROCESSING (Evita que outros Webhooks o peguem) ---
        await updateClipStatus(clipId, 'PROCESSING');
        
        // --- 4. SIMULAÇÃO DE PROCESSAMENTO ---
        console.log(`[PROCESSAMENTO] Simulando o processamento do clipe ID: ${clipId} (${filename}).`);
        
        // Em um ambiente real, aqui estaria:
        // 1. Download do clipe bruto (raw-clips)
        // 2. Chamada ao FFmpeg ou biblioteca de processamento de vídeo
        // 3. Gerar o arquivo final.
        
        // SIMULAÇÃO: O nome do arquivo processado
        const processedFilename = `proc_${filename}`;
        const processedClipPath = `${clipRecord.uploader_id}/${processedFilename}`;


        // --- 5. Upload do Clipe Processado (Simulado) ---
        const simulatedBuffer = Buffer.from(`Arquivo Processado Simulado para o Clipe ID: ${clipId}`);

        const { error: uploadError } = await supabase.storage
            .from(config.processedClipsBucket)
            .upload(processedClipPath, simulatedBuffer, {
                contentType: 'text/plain', // Mudar para 'video/mp4' em produção
                upsert: true,
            });

        if (uploadError) throw new Error(`Upload Processado Falhou: ${uploadError.message}`);
        
        // Gera a URL pública para o frontend
        const { data: publicUrlData } = supabase.storage
            .from(config.processedClipsBucket)
            .getPublicUrl(processedClipPath);
            
        const processedClipUrl = publicUrlData.publicUrl;


        // --- 6. Atualiza o registro para READY ---
        await updateClipStatus(clipId, 'READY', processedClipUrl);

        console.log(`[SUCESSO] Clipe ${clipId} finalizado. URL: ${processedClipUrl}`);
        
    } catch (error) {
        console.error(`[FALHA FATAL] Erro ao processar clipe ${clipId}:`, error.message);
        // Atualiza para FAILED para notificação manual
        await updateClipStatus(clipId, 'FAILED');
    }
});


// ----------------------------------------------------------------------
// FUNÇÃO AUXILIAR: Atualiza o status do clipe no DB
// ----------------------------------------------------------------------
async function updateClipStatus(id, newStatus, processedUrl = null) {
    const updatePayload = { 
        status: newStatus,
        updated_at: new Date().toISOString()
    };
    
    if (processedUrl) {
        updatePayload.processed_clip_url = processedUrl;
    }
    
    const { error } = await supabase
        .from(config.dbTableName)
        .update(updatePayload)
        .eq('id', id);

    if (error) {
        console.error(`[ERRO DB] Falha ao atualizar status para ${newStatus} no clipe ${id}:`, error.message);
        throw error;
    }
    console.log(`[DB] Status do Clipe ${id} atualizado para: ${newStatus}`);
}

// ----------------------------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR
// ----------------------------------------------------------------------
app.listen(config.port, '0.0.0.0', () => {
    console.log(`Serviço Processador rodando em http://0.0.0.0:${config.port}`);
    console.log(`Endpoint Webhook: /webhook/new-clip`);
});
