import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const SOURCE_LANG = 'en';

// Helper to deeply merge objects, but only adding missing keys from source
function mergeDeep(target: any, source: any) {
    if (typeof source !== 'object' || source === null) {
        return target !== undefined ? target : source;
    }

    if (typeof target !== 'object' || target === null) {
        return source;
    }

    const output = { ...target };

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (key in target) {
                output[key] = mergeDeep(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }
    }

    return output;
}

// Helper to sort object keys largely based on source order, but keeping data intact
function sortKeysLike(target: any, source: any): any {
    if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
        return target;
    }

    const output: any = {};
    const targetKeys = new Set(Object.keys(target));

    // Add keys in source order
    for (const key in source) {
        if (targetKeys.has(key)) {
            output[key] = sortKeysLike(target[key], source[key]);
            targetKeys.delete(key);
        }
    }

    // Add remaining keys from target (extras not in source)
    for (const key of targetKeys) {
        output[key] = target[key];
    }

    return output;
}

async function syncTranslations() {
    const sourcePath = path.join(MESSAGES_DIR, `${SOURCE_LANG}.json`);

    if (!fs.existsSync(sourcePath)) {
        console.error(`Source file ${sourcePath} not found!`);
        process.exit(1);
    }

    const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    const files = fs.readdirSync(MESSAGES_DIR).filter(file => file.endsWith('.json') && file !== `${SOURCE_LANG}.json`);

    console.log(`Syncing ${files.length} language files with ${SOURCE_LANG}.json...`);

    for (const file of files) {
        const filePath = path.join(MESSAGES_DIR, file);
        let targetContent;

        try {
            targetContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            console.warn(`Could not parse ${file}, skipping.`);
            continue;
        }

        // Merge missing keys
        const mergedContent = mergeDeep(targetContent, sourceContent);

        // Sort keys to match source for better diffs
        const sortedContent = sortKeysLike(mergedContent, sourceContent);

        fs.writeFileSync(filePath, JSON.stringify(sortedContent, null, 4) + '\n');
        console.log(`Updated ${file}`);
    }

    console.log('Synchronization complete!');
}

syncTranslations();
