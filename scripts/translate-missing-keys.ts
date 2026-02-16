import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

const translations: Record<string, Record<string, string>> = {
    "ar": {
        "nav.roadmap": "خريطة الطريق",
        "footer.sections.legal.privacy": "الخصوصية",
        "footer.sections.legal.terms": "الشروط",
        "footer.sections.legal.license": "الرخصة"
    },
    "bn": {
        "nav.roadmap": "রোডম্যাপ",
        "footer.sections.legal.privacy": "গোপনীয়তা",
        "footer.sections.legal.terms": "শর্তাবলী",
        "footer.sections.legal.license": "লাইসেন্স"
    },
    "es": {
        "nav.roadmap": "Hoja de ruta",
        "footer.sections.legal.privacy": "Privacidad",
        "footer.sections.legal.terms": "Términos",
        "footer.sections.legal.license": "Licencia"
    },
    "fr": {
        "nav.roadmap": "Feuille de route",
        "footer.sections.legal.privacy": "Confidentialité",
        "footer.sections.legal.terms": "Conditions",
        "footer.sections.legal.license": "Licence"
    },
    "hi": {
        "nav.roadmap": "रोडमैप",
        "footer.sections.legal.privacy": "गोपनीयता",
        "footer.sections.legal.terms": "शर्तें",
        "footer.sections.legal.license": "लाइसेंस"
    },
    "ja": {
        "nav.roadmap": "ロードマップ",
        "footer.sections.legal.privacy": "プライバシー",
        "footer.sections.legal.terms": "利用規約",
        "footer.sections.legal.license": "ライセンス"
    },
    "pt": {
        "nav.roadmap": "Roteiro",
        "footer.sections.legal.privacy": "Privacidade",
        "footer.sections.legal.terms": "Termos",
        "footer.sections.legal.license": "Licença"
    },
    "ru": {
        "nav.roadmap": "Дорожная карта",
        "footer.sections.legal.privacy": "Конфиденциальность",
        "footer.sections.legal.terms": "Условия",
        "footer.sections.legal.license": "Лицензия"
    },
    "zh": {
        "nav.roadmap": "路线图",
        "footer.sections.legal.privacy": "隐私",
        "footer.sections.legal.terms": "条款",
        "footer.sections.legal.license": "许可证"
    }
};

function setValue(obj: any, key: string, value: string) {
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
    for (const [lang, keys] of Object.entries(translations)) {
        const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        console.log(`Updating ${lang}...`);
        for (const [key, value] of Object.entries(keys)) {
            setValue(content, key, value);
            console.log(`  Set ${key} = ${value}`);
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    }
    console.log("Done!");
}

main().catch(console.error);
