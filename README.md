# 📊 Objetiva Analytics

Plataforma unificada para gestão de marketing operacional, trade marketing e análise de dados em tempo real.

---

## 🏗️ Arquitetura do Projeto

O projeto utiliza uma arquitetura modular moderna baseada em **Vite**, integrando múltiplos sub-sistemas através de iframes e comunicação via **BroadcastChannel**.

### Estrutura de Pastas
- `/src`: Código-fonte principal da aplicação.
  - `/js`: Lógica de negócios e integração com Supabase.
  - `/css`: Design system e estilos globais.
- `/public`: Ativos estáticos e sub-sistemas legados.
  - `/subsystems`: Micro-aplicações independentes integradas via iframe.
  - `/assets`: Recursos de imagem e arquivos globais.
- `/docs`: Documentação técnica e histórico.

---

## 🚀 Tecnologias Utilizadas

- **Frontend Core**: Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Auth, Database, Realtime).
- **Tooling**: Vite (Bundler & Dev Server).
- **Bibliotecas**:
  - Chart.js (Visualização de Dados).
  - SweetAlert2 (UI/UX de notificações).
  - SheetJS (Processamento de Excel).

---

## ⚙️ Configuração do Ambiente

1. **Dependências**:
   ```bash
   npm install
   ```

2. **Variáveis de Ambiente**:
   - Copie o arquivo `.env.example` para `.env`.
   - Preencha as chaves do seu projeto Supabase.

3. **Execução**:
   ```bash
   # Ambiente de Desenvolvimento
   npm run dev

   # Build de Produção
   npm run build
   ```

---

## 🤝 Contribuição e Padrões

- Utilize **Conventional Commits** para o histórico do Git.
- Mantenha a modularização ao adicionar novas funcionalidades no `src/js/modules/`.
- Evite estilos inline; utilize as variáveis do design system em `style.css`.

---

## 📜 Licença

Propriedade da **Agência Objetiva Marketing**. Todos os direitos reservados.