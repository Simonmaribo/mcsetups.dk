import type Server from '@/interfaces/Server';
import fs from 'fs';
import path from 'path';

export function getFiles(dirPath: string, extension: string | string[]): string[] {
    const files = fs.readdirSync(dirPath);
    const fileLocations: string[] = [];

    files.forEach((file: any) => {
        // check if the files is a directory, and then loop though it
        if(fs.statSync(`${dirPath}/${file}`).isDirectory()){
            fileLocations.push(...getFiles(`${dirPath}/${file}`, extension));
        } else if ( (((extension != null) && ((Array.isArray(extension) && ((extension.includes(path.extname(file)) || (extension.filter((el) => {return (/^\s*$/.test(String(el))) == false}).length == 0))))) || (path.extname(file) == extension))) || (extension == null || /^\s*$/.test(String(extension)))) {
            fileLocations.push(`${dirPath}/${file}`);
        }
    })
    return fileLocations;
}

export function loadFile<Type>(_path: string, server: Server): Type {
    return require(path.resolve(_path))(server);
}

export function getRouteName(_path: string | string[]): string {
    const pathArr = _path = Array.isArray(_path) ? _path : _path.split("/");
    var baseName = "/";

    for(let i = 0; i < pathArr.length; i++) {
        pathArr[i] = pathArr[i].replace(/\.ts|\.js/g, "");
    }

    for (let j = 1; j < pathArr.length; j++) {
        if (pathArr[j + 1] == 'index') baseName += `${pathArr[j]}/`;
        else if ((j > 1) && (j != (pathArr.length - 1))) baseName += `${pathArr[j]}/`;
        else if (pathArr.length - 2 == j) baseName += `${pathArr[j]}/`;
        else if (pathArr[j] != 'index') baseName += `${`${pathArr[j]}`}/`;
    }
    baseName = baseName.replace(/\[([^\]]+)\]/g, ":$1");

    return baseName;
}