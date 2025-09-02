const validateEnvironment = () => {
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'NODE_ENV',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please copy .env.example to .env and fill in the required values');
    process.exit(1);
  }

  // Validate OpenAI API key format
  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.error('❌ Invalid OpenAI API key format');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

module.exports = { validateEnvironment };