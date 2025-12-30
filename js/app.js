// Main Application Controller

const App = {
    // Initialize application
    init() {
        console.log('🛡️ Risk Management Tool - Initializing...');

        // Initialize all modules
        AssetManager.init();
        ThreatManager.init();
        RiskMatrix.init();
        TreatmentManager.init();
        ExportManager.init();

        // Bind navigation
        this.bindNavigation();

        // Bind load sample data button
        document.getElementById('load-sample-btn').addEventListener('click', () => this.loadSampleData());

        // Update dashboard
        this.updateDashboard();

        console.log('✅ Application initialized successfully');
    },

    // Bind navigation events
    bindNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.section;
                this.navigateToSection(sectionId);
            });
        });
    },

    // Navigate to section
    navigateToSection(sectionId) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Refresh section content
        if (sectionId === 'dashboard') {
            this.updateDashboard();
        } else if (sectionId === 'assets') {
            AssetManager.render();
        } else if (sectionId === 'threats') {
            ThreatManager.render();
        } else if (sectionId === 'assessment') {
            RiskMatrix.render();
        } else if (sectionId === 'treatment') {
            TreatmentManager.render();
        }
    },

    // Update dashboard statistics and charts
    updateDashboard() {
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        const treatments = DataStore.getData(DataStore.KEYS.TREATMENTS);

        // Update stat cards
        document.getElementById('stat-assets').textContent = assets.length;
        document.getElementById('stat-vulnerabilities').textContent = vulnerabilities.length;

        const highRisk = vulnerabilities.filter(v => v.riskLevel === 'High').length;
        const mediumRisk = vulnerabilities.filter(v => v.riskLevel === 'Medium').length;
        const lowRisk = vulnerabilities.filter(v => v.riskLevel === 'Low').length;

        document.getElementById('stat-high-risk').textContent = highRisk;
        document.getElementById('stat-medium-risk').textContent = mediumRisk;
        document.getElementById('stat-low-risk').textContent = lowRisk;

        const activeTreatments = treatments.filter(t => t.status !== 'Completed').length;
        document.getElementById('stat-treatments').textContent = activeTreatments;

        // Update risk distribution chart
        this.renderRiskDistribution(lowRisk, mediumRisk, highRisk);

        // Update recent vulnerabilities
        this.renderRecentVulnerabilities(vulnerabilities.slice(-5).reverse());
    },

    // Render risk distribution chart
    renderRiskDistribution(low, medium, high) {
        const container = document.getElementById('risk-distribution-chart');
        const total = low + medium + high || 1;

        const lowHeight = (low / total) * 100;
        const mediumHeight = (medium / total) * 100;
        const highHeight = (high / total) * 100;

        container.innerHTML = `
            <div class="chart-bar">
                <div class="chart-bar-fill" style="background: linear-gradient(to top, #10b981, #34d399); height: ${lowHeight}%;">
                    ${low}
                </div>
                <div class="chart-bar-label">Low Risk</div>
            </div>
            <div class="chart-bar">
                <div class="chart-bar-fill" style="background: linear-gradient(to top, #f59e0b, #fbbf24); height: ${mediumHeight}%;">
                    ${medium}
                </div>
                <div class="chart-bar-label">Medium Risk</div>
            </div>
            <div class="chart-bar">
                <div class="chart-bar-fill" style="background: linear-gradient(to top, #ef4444, #f87171); height: ${highHeight}%;">
                    ${high}
                </div>
                <div class="chart-bar-label">High Risk</div>
            </div>
        `;
    },

    // Render recent vulnerabilities
    renderRecentVulnerabilities(vulnerabilities) {
        const container = document.getElementById('recent-vulnerabilities');
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);
        const threats = DataStore.getData(DataStore.KEYS.THREATS);

        if (vulnerabilities.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No vulnerabilities identified yet.</p>';
            return;
        }

        container.innerHTML = vulnerabilities.map(vuln => {
            const asset = assets.find(a => a.id === vuln.assetId);
            const threat = threats.find(t => t.id === vuln.threatId);

            return `
                <div class="vulnerability-item">
                    <div class="vulnerability-info">
                        <h4>${this.escapeHtml(asset?.name || 'Unknown')} - ${this.escapeHtml(threat?.name || 'Unknown')}</h4>
                        <p>Likelihood: ${vuln.likelihood} | Impact: ${vuln.impact}</p>
                    </div>
                    <span class="risk-badge ${vuln.riskLevel.toLowerCase()}">${vuln.riskLevel}</span>
                </div>
            `;
        }).join('');
    },

    // Load sample data
    loadSampleData() {
        if (confirm('This will load sample data for demonstration. Any existing data will be preserved. Continue?')) {
            // Add sample assets
            const sampleAssets = [
                { name: 'Web Server', type: 'Hardware', value: 5, criticality: 'Critical', description: 'Production web server hosting customer portal' },
                { name: 'Database Server', type: 'Hardware', value: 5, criticality: 'Critical', description: 'Primary customer database' },
                { name: 'Customer Data', type: 'Data', value: 5, criticality: 'Critical', description: 'Personally identifiable information' },
                { name: 'Email System', type: 'Software', value: 4, criticality: 'High', description: 'Corporate email infrastructure' },
                { name: 'Firewall', type: 'Hardware', value: 4, criticality: 'High', description: 'Network perimeter security' },
                { name: 'Employee Workstations', type: 'Hardware', value: 3, criticality: 'Medium', description: 'Desktop computers for staff' },
                { name: 'Backup System', type: 'Software', value: 4, criticality: 'High', description: 'Automated backup solution' },
                { name: 'Office Building', type: 'Facilities', value: 3, criticality: 'Medium', description: 'Main office location' },
                { name: 'IT Staff', type: 'Personnel', value: 4, criticality: 'High', description: 'IT department personnel' },
                { name: 'Mobile Devices', type: 'Hardware', value: 3, criticality: 'Medium', description: 'Company-issued smartphones' }
            ];

            sampleAssets.forEach(asset => {
                DataStore.addItem(DataStore.KEYS.ASSETS, asset);
            });

            // Get added assets and threats
            const assets = DataStore.getData(DataStore.KEYS.ASSETS);
            const threats = DataStore.getData(DataStore.KEYS.THREATS);

            // Add sample vulnerabilities
            const sampleVulnerabilities = [
                { assetName: 'Web Server', threatName: 'DDoS Attack', likelihood: 4, impact: 4, description: 'Server vulnerable to volumetric attacks' },
                { assetName: 'Database Server', threatName: 'SQL Injection', likelihood: 3, impact: 5, description: 'Input validation gaps in legacy code' },
                { assetName: 'Customer Data', threatName: 'Data Breach', likelihood: 3, impact: 5, description: 'Insufficient encryption at rest' },
                { assetName: 'Email System', threatName: 'Phishing Attack', likelihood: 5, impact: 3, description: 'Users susceptible to social engineering' },
                { assetName: 'Firewall', threatName: 'Zero-Day Exploit', likelihood: 2, impact: 5, description: 'Outdated firmware version' },
                { assetName: 'Employee Workstations', threatName: 'Ransomware', likelihood: 4, impact: 3, description: 'No endpoint protection deployed' },
                { assetName: 'Backup System', threatName: 'Insider Threat - Malicious', likelihood: 2, impact: 4, description: 'Excessive admin privileges' },
                { assetName: 'Office Building', threatName: 'Physical Security Breach', likelihood: 2, impact: 3, description: 'Limited access controls' },
                { assetName: 'IT Staff', threatName: 'Insider Threat - Negligent', likelihood: 3, impact: 3, description: 'Insufficient security training' },
                { assetName: 'Mobile Devices', threatName: 'Credential Theft', likelihood: 3, impact: 3, description: 'Weak password policies' }
            ];

            sampleVulnerabilities.forEach(vuln => {
                const asset = assets.find(a => a.name === vuln.assetName);
                const threat = threats.find(t => t.name === vuln.threatName);

                if (asset && threat) {
                    const riskScore = RiskCalculator.calculateRiskScore(vuln.likelihood, vuln.impact);
                    const riskLevel = RiskCalculator.classifyRisk(riskScore);

                    DataStore.addItem(DataStore.KEYS.VULNERABILITIES, {
                        assetId: asset.id,
                        threatId: threat.id,
                        description: vuln.description,
                        likelihood: vuln.likelihood,
                        impact: vuln.impact,
                        riskScore,
                        riskLevel
                    });
                }
            });

            // Add sample treatments
            const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);

            const sampleTreatments = [
                { vulnIndex: 0, strategy: 'Mitigate', status: 'In Progress', responsible: 'Network Team', notes: 'Implement DDoS protection service' },
                { vulnIndex: 1, strategy: 'Mitigate', status: 'Planned', responsible: 'Dev Team', notes: 'Code review and input sanitization' },
                { vulnIndex: 2, strategy: 'Mitigate', status: 'In Progress', responsible: 'Security Team', notes: 'Deploy encryption solution' },
                { vulnIndex: 3, strategy: 'Mitigate', status: 'Planned', responsible: 'HR & IT', notes: 'Security awareness training program' },
                { vulnIndex: 4, strategy: 'Mitigate', status: 'Planned', responsible: 'Network Team', notes: 'Schedule firmware update' },
                { vulnIndex: 5, strategy: 'Mitigate', status: 'In Progress', responsible: 'IT Team', notes: 'Deploy endpoint protection software' }
            ];

            sampleTreatments.forEach(treatment => {
                const vuln = vulnerabilities[treatment.vulnIndex];
                if (vuln) {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 30);

                    DataStore.addItem(DataStore.KEYS.TREATMENTS, {
                        vulnerabilityId: vuln.id,
                        strategy: treatment.strategy,
                        status: treatment.status,
                        responsible: treatment.responsible,
                        dueDate: dueDate.toISOString().split('T')[0],
                        notes: treatment.notes
                    });
                }
            });

            // Refresh all views
            AssetManager.render();
            ThreatManager.render();
            RiskMatrix.render();
            TreatmentManager.render();
            this.updateDashboard();

            alert('Sample data loaded successfully! Explore all sections to see the data.');
        }
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expose App globally for debugging
window.App = App;

// Validation functions for console testing
window.validateRiskCalculations = () => RiskCalculator.validateRiskCalculations();
window.validateDataIntegrity = () => DataStore.validateDataIntegrity();
