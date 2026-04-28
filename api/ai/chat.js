module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const buildFallbackReply = (value = '') => {
      const text = value.toLowerCase();

      if (text.includes('zk') || text.includes('zero-knowledge') || text.includes('proof')) {
        return 'ZK proofs hide sensitive details while still proving the data is valid. In KrishiChain, that means auditors can verify your harvest without exposing private farmer information.';
      }

      if (text.includes('msp') || text.includes('minimum support price')) {
        return 'MSP is the minimum price promised by the government for some crops. It helps protect farmers from selling below a fair floor price.';
      }

      if (text.includes('disease') || text.includes('pest') || text.includes('leaf')) {
        return 'Check for spots, curling, yellowing, or holes. If you share the crop name and symptom, I can suggest likely causes and safe next steps.';
      }

      if (text.includes('price') || text.includes('market')) {
        return 'Market price depends on crop type, quality, moisture, location, and current demand. For a good estimate, share the crop and its grade.';
      }

      return 'I can help with crop prices, MSP, disease signs, and ZK privacy. Ask me a short question and I will guide you.';
    };

    return res.json({
      text: buildFallbackReply(prompt),
      mode: 'demo',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};