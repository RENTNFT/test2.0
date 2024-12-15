function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomizeGradient() {
    const direction = ['to right', 'to left', 'to top', 'to bottom', 'to top right', 'to bottom left'];
    const color1 = getRandomColor();
    const color2 = getRandomColor();
    const color3 = getRandomColor();
    const directionChoice = direction[Math.floor(Math.random() * direction.length)];

    document.body.style.background = `linear-gradient(${directionChoice}, ${color1}, ${color2}, ${color3})`;
}

// Run it on page load
window.onload = randomizeGradient;
// Toggle FAQ answers when clicked
document.querySelectorAll('.faq-item h3').forEach(item => {
    item.addEventListener('click', () => {
        const answer = item.nextElementSibling;
        
        // Ensure maxHeight is set for smooth transitions
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
        } else {
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});

// Check for Phantom wallet and connect
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            if (window.solana.isConnected) {
                const walletPublicKey = window.solana.publicKey.toString();
                document.getElementById("wallet-status").innerHTML = `Wallet Connected: ${walletPublicKey}`;
                return;
            }
            
            const response = await window.solana.connect();
            const walletPublicKey = response.publicKey.toString();
            document.getElementById("wallet-status").innerHTML = `Wallet Connected: ${walletPublicKey}`;
        } catch (err) {
            console.error("Error connecting wallet:", err);
            document.getElementById("wallet-status").innerHTML = "Failed to connect wallet.";
        }
    } else {
        alert("Please install Phantom Wallet to connect.");
    }
}


// Attach the connect function to the button click event
document.getElementById("connect-wallet").addEventListener("click", connectWallet);
// Event listener for "Rent Now" button
document.getElementById("rent-now-btn").addEventListener("click", function() {
    // Hide the Rent Now button
    document.getElementById("rent-now-btn").style.display = "none";
    
    // Show the "Coming Soon" message
    document.getElementById("coming-soon-msg").style.display = "block";
});
// Define initial APY and staking logic
let currentAPY = 20;  // Starting APY
let stakeDuration = 0;  // Number of months the user has staked
const stakingWallet = "975HVAZo3d6VUEbyM4aRtNZBtYvdqbzKGBTVnxSD5gG3";

// Function to calculate APY based on duration
function calculateAPY() {
    if (stakeDuration >= 12) {
        currentAPY = 5;
    } else {
        currentAPY = 20 - stakeDuration;  // Reduces 1% per month
    }
    document.getElementById("apy-status").innerHTML = `Current APY: ${currentAPY}%`;
}

// Function to connect wallet
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            const walletPublicKey = response.publicKey.toString();
            document.getElementById("wallet-status").innerHTML = `Wallet Connected: ${walletPublicKey}`;
            document.getElementById("staking-msg").style.display = "none";
        } catch (err) {
            console.error("Error connecting wallet:", err);
            document.getElementById("wallet-status").innerHTML = "Failed to connect wallet.";
        }
    } else {
        alert("Please install Phantom Wallet to connect.");
    }
}

// Function to handle staking
async function stakeTokens() {
    if (!window.solana || !window.solana.isPhantom) {
        document.getElementById("staking-msg").style.display = "block";
        return;
    }

    // Prompt to connect wallet if not already connected
    if (!window.solana.isConnected) {
        await connectWallet();
    }

    // Get user's balance of RENT tokens (use an API or smart contract for this, example logic follows)
    const rentTokenAmount = 100; // Placeholder for the actual RENT token balance check
    if (rentTokenAmount <= 0) {
        alert("You don't have enough RENT tokens to stake.");
        return;
    }

    // Prompt user to confirm staking
    const confirmation = confirm("Are you sure you want to stake your RENT tokens?");
    if (!confirmation) return;

    // Send RENT tokens to the staking wallet (use Phantom's transfer API or other Solana library)
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
    const senderPublicKey = new solanaWeb3.PublicKey(window.solana.publicKey.toString());
    const stakingWalletPublicKey = new solanaWeb3.PublicKey(stakingWallet);

    // Define the transaction to send tokens
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: senderPublicKey,
            toPubkey: stakingWalletPublicKey,
            lamports: rentTokenAmount * 1000000000 // Convert tokens to lamports (1 token = 10^9 lamports)
        })
    );

    // Send the transaction
    try {
        await window.solana.signAndSendTransaction(transaction);
        alert("Tokens successfully staked!");
        stakeDuration++; // Increment duration each time user stakes
        calculateAPY();  // Recalculate APY based on duration
    } catch (err) {
        console.error("Error staking tokens:", err);
        alert("An error occurred while staking tokens.");
    }
}

// Attach event listener to stake button
document.getElementById("stake-btn").addEventListener("click", stakeTokens);
