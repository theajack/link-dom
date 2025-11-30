/*
 * @Author: tackchen
 * @Date: 2025-11-29 12:00:15
 * @Description: Coding something
 */
import fs from 'fs';
import path from 'path';


/**
 * 递归读取目录下所有 .ts 文件
 * @param dir - 目录路径
 * @param fileList - 文件列表
 * @returns .ts 文件路径数组
 */
export function readExeFiles (dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 递归读取子目录
            readExeFiles(filePath, fileList);
        } else if (path.extname(file) === '.ts' || path.extname(file) === '.js') {
            // 添加 .ts 文件
            fileList.push(filePath);
        }
    });

    return fileList;
}


// 主函数
export function main () {
    const demoDir = path.join(__dirname, '../demo');
    console.log('demoDir');
    const tsFiles = readExeFiles(demoDir).map(file => file.replace(demoDir, ''));


    const jsxDemo = path.join(__dirname, '../jsbox-demo');
    const jsFiles = readExeFiles(jsxDemo).map(file => file.replace(jsxDemo, '/jsbox'));

    const htmlContent = `<div class="env-choose">${
        [ ...tsFiles, ...jsFiles ].map(file => `<span class="env-item"><a href="/?file=${file}">${file}</a></span>`).join('\n')
    }</div>`;

    // 替换index.html 中的 envChoose
    const indexHtmlPath = path.join(__dirname, './tpl.html');
    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
    const newIndexHtmlContent = indexHtmlContent.replace(/<!--ENVCHOOSE-->/, htmlContent);
    fs.writeFileSync(path.join(__dirname, '../index.html'), newIndexHtmlContent);

}


main();