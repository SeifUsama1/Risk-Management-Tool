// Asset Manager - Handles asset inventory operations

const AssetManager = {
    currentEditId: null,

    // Initialize asset manager
    init() {
        this.bindEvents();
        this.render();
    },

    // Bind event listeners
    bindEvents() {
        // Add asset button
        document.getElementById('add-asset-btn').addEventListener('click', () => this.showModal());

        // Modal close buttons
        document.getElementById('asset-modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('asset-cancel-btn').addEventListener('click', () => this.closeModal());

        // Form submit
        document.getElementById('asset-form').addEventListener('submit', (e) => this.handleSubmit(e));

        // Search and filter
        document.getElementById('asset-search').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('asset-filter').addEventListener('change', (e) => this.handleFilter(e.target.value));

        // Close modal on outside click
        document.getElementById('asset-modal').addEventListener('click', (e) => {
            if (e.target.id === 'asset-modal') this.closeModal();
        });

        // Event delegation for table actions
        document.getElementById('assets-tbody').addEventListener('click', (e) => this.handleTableClick(e));
    },

    // Handle table clicks (Delegation)
    handleTableClick(e) {
        const target = e.target;

        // Handle Edit
        const editBtn = target.closest('.edit-btn');
        if (editBtn) {
            const id = editBtn.dataset.id;
            this.showModal(id);
            return;
        }

        // Handle Delete
        const deleteBtn = target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            this.deleteAsset(id);
        }
    },

    // Show add/edit modal
    showModal(assetId = null) {
        const modal = document.getElementById('asset-modal');
        const form = document.getElementById('asset-form');
        const title = document.getElementById('asset-modal-title');

        form.reset();
        this.currentEditId = assetId;

        if (assetId) {
            // Edit mode
            const asset = DataStore.getItem(DataStore.KEYS.ASSETS, assetId);
            if (asset) {
                title.textContent = 'Edit Asset';
                document.getElementById('asset-id').value = asset.id;
                document.getElementById('asset-name').value = asset.name;
                document.getElementById('asset-type').value = asset.type;
                document.getElementById('asset-value').value = asset.value;
                document.getElementById('asset-criticality').value = asset.criticality;
                document.getElementById('asset-description').value = asset.description || '';
            }
        } else {
            // Add mode
            title.textContent = 'Add Asset';
        }

        modal.classList.add('active');
    },

    // Close modal
    closeModal() {
        document.getElementById('asset-modal').classList.remove('active');
        this.currentEditId = null;
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();

        const assetData = {
            name: document.getElementById('asset-name').value.trim(),
            type: document.getElementById('asset-type').value,
            value: parseInt(document.getElementById('asset-value').value),
            criticality: document.getElementById('asset-criticality').value,
            description: document.getElementById('asset-description').value.trim()
        };

        if (this.currentEditId) {
            // Update existing asset
            DataStore.updateItem(DataStore.KEYS.ASSETS, this.currentEditId, assetData);
        } else {
            // Add new asset
            DataStore.addItem(DataStore.KEYS.ASSETS, assetData);
        }

        this.closeModal();
        this.render();

        // Update dashboard and other views
        if (window.App) {
            window.App.updateDashboard();
        }
    },

    // Delete asset
    deleteAsset(id) {
        if (confirm('Are you sure you want to delete this asset? This will also remove all associated vulnerabilities.')) {
            // Delete asset
            DataStore.deleteItem(DataStore.KEYS.ASSETS, id);

            // Delete associated vulnerabilities
            const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
            const filtered = vulnerabilities.filter(v => v.assetId !== id);
            DataStore.saveData(DataStore.KEYS.VULNERABILITIES, filtered);

            this.render();

            // Update other views
            if (window.ThreatManager) window.ThreatManager.render();
            if (window.RiskMatrix) window.RiskMatrix.render();
            if (window.TreatmentManager) window.TreatmentManager.render();
            if (window.App) window.App.updateDashboard();
        }
    },

    // Search assets
    handleSearch(query) {
        this.render(query);
    },

    // Filter assets by type
    handleFilter(type) {
        this.render(null, type);
    },

    // Render assets table
    render(searchQuery = null, filterType = null) {
        let assets = DataStore.getData(DataStore.KEYS.ASSETS);

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            assets = assets.filter(asset =>
                asset.name.toLowerCase().includes(query) ||
                asset.description.toLowerCase().includes(query)
            );
        }

        // Apply filter
        if (filterType) {
            assets = assets.filter(asset => asset.type === filterType);
        }

        const tbody = document.getElementById('assets-tbody');

        if (assets.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No assets found.</td></tr>';
            return;
        }

        tbody.innerHTML = assets.map(asset => `
            <tr>
                <td><strong>${this.escapeHtml(asset.name)}</strong></td>
                <td>${this.escapeHtml(asset.type)}</td>
                <td>${asset.value}/5</td>
                <td><span class="status-badge ${asset.criticality.toLowerCase()}">${this.escapeHtml(asset.criticality)}</span></td>
                <td>${this.escapeHtml(asset.description || '-')}</td>
                <td>
                    <button class="btn btn-sm btn-secondary edit-btn" data-id="${asset.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${asset.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    // Get all assets for dropdowns
    getAssetsForDropdown() {
        return DataStore.getData(DataStore.KEYS.ASSETS);
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Expose to window for inline event handlers
window.AssetManager = AssetManager;
