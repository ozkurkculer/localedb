import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const SOURCE_LANG = 'en';

function getKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getKeys(obj[key], newKey));
        } else {
            keys.push(newKey);
        }
    }
    return keys;
}

function getValue(obj: any, key: string): any {
    const parts = key.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === undefined) return undefined;
        current = current[part];
    }
    return current;
}

function setValue(obj: any, key: string, value: any) {
    const parts = key.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) current[part] = {};
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}

async function main() {
    const files = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json'));
    const sourceFilePath = path.join(MESSAGES_DIR, `${SOURCE_LANG}.json`);

    if (!fs.existsSync(sourceFilePath)) {
        console.error(`Source language file ${SOURCE_LANG}.json not found!`);
        process.exit(1);
    }

    const sourceContent = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));
    const sourceKeys = getKeys(sourceContent);

    console.log(`Source language (${SOURCE_LANG}) has ${sourceKeys.length} keys.`);
    console.log('-'.repeat(50));

    let hasChanges = false;

    for (const file of files) {
        if (file === `${SOURCE_LANG}.json`) continue;

        const lang = file.replace('.json', '');
        const filePath = path.join(MESSAGES_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const keys = new Set(getKeys(content));
        const missingKeys: string[] = [];

        for (const key of sourceKeys) {
            if (!keys.has(key)) {
                missingKeys.push(key);
            }
        }

        if (missingKeys.length > 0) {
            console.log(`\n❌ ${lang} is missing ${missingKeys.length} keys:`);
            missingKeys.forEach(k => {
                console.log(`   - ${k}`);
                const sourceValue = getValue(sourceContent, k);
                setValue(content, k, sourceValue); // Auto-fill with English value
            });

            // Write back updated content
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
            console.log(`   ✅ Automatically filled missing keys with English values.`);
            hasChanges = true;
        } else {
            console.log(`\n✅ ${lang} is complete.`);
        }
    }

    console.log('-'.repeat(50));
    if (hasChanges) {
        console.log('✨ All missing keys have been backfilled with English values.');
    } else {
        console.log('✨ No missing keys found.');
    }
}

main().catch(console.error);
