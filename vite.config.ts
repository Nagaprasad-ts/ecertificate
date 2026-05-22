import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import laravel from 'laravel-vite-plugin';
import * as path from 'path';
import { defineConfig, type Plugin } from 'vite';

// ---------------------------------------------------------------------------
// Template manifest plugin
// Scans resources/js/certificate-templates/{event}/*.tsx and writes
// storage/app/template-manifest.json so Laravel can sync the templates table
// automatically — no artisan command needed after deployment.
// ---------------------------------------------------------------------------
function templateManifestPlugin(): Plugin {
    const templatesDir = path.resolve(__dirname, 'resources/js/certificate-templates');
    const manifestPath = path.resolve(__dirname, 'storage/app/template-manifest.json');

    function humanize(str: string): string {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
    }

    function scan(): void {
        if (!fs.existsSync(templatesDir)) return;

        const templates: { templateFile: string; name: string }[] = [];

        for (const eventEntry of fs.readdirSync(templatesDir, { withFileTypes: true })) {
            if (!eventEntry.isDirectory()) continue;

            const eventDir = path.join(templatesDir, eventEntry.name);

            for (const fileEntry of fs.readdirSync(eventDir, { withFileTypes: true })) {
                if (!fileEntry.isFile()) continue;
                if (!fileEntry.name.endsWith('.tsx')) continue;
                if (fileEntry.name.startsWith('_')) continue;

                const baseName = fileEntry.name.replace(/\.tsx$/, '');
                const templateFile = `${eventEntry.name}/${baseName}`;
                const name = `${humanize(eventEntry.name)} — ${humanize(baseName)}`;

                templates.push({ templateFile, name });
            }
        }

        fs.writeFileSync(manifestPath, JSON.stringify(templates, null, 2));
        console.log(`[template-manifest] ${templates.length} template(s) written to manifest`);
    }

    return {
        name: 'template-manifest',

        // Production build
        buildStart() {
            scan();
        },

        // Dev server: scan on start, re-scan when files are added or removed
        configureServer(server) {
            scan();

            server.watcher.on('add', (file) => {
                if (file.includes('certificate-templates') && file.endsWith('.tsx')) {
                    scan();
                }
            });

            server.watcher.on('unlink', (file) => {
                if (file.includes('certificate-templates') && file.endsWith('.tsx')) {
                    scan();
                }
            });
        },
    };
}

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        templateManifestPlugin(),
    ],
});
