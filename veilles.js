async function fetchAndDisplayGoogleAlerts() {
    const feedContainer = document.getElementById('google-alerts-feed-container');
    if (!feedContainer) {
        console.error("Conteneur 'google-alerts-feed-container' introuvable.");
        return;
    }

    // L'URL de votre flux RSS Google Alert
    const googleAlertRssUrl = 'https://www.google.fr/alerts/feeds/00423473392342493047/13628093156969671124'; // Votre URL est ici

    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(googleAlertRssUrl)}`;
    console.log("URL envoyée à rss2json:", apiUrl);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            feedContainer.innerHTML = ''; 
            data.items.slice(0, 6).forEach(item => {
                const articleCard = document.createElement('article');
                articleCard.className = 'veille-article-card dynamic-feed-item';

                let imageHtml = '';
                let imageUrl = item.thumbnail;
                if (!imageUrl && item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
                    imageUrl = item.enclosure.link;
                }

                if (imageUrl) {
                    imageHtml = `<img src="${imageUrl}" alt="Illustration pour ${item.title}" class="veille-article-image">`;
                } else {
                    imageHtml = `<div class="veille-article-image-placeholder"><i class="fas fa-newspaper"></i></div>`;
                }

                let snippet = item.description || item.content || '';
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = snippet;
                snippet = (tempDiv.textContent || tempDiv.innerText || "").substring(0, 120) + (snippet.length > 120 ? '...' : '');

                articleCard.innerHTML = `
                    ${imageHtml}
                    <div class="veille-article-content">
                        <h3>${item.title}</h3>
                        <p class="veille-source">
                            Source: ${new URL(item.link).hostname} 
                            | ${new Date(item.pubDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                        <p class="veille-summary">${snippet}</p>
                        <a href="${item.link}" class="btn-secondary" target="_blank" rel="noopener noreferrer">
                            Lire l'article <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                `;
                feedContainer.appendChild(articleCard);
            });
        } else {
            feedContainer.innerHTML = '<p class="error-feed">Aucune alerte récente trouvée ou erreur du service de flux.</p>';
            console.error("Erreur de flux ou pas d'items:", data.message || data);
        }
    } catch (error) {
        feedContainer.innerHTML = '<p class="error-feed">Impossible de charger les alertes pour le moment. Vérifiez la console pour les détails.</p>';
        console.error("Erreur lors de la récupération du flux Google Alerts RSS:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // ... (votre code existant pour la navigation) ...

    // Code pour l'année en cours dans le footer (si vous l'avez)
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // Appeler la fonction pour charger le flux Google Alerts
    fetchAndDisplayGoogleAlerts(); 
});