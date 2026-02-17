import path from 'path';
import fs from 'fs';
import { PhoneNumbersClient, PhoneNumberEntry } from '@/components/phone/phone-numbers-client';
import { CountryLocaleData } from '@/types/country';

// Helper to read country data
async function getPhoneData(): Promise<PhoneNumberEntry[]> {
    const dataDir = path.join(process.cwd(), 'data', 'countries');

    try {
        if (!fs.existsSync(dataDir)) {
            return [];
        }

        const files = await fs.promises.readdir(dataDir);
        const entries: PhoneNumberEntry[] = [];

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            try {
                const filePath = path.join(dataDir, file);
                const content = await fs.promises.readFile(filePath, 'utf-8');
                const country: CountryLocaleData = JSON.parse(content);

                // Skip if no phone data
                if (!country.phone) continue;

                // Prioritize mobile pattern, fallback to general
                const pattern = country.phone.types?.mobile?.pattern || country.phone.generalPattern || "";
                const exampleNumber = country.phone.types?.mobile?.exampleNumber || "";

                // Use the pre-formatted example if available, otherwise construct one
                // The data usually has 'exampleFormat' for the whole number
                const exampleFormat = country.phone.exampleFormat ||
                    (country.phone.callingCode ? `${country.phone.callingCode} ${exampleNumber}` : exampleNumber);

                entries.push({
                    countryCode: country.codes.iso3166Alpha2,
                    name: country.basics.name,
                    flagEmoji: country.basics.flagEmoji,
                    callingCode: country.phone.callingCode,
                    pattern: pattern,
                    exampleFormat: exampleFormat,
                    exampleNumber: exampleNumber,
                    region: country.basics.region
                });
            } catch (e) {
                console.error(`Error processing ${file} for phone data`, e);
            }
        }

        return entries.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
        console.error('Error reading country directory', e);
        return [];
    }
}

export default async function PhoneNumbersPage() {
    const data = await getPhoneData();

    return (
        <div className="container py-10">
            <PhoneNumbersClient data={data} />
        </div>
    );
}
