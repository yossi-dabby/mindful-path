import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import glob from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

const globPromise = promisify(glob);

async function scanForLucideImports() {
    const files = await globPromise('src/**/*.{js,jsx,ts,tsx}');
    const iconMap = {};
    const iconSet = new Set();

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const ast = parse(content, { sourceType: 'module', plugins: ['jsx', 'typescript'] });

        traverse(ast, {
            ImportDeclaration({ node }) {
                if (node.source.value === 'lucide-react') {
                    node.specifiers.forEach(specifier => {
                        const name = specifier.local.name;
                        const importedName = specifier.type === 'ImportDefaultSpecifier' ? name : specifier.imported.name;
                        const identifier = specifier.local.name + 'Icon';
                        iconSet.add(identifier);
                        iconMap[path.relative(process.cwd(), file)] = iconMap[path.relative(process.cwd(), file)] || [];
                        iconMap[path.relative(process.cwd(), file)].push(identifier);
                    });
                }
            }
        });
    }

    fs.writeFileSync('reports/lucide-icons.json', JSON.stringify([...iconSet].sort()), 'utf-8');
    fs.writeFileSync('reports/lucide-icons-by-file.json', JSON.stringify(iconMap, null, 2), 'utf-8');
}

scanForLucideImports();