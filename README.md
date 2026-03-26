🚛 RAÍZEN — Sistema de Gestão Operacional de Pátio
Sistema web completo para controle de entrada e saída de caminhões tanque, gestão de tanques de combustível e agendamento de descargas da unidade Raízen — Base de Paulínia (BPA).
Hospedado no GitHub Pages com backend em Supabase (PostgreSQL).

🔗 Links do Sistema
TelaURL🖥️ Painel Principal (Operador/Supervisor)(https://caique4ndrade.github.io/RAIZEN-AGENDAMENTO-DESCARGA/)📱 App do Motoristahttps://kiqand21-rgb.github.io/RAIZEN-AGENDAMENTO-DESCARGA/motorista.html🔍 Status do Motoristahttps://kiqand21-rgb.github.io/RAIZEN-AGENDAMENTO-DESCARGA/status.html

📁 Arquivos do Projeto
ArquivoDescriçãoraizen.htmlSistema principal — registro de entrada, painel operador e supervisormotorista.htmlPágina mobile para o motorista registrar entrada e reabrir jornadastatus.htmlPainel público — motorista consulta o status do veículo pela placamanifest.jsonConfiguração PWA (instalação como app no celular)sw.jsService Worker para PWAREADME.mdEste documento

📋 Funcionalidades
📱 Tela do Motorista (motorista.html)

Registro de entrada pelo próprio motorista via QR Code na portaria
Reabertura de jornada expirada
Opções de jornada: horário limite, jornada livre (24h) ou sem jornada
Interface responsiva otimizada para celular
Validação de placa duplicada em tempo real
Detecção automática de precheck — se a placa foi importada do Coleta, atualiza o registro existente mantendo agendamento, volume e frete

👷 Painel do Operador

Fila de caminhões em tempo real com atualização automática a cada 30 segundos
Importação de agendamentos do Coleta — cola planilha Excel, sistema importa automaticamente os status Agendado e Agendado Automaticamente
Seção Precheck — caminhões agendados que ainda não deram entrada (cards laranja), filtrada por produto
Controle de volume e agendamento por caminhão
Badge FOB/CIF em todos os cards
Botão CONVOCAR via WhatsApp com seleção de baia
Registro de saída com dedução automática do espaço no tanque
Filtros por produto (aplica nos cards normais e no precheck simultaneamente)
Busca rápida por placa
Bloqueio automático do botão WhatsApp quando tanque está sem espaço
Banner de aviso com envio em massa para motoristas bloqueados
Notificações do navegador a cada nova entrada
Sessão persistente por 8 horas — não precisa logar toda vez que abre o site

🛡️ Painel do Supervisor

Importação do Relatório de Supervisão de Tanques com parser automático
Margem de segurança de 120.000 L subtraída automaticamente do espaço bruto
Toggle ativo/inativo por tanque — define qual tanque está recebendo por produto
Barra de progresso visual por tanque
Previsão de enchimento — quantas descargas cabem até lotar por produto
Log completo de ações com filtro por tipo e filtro por período de datas (abre pré-filtrado em hoje)
Atualização automática a cada 30 segundos

🔍 Painel de Status do Motorista (status.html)

Motorista digita a placa e vê o status do veículo em tempo real
Mostra: agendamento, volume previsto, jornada e tempo no pátio
Atualização automática a cada 15 segundos

🔐 Segurança

Login individual por usuário com nome e senha
Perfis separados: OPERADOR e SUPERVISOR
Badge com nome do usuário sempre visível — clique para sair
Sessão salva no navegador por 8 horas
Log de auditoria de todas as ações críticas
Bloqueio de placa duplicada
Senha mestre para exclusão de registros: moto12


🗄️ Banco de Dados — Supabase
URL: https://rbbkjuiizmvatiawfzuv.supabase.co
Criação completa das tabelas
sql-- Registros de entrada/saída dos caminhões
CREATE TABLE registros (
    ID bigint generated always as identity primary key,
    PLACA text,
    PRODUTO text,
    TELEFONE text,
    JORNADA text,
    ENTRADA text,
    SAIDA text,
    AGENDAMENTO text,
    VOLUME numeric,
    PRECHECK boolean DEFAULT false,
    FRETE text DEFAULT 'FOB'
);

-- Tanques individuais de combustível
CREATE TABLE tanques_individuais (
    tanque int primary key,
    produto text,
    disponivel numeric DEFAULT 0,
    ativo boolean DEFAULT false
);

-- Usuários do sistema
CREATE TABLE usuarios (
    id bigint generated always as identity primary key,
    nome text,
    senha text,
    perfil text  -- 'OPERADOR' ou 'SUPERVISOR'
);

-- Log de ações
CREATE TABLE logs (
    id bigint generated always as identity primary key,
    acao text,
    detalhe text,
    quando text,
    usuario_nome text,
    perfil text
);

-- Desabilitar RLS em todas as tabelas
ALTER TABLE registros DISABLE ROW LEVEL SECURITY;
ALTER TABLE tanques_individuais DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;

-- Permissões para acesso público
GRANT ALL ON registros TO anon;
GRANT ALL ON tanques_individuais TO anon;
GRANT ALL ON usuarios TO anon;
GRANT ALL ON logs TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
Se a tabela registros já existir — adicionar colunas novas
sqlALTER TABLE registros ADD COLUMN IF NOT EXISTS "PRECHECK" boolean DEFAULT false;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "FRETE" text DEFAULT 'FOB';
Descrição das colunas
registros
ColunaTipoDescriçãoIDint (PK)ID automáticoPLACAtextPlaca do veículo (formato AAA-0000)PRODUTOtextProduto transportadoTELEFONEtextWhatsApp do motoristaJORNADAtextHH:mm, 24 HORAS ou SEM JORNADA - HH:mmENTRADAtextData/hora de entrada (formato pt-BR)SAIDAtextData/hora de saída (null = ainda no pátio)VOLUMEnumericVolume em litrosAGENDAMENTOtextData/hora do agendamento (YYYY-MM-DD HH:mm)PRECHECKbooleantrue = importado do Coleta, aguardando entrada do motoristaFRETEtextTipo de frete: FOB ou CIF
tanques_individuais
ColunaTipoDescriçãotanqueint (PK)Número do tanqueprodutotextProduto do tanquedisponivelnumericEspaço disponível em litros (valor bruto, sem margem)ativobooleanSe este tanque está recebendo atualmente
usuarios
ColunaTipoDescriçãonometextNome do usuáriosenhatextSenha de acessoperfiltextOPERADOR ou SUPERVISOR
logs
ColunaTipoDescriçãoidint (PK)ID automáticoacaotextTipo da ação registradadetalhetextInformações detalhadasquandotextData/hora da açãousuario_nometextNome do usuário que executouperfiltextPerfil do usuário

🔑 Perfis de Acesso
PerfilComo cadastrarOPERADORInserir na tabela usuarios com perfil = 'OPERADOR'SUPERVISORInserir na tabela usuarios com perfil = 'SUPERVISOR'

⚠️ Altere as senhas diretamente na tabela usuarios do Supabase.


🚛 Fluxo Completo do Sistema
1. Importação de Agendamentos (Operador)

Exporta planilha do Sistema Coleta em Excel
Copia tudo (Ctrl+A → Ctrl+C)
No painel operador clica em IMPORTAR AG.
Cola o conteúdo e clica em PROCESSAR
Sistema filtra apenas status Agendado e Agendado Automaticamente
Extrai: Placa, Produto, Agendamento, Volume e Frete (FOB/CIF)
Cria cards na seção "Aguardando Precheck" com PRECHECK = true

2. Entrada do Motorista

Motorista acessa motorista.html pelo QR Code na portaria
Preenche: placa, produto, WhatsApp e jornada
Se a placa está no precheck: atualiza o registro mantendo agendamento, volume e frete → card sobe para a fila normal
Se não está: cria novo registro normalmente

3. Operação no Pátio

Operador acompanha a fila em tempo real
Quando há espaço no tanque, clica CONVOCAR → abre WhatsApp com mensagem de baia
Após a descarga, clica SAÍDA → deduz o volume do tanque automaticamente

4. Gestão de Tanques (Supervisor)

Cola o relatório de supervisão de tanques
Sistema extrai espaço de cada tanque e subtrai 120.000 L de margem
Supervisor define qual tanque está ativo por produto via toggle
Operador vê o espaço já com margem descontada


📦 Importação do Coleta — Detalhes
Colunas lidas da planilha
Coluna ColetaCampo no sistemaPlacaCarreta1PLACAProdutoPRODUTODataAgendamentoAGENDAMENTO (data)PeriodoAgendamentoAGENDAMENTO (hora início do período)VolumeVOLUMEFreteFRETEStatusFiltro — só importa Agendado e Agendado Automaticamente
Mapeamento de produtos
ColetaSistemaHidratadoETANOL HIDRATADOAnidroETANOL ANIDROBiodiesel B100BIODIESEL (B100)Gasolina AGASOLINADiesel S10 ADIESEL S10JET A(ignorado)

⚠️ Placas do Coleta vêm sem hífen (ex: EVF3988). O sistema normaliza automaticamente para o padrão EVF-3988 ao importar.


🛢️ Regra de Espaço dos Tanques
Espaço visível para o operador = disponivel (banco) − 120.000 L
O campo disponivel armazena o espaço bruto. A margem de 120.000 L é descontada em tempo real no JavaScript — o operador e supervisor sempre veem o espaço líquido disponível.

📊 Ações Registradas no Log
AçãoQuando ocorreSAIDA REGISTRADASaída de caminhão com volume e tanqueVOLUME ALTERADOEdição manual de volume no cardTANQUE ATUALIZADOImportação do relatório de supervisãoTANQUE ATIVADOToggle de tanque ligado pelo supervisorTANQUE DESATIVADOToggle de tanque desligado pelo supervisorREGISTRO EXCLUÍDOExclusão manual pelo operador (requer senha moto12)AGENDAMENTOS IMPORTADOSImportação de agendamentos do Coleta

⚙️ Configurações Técnicas
javascriptconst SEGURANCA_L  = 120000;  // Margem de segurança dos tanques (L)
const SESSAO_HORAS = 8;       // Duração da sessão do operador/supervisor (horas)
// Atualização automática painel operador/supervisor: 30 segundos
// Atualização painel status do motorista: 15 segundos
// Log abre pré-filtrado com a data de hoje

🎨 Paleta de Cores
VariávelHexUso--verde-raizen#4d6d5dVerde principal--verde-vivo#60903eChips ativos, confirmações--verde-claro#acd36cBorda do header--roxo-raizen#781E77Cor primária, botões principais--roxo-sombra#571557Sombra dos botões roxos--amarelo-raizen#fcb414Avisos, jornada, previsão--laranja-raizen#f47920Precheck, alertas de bloqueio--cor-erro#DA291CErros, exclusão--cor-sucesso#60903eJornada em dia

🚀 Tecnologias

Frontend: HTML5, CSS3, JavaScript puro (sem frameworks)
Banco de dados: Supabase (PostgreSQL)
Hospedagem: GitHub Pages
Notificações: Web Notifications API
Comunicação: WhatsApp Web API
PWA: manifest.json + Service Worker


📱 QR Code para Motoristas
Gere o QR Code do link abaixo e cole na portaria:
https://kiqand21-rgb.github.io/RAIZEN-AGENDAMENTO-DESCARGA/motorista.html
Sites gratuitos para gerar QR Code:

qrcode-monkey.com
qr-code-generator.com


👨‍💻 Desenvolvido por
kiqand21-rgb — CAIQUE ANDRADE
Unidade Raízen — Gestão Operacional de Pátio
Base de Paulínia (BPA)
