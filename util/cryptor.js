/**
 * Created by Sarc Bae on 2023-05-09.
 * 암/복호화 모듈
 */
var crypto = require('crypto');

const encryptKeyword = process.env.ENCRYPT_KEY || 'abcdefghijkl';
const decipherType = process.env.DECIPHER_TYPE || 'aes-256-cbc';
const input_encoding = process.env.CRYPTO_INPUT_ENCODEING || 'utf8';
const output_encoding = process.env.CRYPTO_OUTPUT_ENCODEING || 'base64';
const hashedPassword = sha512pbkdf2Hex(encryptKeyword);
const iv = "2120da8c0d09db46"; // iv값은 암호화할 필요는 없는데 예측 불가능이고 유일하면 된다. (이상적으론은 그냥 암호학적으로 무작위면 좋다.) 그 값들은 비밀일 필요가 없다. iv값들은 암호화되지않은(unencrypted) ciphertext messages에 추가된다.
// 16자리 16진수 string이 들어가는 것이 제일 문제가 없는 것으로 예상되어 일단 최하단에 위치할 generateHexadecimal()를 별도로 돌려 생성한 iv값

module.exports = {
	encrypt: (value) => {
		const cipher = crypto.createCipheriv(decipherType, hashedPassword, iv);
		let cipherValue = cipher.update(value, input_encoding, output_encoding);
		cipherValue += cipher.final('base64');
		return cipherValue;
	},
	decrypt: (encryptedValue) => {
		if (!encryptedValue) {
			return undefined
		}
		const decipher = crypto.createDecipheriv(decipherType, hashedPassword, iv);
		let decipherValue = decipher.update(encryptedValue, output_encoding, input_encoding);
		const decryptedValue = decipherValue + decipher.final('utf8');
		return decryptedValue;
	},
	hashedPswd: (value)=>{
		if (!value) {
			return undefined;
		}
		return sha256pbkdf2Hex(value);
	}
};

// Password 해쉬함수
function sha512pbkdf2Hex(value) {
	const key = crypto.pbkdf2Sync(value, 'salt', 121212, 16, 'sha512');
	return key.toString('hex');
}

// Password 해쉬함수 sha256
function sha256pbkdf2Hex(value) {
	const key = crypto.pbkdf2Sync(value, process.env.ENCRYPT_SALT || 'salt', process.env.ENCRYPT_ITERATIONS ? parseInt(process.env.ENCRYPT_ITERATIONS) : 121212, 16, 'sha256');
	return key.toString('hex');
}

/*
* crypto 함수 iv관련 설명 참조
* https://goatee.tistory.com/8
* https://velog.io/@neity16/NodeJS-crypto%EB%8B%A8%EB%B0%A9%ED%96%A5-%EC%95%94%ED%98%B8%ED%99%94
* aes-256-cbc는 1bytes = 8bits기 때문에 256/8 = 32bytes가 되야 하며,
* iv붙는 새로운 메소드들에는 key가 해당 방식으로 들어가야 한다.
* key = crypto.scryptSync(encryptKeyword, 'salt', 32);
* 다만 pbkdf2가 속도면에서 더 유리할수 있다는 표현이 있으므로, pbkdf2Sync를 사용
*
*/

// 암호화에 사용될 16자리 iv값 생성용 임시함수
// function generateHexadecimal() {
// 	let hexadecimal = '';
// 	while (hexadecimal.length < 16) {
// 		hexadecimal += Math.floor(Math.random() * 16).toString(16);
// 	}
// 	return hexadecimal;
// }
