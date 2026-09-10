import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb+srv://Kyro_Project:azimov_3444@cluster0.mgauugq.mongodb.net/?appName=Cluster0';
const MONGO_DB_NAME = 'premium_tools_db';

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(MONGO_DB_NAME);
    const products = await db.collection('products').find().toArray();
    console.log(`Total products: ${products.length}`);
    
    let hasImage = 0;
    let noImage = 0;
    const hosts = {};
    const sampleInvalid = [];
    
    products.forEach(p => {
      const url = p.image || (p.images && p.images[0] && p.images[0].url);
      if (url) {
        hasImage++;
        try {
          const parsed = new URL(url);
          hosts[parsed.hostname] = (hosts[parsed.hostname] || 0) + 1;
        } catch (e) {
          hosts['invalid_url'] = (hosts['invalid_url'] || 0) + 1;
          sampleInvalid.push({ name: p.name, url });
        }
      } else {
        noImage++;
      }
    });

    console.log(`Products with images: ${hasImage}`);
    console.log(`Products without images: ${noImage}`);
    console.log("Image hosts distribution:", hosts);
    if (sampleInvalid.length > 0) {
      console.log("Sample invalid URLs:", sampleInvalid.slice(0, 5));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
