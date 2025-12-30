// Risk Calculator - Likelihood × Impact scoring and classification

const RiskCalculator = {
    // Likelihood scale definitions
    LIKELIHOOD: {
        1: { label: 'Rare', description: 'May occur only in exceptional circumstances' },
        2: { label: 'Unlikely', description: 'Could occur at some time' },
        3: { label: 'Possible', description: 'Might occur at some time' },
        4: { label: 'Likely', description: 'Will probably occur in most circumstances' },
        5: { label: 'Almost Certain', description: 'Expected to occur in most circumstances' }
    },

    // Impact scale definitions
    IMPACT: {
        1: { label: 'Insignificant', description: 'Minimal impact, easily managed' },
        2: { label: 'Minor', description: 'Some impact, manageable with routine procedures' },
        3: { label: 'Moderate', description: 'Moderate impact, requires management attention' },
        4: { label: 'Major', description: 'Significant impact, requires senior management intervention' },
        5: { label: 'Catastrophic', description: 'Severe impact, threatens organizational viability' }
    },

    // Calculate risk score
    calculateRiskScore(likelihood, impact) {
        return likelihood * impact;
    },

    // Classify risk level based on score
    classifyRisk(score) {
        if (score >= 1 && score <= 6) {
            return 'Low';
        } else if (score >= 8 && score <= 12) {
            return 'Medium';
        } else if (score >= 15 && score <= 25) {
            return 'High';
        }
        return 'Unknown';
    },

    // Get risk color
    getRiskColor(level) {
        const colors = {
            'Low': '#10b981',
            'Medium': '#f59e0b',
            'High': '#ef4444'
        };
        return colors[level] || '#6b7280';
    },

    // Get risk class for CSS
    getRiskClass(level) {
        return level.toLowerCase();
    },

    // Calculate risk for a vulnerability
    calculateVulnerabilityRisk(vulnerability) {
        const score = this.calculateRiskScore(vulnerability.likelihood, vulnerability.impact);
        const level = this.classifyRisk(score);
        return {
            score,
            level,
            color: this.getRiskColor(level),
            class: this.getRiskClass(level)
        };
    },

    // Recalculate all vulnerability risks
    recalculateAllRisks() {
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        vulnerabilities.forEach(vuln => {
            const risk = this.calculateVulnerabilityRisk(vuln);
            vuln.riskScore = risk.score;
            vuln.riskLevel = risk.level;
        });
        DataStore.saveData(DataStore.KEYS.VULNERABILITIES, vulnerabilities);
    },

    // Get likelihood label
    getLikelihoodLabel(value) {
        return this.LIKELIHOOD[value]?.label || 'Unknown';
    },

    // Get impact label
    getImpactLabel(value) {
        return this.IMPACT[value]?.label || 'Unknown';
    },

    // Validate risk calculations
    validateRiskCalculations() {
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        let allValid = true;

        vulnerabilities.forEach(vuln => {
            const expectedScore = this.calculateRiskScore(vuln.likelihood, vuln.impact);
            const expectedLevel = this.classifyRisk(expectedScore);

            if (vuln.riskScore !== expectedScore || vuln.riskLevel !== expectedLevel) {
                console.warn(`Invalid risk calculation for vulnerability ${vuln.id}`);
                allValid = false;
            }
        });

        if (allValid) {
            console.log('All risk calculations valid ✓');
        }

        return allValid;
    }
};
