import { question, promptLoop, prompt } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
require("dotenv").config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function searchMovies() {

    await client.connect();
    while (true) {
        let searchTerm = prompt()
        if (searchTerm === 'q') {
            break;
        }
        const columns = ['id', 'name', 'date', 'runtime budget', 'revenue', 'vote_average', 'votes_count']
        const text = `SELECT ${columns.join(', ')} FROM movies where LOWER(name) LIKE ($1) AND kind = ($2) ORDER BY date desc LIMIT 10`
        //var searchTerm = "%" + question('What movie are you searching for?') + "%";
        const search = [`%${searchTerm.toLowerCase()}%`, 'movie']
        const res = await client.query(text, search);
        console.table(res.rows);

    }
    await client.end();
    console.log('User exited loop')

}


console.log("Welcome to search-movies-cli!\nsearch for a movie:");
searchMovies()