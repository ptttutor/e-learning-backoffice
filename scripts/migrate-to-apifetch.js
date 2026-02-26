// Script สำหรับแปลง fetch เป็น apiFetch ใน hooks ทั้งหมด
// Run: node scripts/migrate-to-apifetch.js

const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '../src/hooks');
const componentsDir = path.join(__dirname, '../src/components');

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace: const response = await fetch('/api/...
    // With: const response = await apiFetch('/api/...
    if (content.includes('await fetch')) {
      content = content.replace(/await fetch\(/g, 'await apiFetch(');
      modified = true;
    }

    // Replace: const res = await fetch("/api/...
    // With: const res = await apiFetch("/api/...
    if (content.includes('= await fetch')) {
      // Already covered by above
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error in ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let totalUpdated = 0;

  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      totalUpdated += processDirectory(fullPath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      if (replaceInFile(fullPath)) {
        totalUpdated++;
      }
    }
  });

  return totalUpdated;
}

console.log('🔄 Migrating fetch to apiFetch in hooks...\n');
const hooksUpdated = processDirectory(hooksDir);
console.log(`\n✨ Updated ${hooksUpdated} hooks files`);

console.log('\n🔄 Migrating fetch to apiFetch in components...\n');
const componentsUpdated = processDirectory(componentsDir);
console.log(`\n✨ Updated ${componentsUpdated} component files`);

console.log(`\n🎉 Total files updated: ${hooksUpdated + componentsUpdated}`);
console.log('\n⚠️  Note: Please review changes and ensure all imports include apiFetch');
