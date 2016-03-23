'use strict';
const fs = require('fs'),
	path = require('path');

function stat(filePath){
	const absPath = path.resolve(__dirname, filePath);
	return new Promise((resolve, reject) => {
		fs.stat(filePath, (err, data) => {
			if(err) return reject(err);
			resolve(data);
		});
	});
}

function writeFile(filePath, data){
	const absPath = path.resolve(__dirname, filePath);
	return new Promise((resolve, reject) => {
		fs.writeFile(absPath, data, (err, data) => {
			if(err) return reject(err);
			resolve(data);
		});
	});
}

module.exports = {
	stat : stat,
	writeFile : writeFile
};