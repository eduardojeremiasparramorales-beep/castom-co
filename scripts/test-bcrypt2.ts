const bcrypt = require("bcryptjs");

async function main() {
  const newHash = await bcrypt.hash("castom.co", 10);
  console.log("New hash for castom.co:", newHash);

  const storedHash = "$2a$10$sCsrUWP/MXSdnzBazHEVle/2Qz0CFfINYgWjIWRlyBAQ0z70nUfEK";
  const match = await bcrypt.compare("castom.co", storedHash);
  console.log("compare with stored hash:", match);

  const freshMatch = await bcrypt.compare("castom.co", newHash);
  console.log("compare with fresh hash:", freshMatch);
}

main().catch(console.error);
