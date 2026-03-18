🚛 RAÍZEN — Sistema de Gestão Operacional de Pátio
Sistema web completo para controle de entrada e saída de caminhões tanque, gestão de tanques de combustível e agendamento de descargas da unidade Raízen.

📋 Funcionalidades
🚛 Tela do Motorista (motorista.html)

Registro de entrada pelo próprio motorista via QR Code na portaria
Reabertura de jornada expirada
Interface responsiva otimizada para celular
Validação de placa duplicada em tempo real

👷 Painel do Operador

Fila de caminhões em tempo real com atualização automática a cada 30 segundos
Controle de volume por caminhão
Agendamento de descarga por data e hora
Botão de convocação via WhatsApp com seleção de baia
Registro de saída com dedução automática do tanque
Filtros por produto
Bloqueio automático do WhatsApp quando tanque está sem espaço
Banner de aviso com envio em massa para motoristas bloqueados
Notificações do navegador a cada nova entrada

🛡️ Painel do Supervisor

Gestão de tanques com capacidade e volume utilizado
Barra de progresso visual por tanque
Previsão de esvaziamento com base nos caminhões no pátio
Log completo de ações com identificação do usuário
Zerar uso de tanque

🔐 Segurança

Login individual por usuário com nome e senha
Perfis separados: OPERADOR e SUPERVISOR
Badge com nome do usuário logado sempre visível
Log de auditoria de todas as ações críticas
Bloqueio de placa duplicada


🗄️ Banco de Dados (Supabase)
Tabelas necessárias
sql-- Registros de entrada/saída dos caminhões
CREATE TABLE registros (
  ID bigint generated always as identity primary key,
  PLACA text,
  PRODUTO text,
  TELEFONE text,
  JORNADA text,
  ENTRADA text,
  SAIDA text,
  AGENDAMENTO timestamp with time zone,
  VOLUME numeric
);

-- Tanques de combustível
CREATE TABLE tanques (
  PRODUTO text primary key,
  CAPACIDADE numeric DEFAULT 0,
  UTILIZADO numeric DEFAULT 0
);

-- Usuários do sistema
CREATE TABLE usuarios (
  id bigint generated always as identity primary key,
  nome text,
  senha text,
  perfil text -- 'OPERADOR' ou 'SUPERVISOR'
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
ALTER TABLE tanques DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;

-- Permissões
GRANT ALL ON registros TO anon;
GRANT ALL ON tanques TO anon;
GRANT ALL ON usuarios TO anon;
GRANT ALL ON logs TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
```

---

## 🔗 Links

| Tela | URL |
|------|-----|
| Painel Principal | `https://kiqand21-rgb.github.io/RAIZEN-AGENDAMENTO-DESCARGA/` |
| App do Motorista | `https://kiqand21-rgb.github.io/RAIZEN-AGENDAMENTO-DESCARGA/motorista.html` |

---

## 🔑 Senhas padrão

> ⚠️ Altere as senhas diretamente na tabela `usuarios` do Supabase.

| Perfil | Como acessar |
|--------|-------------|
| Operador | Cadastrar na tabela `usuarios` com perfil `OPERADOR` |
| Supervisor | Cadastrar na tabela `usuarios` com perfil `SUPERVISOR` |

---

## 🚀 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript puro
- **Banco de dados:** Supabase (PostgreSQL)
- **Hospedagem:** GitHub Pages
- **Notificações:** Web Notifications API
- **Comunicação:** WhatsApp Web API

---

## 📱 QR Code para Motoristas

Gere o QR Code do link abaixo e cole na portaria:
```
https://kiqand21-rgb.github.io/RAIZEN-AGENDAMENTO-DESCARGA/motorista.html
Sites gratuitos para gerar QR Code:

qrcode-monkey.com
qr-code-generator.com


👨‍💻 Desenvolvido por
kiqand21-rgb — CAIQUE ANDRADE
Unidade Raízen — Gestão Operacional de Pátio
