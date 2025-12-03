import fs from 'fs';

const files = [
    'src/routes/user.js',
    'src/routes/blog.js'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Split into lines and convert each query
    const lines = content.split('\n');
    const newLines = [];
    
    for (let line of lines) {
        let newLine = line;
        
        // Convert query placeholders
        if (line.includes('db.query') || line.includes('connection.query')) {
            let count = 1;
            while (newLine.includes('?')) {
                newLine = newLine.replace('?', `$${count}`);
                count++;
            }
        }
        
        // Convert destructuring and result access
        newLine = newLine.replace(/const \[([a-zA-Z_]+)\] = await/g, 'const $1 = await');
        newLine = newLine.replace(/\.insertId/g, '.rows[0].id');
        newLine = newLine.replace(/\.affectedRows/g, '.rowCount');
        newLine = newLine.replace(/([a-zA-Z_]+)\.length === 0/g, '$1.rows.length === 0');
        newLine = newLine.replace(/([a-zA-Z_]+)\.length > 0/g, '$1.rows.length > 0');
        newLine = newLine.replace(/([a-zA-Z_]+)\[0\]/g, '$1.rows[0]');
        newLine = newLine.replace(/\.rows\.rows/g, '.rows');
        
        // Convert connection methods
        newLine = newLine.replace(/const connection = await db\.getConnection\(\);/g, 'const connection = await db.connect();');
        newLine = newLine.replace(/await connection\.beginTransaction\(\);/g, 'await connection.query(\'BEGIN\');');
        newLine = newLine.replace(/await connection\.commit\(\);/g, 'await connection.query(\'COMMIT\');');
        newLine = newLine.replace(/await connection\.rollback\(\);/g, 'await connection.query(\'ROLLBACK\');');
        
        newLines.push(newLine);
    }
    
    fs.writeFileSync(file, newLines.join('\n'));
    console.log(`✅ Converted ${file}`);
});

console.log('🎉 All files converted to PostgreSQL!');
