// Script to export Firestore products and categories to JSON using Firebase Client SDK
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function exportFirestoreProducts() {
  console.log('📦 Starting Firestore product export via Client SDK...');

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Fetch categories
    console.log('🔍 Fetching categories from Firestore...');
    const categoriesCol = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCol);
    const categories = [];
    categoriesSnapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Exported ${categories.length} categories.`);

    // Fetch products
    console.log('🔍 Fetching products from Firestore...');
    const productsCol = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCol);
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Exported ${products.length} products.`);

    const exportData = {
      exportedAt: new Date().toISOString(),
      categoriesCount: categories.length,
      productsCount: products.length,
      categories,
      products,
    };

    const outputPath = path.join(process.cwd(), 'scripts', 'mock-products-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`🎉 Export complete! Product backup saved to: ${outputPath}`);
  } catch (err) {
    console.error('❌ Error exporting Firestore products:', err.message);
  }
}

exportFirestoreProducts();
