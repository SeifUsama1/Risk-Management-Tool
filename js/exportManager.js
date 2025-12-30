// Export Manager - PDF and Excel report generation

const ExportManager = {
    // Initialize export manager
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        document.getElementById('export-pdf-btn').addEventListener('click', () => this.generatePDF());
        document.getElementById('export-excel-btn').addEventListener('click', () => this.generateExcel());
    },

    // Generate PDF report
    async generatePDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const assets = DataStore.getData(DataStore.KEYS.ASSETS);
            const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
            const treatments = DataStore.getData(DataStore.KEYS.TREATMENTS);
            const threats = DataStore.getData(DataStore.KEYS.THREATS);

            // Calculate statistics
            const stats = this.calculateStatistics();

            let yPos = 20;

            // Cover Page
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text('Risk Management Report', 105, yPos, { align: 'center' });

            yPos += 15;
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });

            yPos += 20;

            // Executive Summary
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Executive Summary', 14, yPos);

            yPos += 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            const summaryText = [
                `Total Assets: ${stats.totalAssets}`,
                `Total Vulnerabilities: ${stats.totalVulnerabilities}`,
                `High Risk: ${stats.highRisk} | Medium Risk: ${stats.mediumRisk} | Low Risk: ${stats.lowRisk}`,
                `Active Treatments: ${stats.activeTreatments}`
            ];

            summaryText.forEach(line => {
                doc.text(line, 14, yPos);
                yPos += 7;
            });

            // Asset Inventory
            doc.addPage();
            yPos = 20;
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Asset Inventory', 14, yPos);

            yPos += 10;

            if (assets.length > 0) {
                doc.autoTable({
                    startY: yPos,
                    head: [['Name', 'Type', 'Value', 'Criticality']],
                    body: assets.map(a => [a.name, a.type, `${a.value}/5`, a.criticality]),
                    theme: 'grid',
                    headStyles: { fillColor: [30, 58, 138] },
                    styles: { fontSize: 9 }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            }

            // Risk Matrix Summary
            doc.addPage();
            yPos = 20;
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Risk Matrix Summary', 14, yPos);

            yPos += 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text('Risk Classification:', 14, yPos);
            yPos += 7;
            doc.text(`• Low Risk (1-6): ${stats.lowRisk} vulnerabilities`, 20, yPos);
            yPos += 7;
            doc.text(`• Medium Risk (8-12): ${stats.mediumRisk} vulnerabilities`, 20, yPos);
            yPos += 7;
            doc.text(`• High Risk (15-25): ${stats.highRisk} vulnerabilities`, 20, yPos);

            // Detailed Vulnerability Analysis
            doc.addPage();
            yPos = 20;
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Detailed Vulnerability Analysis', 14, yPos);

            yPos += 10;

            if (vulnerabilities.length > 0) {
                const vulnData = vulnerabilities.map(v => {
                    const asset = assets.find(a => a.id === v.assetId);
                    const threat = threats.find(t => t.id === v.threatId);
                    return [
                        asset?.name || 'Unknown',
                        threat?.name || 'Unknown',
                        v.likelihood,
                        v.impact,
                        v.riskScore,
                        v.riskLevel
                    ];
                });

                doc.autoTable({
                    startY: yPos,
                    head: [['Asset', 'Threat', 'L', 'I', 'Score', 'Level']],
                    body: vulnData,
                    theme: 'grid',
                    headStyles: { fillColor: [30, 58, 138] },
                    styles: { fontSize: 8 },
                    columnStyles: {
                        2: { halign: 'center' },
                        3: { halign: 'center' },
                        4: { halign: 'center', fontStyle: 'bold' },
                        5: { halign: 'center' }
                    }
                });
            }

            // Treatment Plans
            doc.addPage();
            yPos = 20;
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Treatment Plans', 14, yPos);

            yPos += 10;

            if (treatments.length > 0) {
                const treatmentData = treatments.map(t => {
                    const vuln = vulnerabilities.find(v => v.id === t.vulnerabilityId);
                    const asset = assets.find(a => a.id === vuln?.assetId);
                    return [
                        asset?.name || 'Unknown',
                        t.strategy,
                        t.status,
                        t.responsible
                    ];
                });

                doc.autoTable({
                    startY: yPos,
                    head: [['Asset', 'Strategy', 'Status', 'Responsible']],
                    body: treatmentData,
                    theme: 'grid',
                    headStyles: { fillColor: [30, 58, 138] },
                    styles: { fontSize: 9 }
                });
            }

            // Methodology Appendix
            doc.addPage();
            yPos = 20;
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Methodology', 14, yPos);

            yPos += 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            const methodology = [
                'Risk Calculation: Risk Score = Likelihood × Impact',
                '',
                'Likelihood Scale (1-5):',
                '1 - Rare: May occur only in exceptional circumstances',
                '2 - Unlikely: Could occur at some time',
                '3 - Possible: Might occur at some time',
                '4 - Likely: Will probably occur in most circumstances',
                '5 - Almost Certain: Expected to occur in most circumstances',
                '',
                'Impact Scale (1-5):',
                '1 - Insignificant: Minimal impact, easily managed',
                '2 - Minor: Some impact, manageable with routine procedures',
                '3 - Moderate: Moderate impact, requires management attention',
                '4 - Major: Significant impact, requires senior management',
                '5 - Catastrophic: Severe impact, threatens organization',
                '',
                'Risk Classification:',
                'Low (1-6): Acceptable risk, routine monitoring',
                'Medium (8-12): Management attention required',
                'High (15-25): Immediate action required'
            ];

            methodology.forEach(line => {
                doc.text(line, 14, yPos);
                yPos += 6;
            });

            // Save PDF
            doc.save(`Risk_Assessment_Report_${new Date().toISOString().split('T')[0]}.pdf`);

            alert('PDF report generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report. Please try again.');
        }
    },

    // Generate Excel report
    generateExcel() {
        try {
            const assets = DataStore.getData(DataStore.KEYS.ASSETS);
            const threats = DataStore.getData(DataStore.KEYS.THREATS);
            const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
            const treatments = DataStore.getData(DataStore.KEYS.TREATMENTS);

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Assets sheet
            const assetsData = assets.map(a => ({
                'Name': a.name,
                'Type': a.type,
                'Value': a.value,
                'Criticality': a.criticality,
                'Description': a.description || ''
            }));
            const assetsSheet = XLSX.utils.json_to_sheet(assetsData);
            XLSX.utils.book_append_sheet(wb, assetsSheet, 'Assets');

            // Threats sheet
            const threatsData = threats.map(t => ({
                'Name': t.name,
                'Category': t.category,
                'Description': t.description || ''
            }));
            const threatsSheet = XLSX.utils.json_to_sheet(threatsData);
            XLSX.utils.book_append_sheet(wb, threatsSheet, 'Threats');

            // Vulnerabilities sheet
            const vulnData = vulnerabilities.map(v => {
                const asset = assets.find(a => a.id === v.assetId);
                const threat = threats.find(t => t.id === v.threatId);
                return {
                    'Asset': asset?.name || 'Unknown',
                    'Threat': threat?.name || 'Unknown',
                    'Likelihood': v.likelihood,
                    'Impact': v.impact,
                    'Risk Score': v.riskScore,
                    'Risk Level': v.riskLevel,
                    'Description': v.description || ''
                };
            });
            const vulnSheet = XLSX.utils.json_to_sheet(vulnData);
            XLSX.utils.book_append_sheet(wb, vulnSheet, 'Vulnerabilities');

            // Treatments sheet
            const treatmentData = treatments.map(t => {
                const vuln = vulnerabilities.find(v => v.id === t.vulnerabilityId);
                const asset = assets.find(a => a.id === vuln?.assetId);
                const threat = threats.find(th => th.id === vuln?.threatId);
                return {
                    'Asset': asset?.name || 'Unknown',
                    'Threat': threat?.name || 'Unknown',
                    'Strategy': t.strategy,
                    'Status': t.status,
                    'Responsible': t.responsible,
                    'Due Date': t.dueDate || '',
                    'Notes': t.notes || ''
                };
            });
            const treatmentSheet = XLSX.utils.json_to_sheet(treatmentData);
            XLSX.utils.book_append_sheet(wb, treatmentSheet, 'Treatments');

            // Summary sheet
            const stats = this.calculateStatistics();
            const summaryData = [
                { 'Metric': 'Total Assets', 'Value': stats.totalAssets },
                { 'Metric': 'Total Vulnerabilities', 'Value': stats.totalVulnerabilities },
                { 'Metric': 'High Risk Vulnerabilities', 'Value': stats.highRisk },
                { 'Metric': 'Medium Risk Vulnerabilities', 'Value': stats.mediumRisk },
                { 'Metric': 'Low Risk Vulnerabilities', 'Value': stats.lowRisk },
                { 'Metric': 'Active Treatments', 'Value': stats.activeTreatments },
                { 'Metric': 'Completed Treatments', 'Value': stats.completedTreatments }
            ];
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

            // Save Excel file
            XLSX.writeFile(wb, `Risk_Assessment_Data_${new Date().toISOString().split('T')[0]}.xlsx`);

            alert('Excel report generated successfully!');
        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Error generating Excel report. Please try again.');
        }
    },

    // Calculate statistics
    calculateStatistics() {
        const assets = DataStore.getData(DataStore.KEYS.ASSETS);
        const vulnerabilities = DataStore.getData(DataStore.KEYS.VULNERABILITIES);
        const treatments = DataStore.getData(DataStore.KEYS.TREATMENTS);

        return {
            totalAssets: assets.length,
            totalVulnerabilities: vulnerabilities.length,
            highRisk: vulnerabilities.filter(v => v.riskLevel === 'High').length,
            mediumRisk: vulnerabilities.filter(v => v.riskLevel === 'Medium').length,
            lowRisk: vulnerabilities.filter(v => v.riskLevel === 'Low').length,
            activeTreatments: treatments.filter(t => t.status !== 'Completed').length,
            completedTreatments: treatments.filter(t => t.status === 'Completed').length
        };
    }
};
