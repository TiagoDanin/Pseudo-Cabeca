#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const argv = require('yargs').argv

if (!argv.file) {
	console.log('Use: pseudo-cabeca --file=code.txt')
	return
}
var code = fs.readFileSync(path.resolve(argv.file), 'utf8').toString()

const help = `
var types = {}
const checkType = (v, _return) => {
	var type = types[v]
	if (type) {
		if (type == 'real') {
			return Number(_return)
		} else if (type == 'inteiro') {
			return Math.floor(_return)
		} else if (type == 'caractere') {
			return
		} else if (type == 'lógico') {
			return
		} else {
			console.log('ERRO: Não sei como você conseguiu fazer isso!')
		}
	} else {
		console.log(\`ERRRO: Acabou de ganha um zero! Sem identificador para \${v}\`)
		return 0
	}
}
`

code = code
	.replace(/[\t]*/gmi, '')
	.replace(/\/\*.*\*\//gs, '')
	.replace(/\sdiv\s/g, '/')
	.replace(/\smod\s/g, '%')
	.replace(/se\s*\(/gi, 'if(')
	.replace(/\)\s*então/gi, ') {')
	.replace(/\s*senão*\s/gi, '} else {')
	.replace(/\s*fimse;/gi, '}')
	.replace(/in[ií]cio/i, `
const main = async () => {
await new Promise((resolve) => setTimeout(
	resolve,
	1000
))
	`)
	.replace(/fim\./i, `
}
main().catch((e) => {
	console.log('ERRRO: Acabou de ganha um zero!')
	console.log(e)
})
"Pseudo Cabeça V1.0.0"
	`)
	.replace(/imprimir\((.*)\);/gi, (match, key) => {
		return `console.log(${key})`
	}, '')
	.replace(/([\w\d,]*)\s*\<\-(.*);/g, (match, keyA, keyB) => {
		return `${keyA} = checkType('${keyA}', (${keyB}))`
	}, '')
	.replace(/real:([\w\d\s,]*);/g, (match, keys) => {
		var output = ''
		for (var key of keys.split(',')) {
			key = key.replace(/\s/g, '')
			output += `var ${key}\n`
			output += `types['${key}'] = 'real'\n`
		}
		return output
	}, '')
	.replace(/inteiro:([\w\d\s,]*);/gi, (match, keys) => {
		var output = ''
		for (var key of keys.split(',')) {
			key = key.replace(/\s/g, '')
			output += `var ${key}\n`
			output += `types['${key}'] = 'inteiro'\n`
		}
		return output
	}, '')
	.replace(/caractere:([\w\d\s,\[\]]*);/gi, (match, keys) => {
		var output = ''
		for (var key of keys.split(',')) {
			key = key.replace(/\s/g, '')
			var match = key.match(/\[(\d*)\]/)
			if (match) {
				key = key.replace(/\[\d*\]/)
				output += `types['${key}-length'] = Number(${match[1]})\n`
			} else {
				output += `types['${key}-length'] = 0\n`
			}
			output += `var ${key}\n`
			output += `types['${key}'] = 'caractere'\n`
		}
		return output
	}, '')
	.replace(/lógico:([\w\d\s,]*);/gi, (match, keys) => {
		var output = ''
		for (var key of keys.split(',')) {
			key = key.replace(/\s/g, '')
			output += `var ${key}\n`
			output += `types['${key}'] = 'lógico'\n`
		}
		return output
	}, '')
	.replace(/ler\(([\w\d]*)\);/gi, (match, key) => {
		var output =  `
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})
${key} = checkType(
	'${key}',
	await new Promise(
		resolve => rl.question('', r => {
			rl.close()
			resolve(r)
		})
	)
)
		`
		return output
	}, '')

code = help + code
const result = eval(code)
console.log(result)
