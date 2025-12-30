// Treatment Manager - Risk treatment tracking

const TreatmentManager = {
    currentEditId: null,
    currentFilter: 'all',

    // Initialize treatment manager
    init() {
        this.bindEvents();
        this.render();
    },

    // Bind event listeners
    bindEvents() {
        // Add treatment button
        document.getElementById('add-treatment-btn').addEventListener('click', () => this.showModal());

        // Modal close buttons
        document.getElementById('treatment-modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('treatment-cancel-btn').addEventListener('click', () => this.closeModal());

        // Form submit
        document.getElementById('treatment-form').addEventListener('submit', (e) => this.handleSubmit(e));

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Close modal on outside click
        document.getElementById('treatment-modal').addEventListener('click', (e) => {
            if (e.target.id === 'treatment-modal') this.closeModal();
        });

        // Event delegation for table actions
        document.getElementById('treatments-tbody').addEventListener('click', (e) => this.handleTableClick(e));
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
            this.deleteTreatment(id);
        }
    },

    // Show add/edit modal
    showModal(treatmentId = null) {
        const modal = document.getElementById('treatment-modal');
        const form = document.getElementById('treatment-form');
        const title = document.getElementById('treatment-modal-title');

        form.reset();
        this.currentEditId = treatmentId;

        // Populate vulnerability dropdown
        this.populateVulnerabilityDropdown();

        if (treatmentId) {
            // Edit mode
            const treatment = DataStore.getItem(DataStore.KEYS.TREATMENTS, treatmentId);
            if (treatment) {
                title.textContent = 'Edit Treatment Plan';
                document.getElementById('treatment-id').value = treatment.id;
                document.getElementById('treatment-vulnerability').value = treatment.vulnerabilityId;
                document.getElementById('treatment-strategy').value = treatment.strategy;
                document.getElementById('treatment-status').value = treatment.status;
                document.getElementById('treatment-responsible').value = treatment.responsible;
                document.getElementById('treatment-due-date').value = treatment.dueDate || '';
                document.getElementById('treatment-notes').value = treatment.notes || '';
            }
        } else {
            // Add mode
            title.textContent = 'Add Treatment Plan';
            document.getElementById('treatment-status').value = 'Planned';
        }

        modal.classList.add('active');
    },

    // Close modal
    closeModal() {
        document.getElementById('treatment-modal').classList.remove('active');
        this.currentEditId = null;
    },

    // Populate vulnerability dropdown
    populateVulnerabilityDropdown() {
        const select = document.getElementById('treatment-vulnerability');
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);
        const threats = DataStore.getData(DataStore.KEYS.THREATS);

        select.innerHTML = '<option value="">Select Vulnerability</option>' +
            vulnerabilities.map(vuln => {
                const asset = assets.find(a => a.id === vuln.assetId);
                const threat = threats.find(t => t.id === vuln.threatId);
                return `<option value="${vuln.id}">${this.escapeHtml(asset?.name || 'Unknown')} - ${this.escapeHtml(threat?.name || 'Unknown')} (Risk: ${vuln.riskLevel})</option>`;
            }).join('');
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();

        const treatmentData = {
            vulnerabilityId: document.getElementById('treatment-vulnerability').value,
            strategy: document.getElementById('treatment-strategy').value,
            status: document.getElementById('treatment-status').value,
            responsible: document.getElementById('treatment-responsible').value.trim(),
            dueDate: document.getElementById('treatment-due-date').value,
            notes: document.getElementById('treatment-notes').value.trim()
        };

        if (this.currentEditId) {
            // Update existing treatment
            DataStore.updateItem(DataStore.KEYS.TREATMENTS, this.currentEditId, treatmentData);
        } else {
            // Add new treatment
            DataStore.addItem(DataStore.KEYS.TREATMENTS, treatmentData);
        }

        this.closeModal();
        this.render();

        // Update dashboard
        if (window.App) window.App.updateDashboard();
    },

    // Delete treatment
    deleteTreatment(id) {
        if (confirm('Are you sure you want to delete this treatment plan?')) {
            DataStore.deleteItem(DataStore.KEYS.TREATMENTS, id);
            this.render();

            // Update dashboard
            if (window.App) window.App.updateDashboard();
        }
    },

    // Render treatments table
    render() {
        let treatments = DataStore.getData(DataStore.KEYS.TREATMENTS);

        // Apply filter
        if (this.currentFilter !== 'all') {
            treatments = treatments.filter(t => t.strategy === this.currentFilter);
        }

        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);
        const threats = DataStore.getData(DataStore.KEYS.THREATS);
        const tbody = document.getElementById('treatments-tbody');

        if (treatments.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No treatment plans found.</td></tr>';
            return;
        }

        tbody.innerHTML = treatments.map(treatment => {
            const vuln = vulnerabilities.find(v => v.id === treatment.vulnerabilityId);
            const asset = assets.find(a => a.id === vuln?.assetId);
            const threat = threats.find(t => t.id === vuln?.threatId);

            const vulnDisplay = vuln
                ? `${this.escapeHtml(asset?.name || 'Unknown')} - ${this.escapeHtml(threat?.name || 'Unknown')} (${vuln.riskLevel})`
                : 'Unknown Vulnerability';

            const statusClass = treatment.status.toLowerCase().replace(' ', '-');
            const dueDate = treatment.dueDate ? new Date(treatment.dueDate).toLocaleDateString() : '-';

            return `
                <tr>
                    <td><strong>${vulnDisplay}</strong></td>
                    <td><span class="status-badge">${this.escapeHtml(treatment.strategy)}</span></td>
                    <td><span class="status-badge ${statusClass}">${this.escapeHtml(treatment.status)}</span></td>
                    <td>${this.escapeHtml(treatment.responsible)}</td>
                    <td>${dueDate}</td>
                    <td>${this.escapeHtml(treatment.notes || '-')}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary edit-btn" data-id="${treatment.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${treatment.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Expose to window for inline event handlers
window.TreatmentManager = TreatmentManager;
