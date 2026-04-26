// ============================================
// AgriChain ZK — Simulated Blockchain Engine
// ============================================

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  async calculateHash() {
    const str = this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce;
    // Use Web Crypto API for SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

class AgriBlockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.initialized = false;
  }

  async init(seedTransactions) {
    // Create genesis block
    const genesis = new Block(0, '2026-01-01T00:00:00Z', { type: 'genesis', message: 'AgriChain ZK Genesis Block' }, '0');
    genesis.hash = await genesis.calculateHash();
    this.chain.push(genesis);

    // Add seed transactions as blocks
    for (const tx of seedTransactions) {
      await this.addBlock(tx);
    }
    this.initialized = true;
  }

  async addBlock(data) {
    const prevBlock = this.chain[this.chain.length - 1];
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      typeof prevBlock.hash === 'string' ? prevBlock.hash : await prevBlock.hash
    );
    newBlock.hash = await newBlock.calculateHash();
    this.chain.push(newBlock);
    return newBlock;
  }

  async getBlockByIndex(index) {
    return this.chain[index] || null;
  }

  async getTransactionsByBatch(batchId) {
    const results = [];
    for (const block of this.chain) {
      if (block.data && block.data.batchId === batchId) {
        results.push({
          blockIndex: block.index,
          hash: typeof block.hash === 'string' ? block.hash : await block.hash,
          previousHash: block.previousHash,
          timestamp: block.timestamp,
          data: block.data
        });
      }
    }
    return results;
  }

  async getRecentBlocks(count = 10) {
    const blocks = [];
    const start = Math.max(0, this.chain.length - count);
    for (let i = this.chain.length - 1; i >= start; i--) {
      const block = this.chain[i];
      blocks.push({
        index: block.index,
        hash: typeof block.hash === 'string' ? block.hash : await block.hash,
        timestamp: block.timestamp,
        data: block.data
      });
    }
    return blocks;
  }

  getChainLength() {
    return this.chain.length;
  }

  async isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      const currentHash = typeof current.hash === 'string' ? current.hash : await current.hash;
      const recalculated = await current.calculateHash();
      if (currentHash !== recalculated) return false;
      const prevHash = typeof previous.hash === 'string' ? previous.hash : await previous.hash;
      if (current.previousHash !== prevHash) return false;
    }
    return true;
  }
}

// Global blockchain instance
window.agriChain = new AgriBlockchain();
