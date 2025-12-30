// Threat Manager - Handles threats and vulnerabilities

const ThreatManager = {
    currentEditId: null,

    // Initialize threat manager
    init() {
        this.bindEvents();
        this.render();
    },

    // Bind event listeners
    bindEvents() {
        // Add vulnerability button
        document.getElementById('add-vulnerability-btn').addEventListener('click', () => this.showModal());

        // Modal close buttons
        document.getElementById('vulnerability-modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('vulnerability-cancel-btn').addEventListener('click', () => this.closeModal());

        // Form submit
        document.getElementById('vulnerability-form').addEventListener('submit', (e) => this.handleSubmit(e));

        // Risk preview on likelihood/impact change
        document.getElementById('vulnerability-likelihood').addEventListener('change', () => this.updateRiskPreview());
        document.getElementById('vulnerability-impact').addEventListener('change', () => this.updateRiskPreview());

        // Close modal on outside click
        document.getElementById('vulnerability-modal').addEventListener('click', (e) => {
            if (e.target.id === 'vulnerability-modal') this.closeModal();
        });

        // Event delegation for table actions
        document.getElementById('vulnerabilities-tbody').addEventListener('click', (e) => this.handleTableClick(e));
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
            this.deleteVulnerability(id);
        }
    },

    // Show add/edit modal
    showModal(vulnerabilityId = null) {
        const modal = document.getElementById('vulnerability-modal');
        const form = document.getElementById('vulnerability-form');
        const title = document.getElementById('vulnerability-modal-title');

        form.reset();
        this.currentEditId = vulnerabilityId;

        // Populate asset dropdown
        this.populateAssetDropdown();
        this.populateThreatDropdown();

        if (vulnerabilityId) {
            // Edit mode
            const vuln = DataStore.getItem(DataStore.KEYS.VULNERABILITIES, vulnerabilityId);
            if (vuln) {
                title.textContent = 'Edit Vulnerability';
                document.getElementById('vulnerability-id').value = vuln.id;
                document.getElementById('vulnerability-asset').value = vuln.assetId;
                document.getElementById('vulnerability-threat').value = vuln.threatId;
                document.getElementById('vulnerability-description').value = vuln.description || '';
                document.getElementById('vulnerability-likelihood').value = vuln.likelihood;
                document.getElementById('vulnerability-impact').value = vuln.impact;
                this.updateRiskPreview();
            }
        } else {
            // Add mode
            title.textContent = 'Add Vulnerability';
        }

        modal.classList.add('active');
    },

    // Close modal
    closeModal() {
        document.getElementById('vulnerability-modal').classList.remove('active');
        this.currentEditId = null;
    },

    // Populate asset dropdown
    populateAssetDropdown() {
        const select = document.getElementById('vulnerability-asset');
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);

        select.innerHTML = '<option value="">Select Asset</option>' +
            assets.map(asset => `<option value="${asset.id}">${this.escapeHtml(asset.name)} (${asset.type})</option>`).join('');
    },

    // Populate threat dropdown
    populateThreatDropdown() {
        const select = document.getElementById('vulnerability-threat');
        const threats = DataStore.getData(DataStore.KEYS.THREATS);

        select.innerHTML = '<option value="">Select Threat</option>' +
            threats.map(threat => `<option value="${threat.id}">${this.escapeHtml(threat.name)}</option>`).join('');
    },

    // Update risk preview
    updateRiskPreview() {
        const likelihood = parseInt(document.getElementById('vulnerability-likelihood').value);
        const impact = parseInt(document.getElementById('vulnerability-impact').value);

        if (likelihood && impact) {
            const score = RiskCalculator.calculateRiskScore(likelihood, impact);
            const level = RiskCalculator.classifyRisk(score);
            const color = RiskCalculator.getRiskColor(level);

            document.getElementById('preview-score').textContent = score;
            document.getElementById('preview-level').textContent = level;
            document.getElementById('preview-level').style.backgroundColor = color;
            document.getElementById('preview-level').style.color = 'white';
            document.getElementById('preview-level').style.padding = '2px 8px';
            document.getElementById('preview-level').style.borderRadius = '4px';
        }
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();

        const likelihood = parseInt(document.getElementById('vulnerability-likelihood').value);
        const impact = parseInt(document.getElementById('vulnerability-impact').value);
        const riskScore = RiskCalculator.calculateRiskScore(likelihood, impact);
        const riskLevel = RiskCalculator.classifyRisk(riskScore);

        const vulnData = {
            assetId: document.getElementById('vulnerability-asset').value,
            threatId: document.getElementById('vulnerability-threat').value,
            description: document.getElementById('vulnerability-description').value.trim(),
            likelihood,
            impact,
            riskScore,
            riskLevel
        };

        if (this.currentEditId) {
            // Update existing vulnerability
            DataStore.updateItem(DataStore.KEYS.VULNERABILITIES, this.currentEditId, vulnData);
        } else {
            // Add new vulnerability
            DataStore.addItem(DataStore.KEYS.VULNERABILITIES, vulnData);
        }

        this.closeModal();
        this.render();

        // Update other views
        if (window.RiskMatrix) window.RiskMatrix.render();
        if (window.App) window.App.updateDashboard();
    },

    // Delete vulnerability
    deleteVulnerability(id) {
        if (confirm('Are you sure you want to delete this vulnerability?')) {
            DataStore.deleteItem(DataStore.KEYS.VULNERABILITIES, id);

            // Delete associated treatments
            const treatments = DataStore.getData(DataStore.KEYS.TREATMENTS);
            const filtered = treatments.filter(t => t.vulnerabilityId !== id);
            DataStore.saveData(DataStore.KEYS.TREATMENTS, filtered);

            this.render();

            // Update other views
            if (window.RiskMatrix) window.RiskMatrix.render();
            if (window.TreatmentManager) window.TreatmentManager.render();
            if (window.App) window.App.updateDashboard();
        }
    },

    // Render threat library and vulnerabilities
    render() {
        this.renderThreatLibrary();
        this.renderVulnerabilities();
    },

    // Render threat library
    renderThreatLibrary() {
        const threats = DataStore.getData(DataStore.KEYS.THREATS);
        const container = document.getElementById('threat-library');

        container.innerHTML = threats.map(threat => `
            <div class="threat-item">
                <div class="threat-name">${this.escapeHtml(threat.name)}</div>
                <div class="threat-category">${this.escapeHtml(threat.category)}</div>
            </div>
        `).join('');
    },

    // Render vulnerabilities table
    renderVulnerabilities() {
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);
        const threats = DataStore.getData(DataStore.KEYS.THREATS);
        const tbody = document.getElementById('vulnerabilities-tbody');

        if (vulnerabilities.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No vulnerabilities identified yet.</td></tr>';
            return;
        }

        tbody.innerHTML = vulnerabilities.map(vuln => {
            const asset = assets.find(a => a.id === vuln.assetId);
            const threat = threats.find(t => t.id === vuln.threatId);

            return `
                <tr>
                    <td><strong>${this.escapeHtml(asset?.name || 'Unknown')}</strong></td>
                    <td>${this.escapeHtml(threat?.name || 'Unknown')}</td>
                    <td>${vuln.likelihood} - ${RiskCalculator.getLikelihoodLabel(vuln.likelihood)}</td>
                    <td>${vuln.impact} - ${RiskCalculator.getImpactLabel(vuln.impact)}</td>
                    <td><strong>${vuln.riskScore}</strong></td>
                    <td><span class="risk-badge ${vuln.riskLevel.toLowerCase()}">${vuln.riskLevel}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary edit-btn" data-id="${vuln.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${vuln.id}">Delete</button>
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
window.ThreatManager = ThreatManager;
