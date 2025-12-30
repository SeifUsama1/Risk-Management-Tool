// Risk Matrix - Visual risk classification and matrix display

const RiskMatrix = {
    // Initialize risk matrix
    init() {
        this.render();
    },

    // Render the complete risk matrix
    render() {
        this.renderMatrix();
    },

    // Render the 5x5 risk matrix
    renderMatrix() {
        const container = document.getElementById('risk-matrix');
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);

        // Create 5x5 grid (likelihood 5 to 1, impact 1 to 5)
        let html = '';

        for (let likelihood = 5; likelihood >= 1; likelihood--) {
            for (let impact = 1; impact <= 5; impact++) {
                const score = likelihood * impact;
                const level = RiskCalculator.classifyRisk(score);
                const vulnsInCell = vulnerabilities.filter(v =>
                    v.likelihood === likelihood && v.impact === impact
                );

                html += `
                    <div class="matrix-cell ${level.toLowerCase()}" 
                         onclick="RiskMatrix.showCellDetails(${likelihood}, ${impact})"
                         title="Likelihood: ${likelihood}, Impact: ${impact}">
                        <div class="matrix-cell-score">${score}</div>
                        ${vulnsInCell.length > 0 ? `<div class="matrix-cell-count">${vulnsInCell.length} vuln${vulnsInCell.length > 1 ? 's' : ''}</div>` : ''}
                    </div>
                `;
            }
        }

        container.innerHTML = html;
    },

    // Show details for a specific matrix cell
    showCellDetails(likelihood, impact) {
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);
        const threats = DataStore.getData(DataStore.KEYS.THREATS);

        const vulnsInCell = vulnerabilities.filter(v =>
            v.likelihood === likelihood && v.impact === impact
        );

        if (vulnsInCell.length === 0) {
            return;
        }

        const score = likelihood * impact;
        const level = RiskCalculator.classifyRisk(score);

        const modal = document.getElementById('matrix-detail-modal');
        const title = document.getElementById('matrix-detail-title');
        const content = document.getElementById('matrix-detail-content');

        title.textContent = `Risk Score ${score} (${level}) - ${vulnsInCell.length} Vulnerabilit${vulnsInCell.length > 1 ? 'ies' : 'y'}`;

        content.innerHTML = `
            <div style="padding: 1rem;">
                <p style="margin-bottom: 1rem;">
                    <strong>Likelihood:</strong> ${likelihood} - ${RiskCalculator.getLikelihoodLabel(likelihood)}<br>
                    <strong>Impact:</strong> ${impact} - ${RiskCalculator.getImpactLabel(impact)}
                </p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Threat</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vulnsInCell.map(vuln => {
            const asset = assets.find(a => a.id === vuln.assetId);
            const threat = threats.find(t => t.id === vuln.threatId);
            return `
                                <tr>
                                    <td><strong>${this.escapeHtml(asset?.name || 'Unknown')}</strong></td>
                                    <td>${this.escapeHtml(threat?.name || 'Unknown')}</td>
                                    <td>${this.escapeHtml(vuln.description || '-')}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        modal.classList.add('active');

        // Close modal handlers
        document.getElementById('matrix-detail-close').onclick = () => {
            modal.classList.remove('active');
        };

        modal.onclick = (e) => {
            if (e.target.id === 'matrix-detail-modal') {
                modal.classList.remove('active');
            }
        };
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Expose to window for inline event handlers
window.RiskMatrix = RiskMatrix;
