const path = require('path');
const { app } = require('./backend/server');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Vax360 Production server running on port ${PORT}`);
});
