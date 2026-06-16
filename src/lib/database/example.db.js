import postgres from 'postgres';

const user = 'zelda';
const password = 'password123';
const host = 'localhost:5432';
const database = 'csr_test';

const sql = postgres('postgress://', {
	user,
	password,
	host,
	database
});

console.log('Connected!');

export default sql;
