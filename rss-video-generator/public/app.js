// API Base URL
const API_BASE = '/api';

// WebSocket connection
let ws = null;
let reconnectInterval = null;

// State
const state = {
    feeds: [],
    items: [],
    selectedItems: new Set(),
    currentView: 'dashboard'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initWebSocket();
    initNavigation();
    initModals();
    initEventListeners();
    loadDashboard();
});

// WebSocket
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');
        updateConnectionStatus(true);
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateConnectionStatus(false);

        // Reconnect after 5 seconds
        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                console.log('Attempting to reconnect...');
                initWebSocket();
            }, 5000);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handleWebSocketMessage(data) {
    console.log('WebSocket message:', data);

    switch (data.type) {
        case 'connected':
            showToast(data.message, 'success');
            break;
        case 'feed_added':
            addActivityItem(`New feed added: ${data.data.name}`);
            loadFeeds();
            break;
        case 'feed_fetched':
            addActivityItem(`Fetched ${data.data.count} items from feed`);
            loadStats();
            break;
        case 'all_feeds_fetched':
            addActivityItem(`Fetched all feeds`);
            loadStats();
            loadItems();
            break;
        case 'processing_started':
            addActivityItem(`Processing item ${data.data.itemId}...`);
            break;
        case 'summary_generated':
            addActivityItem(`Summary generated for item ${data.data.itemId}`);
            break;
        case 'image_generated':
            addActivityItem(`Image generated for item ${data.data.itemId}`);
            break;
        case 'video_generated':
            addActivityItem(`Video (${data.data.format}) generated for item ${data.data.itemId}`);
            break;
        case 'processing_completed':
            addActivityItem(`Processing completed for item ${data.data.itemId}`);
            showToast('Item processed successfully!', 'success');
            break;
        case 'processing_error':
            addActivityItem(`Error processing item ${data.data.itemId}: ${data.data.error}`);
            showToast('Processing failed', 'error');
            break;
    }
}

function updateConnectionStatus(connected) {
    const indicator = document.getElementById('wsStatus');
    const text = document.getElementById('wsText');

    if (connected) {
        indicator.classList.add('connected');
        text.textContent = 'Connected';
    } else {
        indicator.classList.remove('connected');
        text.textContent = 'Disconnected';
    }
}

// Navigation
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

function switchView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    state.currentView = viewName;

    // Load view data
    switch (viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'feeds':
            loadFeeds();
            break;
        case 'items':
            loadItems();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Modals
function initModals() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        const closeButtons = modal.querySelectorAll('.modal-close');

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Event Listeners
function initEventListeners() {
    // Fetch all feeds
    document.getElementById('fetchAllBtn').addEventListener('click', async () => {
        try {
            showToast('Fetching all feeds...', 'info');
            const response = await fetch(`${API_BASE}/feeds/fetch-all`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                showToast('Feeds fetched successfully!', 'success');
            }
        } catch (error) {
            showToast('Error fetching feeds', 'error');
            console.error(error);
        }
    });

    // Add feed
    document.getElementById('addFeedBtn').addEventListener('click', () => {
        document.getElementById('addFeedModal').classList.add('active');
    });

    document.getElementById('submitFeedBtn').addEventListener('click', async () => {
        const url = document.getElementById('feedUrl').value;
        const name = document.getElementById('feedName').value;
        const category = document.getElementById('feedCategory').value;
        const language = document.getElementById('feedLanguage').value;

        if (!url || !name) {
            showToast('Please fill in required fields', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/feeds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, name, category, language })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Feed added successfully!', 'success');
                document.getElementById('addFeedModal').classList.remove('active');
                document.getElementById('feedUrl').value = '';
                document.getElementById('feedName').value = '';
                document.getElementById('feedCategory').value = '';
                loadFeeds();
            } else {
                showToast(data.error || 'Error adding feed', 'error');
            }
        } catch (error) {
            showToast('Error adding feed', 'error');
            console.error(error);
        }
    });

    // Export buttons
    document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
        window.open(`${API_BASE}/export/json`, '_blank');
    });

    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
        window.open(`${API_BASE}/export/csv`, '_blank');
    });
}

// Dashboard
async function loadDashboard() {
    await loadStats();
    await loadTrending();
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/analytics/stats`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('stat-feeds').textContent = data.stats.active_feeds || 0;
            document.getElementById('stat-items').textContent = data.stats.total_items || 0;
            document.getElementById('stat-images').textContent = data.stats.total_images || 0;
            document.getElementById('stat-videos').textContent = data.stats.total_videos || 0;

            // Update analytics view if active
            if (state.currentView === 'analytics') {
                document.getElementById('items-today').textContent = data.stats.items_today || 0;
                document.getElementById('avg-sentiment').textContent = (data.stats.avg_sentiment || 0).toFixed(2);
                document.getElementById('total-summaries').textContent = data.stats.total_summaries || 0;
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadTrending() {
    try {
        const response = await fetch(`${API_BASE}/analytics/trending`);
        const data = await response.json();

        const container = document.getElementById('trendingTopics');

        if (data.success && data.topics.length > 0) {
            container.innerHTML = data.topics.map(topic => `
        <div class="trending-tag">
          <div class="trending-topic">${escapeHtml(topic.topic)}</div>
          <div class="trending-score">${topic.mention_count}</div>
        </div>
      `).join('');
        } else {
            container.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M8 48L24 32L32 40L56 16" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>No trending topics yet</p>
        </div>
      `;
        }
    } catch (error) {
        console.error('Error loading trending:', error);
    }
}

function addActivityItem(message) {
    const feed = document.getElementById('activityFeed');
    const emptyState = feed.querySelector('.empty-state');

    if (emptyState) {
        feed.innerHTML = '';
    }

    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
    <div class="activity-time">${new Date().toLocaleTimeString()}</div>
    <div class="activity-message">${escapeHtml(message)}</div>
  `;

    feed.insertBefore(item, feed.firstChild);

    // Keep only last 10 items
    while (feed.children.length > 10) {
        feed.removeChild(feed.lastChild);
    }
}

// Feeds
async function loadFeeds() {
    try {
        const response = await fetch(`${API_BASE}/feeds`);
        const data = await response.json();

        const container = document.getElementById('feedsGrid');

        if (data.success && data.feeds.length > 0) {
            state.feeds = data.feeds;
            container.innerHTML = data.feeds.map(feed => `
        <div class="feed-card">
          <div class="feed-header">
            <div>
              <div class="feed-name">${escapeHtml(feed.name)}</div>
              <div class="feed-url">${escapeHtml(feed.url)}</div>
            </div>
            ${feed.active ? '<div class="feed-badge">Active</div>' : ''}
          </div>
          <div class="feed-stats">
            <div class="feed-stat">
              <div class="feed-stat-value">${feed.total_items_fetched || 0}</div>
              <div class="feed-stat-label">Items</div>
            </div>
            <div class="feed-stat">
              <div class="feed-stat-value">${feed.error_count || 0}</div>
              <div class="feed-stat-label">Errors</div>
            </div>
          </div>
          <div class="feed-actions">
            <button class="btn btn-primary" onclick="fetchFeed(${feed.id})">Fetch Now</button>
          </div>
        </div>
      `).join('');

            // Update feed filter
            const feedFilter = document.getElementById('feedFilter');
            if (feedFilter) {
                feedFilter.innerHTML = '<option value="">All Feeds</option>' +
                    data.feeds.map(feed => `<option value="${feed.id}">${escapeHtml(feed.name)}</option>`).join('');
            }
        } else {
            container.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="16" y="16" width="32" height="32" rx="4" stroke="#e0e0e0" stroke-width="2"/>
          </svg>
          <p>No feeds added yet</p>
        </div>
      `;
        }
    } catch (error) {
        console.error('Error loading feeds:', error);
    }
}

async function fetchFeed(feedId) {
    try {
        showToast('Fetching feed...', 'info');
        const response = await fetch(`${API_BASE}/feeds/${feedId}/fetch`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            showToast(`Fetched ${data.items.length} new items!`, 'success');
        }
    } catch (error) {
        showToast('Error fetching feed', 'error');
        console.error(error);
    }
}

// Items
async function loadItems() {
    try {
        const feedId = document.getElementById('feedFilter')?.value || '';
        const url = feedId ? `${API_BASE}/items?feedId=${feedId}` : `${API_BASE}/items`;

        const response = await fetch(url);
        const data = await response.json();

        const container = document.getElementById('itemsList');

        if (data.success && data.items.length > 0) {
            state.items = data.items;
            container.innerHTML = data.items.map(item => `
        <div class="item-card" onclick="viewItem(${item.id})">
          <div class="item-header">
            <div>
              <div class="item-title">${escapeHtml(item.title)}</div>
              <div class="item-meta">
                <span>${new Date(item.published_date).toLocaleDateString()}</span>
                ${item.author ? `<span>By ${escapeHtml(item.author)}</span>` : ''}
                ${item.reading_time_minutes ? `<span>${item.reading_time_minutes} min read</span>` : ''}
              </div>
            </div>
          </div>
          <div class="item-description">${escapeHtml((item.description || '').substring(0, 200))}...</div>
          <div class="item-actions">
            <button class="btn btn-primary" onclick="processItem(${item.id}, event)">Process</button>
            ${item.link ? `<button class="btn btn-secondary" onclick="window.open('${item.link}', '_blank'); event.stopPropagation();">View Original</button>` : ''}
          </div>
        </div>
      `).join('');
        } else {
            container.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="16" y="16" width="32" height="32" rx="4" stroke="#e0e0e0" stroke-width="2"/>
          </svg>
          <p>No items found</p>
        </div>
      `;
        }
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

async function processItem(itemId, event) {
    if (event) event.stopPropagation();

    try {
        showToast('Processing item...', 'info');
        const response = await fetch(`${API_BASE}/items/${itemId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                style: 'vibrant',
                videoFormats: ['mp4', 'webm'],
                videoStyle: 'fade'
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Item processed successfully!', 'success');
        } else {
            showToast(data.error || 'Processing failed', 'error');
        }
    } catch (error) {
        showToast('Error processing item', 'error');
        console.error(error);
    }
}

async function viewItem(itemId) {
    try {
        const response = await fetch(`${API_BASE}/items/${itemId}`);
        const data = await response.json();

        if (data.success) {
            console.log('Item details:', data.item);
            // You can implement a detailed view modal here
        }
    } catch (error) {
        console.error('Error viewing item:', error);
    }
}

// Analytics
async function loadAnalytics() {
    await loadStats();
    // Load sentiment distribution (you can implement this based on your data)
}

// Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/webhooks`);
        const data = await response.json();

        const container = document.getElementById('webhooksList');

        if (data.success && data.webhooks.length > 0) {
            container.innerHTML = data.webhooks.map(webhook => `
        <div class="webhook-item" style="padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-sm); margin-bottom: 8px;">
          <div style="font-size: 14px; color: var(--text-primary);">${escapeHtml(webhook.url)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Event: ${webhook.event_type}</div>
        </div>
      `).join('');
        } else {
            container.innerHTML = '<p style="color: var(--text-muted);">No webhooks configured</p>';
        }
    } catch (error) {
        console.error('Error loading webhooks:', error);
    }
}

// Utilities
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
      <path d="M10 6V10M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions global
window.fetchFeed = fetchFeed;
window.processItem = processItem;
window.viewItem = viewItem;
