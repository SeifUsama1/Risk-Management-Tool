// Data Store - LocalStorage wrapper for data persistence

const DataStore = {
    // Keys for different data types
    KEYS: {
        ASSETS: 'rm_assets',
        THREATS: 'rm_threats',
        VULNERABILITIES: 'rm_vulnerabilities',
        TREATMENTS: 'rm_treatments'
    },

    // Get data from localStorage
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return [];
        }
    },

    // Save data to localStorage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    },

    // Add new item
    addItem(key, item) {
        const data = this.getData(key);
        item.id = this.generateId();
        data.push(item);
        this.saveData(key, data);
        return item;
    },

    // Update existing item
    updateItem(key, id, updates) {
        const data = this.getData(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.saveData(key, data);
            return data[index];
        }
        return null;
    },

    // Delete item
    deleteItem(key, id) {
        const data = this.getData(key);
        const filtered = data.filter(item => item.id !== id);
        this.saveData(key, filtered);
        return filtered.length < data.length;
    },

    // Get single item by ID
    getItem(key, id) {
        const data = this.getData(key);
        return data.find(item => item.id === id);
    },

    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // Generate unique ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Initialize with default threats if empty
    initializeThreats() {
        const threats = this.getData(this.KEYS.THREATS);
        if (threats.length === 0) {
            const defaultThreats = [
                { name: 'Ransomware', category: 'Malware', description: 'Malicious software that encrypts data and demands payment' },
                { name: 'Phishing Attack', category: 'Social Engineering', description: 'Fraudulent attempts to obtain sensitive information' },
                { name: 'DDoS Attack', category: 'Network Attack', description: 'Distributed Denial of Service attack overwhelming systems' },
                { name: 'Insider Threat - Malicious', category: 'Insider Threat', description: 'Intentional harm by authorized users' },
                { name: 'Insider Threat - Negligent', category: 'Insider Threat', description: 'Unintentional security breaches by employees' },
                { name: 'SQL Injection', category: 'Web Attack', description: 'Code injection targeting database-driven applications' },
                { name: 'Zero-Day Exploit', category: 'Vulnerability Exploit', description: 'Attack on previously unknown vulnerability' },
                { name: 'Physical Security Breach', category: 'Physical', description: 'Unauthorized physical access to facilities or equipment' },
                { name: 'Data Breach', category: 'Data Security', description: 'Unauthorized access to confidential data' },
                { name: 'Supply Chain Attack', category: 'Third Party', description: 'Attack through trusted third-party vendors' },
                { name: 'Man-in-the-Middle', category: 'Network Attack', description: 'Interception of communications between parties' },
                { name: 'Credential Theft', category: 'Authentication', description: 'Theft of usernames and passwords' }
            ];

            defaultThreats.forEach(threat => {
                this.addItem(this.KEYS.THREATS, threat);
            });
        }
    },

    // Validation functions
    validateDataIntegrity() {
        const assets = this.getData(this.KEYS.ASSETS);
        const threats = this.getData(this.KEYS.THREATS);
        const vulnerabilities = this.getData(this.KEYS.VULNERABILITIES);
        const treatments = this.getData(this.KEYS.TREATMENTS);

        let errors = [];

        // Check vulnerabilities reference valid assets and threats
        vulnerabilities.forEach(vuln => {
            if (!assets.find(a => a.id === vuln.assetId)) {
                errors.push(`Vulnerability ${vuln.id} references non-existent asset`);
            }
            if (!threats.find(t => t.id === vuln.threatId)) {
                errors.push(`Vulnerability ${vuln.id} references non-existent threat`);
            }
        });

        // Check treatments reference valid vulnerabilities
        treatments.forEach(treatment => {
            if (!vulnerabilities.find(v => v.id === treatment.vulnerabilityId)) {
                errors.push(`Treatment ${treatment.id} references non-existent vulnerability`);
            }
        });

        if (errors.length > 0) {
            console.warn('Data integrity issues:', errors);
            return false;
        }

        console.log('Data integrity check passed ✓');
        return true;
    }
};

// Initialize threats on load
DataStore.initializeThreats();
