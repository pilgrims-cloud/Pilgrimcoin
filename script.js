// PILGRIMS-COIN Platform JavaScript

// Global State
let currentUser = null;
let isAdmin = false;
let isMining = false;
let miningInterval = null;
let currentCalcValue = '0';

// Exchange Rates (mock data)
const exchangeRates = {
    PILGRIMS: { USD: 0.5, BTC: 0.00001, ETH: 0.00015 },
    USD: { PILGRIMS: 2, BTC: 0.00002, ETH: 0.0003 },
    BTC: { PILGRIMS: 100000, USD: 50000, ETH: 15 },
    ETH: { PILGRIMS: 6666.67, USD: 3333.33, BTC: 0.067 }
};

// Page Management
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showDashboardSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Modal Management
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}

// User Authentication
function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };

    if (userData.password !== userData.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Generate wallet addresses
    userData.coinWallet = generateWalletAddress('PILGRIMS');
    userData.cashWallet = generateWalletAddress('CASH');
    userData.coinBalance = 0;
    userData.cashBalance = 0;
    userData.transactions = [];
    userData.minedToday = 0;
    userData.totalMined = 0;
    userData.registeredAt = new Date().toISOString();

    // Save user (in localStorage for demo)
    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');
    users.push(userData);
    localStorage.setItem('pilgrimsUsers', JSON.stringify(users));

    alert('Registration successful! Please login.');
    showPage('login-page');
}

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        isAdmin = false;
        initializeDashboard();
        showPage('dashboard-page');
    } else {
        alert('Invalid email or password!');
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    // Only Olawale Abdul-Ganiyu can access admin
    if (username === 'Olawale Abdul-Ganiyu' && password === 'admin123') {
        currentUser = { fullName: 'Olawale Abdul-Ganiyu', email: 'admin@pilgrims-coin.com' };
        isAdmin = true;
        initializeAdminDashboard();
        showPage('admin-dashboard-page');
    } else {
        alert('Access denied! Only Olawale Abdul-Ganiyu can access admin dashboard.');
    }
}

function handleForgotPassword(event) {
    event.preventDefault();
    alert('Password reset link has been sent to your email.');
    showPage('cover-page');
}

function handleLogout() {
    currentUser = null;
    isAdmin = false;
    stopMining();
    showPage('cover-page');
}

function handleAdminLogout() {
    currentUser = null;
    isAdmin = false;
    showPage('cover-page');
}

// Wallet Management
function generateWalletAddress(type) {
    const prefix = type === 'PILGRIMS' ? 'PIL' : 'CASH';
    const random = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
    return `${prefix}-${random.toUpperCase()}`;
}

function initializeDashboard() {
    if (!currentUser) return;

    // Update wallet displays
    document.getElementById('coin-balance').textContent = currentUser.coinBalance.toFixed(8);
    document.getElementById('cash-balance').textContent = `$${currentUser.cashBalance.toFixed(8)}`;
    document.getElementById('coin-address').textContent = currentUser.coinWallet;
    document.getElementById('cash-address').textContent = currentUser.cashWallet;
    document.getElementById('coin-barcode-text').textContent = `PILGRIMS-COIN: ${currentUser.coinWallet}`;
    document.getElementById('cash-barcode-text').textContent = `PILGRIMS-CASH: ${currentUser.cashWallet}`;

    // Update mining info
    document.getElementById('mined-today').textContent = `${currentUser.minedToday.toFixed(8)} PILGRIMS`;
    document.getElementById('total-mined').textContent = `${currentUser.totalMined.toFixed(8)} PILGRIMS`;

    // Update transaction history
    updateTransactionHistory();

    // Generate barcodes
    generateBarcode('coin-barcode', currentUser.coinWallet);
    generateBarcode('cash-barcode', currentUser.cashWallet);
}

function generateBarcode(elementId, data) {
    const barcodeElement = document.getElementById(elementId);
    const lines = barcodeElement.querySelector('.barcode-lines');
    
    // Simple barcode simulation
    let barcodeHTML = '';
    for (let i = 0; i < 50; i++) {
        const width = Math.random() > 0.5 ? '3px' : '1px';
        barcodeHTML += `<div style="display:inline-block;width:${width};height:40px;background:#fff;margin:0 1px;"></div>`;
    }
    lines.innerHTML = barcodeHTML;
}

// Mining System
function toggleMining() {
    if (isMining) {
        stopMining();
    } else {
        startMining();
    }
}

function startMining() {
    isMining = true;
    document.getElementById('mining-status').textContent = 'Running';
    document.getElementById('mining-status').className = 'status-running';
    document.getElementById('start-mining-btn').textContent = 'Stop Mining';

    miningInterval = setInterval(() => {
        // Mine 0.00000001 PILGRIMS every second
        const minedAmount = 0.00000001;
        
        // Update balances
        currentUser.coinBalance += minedAmount;
        currentUser.cashBalance += minedAmount * 0.5; // 1 PILGRIMS = 0.5 USD
        currentUser.minedToday += minedAmount;
        currentUser.totalMined += minedAmount;

        // Update displays
        document.getElementById('coin-balance').textContent = currentUser.coinBalance.toFixed(8);
        document.getElementById('cash-balance').textContent = `$${currentUser.cashBalance.toFixed(8)}`;
        document.getElementById('mined-today').textContent = `${currentUser.minedToday.toFixed(8)} PILGRIMS`;
        document.getElementById('total-mined').textContent = `${currentUser.totalMined.toFixed(8)} PILGRIMS`;

        // Update progress bar
        const progress = Math.min((currentUser.minedToday / 1.0) * 100, 100);
        document.getElementById('mining-progress').style.width = `${progress}%`;

        // Add to mining log
        addMiningLog(minedAmount);

        // Save user data
        saveUserData();

        // Notify crypto partners (simulation)
        notifyCryptoPartners(minedAmount);

    }, 1000);
}

function stopMining() {
    isMining = false;
    document.getElementById('mining-status').textContent = 'Stopped';
    document.getElementById('mining-status').className = 'status-stopped';
    document.getElementById('start-mining-btn').textContent = 'Start Mining';

    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
}

function pauseMining() {
    if (isMining) {
        clearInterval(miningInterval);
        isMining = false;
        document.getElementById('mining-status').textContent = 'Paused';
        document.getElementById('start-mining-btn').textContent = 'Resume Mining';
    }
}

function addMiningLog(amount) {
    const log = document.getElementById('mining-log');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('p');
    logEntry.innerHTML = `<strong>${timestamp}</strong> - Mined ${amount.toFixed(8)} PILGRIMS (+$${(amount * 0.5).toFixed(8)})`;
    
    // Keep only last 50 entries
    if (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
    
    log.appendChild(logEntry);
    log.scrollTop = log.scrollHeight;
}

function notifyCryptoPartners(minedAmount) {
    // Simulate notifying crypto partners about PILGRIMS growth
    console.log(`Notifying partners: ${minedAmount.toFixed(8)} PILGRIMS mined`);
    console.log('Partners notified: Bitcoin.com, Bit Cash, Globalbank, Blockchain');
    
    // Robot statistics update (simulation)
    updateRobotStatistics();
}

function updateRobotStatistics() {
    // Simulate robot increasing PILGRIMS value based on mining activity
    const growthRate = 0.0001; // 0.01% growth per mining tick
    const currentValue = exchangeRates.PILGRIMS.USD;
    const newValue = currentValue * (1 + growthRate);
    exchangeRates.PILGRIMS.USD = newValue;
    
    console.log(`Robot updated: PILGRIMS value now $${newValue.toFixed(8)}`);
}

// Trading Functions
function handleBuy(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const usdAmount = parseFloat(formData.get('buyAmount'));
    
    if (usdAmount > currentUser.cashBalance) {
        alert('Insufficient cash balance!');
        return;
    }

    const pilgrimAmount = usdAmount / exchangeRates.PILGRIMS.USD;
    currentUser.cashBalance -= usdAmount;
    currentUser.coinBalance += pilgrimAmount;

    // Add transaction
    addTransaction('buy', 'PILGRIMS-COIN', pilgrimAmount, usdAmount);

    initializeDashboard();
    saveUserData();
    alert(`Successfully bought ${pilgrimAmount.toFixed(8)} PILGRIMS!`);
}

function handleSell(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const pilgrimAmount = parseFloat(formData.get('sellAmount'));
    
    if (pilgrimAmount > currentUser.coinBalance) {
        alert('Insufficient PILGRIMS balance!');
        return;
    }

    const usdAmount = pilgrimAmount * exchangeRates.PILGRIMS.USD;
    currentUser.coinBalance -= pilgrimAmount;
    currentUser.cashBalance += usdAmount;

    // Add transaction
    addTransaction('sell', 'PILGRIMS-COIN', pilgrimAmount, usdAmount);

    initializeDashboard();
    saveUserData();
    alert(`Successfully sold ${pilgrimAmount.toFixed(8)} PILGRIMS for $${usdAmount.toFixed(8)}!`);
}

function handleExchange(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const fromCurrency = formData.get('fromCurrency');
    const toCurrency = formData.get('toCurrency');
    const amount = parseFloat(formData.get('exchangeAmount'));

    let result;
    if (fromCurrency === 'PILGRIMS') {
        result = amount * exchangeRates.PILGRIMS[toCurrency];
    } else {
        result = amount * exchangeRates[fromCurrency][toCurrency];
    }

    alert(`Exchange: ${amount} ${fromCurrency} = ${result.toFixed(8)} ${toCurrency}`);
    addTransaction('exchange', `${fromCurrency} to ${toCurrency}`, amount, result);
}

function calculateExchange() {
    const fromCurrency = document.querySelector('select[name="fromCurrency"]').value;
    const toCurrency = document.querySelector('select[name="toCurrency"]').value;
    const amount = parseFloat(document.querySelector('input[name="exchangeAmount"]').value) || 0;

    let result;
    if (fromCurrency === 'PILGRIMS') {
        result = amount * exchangeRates.PILGRIMS[toCurrency];
    } else {
        result = amount * exchangeRates[fromCurrency][toCurrency];
    }

    document.getElementById('exchange-calculated').textContent = `${result.toFixed(8)} ${toCurrency}`;
}

// Deposit Functions
function showDepositMethod(method) {
    const formContainer = document.getElementById('deposit-method-form');
    formContainer.classList.remove('hidden');
    
    let formHTML = '';
    
    switch(method) {
        case 'crypto':
            formHTML = `
                <h3>Crypto Deposit</h3>
                <form onsubmit="handleDeposit(event, 'crypto')">
                    <div class="form-group">
                        <label>Select Crypto</label>
                        <select name="cryptoType" required>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                            <option value="PILGRIMS">PILGRIMS-COIN</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" step="0.00000001" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit</button>
                </form>
            `;
            break;
        case 'card':
            formHTML = `
                <h3>Card Deposit</h3>
                <form onsubmit="handleDeposit(event, 'card')">
                    <div class="form-group">
                        <label>Card Type</label>
                        <select name="cardType" required>
                            <option value="visa">Visa</option>
                            <option value="mastercard">Mastercard</option>
                            <option value="amex">American Express</option>
                            <option value="apple">Apple Pay</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" name="cardNumber" placeholder="1234 5678 9012 3456" required>
                    </div>
                    <div class="form-group">
                        <label>Expiry Date</label>
                        <input type="text" name="expiry" placeholder="MM/YY" required>
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" name="cvv" placeholder="123" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit</button>
                </form>
            `;
            break;
        case 'bank':
            formHTML = `
                <h3>Bank Transfer</h3>
                <form onsubmit="handleDeposit(event, 'bank')">
                    <div class="form-group">
                        <label>Bank Name</label>
                        <input type="text" name="bankName" required>
                    </div>
                    <div class="form-group">
                        <label>Account Number</label>
                        <input type="text" name="accountNumber" required>
                    </div>
                    <div class="form-group">
                        <label>Routing Number</label>
                        <input type="text" name="routingNumber" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit</button>
                </form>
            `;
            break;
        case 'bvn':
            formHTML = `
                <h3>BVN Deposit</h3>
                <form onsubmit="handleDeposit(event, 'bvn')">
                    <div class="form-group">
                        <label>BVN Number</label>
                        <input type="text" name="bvn" placeholder="11-digit BVN" required>
                    </div>
                    <div class="form-group">
                        <label>Bank Name</label>
                        <input type="text" name="bankName" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit via BVN</button>
                </form>
            `;
            break;
        case 'nin':
            formHTML = `
                <h3>NIN Deposit</h3>
                <form onsubmit="handleDeposit(event, 'nin')">
                    <div class="form-group">
                        <label>NIN Number</label>
                        <input type="text" name="nin" placeholder="11-digit NIN" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit via NIN</button>
                </form>
            `;
            break;
        case 'swift':
            formHTML = `
                <h3>Swift Code Transfer</h3>
                <form onsubmit="handleDeposit(event, 'swift')">
                    <div class="form-group">
                        <label>Swift Code</label>
                        <input type="text" name="swiftCode" placeholder="8 or 11 character code" required>
                    </div>
                    <div class="form-group">
                        <label>Bank Name</label>
                        <input type="text" name="bankName" required>
                    </div>
                    <div class="form-group">
                        <label>Account Number/IBAN</label>
                        <input type="text" name="accountNumber" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit via Swift</button>
                </form>
            `;
            break;
        case 'swiss':
            formHTML = `
                <h3>SWISS Code Transfer</h3>
                <form onsubmit="handleDeposit(event, 'swiss')">
                    <div class="form-group">
                        <label>SWISS Code</label>
                        <input type="text" name="swissCode" placeholder="Enter SWISS code" required>
                    </div>
                    <div class="form-group">
                        <label>Bank Name</label>
                        <input type="text" name="bankName" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit via SWISS</button>
                </form>
            `;
            break;
        case 'blockchain':
            formHTML = `
                <h3>Blockchain Deposit</h3>
                <form onsubmit="handleDeposit(event, 'blockchain')">
                    <div class="form-group">
                        <label>Network</label>
                        <select name="network" required>
                            <option value="ethereum">Ethereum</option>
                            <option value="bitcoin">Bitcoin</option>
                            <option value="binance">Binance Smart Chain</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Wallet Address</label>
                        <input type="text" name="walletAddress" required>
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" step="0.00000001" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit from Blockchain</button>
                </form>
            `;
            break;
        case 'bitcoin':
            formHTML = `
                <h3>Bitcoin.com Deposit</h3>
                <form onsubmit="handleDeposit(event, 'bitcoin')">
                    <div class="form-group">
                        <label>Bitcoin.com Wallet Address</label>
                        <input type="text" name="bitcoinAddress" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (BTC)</label>
                        <input type="number" step="0.00000001" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit from Bitcoin.com</button>
                </form>
            `;
            break;
        case 'amazon':
            formHTML = `
                <h3>Amazon Deposit</h3>
                <form onsubmit="handleDeposit(event, 'amazon')">
                    <div class="form-group">
                        <label>Amazon Account Email</label>
                        <input type="email" name="amazonEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Gift Card Code (Optional)</label>
                        <input type="text" name="giftCardCode" placeholder="XXXX-XXXX-XXXX-XXXX">
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit from Amazon</button>
                </form>
            `;
            break;
        case 'itunes':
            formHTML = `
                <h3>iTunes Deposit</h3>
                <form onsubmit="handleDeposit(event, 'itunes')">
                    <div class="form-group">
                        <label>Apple ID</label>
                        <input type="email" name="appleId" required>
                    </div>
                    <div class="form-group">
                        <label>iTunes Gift Card Code</label>
                        <input type="text" name="itunesCode" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit iTunes</button>
                </form>
            `;
            break;
        case 'apple':
            formHTML = `
                <h3>Apple Pay Deposit</h3>
                <form onsubmit="handleDeposit(event, 'apple')">
                    <div class="form-group">
                        <label>Device ID</label>
                        <input type="text" name="deviceId" required>
                    </div>
                    <div class="form-group">
                        <label>Amount (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Deposit with Apple Pay</button>
                </form>
            `;
            break;
        case 'pocket':
        case 'iq':
        case 'expert':
        case 'fx':
        case 'crypto-trading':
            formHTML = `
                <h3>${getTradingPlatformName(method)} Deposit</h3>
                <form onsubmit="handleDeposit(event, '${method}')">
                    <div class="form-group">
                        <label>Trading Account ID</label>
                        <input type="text" name="tradingAccountId" required>
                    </div>
                    <div class="form-group">
                        <label>Platform Password</label>
                        <input type="password" name="tradingPassword" required>
                    </div>
                    <div class="form-group">
                        <label>Amount to Transfer (USD)</label>
                        <input type="number" step="0.01" name="amount" required>
                    </div>
                    <button type="submit" class="btn-primary">Transfer from ${getTradingPlatformName(method)}</button>
                </form>
            `;
            break;
    }
    
    formContainer.innerHTML = formHTML;
}

function getTradingPlatformName(code) {
    const names = {
        'pocket': 'Pocket Data Trading',
        'iq': 'IQ Trading',
        'expert': 'Expert Trading',
        'fx': 'FX Trading',
        'crypto-trading': 'Crypto Trading'
    };
    return names[code] || code;
}

function handleDeposit(event, method) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const amount = parseFloat(formData.get('amount'));

    if (isNaN(amount) || amount <= 0) {
        alert('Invalid amount!');
        return;
    }

    // Convert to USD and add to cash wallet
    currentUser.cashBalance += amount;

    // Add transaction
    addTransaction('deposit', method.toUpperCase(), amount, amount, 'PILGRIMS-CASH');

    initializeDashboard();
    saveUserData();
    closeModal('deposit-modal');
    alert(`Successfully deposited $${amount.toFixed(8)} via ${method.toUpperCase()}!`);
}

// Withdrawal Functions
function handleWithdraw(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const walletType = formData.get('withdrawWallet');
    const amount = parseFloat(formData.get('withdrawAmount'));
    const destination = formData.get('withdrawDestination');

    let balance = walletType === 'coin' ? currentUser.coinBalance : currentUser.cashBalance;

    if (amount > balance) {
        alert('Insufficient balance!');
        return;
    }

    // Process withdrawal
    if (walletType === 'coin') {
        currentUser.coinBalance -= amount;
    } else {
        currentUser.cashBalance -= amount;
    }

    // Get transaction details
    let details = {};
    if (destination === 'wallet') {
        details.walletAddress = formData.get('walletAddress');
    } else {
        details.bankName = formData.get('bankName');
        details.accountNumber = formData.get('accountNumber');
        details.accountName = formData.get('accountName');
    }

    // Add transaction
    addTransaction('withdrawal', walletType === 'coin' ? 'PILGRIMS-COIN' : 'PILGRIMS-CASH', amount, amount, destination, details);

    initializeDashboard();
    saveUserData();
    closeModal('withdraw-modal');
    alert(`Withdrawal of ${amount.toFixed(8)} ${walletType === 'coin' ? 'PILGRIMS' : 'USD'} successful!`);
}

function toggleWithdrawDestination() {
    const destination = document.querySelector('select[name="withdrawDestination"]').value;
    const walletGroup = document.getElementById('wallet-address-group');
    const bankGroup = document.getElementById('bank-details-group');

    if (destination === 'wallet') {
        walletGroup.classList.remove('hidden');
        bankGroup.classList.add('hidden');
    } else {
        walletGroup.classList.add('hidden');
        bankGroup.classList.remove('hidden');
    }
}

// Send and Receive Functions
function handleSend(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const walletType = formData.get('sendWallet');
    const recipientAddress = formData.get('recipientAddress');
    const amount = parseFloat(formData.get('sendAmount'));

    let balance = walletType === 'coin' ? currentUser.coinBalance : currentUser.cashBalance;

    if (amount > balance) {
        alert('Insufficient balance!');
        return;
    }

    // Process send
    if (walletType === 'coin') {
        currentUser.coinBalance -= amount;
    } else {
        currentUser.cashBalance -= amount;
    }

    // Add transaction
    addTransaction('send', walletType === 'coin' ? 'PILGRIMS-COIN' : 'PILGRIMS-CASH', amount, amount, recipientAddress);

    initializeDashboard();
    saveUserData();
    closeModal('send-modal');
    alert(`Successfully sent ${amount.toFixed(8)} ${walletType === 'coin' ? 'PILGRIMS' : 'USD'}!`);
}

function showReceiveInfo(walletType) {
    const address = walletType === 'coin' ? currentUser.coinWallet : currentUser.cashWallet;
    const displayElement = walletType === 'coin' ? 'receive-coin-address' : 'receive-cash-address';
    document.getElementById(displayElement).textContent = address;
}

// Investment Functions
function handleInvest(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const plan = formData.get('investmentPlan');
    const amount = parseFloat(formData.get('investmentAmount'));

    if (amount > currentUser.coinBalance) {
        alert('Insufficient PILGRIMS balance!');
        return;
    }

    // Deduct investment amount
    currentUser.coinBalance -= amount;

    // Add transaction
    addTransaction('investment', plan.toUpperCase(), amount, amount, 'PILGRIMS-COIN');

    initializeDashboard();
    saveUserData();
    closeModal('invest-modal');
    alert(`Successfully invested ${amount.toFixed(8)} PILGRIMS in ${plan.toUpperCase()} plan!`);
}

// Transaction Management
function addTransaction(type, currency, amount, value, destination = '', details = {}) {
    const transaction = {
        id: Date.now(),
        type: type,
        currency: currency,
        amount: amount,
        value: value,
        destination: destination,
        details: details,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };

    currentUser.transactions.unshift(transaction);
    
    // Keep only last 100 transactions
    if (currentUser.transactions.length > 100) {
        currentUser.transactions = currentUser.transactions.slice(0, 100);
    }
}

function updateTransactionHistory() {
    const transactionsList = document.getElementById('transactions-list');
    const filter = document.getElementById('transaction-filter').value;

    let filteredTransactions = currentUser.transactions;
    
    if (filter !== 'all') {
        filteredTransactions = currentUser.transactions.filter(t => t.type === filter);
    }

    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-transactions">No transactions yet</p>';
        return;
    }

    let html = '';
    filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const time = new Date(transaction.timestamp).toLocaleTimeString();
        const amountClass = (transaction.type === 'deposit' || transaction.type === 'receive' || transaction.type === 'buy') ? 'positive' : 'negative';
        
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type">${transaction.type.toUpperCase()} - ${transaction.currency}</div>
                    <div class="transaction-details">
                        <strong>Date:</strong> ${date} ${time}<br>
                        <strong>ID:</strong> ${transaction.id}<br>
                        ${transaction.destination ? `<strong>To/From:</strong> ${transaction.destination}<br>` : ''}
                        ${transaction.details && Object.keys(transaction.details).length > 0 ? 
                            `<strong>Details:</strong> ${JSON.stringify(transaction.details)}<br>` : ''}
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${transaction.type === 'withdrawal' || transaction.type === 'send' || transaction.type === 'sell' ? '-' : '+'}
                    ${transaction.amount.toFixed(8)} ${transaction.currency}
                </div>
            </div>
        `;
    });

    transactionsList.innerHTML = html;
}

function filterTransactions() {
    updateTransactionHistory();
}

// Admin Functions
function initializeAdminDashboard() {
    updateCustomersList();
    updateAdminTransactions();
}

function updateCustomersList() {
    const customersList = document.getElementById('customers-list');
    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');

    if (users.length === 0) {
        customersList.innerHTML = '<p>No customers registered yet</p>';
        return;
    }

    let html = '';
    users.forEach(user => {
        html += `
            <div class="customer-item">
                <div class="customer-info">
                    <h4>${user.fullName}</h4>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>PILGRIMS Balance:</strong> ${user.coinBalance.toFixed(8)}</p>
                    <p><strong>Cash Balance:</strong> $${user.cashBalance.toFixed(8)}</p>
                    <p><strong>Registered:</strong> ${new Date(user.registeredAt).toLocaleDateString()}</p>
                </div>
                <div class="customer-actions">
                    <button class="btn-primary" onclick="showCreditDebitModal('${user.email}')">Credit/Debit</button>
                </div>
            </div>
        `;
    });

    customersList.innerHTML = html;
}

function updateAdminTransactions() {
    const transactionsList = document.getElementById('admin-transactions-list');
    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');
    
    let allTransactions = [];
    users.forEach(user => {
        user.transactions.forEach(transaction => {
            allTransactions.push({
                ...transaction,
                userName: user.fullName,
                userEmail: user.email
            });
        });
    });

    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (allTransactions.length === 0) {
        transactionsList.innerHTML = '<p>No transactions yet</p>';
        return;
    }

    let html = '';
    allTransactions.forEach(transaction => {
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const time = new Date(transaction.timestamp).toLocaleTimeString();
        
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type">${transaction.type.toUpperCase()} - ${transaction.currency}</div>
                    <div class="transaction-details">
                        <strong>User:</strong> ${transaction.userName} (${transaction.userEmail})<br>
                        <strong>Date:</strong> ${date} ${time}<br>
                        <strong>Amount:</strong> ${transaction.amount.toFixed(8)}<br>
                        ${transaction.destination ? `<strong>Destination:</strong> ${transaction.destination}<br>` : ''}
                    </div>
                </div>
                <div class="transaction-amount">
                    ${transaction.amount.toFixed(8)}
                </div>
            </div>
        `;
    });

    transactionsList.innerHTML = html;
}

function showCreditDebitModal(customerEmail) {
    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');
    const customer = users.find(u => u.email === customerEmail);
    
    if (customer) {
        document.getElementById('credit-debit-customer-id').value = customerEmail;
        showModal('credit-debit-modal');
    }
}

function handleCreditDebit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const customerId = formData.get('customerId');
    const action = formData.get('action');
    const walletType = formData.get('walletType');
    const amount = parseFloat(formData.get('amount'));

    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');
    const userIndex = users.findIndex(u => u.email === customerId);

    if (userIndex === -1) {
        alert('Customer not found!');
        return;
    }

    const user = users[userIndex];

    if (action === 'credit') {
        if (walletType === 'coin') {
            user.coinBalance += amount;
        } else {
            user.cashBalance += amount;
        }
    } else {
        if (walletType === 'coin') {
            if (amount > user.coinBalance) {
                alert('Insufficient balance!');
                return;
            }
            user.coinBalance -= amount;
        } else {
            if (amount > user.cashBalance) {
                alert('Insufficient balance!');
                return;
            }
            user.cashBalance -= amount;
        }
    }

    // Add transaction
    addTransactionToUser(user, action, walletType === 'coin' ? 'PILGRIMS-COIN' : 'PILGRIMS-CASH', amount, amount, 'Admin Operation');

    users[userIndex] = user;
    localStorage.setItem('pilgrimsUsers', JSON.stringify(users));

    updateCustomersList();
    closeModal('credit-debit-modal');
    alert(`Successfully ${action}ed ${amount.toFixed(8)} to ${user.fullName}!`);
}

function addTransactionToUser(user, type, currency, amount, value, destination = '') {
    const transaction = {
        id: Date.now(),
        type: type,
        currency: currency,
        amount: amount,
        value: value,
        destination: destination,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };

    user.transactions.unshift(transaction);
    
    if (user.transactions.length > 100) {
        user.transactions = user.transactions.slice(0, 100);
    }
}

function searchCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');
    
    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );

    const customersList = document.getElementById('customers-list');

    if (filteredUsers.length === 0) {
        customersList.innerHTML = '<p>No customers found</p>';
        return;
    }

    let html = '';
    filteredUsers.forEach(user => {
        html += `
            <div class="customer-item">
                <div class="customer-info">
                    <h4>${user.fullName}</h4>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>PILGRIMS Balance:</strong> ${user.coinBalance.toFixed(8)}</p>
                    <p><strong>Cash Balance:</strong> $${user.cashBalance.toFixed(8)}</p>
                </div>
                <div class="customer-actions">
                    <button class="btn-primary" onclick="showCreditDebitModal('${user.email}')">Credit/Debit</button>
                </div>
            </div>
        `;
    });

    customersList.innerHTML = html;
}

// Calculator Functions
function calcInput(value) {
    if (currentCalcValue === '0' && value !== '.') {
        currentCalcValue = value;
    } else {
        currentCalcValue += value;
    }
    document.getElementById('calc-display').textContent = currentCalcValue;
}

function calcClear() {
    currentCalcValue = '0';
    document.getElementById('calc-display').textContent = '0';
}

function calcBackspace() {
    currentCalcValue = currentCalcValue.slice(0, -1) || '0';
    document.getElementById('calc-display').textContent = currentCalcValue;
}

function calcResult() {
    try {
        currentCalcValue = eval(currentCalcValue).toString();
        document.getElementById('calc-display').textContent = currentCalcValue;
    } catch (error) {
        document.getElementById('calc-display').textContent = 'Error';
        currentCalcValue = '0';
    }
}

function convertCrypto() {
    const amount = parseFloat(currentCalcValue);
    if (isNaN(amount)) {
        alert('Please enter a valid number');
        return;
    }
    updateConversion();
}

function updateConversion() {
    const amount = parseFloat(document.getElementById('calc-display').textContent) || 0;
    const fromCurrency = document.getElementById('convert-from').value;
    const toCurrency = document.getElementById('convert-to').value;

    let result;
    if (fromCurrency === 'PILGRIMS') {
        result = amount * exchangeRates.PILGRIMS[toCurrency];
    } else {
        result = amount * exchangeRates[fromCurrency][toCurrency];
    }

    document.getElementById('conversion-result').textContent = 
        `${amount} ${fromCurrency} = ${result.toFixed(8)} ${toCurrency}`;
}

// Trading Platform Connection
function connectPlatform(platform) {
    const platformName = getTradingPlatformName(platform);
    const confirmed = confirm(`Connect to ${platformName}?\n\nThis will allow you to deposit funds from ${platformName} directly to your PILGRIMS wallet.`);
    
    if (confirmed) {
        alert(`${platformName} connection initiated!\n\nPlease complete the authentication process in the deposit section.`);
        showModal('deposit-modal');
        showDepositMethod(platform);
    }
}

// Data Persistence
function saveUserData() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('pilgrimsUsers') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('pilgrimsUsers', JSON.stringify(users));
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        initializeDashboard();
        showPage('dashboard-page');
    }
});

// Auto-save current user
setInterval(() => {
    if (currentUser && !isAdmin) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}, 5000);

// Mining recovery (continue from where stopped)
window.addEventListener('beforeunload', function() {
    if (isMining) {
        // Save mining state
        localStorage.setItem('miningState', JSON.stringify({
            isMining: true,
            timestamp: Date.now()
        }));
    }
});

// Resume mining if it was running
document.addEventListener('DOMContentLoaded', function() {
    const miningState = JSON.parse(localStorage.getItem('miningState') || 'null');
    if (miningState && miningState.isMining) {
        // Calculate lost mining time
        const lostTime = (Date.now() - miningState.timestamp) / 1000;
        console.log(`Resuming mining after ${lostTime.toFixed(0)} seconds`);
        
        // Clear saved state
        localStorage.removeItem('miningState');
        
        // Optionally auto-start mining
        // startMining();
    }
});