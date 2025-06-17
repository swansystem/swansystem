(function() { // Utilisation d'une IIFE pour encapsuler le code et éviter les conflits globaux

    // Injecter les styles CSS dynamiquement
    const style = document.createElement('style');
    style.textContent = `
        /* Styles globaux */
        body { font-family: 'Inter', sans-serif; margin: 0; }

        /* Styles du bouton de chat */
        #chat-button-container {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 60px; height: 60px; border-radius: 50%;
            /* MODIFIÉ : Couleur de fond pour le bouton de chat, assortie à l'en-tête du chat */
            background: linear-gradient(45deg, rgb(69, 110, 128), #D3EBF5);
            color: #fff;
            display: flex; /* Toujours visible par défaut pour que l'utilisateur puisse cliquer */
            justify-content: center; align-items: center;
            cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            font-size: 24px; z-index: 9999 !important;
            transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
            overflow: visible; position: relative;
        }
        #chat-button-container:hover { transform: scale(1.05); }

        /* Styles du badge de notification */
        #notification-badge {
            position: absolute; top: -10px; right: -10px;
            background-color: transparent;
            border-radius: 15px;
            padding: 1px 0px;
            font-size: 12px; font-weight: bold;
            display: flex; align-items: center;
            gap: 4px;
            box-shadow: none;
            white-space: nowrap; opacity: 0;
            transform: scale(0); transform-origin: top right;
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        #notification-badge.visible { opacity: 1; transform: scale(1); }
        .notification-count {
            background-color: #ff0000;
            color: #fff;
            border-radius: 50%;
            width: 20px; height: 20px;
            display: flex; justify-content: center; align-items: center;
            font-size: 10px; flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .notification-text {
            font-size: 12px;
            color: #333;
            padding-right: 4px;
            visibility: hidden;
            width: 0;
            overflow: hidden;
        }

        /* Styles de la boîte de chat */
        #chat-box-container {
            position: fixed !important;
            bottom: 90px !important;
            right: 20px !important;
            width: 350px;
            height: 600px;
            background: linear-gradient(135deg, #D3EBF5,rgb(69, 110, 128));
            border-radius: 15px;
            display: none; /* Reste à 'none' pour l'animation d'ouverture */
            flex-direction: column;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 9999 !important;
            overflow: hidden;
            transform: translateY(20px) scale(0.95); opacity: 0; /* État initial pour l'animation */
            transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }
        #chat-box-container.open { /* Cette classe déclenche l'animation pour l'ouverture */
            transform: translateY(0) scale(1);
            opacity: 1;
            display: flex;
        }

        /* Styles de l'en-tête du chat */
        #chat-header {
            background: linear-gradient(45deg,rgb(69, 110, 128), #D3EBF5);
            color: #333; padding: 15px; font-weight: bold;
            border-top-left-radius: 15px; border-top-right-radius: 15px;
            display: flex;
            align-items: center;
            /* MODIFIÉ : Pas de "justify-content: space-between" car le bouton X est retiré */
            justify-content: flex-start; /* Aligne le contenu (avatar + Clara) à gauche */
            font-size: 1.1em;
        }

        /* Style pour la photo de profil dans l'en-tête */
        #chat-header .profile-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #fff;
            margin-right: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            border: 2px solid #D3EBF5;
        }
        #chat-header .profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* MODIFIÉ : Ces styles ne sont plus nécessaires pour le bouton de fermeture X */
        /* #chat-header button {
            background: none; border: none; color: #fff;
            font-size: 1.2em; cursor: pointer; transition: transform 0.2s ease-in-out;
        }
        #chat-header button:hover { transform: rotate(90deg); } */

        /* Styles du conteneur des messages */
        #messages {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
            display: flex;
            flex-direction: column;
        }
        #messages::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
        /* Styles des messages individuels */
        .message {
            max-width: 80%; padding: 8px 12px; border-radius: 15px;
            white-space: pre-wrap; word-wrap: break-word;
            margin-bottom: 10px;
        }
        .message.bot {
            align-self: flex-start;
            background: linear-gradient(45deg, #D3EBF5, #FFFFFF);
            color: #333;
            border-bottom-left-radius: 5px;
        }
        .message.user {
            align-self: flex-end;
            background: linear-gradient(45deg, #FFFFFF, #D3EBF5);
            color: #333;
            border-bottom-right-radius: 5px;
        }
        .message.loading {
            align-self: flex-start; background: #f0f0f0; color: #555;
            font-style: italic; animation: pulse 1.5s infinite ease-in-out;
        }

        /* Animation pour les nouveaux messages du bot */
        @keyframes new-message-arrival {
            0% { background-color: #FFF0F5; }
            50% { background-color: #FFECF2; }
            100% { background-color: #FFECF2; }
        }

        .message.bot.new-arrival {
            animation: new-message-arrival 1s ease-out;
        }

        /* Styles du conteneur d'options (QCM) */
        #chat-options-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
            border-top: 1px solid #e0e0e0;
            padding: 10px;
            background: linear-gradient(90deg,rgb(69, 110, 128), #D3EBF5);
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 15px;
        }

        .option-button {
            background: linear-gradient(45deg, #D3EBF5, #FFFFFF);
            color: #333;
            padding: 0.6rem 1rem;
            border-radius: 0.75rem;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
            font-weight: 600;
            font-size: 0.9em;
            flex: 1 1 auto;
            min-width: 100px;
            text-align: center;
            border: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .option-button:hover {
            background: linear-gradient(45deg, #FFFFFF, #D3EBF5);
            transform: translateY(-2px);
        }
        .option-button:active {
            transform: translateY(0);
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .link-message {
            color: #0056b3;
            text-decoration: underline;
            cursor: pointer;
            word-break: break-all;
        }

        /* Styles de la zone de saisie */
        #input-area {
            display: flex; border-top: 1px solid #e0e0e0;
            padding: 10px; background: linear-gradient(135deg,rgb(69, 110, 128), #D3EBF5);
            border-bottom-left-radius: 15px; border-bottom-right-radius: 15px;
        }
        #user-input {
            flex: 1; border: 1px solid #ccc; border-radius: 8px;
            padding: 10px; font-size: 14px; margin-right: 8px;
            background: linear-gradient(135deg, #D3EBF5, #FFFFFF);
        }
        #send-button {
            background: linear-gradient(45deg, #D3EBF5, #FFFFFF);
            color: #333; border: none; border-radius: 8px;
            padding: 10px 20px; cursor: pointer;
            font-size: 14px; font-weight: bold;
            transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
        }
        #send-button:hover { background: linear-gradient(45deg, #FFFFFF, #D3EBF5); transform: translateY(-1px); }
        #send-button:active { transform: translateY(0); }

        /* Animations */
        @keyframes pulse { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .shake { animation: shake 0.5s; }

        /* Styles de l'iframe Calendly */
        .calendly-integrated {
            width: 100%;
            height: 600px;
            border: none;
            border-radius: 10px;
            margin-top: 10px;
            flex-shrink: 0;
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }
        .calendly-integrated::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
    `;
    document.head.appendChild(style);

    // Création des éléments HTML dynamiquement
    const chatButtonDiv = document.createElement('div');
    chatButtonDiv.id = 'chat-button-container';
    chatButtonDiv.innerHTML = `
        <span class="chat-icon">💬</span>
        <div id="notification-badge">
            <span class="notification-count">+1</span>
            <span class="notification-text"></span>
        </div>
    `;
    document.body.appendChild(chatButtonDiv);

    const chatBoxDiv = document.createElement('div');
    chatBoxDiv.id = 'chat-box-container';
    chatBoxDiv.innerHTML = `
        <div id="chat-header">
            <div class="profile-avatar">
                <img src="clara.png" alt="Clara Profile Picture" onerror="this.onerror=null;this.src='https://placehold.co/60x60/cccccc/333333?text=Clara';" />
            </div>
            Clara
            <!-- MODIFIÉ : Bouton de fermeture X retiré -->
            <!-- <button id="close-chat-button">✖</button> -->
        </div>
        <div id="messages"></div>
        <div id="chat-interactions">
            <div id="chat-options-container"></div>
            <div id="input-area">
                <input id="user-input" type="text" placeholder="Votre message...">
                <button id="send-button">Envoyer</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatBoxDiv);

    document.addEventListener('DOMContentLoaded', () => {
        const D = document; // Raccourci pour document

        // Récupération des éléments du DOM après leur création dynamique
        const chatButton = D.getElementById('chat-button-container'),
              chatBox = D.getElementById('chat-box-container'),
              // MODIFIÉ : closeChatButton n'est plus déclaré
              // closeChatButton = D.getElementById('close-chat-button'),
              chatMessages = D.getElementById('messages'),
              chatOptionsContainer = D.getElementById('chat-options-container'),
              inputArea = D.getElementById('input-area'),
              userInput = D.getElementById('user-input'),
              sendButton = D.getElementById('send-button'),
              notificationBadge = D.getElementById('notification-badge'),
              notificationText = notificationBadge.querySelector('.notification-text');

        // URL du webhook Make.com pour envoyer les données au mode agent (discussion libre)
        const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/4j9ak0usjvjbo7ekocdi5pz8huwf82hq';
        // URL du webhook Make.com pour le stockage TEMPORAIRE des données du chatbot
        const TEMP_MAKE_WEBHOOK_URL = 'YOUR_TEMP_MAKE_WEBHOOK_URL_HERE'; // *** REMPLACEZ CECI PAR VOTRE VRAIE URL DE WEBHOOK TEMPORAIRE MAKE.COM ***

        let isChatOpen = false; // Indique si la fenêtre du chat est ouverte
        let hasInitialBotMessageBeenShown = false; // Permet de savoir si le message initial a été affiché
        let conversationState = 'initial'; // Gère l'état actuel de la conversation

        // Objet pour stocker les données de la session du chatbot
        let sessionData = {
            userId: null, // Sera initialisé par getUserId()
            statutEntreprise: null, // Pour le flux "J'ai besoin d'un comptable"
            aUnComptable: null, // Pour le flux "J'ai besoin d'un comptable"
            formeJuridiqueCreation: null, // Pour le flux "Je veux créer une société"
            sujetConseil: null, // Nouvelle donnée pour le sujet du conseil
            typeSocieteComptabiliteConseil: null, // Pour le conseil en comptabilité
            aUnComptableConseil: null // Pour le conseil en comptabilité
        };

        // Génère un ID utilisateur unique
        const generateUserId = () => 'user-' + Math.random().toString(36).substr(2, 9);
        const getUserId = () => {
            let userId = localStorage.getItem('chatUserId');
            if (!userId) {
                userId = generateUserId();
                localStorage.setItem('chatUserId', userId);
            }
            return userId;
        };

        // Initialise l'ID utilisateur au chargement ou à l'ouverture du chat
        sessionData.userId = getUserId();


        // Fonction pour faire vibrer le bouton de chat
        const shakeButton = () => {
            // Ne faire vibrer que si le bouton de chat est visible et que la boîte de chat est fermée
            if (!isChatOpen && chatButton.style.display !== 'none') { // 'display !== none' est une sécurité, mais le bouton sera toujours 'flex'
                chatButton.classList.add('shake');
                setTimeout(() => chatButton.classList.remove('shake'), 500);
            }
        };
        // Intervalle pour la vibration, ne se déclenche que si le bouton est visible
        setInterval(shakeButton, 10000);

        // Fonction pour activer/désactiver le badge de notification (pas utilisée pour l'instant avec le nouveau comportement)
        const toggleNotification = (show, text = '') => {
            notificationBadge.classList.toggle('visible', show);
            notificationText.textContent = text;
        };

        // Fonction pour formater les messages du bot avec des liens cliquables
        const formatBotMessage = (text) => {
            const urlRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[A-Z0-9._%+-]+(?:\.[A-Z]{2,4})+\b(?:\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*)?)/igm;
            return text.replace(urlRegex, (url) => {
                let fullUrl = url;
                if (!/^https?:\/\//i.test(url) && !/^ftp:\/\//i.test(url)) {
                    fullUrl = 'http://' + url;
                }
                return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="link-message">${url}</a>`;
            });
        };

        // Fonction pour ajouter des messages à l'interface du chat
        const appendMessage = (text, sender) => {
            const msg = D.createElement('div');
            msg.classList.add('message', sender);
            if (sender === 'bot') {
                msg.innerHTML = formatBotMessage(text);
                msg.classList.add('new-arrival');
                setTimeout(() => {
                    msg.classList.remove('new-arrival');
                }, 1000);
            } else {
                msg.textContent = text;
            }
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        // Fonction pour afficher les options cliquables (boutons QCM)
        function displayOptions(options) {
            chatOptionsContainer.innerHTML = '';
            inputArea.style.display = 'none'; // Cache la zone de saisie quand on affiche le QCM
            chatOptionsContainer.style.display = 'flex'; // Affiche le conteneur QCM

            options.forEach(option => {
                const button = D.createElement('button');
                button.classList.add('option-button');
                button.textContent = option.text;
                button.onclick = () => handleOptionClick(option);
                chatOptionsContainer.appendChild(button);
            });
        }

        // Fonction pour envoyer les données collectées à Make.com (temporairement)
        const sendTemporaryChatbotData = async () => {
            console.log("Envoi des données temporaires à Make.com:", sessionData); // Pour le débogage

            try {
                // Utilise la nouvelle URL de webhook temporaire
                const response = await fetch(TEMP_MAKE_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sessionData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Erreur HTTP lors de l'envoi des données temporaires: ${response.status} - ${errorText}`);
                }

                console.log("Données temporaires envoyées avec succès à Make.com !");
            } catch (err) {
                console.error("Erreur lors de l'envoi des données temporaires à Make.com:", err);
            }
        };

        // Fonction pour envoyer le message à l'agent Make.com (mode agent)
        const sendMessage = async () => {
            const text = userInput.value.trim();
            if (!text) return;

            appendMessage(text, 'user');
            userInput.value = '';

            const loadingMessage = D.createElement('div');
            loadingMessage.classList.add('message', 'bot', 'loading');
            loadingMessage.textContent = 'Clara est en train d\'écrire...';
            chatMessages.appendChild(loadingMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Réponse fixe pour le mode agent après le message initial
            const fixedReply = "Ceci est un Chatbot de démonstration de nos possibilités. Cette partie pourrait aussi bien être reliée à un standard humain qu'artificiel.";

            setTimeout(() => {
                if (chatMessages.contains(loadingMessage)) chatMessages.removeChild(loadingMessage);
                appendMessage(fixedReply, 'bot');
            }, 1500); // Délai pour simuler une réponse
        };

        // Écouteurs d'événements pour la saisie de texte
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

        // Fonction pour intégrer Calendly dans le chat
        async function integrateCalendly() {
            chatOptionsContainer.style.display = 'none';

            // Récupère le dernier message du bot
            const lastBotMessage = chatMessages.querySelector('.message.bot:last-child');

            // Positionne le défilement pour que le dernier message du bot soit en haut de la vue
            if (lastBotMessage) {
                lastBotMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            const calendlyIframe = D.createElement('iframe');
            // Ajout du userId à l'URL de Calendly pour le lier à la réservation
            calendlyIframe.src = `https://calendly.com/swansystem-contact/30min?a1=${sessionData.userId}`;
            calendlyIframe.classList.add('calendly-integrated');
            chatMessages.appendChild(calendlyIframe);

            // Le bouton "Redémarrer" apparaît 10 secondes après l'intégration de Calendly
            setTimeout(() => {
                displayOptions([
                    { id: 'start', text: 'Redémarrer' }
                ]);
                conversationState = 'initial'; // Réinitialise l'état pour une nouvelle conversation
            }, 10000); // 10 secondes de délai
        }

        // Fonction principale pour gérer les clics sur les options utilisateur et le flux de conversation
        function handleOptionClick(option) {
            if (option.id !== 'start') {
                appendMessage(option.text, 'user');
            }
            chatOptionsContainer.innerHTML = ''; // Efface les options QCM

            // Efface tout iframe Calendly existant avant de continuer
            const existingIframe = chatMessages.querySelector('iframe');
            if (existingIframe) {
                existingIframe.remove();
            }

            setTimeout(async () => {
                switch (conversationState) {
                    case 'initial':
                    case 'main_menu':
                        switch (option.id) {
                            case 'start':
                                // Réinitialise les données de session au début d'une nouvelle conversation
                                sessionData = {
                                    userId: getUserId(),
                                    statutEntreprise: null,
                                    aUnComptable: null,
                                    formeJuridiqueCreation: null,
                                    sujetConseil: null,
                                    typeSocieteComptabiliteConseil: null,
                                    aUnComptableConseil: null
                                };
                                appendMessage("Bonjour, comment puis-je vous aider ?", 'bot');
                                displayOptions([
                                    { id: 'besoin-comptable', text: "J'ai besoin d'un comptable" },
                                    { id: 'creer-societe', text: "Je veux créer une société" },
                                    { id: 'conseil-personnalise', text: "J'ai besoin d'un conseil personnalisé" },
                                    { id: 'parler-agent', text: "Je souhaite parler à un agent en ligne" }
                                ]);
                                conversationState = 'main_menu';
                                break;
                            case 'besoin-comptable':
                                // Réinitialise les données liées si l'utilisateur revient sur ce flux
                                sessionData.statutEntreprise = null;
                                sessionData.aUnComptable = null;
                                appendMessage("Quel est le statut de votre entreprise ?", 'bot');
                                displayOptions([
                                    { id: 'sci', text: "SCI" },
                                    { id: 'sarl-eurl', text: "SARL/EURL" },
                                    { id: 'lmnp', text: "LMNP" },
                                    { id: 'professions-liberales', text: "Professions libérales" },
                                    { id: 'artisans-commercants', text: "Artisans et commerçants" },
                                    { id: 'btp', text: "BTP" },
                                    { id: 'e-commerce', text: "E-commerce" },
                                    { id: 'auto-entrepreneur', text: "Auto-entrepreneur" },
                                    { id: 'taxis-vtc', text: "Taxis et VTC" },
                                    { id: 'autre-statut', text: "Autre" }
                                ]);
                                conversationState = 'statut_entreprise_existing';
                                break;
                            case 'creer-societe':
                                // Réinitialise les données liées si l'utilisateur revient sur ce flux
                                sessionData.formeJuridiqueCreation = null;
                                appendMessage("Parfait, vous êtes au bon endroit! Avez-vous déjà choisie une forme juridique ?", 'bot');
                                displayOptions([
                                    { id: 'oui-form-juridique', text: "OUI" },
                                    { id: 'non-form-juridique', text: "NON" }
                                ]);
                                conversationState = 'creation_societe_form_juridique';
                                break;
                            case 'conseil-personnalise':
                                // Nouvelle étape pour le conseil personnalisé
                                sessionData.sujetConseil = null; // Réinitialise le sujet
                                appendMessage("Très bien, quel sujet concerne votre demande?", 'bot');
                                displayOptions([
                                    { id: 'conseil-creation', text: "Création d'entreprise" },
                                    { id: 'conseil-comptabilite', text: "Comptabilité" },
                                    { id: 'conseil-autre', text: "Autre" }
                                ]);
                                conversationState = 'conseil_personnalise_sujet';
                                break;
                            case 'parler-agent':
                                chatOptionsContainer.style.display = 'none';
                                inputArea.style.display = 'flex';
                                appendMessage("Clara est en train de se connecter...", 'bot');

                                setTimeout(() => {
                                    // Pas de message de chargement à retirer ici, car c'est un message normal
                                    appendMessage("Bonjour, je suis Clara, votre assistante en ligne, comment puis-je vous aider?", 'bot');
                                    userInput.focus();
                                    conversationState = 'agent_mode';
                                }, 1500); // Délai pour simuler une connexion
                                break;
                            default:
                                appendMessage("Désolé, je n'ai pas compris votre choix. Veuillez choisir une option.", 'bot');
                                displayOptions([
                                    { id: 'besoin-comptable', text: "J'ai besoin d'un comptable" },
                                    { id: 'creer-societe', text: "Je veux créer une société" },
                                    { id: 'conseil-personnalise', text: "J'ai besoin d'un conseil personnalisé" },
                                    { id: 'parler-agent', text: "Je souhaite parler à un agent en ligne" }
                                ]);
                                break;
                        }
                        break;

                    case 'statut_entreprise_existing':
                        // Collecte le statut de l'entreprise
                        sessionData.statutEntreprise = option.text;
                        appendMessage("Avez-vous un cabinet comptable actuellement ?", 'bot');
                        displayOptions([
                            { id: 'oui-cabinet-exist', text: "Oui" },
                            { id: 'non-cabinet-exist', text: "Non" }
                        ]);
                        conversationState = 'cabinet_comptable_status';
                        break;

                    case 'cabinet_comptable_status':
                        // Collecte l'information sur le comptable et ajuste le message
                        sessionData.aUnComptable = option.text;
                        let messageCabinetComptable;
                        if (option.id === 'oui-cabinet-exist') {
                            messageCabinetComptable = "Merci pour votre réponse. Je comprends que vous cherchez à changer de cabinet. Je vous propose d’en discuter plus en détail lors d’un rendez-vous si vous souhaitez. Voici nos disponibilités:";
                        } else { // non-cabinet-exist
                            messageCabinetComptable = "Très bien, nous pouvons vous accompagner dans vos débuts. Je vous propose d’en discuter plus en détail lors d’un rendez-vous si vous le souhaitez. Voici nos disponibilités:";
                        }
                        // Envoie les données temporaires AVANT d'ouvrir Calendly
                        await sendTemporaryChatbotData();
                        appendMessage(messageCabinetComptable, 'bot');
                        integrateCalendly();
                        break;

                    case 'creation_societe_form_juridique':
                        if (option.id === 'oui-form-juridique') {
                            appendMessage("Super, c’est une excellente première étape ! Je vous propose d’en discuter plus en détail lors d’un rendez-vous personnalisé, si vous le souhaitez. Voici nos disponibilités:", 'bot');
                            // Directly integrate Calendly based on the new flow, as the sub-questions about structure
                            // are now handled within the 'conseil-creation' path if chosen from 'conseil-personnalise'.
                            // If chosen from "Je veux créer une société" and "Oui", it goes straight to Calendly
                            // as per the requirement for the main "Création d'entreprise" path (first modification request).
                            await sendTemporaryChatbotData();
                            integrateCalendly();
                        } else if (option.id === 'non-form-juridique') {
                            sessionData.formeJuridiqueCreation = "Non (pas encore choisie)"; // Enregistrer ce choix explicite
                            // Envoie les données temporaires AVANT d'ouvrir Calendly
                            await sendTemporaryChatbotData();
                            appendMessage("D’accord, pas de souci. C’est important de faire le bon choix dès le départ. Si vous le souhaitez, nos conseillers sont là pour vous accompagner dans le choix de la forme juridique la plus adaptée à votre projet. Je vous propose d’en discuter lors d’un rendez-vous. Voici nos disponibilités :", 'bot');
                            integrateCalendly();
                        }
                        break;

                    case 'creation_societe_structure_choix':
                        // This case might be obsolete if "oui-form-juridique" in 'creation_societe_form_juridique'
                        // directly leads to Calendly now, as per the latest instructions.
                        // However, it's still used by 'conseil_creation_form_juridique_status' -> 'oui' path.
                        sessionData.formeJuridiqueCreation = option.text;
                        await sendTemporaryChatbotData();
                        appendMessage("Très bien, merci. Je vous invite à prendre rendez-vous. Voici le calendrier pour la prise de rendez-vous.", 'bot');
                        integrateCalendly();
                        break;

                    case 'conseil_personnalise_sujet':
                        sessionData.sujetConseil = option.text;
                        if (option.id === 'conseil-creation') {
                            appendMessage("Avez-vous déjà choisie une forme juridique ?", 'bot');
                            displayOptions([
                                { id: 'oui-form-juridique-conseil', text: "Oui" },
                                { id: 'non-form-juridique-conseil', text: "Non" }
                            ]);
                            conversationState = 'conseil_creation_form_juridique_status';
                        } else if (option.id === 'conseil-comptabilite') {
                            appendMessage("Pour quel type de société ?", 'bot');
                            displayOptions([
                                { id: 'sci-conseil-comp', text: "SCI" },
                                { id: 'sarl-eurl-conseil-comp', text: "SARL/EURL" },
                                { id: 'lmnp-conseil-comp', text: "LMNP" },
                                { id: 'professions-liberales-conseil-comp', text: "Professions libérales" },
                                { id: 'artisans-commercants-conseil-comp', text: "Artisans et commerçants" },
                                { id: 'btp-conseil-comp', text: "BTP" },
                                { id: 'e-commerce-conseil-comp', text: "E-commerce" },
                                { id: 'auto-entrepreneur-conseil-comp', text: "Auto-entrepreneur" },
                                { id: 'taxis-vtc-conseil-comp', text: "Taxis et VTC" },
                                { id: 'autre-conseil-comp', text: "Autre" }
                            ]);
                            conversationState = 'conseil_comptabilite_type_societe';
                        } else { // 'conseil-autre'
                            await sendTemporaryChatbotData();
                            appendMessage("Pour ceci, je vous invite à prendre rendez-vous avec un de nos conseillers. Voici le calendrier pour la prise de rendez-vous.", 'bot');
                            integrateCalendly();
                        }
                        break;

                    case 'conseil_creation_form_juridique_status':
                        if (option.id === 'non-form-juridique-conseil') {
                            sessionData.formeJuridiqueCreation = "Non (pas encore choisie)";
                            await sendTemporaryChatbotData();
                            appendMessage("D’accord, pas de souci. C’est important de faire le bon choix dès le départ. Si vous le souhaitez, nos conseillers sont là pour vous accompagner dans le choix de la forme juridique la plus adaptée à votre projet. Je vous propose d’en discuter lors d’un rendez-vous. Voici nos disponibilités :", 'bot');
                            integrateCalendly();
                        } else if (option.id === 'oui-form-juridique-conseil') {
                            appendMessage("Quel type de structure envisagez-vous ?", 'bot');
                            displayOptions([
                                { id: 'sas-sasu-conseil', text: "SAS/SASU" },
                                { id: 'sarl-eurl-conseil', text: "SARL/EURL" },
                                { id: 'lmnp-conseil', text: "LMNP" },
                                { id: 'sci-conseil', text: "SCI" },
                                { id: 'auto-entrepreneur-conseil', text: "Auto-entrepreneur" },
                                { id: 'autre-creation-conseil', text: "Autre" },
                                { id: 'je-ne-sais-pas-conseil', text: "Je ne sais pas" }
                            ]);
                            conversationState = 'conseil_creation_structure_choix';
                        }
                        break;

                    case 'conseil_creation_structure_choix':
                        sessionData.formeJuridiqueCreation = option.text;
                        await sendTemporaryChatbotData();
                        appendMessage("Super, c’est une excellente première étape ! Je vous propose d’en discuter plus en détail lors d’un rendez-vous personnalisé, si vous le souhaitez. Voici nos disponibilités:", 'bot');
                        integrateCalendly();
                        break;

                    case 'conseil_comptabilite_type_societe':
                        sessionData.typeSocieteComptabiliteConseil = option.text; // Store the type of society for advice
                        appendMessage("Travaillez-vous déjà avec un cabinet comptable actuellement ?", 'bot');
                        displayOptions([
                            { id: 'oui-cabinet-conseil', text: "Oui" },
                            { id: 'non-cabinet-conseil', text: "Non" }
                        ]);
                        conversationState = 'conseil_comptabilite_cabinet_status';
                        break;

                    case 'conseil_comptabilite_cabinet_status':
                        sessionData.aUnComptableConseil = option.text; // Store the answer for advice
                        let messageComptableConseil;
                        if (option.id === 'oui-cabinet-conseil') {
                            messageComptableConseil = "Merci pour votre réponse. Je vous propose d’en discuter plus en détail lors d’un rendez-vous si vous souhaitez. Voici nos disponibilités:";
                        } else { // non-cabinet-conseil
                            messageComptableConseil = "D'accord, pas de problème, nous pouvons vous accompagner dans vos débuts. Je vous propose d’en discuter plus en détail lors d’un rendez-vous si vous le souhaitez. Voici nos disponibilités:";
                        }
                        await sendTemporaryChatbotData();
                        appendMessage(messageComptableConseil, 'bot');
                        integrateCalendly();
                        break;

                    case 'agent_mode':
                        // La logique de réponse fixe est maintenant dans sendMessage()
                        break;

                    default:
                        appendMessage("Désolé, une erreur est survenue. Veuillez redémarrer la conversation.", 'bot');
                        displayOptions([
                            { id: 'besoin-comptable', text: "J'ai besoin d'un comptable" },
                            { id: 'creer-societe', text: "Je veux créer une société" },
                            { id: 'conseil-personnalise', text: "J'ai besoin d'un conseil personnalisé" },
                            { id: 'parler-agent', text: "Je souhaite parler à un agent en ligne" }
                        ]);
                        conversationState = 'initial';
                        break;
                }
            }, 500); // Délai pour simuler un temps de réponse du bot
        }

        // --- Fonctions exposées globalement pour interaction avec la page principale ---

        /**
         * Ouvre la fenêtre du chatbot et réinitialise la conversation.
         * Le bouton flottant est masqué à l'ouverture.
         */
        window.openChatbot = () => {
            // MODIFIÉ : Le bouton flottant NE sera PLUS caché lors de l'ouverture du chat
            // chatButton.style.display = 'none';

            // Réinitialise la conversation
            conversationState = 'initial';
            chatMessages.innerHTML = '';
            hasInitialBotMessageBeenShown = false;
            inputArea.style.display = 'none';
            chatOptionsContainer.style.display = 'flex';
            const existingIframe = chatMessages.querySelector('iframe');
            if (existingIframe) {
                existingIframe.remove();
            }

            // Ouvre la boîte de chat avec animation
            chatBox.style.display = 'flex';
            setTimeout(() => chatBox.classList.add('open'), 10);
            isChatOpen = true;
            toggleNotification(false);

            // Démarre la conversation QCM initiale
            handleOptionClick({ id: 'start', text: 'Démarrer le Chat' });
        };

        /**
         * Ferme complètement la fenêtre du chatbot ET le bouton flottant.
         * Cette fonction est conservée au cas où vous voudriez tout masquer,
         * mais n'est plus liée à la croix de fermeture.
         * Réinitialise également la conversation.
         */
        window.closeChatbotFully = () => {
            chatBox.classList.remove('open');
            setTimeout(() => {
                chatBox.style.display = 'none';
                chatButton.style.display = 'flex'; // Le bouton est affiché en cas de fermeture complète
            }, 300);
            isChatOpen = false;

            // Réinitialisation complète de l'état du chatbot
            conversationState = 'initial';
            inputArea.style.display = 'none';
            chatOptionsContainer.style.display = 'flex';
            chatMessages.innerHTML = '';
            hasInitialBotMessageBeenShown = false;
            toggleNotification(false);

            // Efface également tout iframe Calendly existant
            const existingIframe = chatMessages.querySelector('iframe');
            if (existingIframe) {
                existingIframe.remove();
            }

            // Réinitialise les données de session lors de la fermeture complète
            sessionData = {
                userId: getUserId(), // Conserve l'ID utilisateur
                statutEntreprise: null,
                aUnComptable: null,
                formeJuridiqueCreation: null,
                sujetConseil: null,
                typeSocieteComptabiliteConseil: null,
                aUnComptableConseil: null
            };
        };

        /**
         * Alterne la visibilité de la fenêtre du chat.
         * Le bouton flottant reste toujours visible et gère l'ouverture/fermeture.
         * Ne réinitialise pas la conversation.
         */
        window.toggleChatboxVisibility = () => {
            if (chatBox.classList.contains('open')) {
                // Fermeture du chat
                chatBox.classList.remove('open');
                setTimeout(() => chatBox.style.display = 'none', 300);
                isChatOpen = false;
                // MODIFIÉ : Le bouton reste affiché, donc pas de changement de display ici.
                // chatButton.style.display = 'flex';
            } else {
                // Ouverture du chat
                chatBox.style.display = 'flex';
                setTimeout(() => chatBox.classList.add('open'), 10);
                isChatOpen = true;
                toggleNotification(false);
                // MODIFIÉ : Le bouton reste affiché, donc pas de changement de display ici.
                // chatButton.style.display = 'none';

                // Si c'est la première ouverture (ou après une réinitialisation), démarre la conversation
                if (!hasInitialBotMessageBeenShown && conversationState === 'initial') {
                    handleOptionClick({ id: 'start', text: 'Démarrer le Chat' });
                    hasInitialBotMessageBeenShown = true;
                }
            }
        };

        // Gère l'ouverture/fermeture du chat via le bouton flottant (qui est toujours visible)
        chatButton.addEventListener('click', window.toggleChatboxVisibility);
        // MODIFIÉ : L'écouteur du bouton de fermeture 'X' est retiré
        // closeChatButton.addEventListener('click', window.toggleChatboxVisibility);

        // MODIFIÉ : Le chatbot est fermé par défaut, mais la bulle reste visible.
        // window.openChatbot(); // Cette ligne est maintenant commentée
    });
})();
