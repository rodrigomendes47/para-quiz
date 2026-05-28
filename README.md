# PARA QUIZ 🏆
> Uma plataforma interativa de trivia sobre o universo do paradesporto brasileiro, classificação funcional, guia parlamentar e movimento surdolímpico.

O **PARA QUIZ** é um web app gamificado projetado para testar, consolidar e disseminar conhecimentos cruciais acerca do paradesporto e suas vertentes no Brasil. O projeto utiliza dinâmicas de quiz para engajar profissionais, estudantes, parlamentares e entusiastas no aprendizado sobre a inclusão esportiva.

---

## 🎯 Motivações do Projeto

O paradesporto vai muito além da prática esportiva: ele engloba conceitos complexos de elegibilidade, equidade, leis públicas de fomento e direitos civis. Este projeto nasceu com os seguintes objetivos:
1. **Disseminar o Conhecimento**: Facilitar o entendimento sobre as regras e conceitos do paradesporto, como a classificação funcional e a atuação do movimento surdolímpico.
2. **Capacitação de Forma Leve**: Servir como ferramenta de apoio pedagógico para professores, treinadores e gestores esportivos através da gamificação.
3. **Engajamento Político-Social**: Auxiliar na compreensão de diretrizes de investimento no esporte para pessoas com deficiência, embasado no Guia Parlamentar sobre o Paradesporto.

---

## ✨ Funcionalidades Principais

*   **Identificação do Jogador & Leaderboard**: Tela inicial personalizada com entrada de nome do usuário e um ranking dinâmico (Top 10) que persiste localmente os maiores pontuadores utilizando `LocalStorage`.
*   **Modal de Configuração da Rodada**:
    *   **Seleção de Temas**: Escolha quais arquivos de perguntas carregar na rodada:
        *   *Movimento Surdolímpico* (Deaflympics, regras adaptadas e história)
        *   *Guia Parlamentar* (Manifestações do desporto, eixos estruturantes e emendas públicas)
        *   *Classificação no Paradesporto* (Elegibilidade, equidade, modelos biomédicos e históricos da classificação)
    *   **Quantidade Customizável**: Entrada numérica dinâmica para escolher entre 10 e 30 perguntas por rodada.
*   **Interface Interativa com Personagens**: Durante o jogo, personagens e mascotes ilustrativos alternam aleatoriamente para guiar o participante.
*   **Feedback Visual e Sonoro Imediato**:
    *   Sinalização imediata de acertos (verde) e erros (vermelho), revelando a resposta correta em caso de falha.
    *   Áudio sintetizado em tempo real utilizando a **Web Audio API** do navegador (gera tons sonoros dinamicamente sem a necessidade de arquivos externos de áudio pesados).
*   **Transições Suaves**: Efeitos de animação (*fade-in* e *fade-out* com translação e zoom) durante a troca de perguntas para uma experiência de jogo mais fluida e premium.
*   **Design Responsivo e Moderno**: Visual construído do zero sob o conceito de *Glassmorphic design* (transparências elegantes, sombras profundas e micro-interações), otimizado para dispositivos móveis e desktops.

---

## 🛠️ Tecnologias Utilizadas

*   **HTML5**: Estrutura semântica do aplicativo.
*   **CSS3**: Estilização rica baseada em CSS Variables, transições suaves, sombras de relevo, layout flexível (Flexbox e CSS Grid) e animações (`keyframes`).
*   **JavaScript (ES6+)**:
    *   Lógica geral do jogo e manipulação de estado.
    *   Consumo de dados via `fetch()` assíncrono para mesclagem sob demanda das perguntas.
    *   `Web Audio API` para síntese de frequências de áudio.
    *   `LocalStorage` para persistência dos dados locais da tabela de classificação.
*   **Banco de Dados de Questões**: Estruturado em arquivos JSON locais na pasta `questions/` para fácil adição e manutenção de novos temas.

---

## 🚀 Como Executar o Projeto

Como o aplicativo carrega os dados das perguntas assincronamente através de arquivos JSON locais, os navegadores modernos bloqueiam a execução direta se o arquivo `index.html` for aberto simplesmente com dois cliques (devido à política de segurança de CORS para o protocolo `file://`).

### Executando Localmente (Windows)
1. Certifique-se de ter o **Python** instalado no seu computador.
2. Dê dois cliques no arquivo **`run.bat`** na raiz do projeto. Ele iniciará um servidor web local seguro na porta `8080`.
3. Abra seu navegador de preferência e acesse: [http://localhost:8080](http://localhost:8080).

### Utilizando Extensões do Editor (ex: VS Code)
1. Instale a extensão **Live Server** no VS Code.
2. Abra a pasta do projeto no VS Code, abra o arquivo `index.html`, clique com o botão direito e selecione **Open with Live Server**.

### Publicando no GitHub Pages
O projeto é 100% estático e compatível com o GitHub Pages:
1. Envie todos os arquivos do repositório para o GitHub.
2. Nas configurações do repositório (**Settings**), acesse a aba **Pages**.
3. Defina a branch principal (`main` ou `master`) como fonte de publicação e salve.
4. O link público gerado pelo GitHub executará o jogo de forma segura e sem problemas de CORS.
