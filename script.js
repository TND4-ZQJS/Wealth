document.addEventListener("DOMContentLoaded", function() {
    let table = document.getElementById("commissionTable");

    for (let i = 1; i <= 6; i++) {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${i} Year</td>
            <td><input type="number" id="year${i}" placeholder="Enter FYP" onfocus="this.value=''"></td>
            <td><input type="number" id="term${i}" value="20"></td>
        `;
    }
});

function calculateCommission() {
    let years = 12;
    let commissionRates = [20, 20, 10, 15, 15, 15];
    let BSC_Rates = [4.13, 4.12, 2.06];
    let API_Bonus = [
        { min: 50000, max: 99999, rate: 1 },
        { min: 100000, max: 179999, rate: 2 },
        { min: 180000, max: 299999, rate: 3 },
        { min: 300000, max: Infinity, rate: 5 }
    ];

    let policyData = {};
    let BSC_Tracking = {};
    let totalEarnings = 0;

    let table = `<div class="table-wrapper"><table>
        <tr>
            <th>Financial Year</th>
            <th>New Business FYP (RM)</th>
            <th>Pro-rated FYP (RFYP)</th>
            <th>FYC</th>
            <th>Renewal Commission</th>
            <th>API Bonus</th>
            <th>New Business BSC</th>
            <th>Renewal BSC</th>
            <th>Total Earnings</th>
        </tr>`;

    for (let fy = 1; fy <= years; fy++) {
        let FYP = parseFloat(document.getElementById(`year${fy}`)?.value) || 0;
        let paymentTerm = parseFloat(document.getElementById(`term${fy}`)?.value) || 20;
        let RFYP = (paymentTerm / 20) * FYP;
        policyData[fy] = RFYP;

        let FYC = (RFYP * commissionRates[0]) / 100;
        let renewalCommission = 0;

        for (let py = 1; py < fy; py++) {
            let renewalRate = commissionRates[py] || 0;
            renewalCommission += (policyData[fy - py] * renewalRate) / 100 || 0;
        }

        let API_Commission = 0;
        if (fy >= 2) {
            let APE = FYP;
            for (let bonus of API_Bonus) {
                if (APE >= bonus.min && APE <= bonus.max) {
                    API_Commission = (RFYP * bonus.rate) / 100;
                    break;
                }
            }
        }

        let BSC_Commission = 0;
        let Renewal_BSC = 0;
        if (fy >= 3) {
            if (policyData[fy]) {
                BSC_Commission += (policyData[fy] * BSC_Rates[0]) / 100;
                BSC_Tracking[fy] = policyData[fy];
            }
            
            if (BSC_Tracking[fy - 1]) Renewal_BSC += (BSC_Tracking[fy - 1] * BSC_Rates[1]) / 100;
            if (BSC_Tracking[fy - 2]) Renewal_BSC += (BSC_Tracking[fy - 2] * BSC_Rates[2]) / 100;
        }

        let total = FYC + renewalCommission + API_Commission + BSC_Commission + Renewal_BSC;
        totalEarnings += total;

        table += `<tr>
            <td>${fy} Year</td>
            <td>${formatNumber(FYP)}</td>
            <td>${formatNumber(RFYP)}</td>
            <td>${formatNumber(FYC)}</td>
            <td>${formatNumber(renewalCommission)}</td>
            <td>${formatNumber(API_Commission)}</td>
            <td>${formatNumber(BSC_Commission)}</td>
            <td>${formatNumber(Renewal_BSC)}</td>
            <td><strong>${formatNumber(total)}</strong></td>
        </tr>`;
    }

    table += `</table></div><h3>Total Earnings: RM <strong>${formatNumber(totalEarnings)}</strong></h3>`;
    document.getElementById("result").innerHTML = table;
}

function formatNumber(num) {
    return num.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function autoFill() {
    let fy1FYP = document.getElementById("year1").value;
    for (let i = 2; i <= 6; i++) {
        document.getElementById(`year${i}`).value = fy1FYP;
    }
}